import vehicleRepository from '../../repository/vehicle-repository.js';
import fileService from '../../services/file-service.js';
import { getFilenameFromUrl } from '../../utils/file-utils.js';
import manufacturerRepository from '../../repository/manufacturer-repository.js';
import modelRepository from '../../repository/model-repository.js'; 
import { prisma } from '../../config/prisma.js';
import xlsx from 'xlsx'
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
        console.log(input)
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
        console.log(vehicleData)

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
        otherImages: [otherImageUrls],
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


  /**
   * @desc Import vehicles from Excel file
   * @param {Readable} stream - File stream
   * @param {string} filename - Original filename
   * @param {string} mimetype - File MIME type
   * @returns {Object} Import result
   */
  async importVehiclesFromExcel(stream, filename, mimetype) {
    if (!mimetype.includes('spreadsheet')) {
      throw new Error('Invalid file type. Please upload an Excel file.');
    }

    try {
      const buffer = await this.streamToBuffer(stream);
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet); 
      

      let importedCount = 0;
      const errors = [];

      for (const row of data) {
        try {
          await this.processVehicleRow(row);
          importedCount++;
        } catch (error) {
          errors.push(`Row ${data.indexOf(row) + 2}: ${error.message}`);
        }
      }

      const message = errors.length > 0
        ? `Imported ${importedCount} vehicles with ${errors.length} errors. Errors: ${errors.join('; ')}`
        : `Successfully imported ${importedCount} vehicles`;

      return {
        success: importedCount > 0,
        message,
        importedCount,
      };
    } catch (error) {
      console.error('Error importing vehicles:', error);
      return {
        success: false,
        message: `Error importing vehicles: ${error.message}`,
        importedCount: 0,
      };
    }
  }

  /**
   * @desc Process a single row from the Excel file
   * @param {Object}  - Row data
   */
  async processVehicleRow(row) {
    const { name, manufacturer, model, price, quantity, primaryImage, otherImages } = row;
  
    // Input validation
    if (!name || !manufacturer || !model || !price || !quantity) {
      throw new Error('Missing required fields');
    }
  
    // Normalize input by trimming whitespace
    const normalizedName = name.trim();
    const normalizedManufacturer = manufacturer.trim();
    const normalizedModel = model.trim();
  
    let processedPrimaryImage = null;
    if (primaryImage) {
      processedPrimaryImage = await this.fileService.downloadAndUploadImage(primaryImage, 'vehicles');
    } 

    console.log('primaryImage',processedPrimaryImage)
  
    // Process otherImages
    let processedOtherImages = [];
    if (otherImages) {
      const imageUrls = otherImages
        .split(/,\s*|\n/)
        .map(url => url.trim())
        .filter(url => url !== '');
  
      processedOtherImages = await Promise.all(
        imageUrls.map(url => this.fileService.downloadAndUploadImage(url, 'vehicles'))
      );
    }
  
    // Check if the vehicle already exists
    const existingVehicle = await this.vehicleRepository.findByNameManufacturerAndModel(
      normalizedName,
      normalizedManufacturer,
      normalizedModel
    );
  
    if (existingVehicle) {
      // Update existing vehicle
      const updatedVehicleData = {
        price: price,
        quantity: quantity,
        primaryImage: processedPrimaryImage || existingVehicle.primaryImage,
        otherImages: processedOtherImages.length > 0 ? processedOtherImages : existingVehicle.otherImages,
      };
  
      await this.vehicleRepository.updateVehicle(existingVehicle.id, updatedVehicleData);
      console.log(`Updated existing vehicle: ${normalizedName} (${normalizedManufacturer} ${normalizedModel})`);
    } else {
      // Find or create manufacturer
      let manufacturerDoc = await manufacturerRepository.findByName(normalizedManufacturer);
      if (!manufacturerDoc) {
        manufacturerDoc = await manufacturerRepository.create({ name: normalizedManufacturer });
      }
      
      // Find or create model
      let modelDoc = await modelRepository.findByNameAndManufacturer(normalizedModel, manufacturerDoc.id);
      if (!modelDoc) {
        modelDoc = await modelRepository.createModel({ name: normalizedModel, manufacturerId: manufacturerDoc.id });
      }
  
      // Create new vehicle
      const newVehicleData = {
        name: normalizedName,
        manufacturer: { connect: { id: manufacturerDoc.id } },
        model: { connect: { id: modelDoc.id } },
        price: price,
        quantity: quantity,
        primaryImage: processedPrimaryImage || 'http://localhost:9000/vehicles/default-image.png',
        otherImages: processedOtherImages,
      };
  
      await this.vehicleRepository.createVehicle(newVehicleData);
      console.log(`Created new vehicle: ${normalizedName} (${normalizedManufacturer} ${normalizedModel})`);
    }
  }
  /**
   * @desc Convert a readable stream to a buffer
   * @param {Readable} stream - Readable stream
   * @returns {Promise<Buffer>} Buffer
   */
  streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

}

// Create and export an instance of VehicleController
export default new VehicleController();