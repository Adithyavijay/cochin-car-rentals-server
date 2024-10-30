import { prisma } from '../../config/prisma.js';

class VehicleAvailabilityController {
    /**
     * @desc Check vehicle availability for given dates
     * @param {string} vehicleId - Vehicle ID
     * @param {Date} requestedStartDate - Desired start date
     * @param {Date} requestedEndDate - Desired end date
     */
    async checkAvailability(vehicleId, requestedStartDate, requestedEndDate) {
        try {  
            
            const startDate = new Date(requestedStartDate);
            const endDate = new Date(requestedEndDate);
            
            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error('Invalid date format');
            }
            // Validate vehicle exists and get related data
            const vehicle = await prisma.vehicle.findUnique({
                where: { id: vehicleId },
                include: {
                    bookings: { 
                        where: {
                            AND: [
                                { startDate: { lte: endDate } },
                                { endDate: { gte: startDate } }
                            ]
                        },
                        orderBy: { endDate: 'asc' }
                    },
                    queueEntries: {
                        orderBy: { position: 'asc' }
                    }
                }
            });

            if (!vehicle) {
                throw new Error('Vehicle not found');
            }
                
            // Get overlapping bookings for requested period
         
        // Calculate overlapping bookings correctly
        const overlappingBookings = vehicle.bookings.filter(booking => {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);
            
            // Check if this booking overlaps with requested period
            return (
                (bookingStart <= endDate) && (bookingEnd >= startDate)
            );
        }).length;



            // Calculate available units during requested period
            const availableUnits = vehicle.availableQuantity - overlappingBookings;

            // Direct availability check
            if (availableUnits > 0) {
                return {
                    status: 'AVAILABLE',
                    percentage: 100,
                    canBookDirectly: true,
                    availableUnits,
                    queuePosition: null,
                    returningVehicles: 0,
                    message: `${availableUnits} unit(s) available for direct booking`
                };
            }

            // If not directly available, calculate queue-based availability
            return await this.calculateQueueBasedAvailability(
                vehicle,
                requestedStartDate,
                requestedEndDate
            );
        } catch (error) {
            console.error('Error checking availability:', error);
            throw new Error(`Failed to check vehicle availability: ${error.message}`);
        }
    }

   /**
     * @desc Calculate availability based on queue position and cancellation probability
     * @param {Object} vehicle - Vehicle with bookings and queue data
     * @param {Date} requestedStartDate - Desired start date
     * @param {Date} requestedEndDate - Desired end date
     */
   async calculateQueueBasedAvailability(vehicle, requestedStartDate, requestedEndDate) {
    // Calculate queue position
    const queuePosition = vehicle.queueEntries.length + 1;

    // Calculate overlapping bookings
    const overlappingBookings = vehicle.bookings.filter(booking => 
        booking.startDate <= requestedEndDate && 
        booking.endDate >= requestedStartDate
    );

    // Calculate potential cancellation chance
    let percentage = this.calculateCancellationProbability(
        queuePosition,
        overlappingBookings.length,
        requestedStartDate
    );
    
    return {
        status: percentage > 0 ? 'QUEUED' : 'UNAVAILABLE',
        percentage: Math.round(percentage),
        canBookDirectly: false,
        availableUnits: 0,
        queuePosition,
        potentialCancellations: overlappingBookings.length,
        message: this.generateQueueMessage(
            queuePosition,
            overlappingBookings.length,
            percentage,
            requestedStartDate
        )
    };
}

/**
 * @desc Calculate probability based on queue position and booking patterns
 * @param {number} queuePosition - Position in queue
 * @param {number} overlappingBookings - Number of overlapping bookings
 * @param {Date} requestedDate - Requested booking date
 */
calculateCancellationProbability(queuePosition, overlappingBookings, requestedDate) {
    // Base chance starts higher for fewer overlapping bookings
    const baseChance = Math.min(80, 100 - (overlappingBookings * 10));
    
    // Queue position impact
    const queueImpact = (queuePosition - 1) * 15;
    
    // Time factor - further dates have higher chances of cancellations
    const daysUntilBooking = Math.ceil(
        (requestedDate - new Date()) / (1000 * 60 * 60 * 24)
    );
    
    // Calculate time-based boost (max 25% boost for dates 30+ days away)
    const timeBoost = Math.min(25, (daysUntilBooking / 30) * 25);
    
    // Average historical cancellation rate (this could be calculated from actual data)
    const avgCancellationRate = 0.15; // 15% cancellation rate
    
    // Calculate final percentage
    let percentage = baseChance - queueImpact + timeBoost;
    
    // Adjust based on historical cancellation rate
    percentage *= (1 + avgCancellationRate);
    
    // Ensure percentage stays within bounds
    return Math.min(95, Math.max(0, percentage));
}

/**
 * @desc Generate queue-specific message
 * @param {number} queuePosition - Queue position
 * @param {number} overlappingBookings - Number of overlapping bookings
 * @param {number} percentage - Calculated percentage
 * @param {Date} requestedDate - Requested booking date
 */
generateQueueMessage(queuePosition, overlappingBookings, percentage, requestedDate) {
    const daysUntilBooking = Math.ceil(
        (requestedDate - new Date()) / (1000 * 60 * 60 * 24)
    );

    let message = `You are position ${queuePosition} in queue. `;
    message += `There are currently ${overlappingBookings} booking(s) during your requested period. `;

    if (daysUntilBooking > 7) {
        message += `Your advance booking ${daysUntilBooking} days ahead improves your chances. `;
    }

    // Add specific messaging based on percentage ranges
    if (percentage >= 70) {
        message += `Your chances are good with ${Math.round(percentage)}% probability of getting the vehicle.`;
    } else if (percentage >= 40) {
        message += `You have a moderate chance (${Math.round(percentage)}%) of getting the vehicle.`;
    } else {
        message += `Your booking chance is currently ${Math.round(percentage)}%. Consider alternative dates or vehicles.`;
    }

    return message;
}
}

export default new VehicleAvailabilityController();