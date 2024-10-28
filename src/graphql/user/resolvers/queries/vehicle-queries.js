import vehicleController from "../../../../controllers/user/vehicle-controller.js";

export const vehicleQueryResolvers = {
    /**
   * @desc Resolver for fetching available vehicles for rent
   * @returns {Promise<Array>} Promise resolving to array of available vehicles
   */
  getAvailableVehiclesForRent: async (_, __, { }) => {

    try {
      console.log('Resolver: Fetching available vehicles for rent');
      const vehicles = await vehicleController.getAvailableVehiclesForRent();
      return vehicles;
    } catch (error) {
      console.error('Resolver Error:', error);
      throw new Error('Failed to fetch available vehicles');
    } 
  } ,  
  searchVehiclesUser: async (_, { input }, { }) => {
    return vehicleController.searchVehicles(input);
  },

}