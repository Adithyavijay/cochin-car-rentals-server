// Add this to your query resolvers file
import vehicleAvailabilityController from '../../../../controllers/user/vehicle-availability-controller.js';

export const vehicleAvailabilityResolver = {
    checkVehicleAvailability: async (_, { input }) => { 
       
      try {
        const { vehicleId, startDate, endDate } = input;

        // Convert string dates to Date objects
        const requestedStartDate = new Date(startDate);
        const requestedEndDate = new Date(endDate);

        // Validate dates
        const currentDate = new Date();
        if (requestedStartDate < currentDate) {
          throw new Error("Start date cannot be in the past");
        }
        if (requestedEndDate <= requestedStartDate) {
          throw new Error("End date must be after start date");
        }

        // Call service to check availability
        const availability = await vehicleAvailabilityController.checkAvailability(
          vehicleId,
          requestedStartDate,
          requestedEndDate
        );

        return availability;
      } catch (error) {
        console.error('Error checking vehicle availability:', error);
        throw new Error(`Failed to check vehicle availability: ${error.message}`);
      }
    }
};