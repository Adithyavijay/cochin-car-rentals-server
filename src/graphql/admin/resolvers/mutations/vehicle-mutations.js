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

    importVehicles: async (_, args) => {
        try {
          
          const { file } = args;
          
          if (!file) {
            console.error("Invalid file received in importVehicles resolver");
            return {
              success: false,
              message: "Invalid file upload",
              importedCount: 0
            };
          }
      
        
      
          // Access the promise directly from the Upload instance
          const resolvedFile = await file.promise;
          
          
          if (!resolvedFile.createReadStream) {
            console.error("Resolved file object does not have createReadStream method");
            return {
              success: false,
              message: "Invalid file upload",
              importedCount: 0
            };
          }
      
          const { createReadStream, filename, mimetype } = resolvedFile;
          const stream = createReadStream();
          
     
          return await vehicleController.importVehiclesFromExcel(stream, filename, mimetype);
        } catch (error) {
          console.error("Error in importVehicles resolver:", error);
          return {
            success: false,
            message: `Error processing file upload: ${error.message}`,
            importedCount: 0
          };
        }
      },
    
};
