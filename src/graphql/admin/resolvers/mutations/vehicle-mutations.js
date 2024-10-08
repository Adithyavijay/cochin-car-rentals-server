import vehicleController from "../../../../controllers/admin/vehicle-controller.js";

export const vehicleMutationResolvers = {
    // add vehicle
    addVehicle: async (_, { input }) => {
        return vehicleController.addVehicle(input);
    },

    updateVehicle: async (_, { id, input }) => {
        return vehicleController.updateVehicle(id, input);
    },

    /**
     * @desc Delete a vehicle by ID
     * @param {Object} _ - Parent resolver (not used)
     * @param {Object} args - Mutation arguments
     * @param {string} args.id - ID of the vehicle to delete
     * @returns {Promise<Object>} Promise resolving to the deleted vehicle object
     */
    deleteVehicle: async (_, { id }) => { 
        return vehicleController.deleteVehicle(id);
    },
};
