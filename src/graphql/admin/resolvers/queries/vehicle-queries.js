import vehicleController from '../../../../controllers/admin/vehicle-controller.js';

export const vehicleQueryResolvers = {
    /**
  * @desc Retrieves all vehicle details from the database
  * @param {Object} _ - Parent resolver (not used)
  * @param {Object} __ - Query arguments (not used)
  * @param {Object} context - GraphQL context
  * @param {Object} context.adminController - Admin controller instance
  * @returns {Promise<Array>} Promise resolving to an array of vehicle objects
  */
    getAllVehicles: async (_, __, { }) => {  
  
     return vehicleController.getAllVehicles();
   }

 };