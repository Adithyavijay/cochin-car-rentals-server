// controllers/manufacturer-controller.js
import manufacturerRepository from '../../repository/manufacturer-repository.js';

class ManufacturerController {
  constructor() {
    this.manufacturerRepository = manufacturerRepository;
  }

  /**
   * @desc Get all manufacturers
   * @returns {Promise<Array>} Promise resolving to an array of manufacturer objects
   */
  async getAllManufacturers() {
    try {
      return await this.manufacturerRepository.getAllManufacturers();
    } catch (error) {
      console.error("Error fetching manufacturers:", error);
      throw new Error("Failed to fetch manufacturers");
    }
  }

  /**
   * @desc Add a new manufacturer
   * @param {string} name - Name of the manufacturer
   * @returns {Promise<Object>} Promise resolving to the created manufacturer object
   */
  async addManufacturer(name) {
    try {
      return await this.manufacturerRepository.createManufacturer(name);
    } catch (error) {
      console.error("Error adding manufacturer:", error);
      throw new Error("Failed to add manufacturer");
    }
  }

  /**
   * @desc Update an existing manufacturer
   * @param {string} id - ID of the manufacturer to update
   * @param {string} name - New name for the manufacturer
   * @returns {Promise<Object>} Promise resolving to the updated manufacturer object
   */
  async updateManufacturer(id, name) {
    try {
      return await this.manufacturerRepository.updateManufacturer(id, name);
    } catch (error) {
      console.error("Error updating manufacturer:", error);
      throw new Error("Failed to update manufacturer");
    }
  }

  /**
   * @desc Delete a manufacturer
   * @param {string} id - ID of the manufacturer to delete
   * @returns {Promise<Object>} Promise resolving to the deleted manufacturer object
   */
  async deleteManufacturer(id) {
    try {
      return await this.manufacturerRepository.deleteManufacturer(id);
    } catch (error) {
      console.error("Error deleting manufacturer:", error);
      throw new Error("Failed to delete manufacturer");
    }
  }
}

// Create and export an instance of ManufacturerController
export default new ManufacturerController();