import manufacturerController from '../../../../controllers/admin/manufacturer-controller.js';

export const manufacturerQueryResolvers = {
  /**
   * @desc Retrieves all manufacturer details from the database
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} __ - Query arguments (not used)
   * @param {Object} context - GraphQL context
   * @returns {Promise<Array>} Promise resolving to an array of manufacturer objects
   */
  getAllManufacturers: async (_, __, { }) => { 
    return manufacturerController.getAllManufacturers();
  }
};