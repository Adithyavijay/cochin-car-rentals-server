import manufacturerController from '../../../../controllers/admin/manufacturer-controller.js';

export const manufacturerMutationResolvers = {
    /**
     * @desc Adds a new manufacturer to the database
     * @param {Object} _ - Parent resolver (not used)
     * @param {Object} args - Mutation arguments
     * @param {string} args.name - Name of the manufacturer
     * @param {Object} context - GraphQL context
     * @returns {Promise<Object>} Promise resolving to the created manufacturer object
     */
    addManufacturer: async (_, { name }, { }) => {
      return manufacturerController.addManufacturer(name);
    },
  
    /**
     * @desc Updates an existing manufacturer in the database
     * @param {Object} _ - Parent resolver (not used)
     * @param {Object} args - Mutation arguments
     * @param {string} args.id - ID of the manufacturer to update
     * @param {string} args.name - New name for the manufacturer
     * @param {Object} context - GraphQL context
     * @returns {Promise<Object>} Promise resolving to the updated manufacturer object
     */
    updateManufacturer: async (_, { id, name }, { }) => {
      return manufacturerController.updateManufacturer(id, name);
    },
  
    /**
     * @desc Deletes a manufacturer from the database
     * @param {Object} _ - Parent resolver (not used)
     * @param {Object} args - Mutation arguments
     * @param {string} args.id - ID of the manufacturer to delete
     * @param {Object} context - GraphQL context
     * @returns {Promise<Object>} Promise resolving to the deleted manufacturer object
     */
    deleteManufacturer: async (_, { id }, { }) => {
      return manufacturerController.deleteManufacturer(id);
    }
  };