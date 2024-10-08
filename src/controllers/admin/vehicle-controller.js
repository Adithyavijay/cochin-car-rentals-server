import vehicleRepository from '../../repository/vehicle-repository.js';
import fileService from '../../services/file-service.js';
import { getFilenameFromUrl } from '../../utils/file-utils.js';
import manufacturerRepository from '../../repository/manufacturer-repository.js';
import modelRepository from '../../repository/model-repository.js';
/**
 * @desc VehicleController class for handling vehicle-related operations
 */
class VehicleController {
  constructor() {
    this.vehicleRepository = vehicleRepository;
    this.fileService = fileService; 
    this.manufacturerRepository=manufacturerRepository;
    this.modelRepository=modelRepository;
  }

  /**
   * @desc Add a new vehicle
   * @param {Object} input - Vehicle input data
   * @returns {Object} Created vehicle object
   */
  async addVehicle(input) {
    try {
        // 1. Upload the images
        const primaryImageUrl = await this.fileService.uploadFile(input.primaryImage, 'vehicles');
        const otherImageUrls = await Promise.all(input.otherImages.map(file => this.fileService.uploadFile(file, 'vehicles')));

        // 2. Check if manufacturer and model exist
        const manufacturer = await this.manufacturerRepository.findById(input.manufacturerId);
        if (!manufacturer) {
            throw new Error("Manufacturer not found");
        }

        const model = await this.modelRepository.findById(input.modelId);
        if (!model) {
            throw new Error("Model not found");
        }

        // 3. Prepare vehicle data with connect for relationships
        const vehicleData = {
            name: input.name,
            manufacturer: { connect: { id: input.manufacturerId } }, // Using connect here
            model: { connect: { id: input.modelId } }, // Using connect here
            price: input.price,
            quantity: input.quantity,
            primaryImage: primaryImageUrl,
            otherImages: otherImageUrls,
        };

        // 4. Save vehicle in the database
        const vehicle = await this.vehicleRepository.createVehicle(vehicleData);
        console.log(`Vehicle added to database: ${vehicle.id}`);

        // 5. Return the vehicle with manufacturer and model data
        return {
            ...vehicle,
            manufacturer, // Return the full manufacturer object
            model,        // Return the full model object
        };
    } catch (error) {
        console.error("Error in addVehicle:", error);
        throw new Error("Failed to add vehicle");
    }
}
  /**
   * @desc Get all vehicles
   * @returns {Array} Array of vehicle objects
   */
  async getAllVehicles() {
    try {
      return await this.vehicleRepository.getAllVehicles();
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      throw new Error("Failed to fetch vehicles");
    }
  } 

  async updateVehicle(id, input) {
    try {
      const {
        name,
        manufacturerId,
        modelId,
        price,
        quantity,
        primaryImage,
        otherImages,
      } = input;
      console.log("Update input:", input);
  
      const existingVehicle = await this.vehicleRepository.findVehicleById(id);
  
      if (!existingVehicle) {
        throw new Error("Vehicle not found");
      }
  
      // Validate manufacturer and model
      const manufacturer = await this.manufacturerRepository.findById(manufacturerId);
      if (!manufacturer) {
        throw new Error("Manufacturer not found");
      }
  
      const model = await this.modelRepository.findById(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
  
      // Handle primary image
      let primaryImageUrl = existingVehicle.primaryImage;
      if (primaryImage) {
        if (existingVehicle.primaryImage) {
          await this.fileService.deleteFile(getFilenameFromUrl(existingVehicle.primaryImage));
        }
        primaryImageUrl = await this.fileService.uploadFile(primaryImage, 'vehicles');
      }
  
      // Handle other images
      let otherImageUrls = existingVehicle.otherImages;
      if (otherImages && otherImages.length > 0) {
        for (const oldImageUrl of existingVehicle.otherImages) {
          await this.fileService.deleteFile(getFilenameFromUrl(oldImageUrl));
        }
        otherImageUrls = await Promise.all(otherImages.map(file => this.fileService.uploadFile(file, 'vehicles')));
      }
  
      const updatedVehicle = await this.vehicleRepository.updateVehicle(id, {
        name: name || existingVehicle.name,
        manufacturer: { connect: { id: manufacturerId } },
        model: { connect: { id: modelId } },
        price: price || existingVehicle.price,
        quantity: quantity || existingVehicle.quantity,
        primaryImage: primaryImageUrl,
        otherImages: otherImageUrls,
      });
  
      return updatedVehicle;
    } catch (error) {
      console.error("Error updating vehicle:", error);
      throw new Error(`Failed to update vehicle: ${error.message}`);
    }
  }

  // In vehicle-controller.js

/**
 * @desc Delete a vehicle by its ID
 * @param {string} id - ID of the vehicle to delete
 * @returns {Object} Deleted vehicle object
 */
async deleteVehicle(id) {
  try {
    // Fetch the vehicle to get image URLs
    const vehicle = await this.vehicleRepository.findVehicleById(id);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    // Delete the primary image
    if (vehicle.primaryImage) {
      await this.fileService.deleteFile(getFilenameFromUrl(vehicle.primaryImage));
    }

    // Delete other images
    if (vehicle.otherImages && vehicle.otherImages.length > 0) {
      for (const imageUrl of vehicle.otherImages) {
        await this.fileService.deleteFile(getFilenameFromUrl(imageUrl));
      }
    }

    // Delete the vehicle from the database
    const deletedVehicle = await this.vehicleRepository.deleteVehicle(id);
    
    console.log(`Vehicle deleted from database: ${id}`);
    return deletedVehicle
  } catch (error) {
    console.error("Error in deleteVehicle:", error);
    throw new Error("Failed to delete vehicle");
  }
}

}

// Create and export an instance of VehicleController
export default new VehicleController();