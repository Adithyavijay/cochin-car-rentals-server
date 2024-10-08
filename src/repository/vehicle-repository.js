import { prisma } from '../config/prisma.js';

class VehicleRepository { 


  /**
   * @desc Create a new vehicle in the database
   * @param {Object} vehicleData - Vehicle data to be stored
   * @returns {Object} Created vehicle object
   */
  async createVehicle(vehicleData) {
    return prisma.vehicle.create({
      data: vehicleData,
      include: {
        manufacturer: true,
        model: true
      }
    });
  }

  /**
   * @desc Find a vehicle by its ID
   * @param {string} id - ID of the vehicle to find
   * @returns {Object} Found vehicle object
   */
  async findVehicleById(id) {
    return prisma.vehicle.findUnique({
      where: { id },
      include: {
        manufacturer: true,
        model: true
      }
    });
  }

  /**
   * @desc Fetch all vehicles from the database
   * @returns {Array} Array of vehicle objects
   */
  async getAllVehicles() {
    return prisma.vehicle.findMany({
      include: { 
        manufacturer: true, 
        model: true
      }
    });
  }

  /**
   * @desc Update an existing vehicle in the database
   * @param {string} id - ID of the vehicle to update
   * @param {Object} updateData - Updated vehicle data
   * @returns {Object} Updated vehicle object
   */
  async updateVehicle(id, updateData) {
    return prisma.vehicle.update({
      where: { id },
      data: updateData,
      include: {
        manufacturer: true,
        model: true
      }
    });
  }

  /**
   * @desc Delete a vehicle from the database
   * @param {string} id - ID of the vehicle to delete
   * @returns {Object} Deleted vehicle object
   */
  async deleteVehicle(id) {
    return prisma.vehicle.delete({
      where: { id },
      include: {
        manufacturer: true,
        model: true
      }
    });
  }
}

export default new VehicleRepository();