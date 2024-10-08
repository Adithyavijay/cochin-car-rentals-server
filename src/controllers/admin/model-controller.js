import modelRepository from '../../repository/model-repository.js';

class ModelController {
  static async addModel(input) {
    try {
      return await modelRepository.createModel(input);
    } catch (error) {
      console.error("Error in addModel:", error);
      throw new Error("Failed to add model");
    }
  }

  static async updateModel(id, input) {
    try {
      return await modelRepository.updateModel(id, input);
    } catch (error) {
      console.error("Error in updateModel:", error);
      throw new Error("Failed to update model");
    }
  }

  static async deleteModel(id) {
    try {
      return await modelRepository.deleteModel(id);
    } catch (error) {
      console.error("Error in deleteModel:", error);
      throw new Error("Failed to delete model");
    }
  }

  static async getAllModels() {
    try {
      return await modelRepository.getAllModels();
    } catch (error) {
      console.error("Error in getAllModels:", error);
      throw new Error("Failed to fetch models");
    }
  }

  static async getAllManufacturers() {
    try {
      return await modelRepository.getAllManufacturers();
    } catch (error) {
      console.error("Error in getAllManufacturers:", error);
      throw new Error("Failed to fetch manufacturers");
    }
  }
}

export default ModelController;