import vehicleRepository from '../../repository/vehicle-repository.js';
import fileService from '../../services/file-service.js';
import { getFilenameFromUrl } from '../../utils/file-utils.js';
import manufacturerRepository from '../../repository/manufacturer-repository.js';
import modelRepository from '../../repository/model-repository.js'; 
import { prisma } from '../../config/prisma.js';
import xlsx from 'xlsx';
import typesenseClient from '../../config/typesense-config.js';
import { SearchClient } from 'typesense';
/**
 * @desc VehicleController class for handling vehicle-related operations
 */ 
class VehicleController {
  constructor() {
    this.vehicleRepository = vehicleRepository;
    this.fileService = fileService; 
    this.manufacturerRepository=manufacturerRepository;
    this.modelRepository=modelRepository;
    this.initializeTypesenseSchema();
  }
    
  /**
   * @desc Initialize Typesense schema for vehicles
   */
    async initializeTypesenseSchema() {  
      // try{ 
      //   if(typesenseClient.collections('vehicles'))
      //   await typesenseClient.collections('vehicles').delete();
      // }catch(err){
      //   console.log(err)
      // }
      
      const schema = {
        name: 'vehicles',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'name', type: 'string', facet: true },
          { name: 'manufacturer', type: 'string', facet: true },
          { name: 'model', type: 'string', facet: true },
          { name: 'dailyRate', type: 'float', facet: true },
          { name: 'category', type: 'string', facet: true },
          { name: 'transmission', type: 'string', facet: true },
          { name: 'fuelType', type: 'string', facet: true },  // Changed from fuelType
          { name: 'seatingCapacity', type: 'int32', facet: true },  // Changed from seatingCapacity
          { name: 'yearOfManufacture', type: 'int32', facet: true },
        ],
        default_sorting_field: 'dailyRate'
      };

      try {
        await typesenseClient.collections('vehicles').retrieve();
        console.log('Typesense schema already exists');
      } catch (error) {
        if (error.httpStatus === 404) {
          await typesenseClient.collections().create(schema);
          console.log('Typesense schema created');
        } else {
          console.error('Error initializing Typesense schema:', error);
        }
      }
    }

  /**
   * @desc Add a new vehicle
   * @param {Object} input - Vehicle input data
   * @returns {Object} Created vehicle object
   */
  async addVehicle(input) {
    try { 
      console.log('hello user')
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
        manufacturer: { connect: { id: input.manufacturerId } },
        model: { connect: { id: input.modelId } },
        dailyRate: input.dailyRate,
        availableQuantity: input.availableQuantity,
        primaryImage: primaryImageUrl,
        otherImages: otherImageUrls,
        category: input.category,
        description: input.description,
        transmission: input.transmission,
        seatingCapacity: input.seatingCapacity,
        yearOfManufacture: input.yearOfManufacture,
        maintenanceStatus: input.maintenanceStatus,
        fuelType : input.fuelType
        
      };

      // 4. Save vehicle in the database
      const vehicle = await this.vehicleRepository.createVehicle(vehicleData);
      console.log(`Vehicle added to database: ${vehicle.id}`);

      // 5. Add vehicle to Typesense
      await this.addVehicleToTypesense(vehicle);

      // 6. Return the vehicle with manufacturer and model data
      return {
        ...vehicle,
        manufacturer,
        model,
      };
    } catch (error) {
      console.error("Error in addVehicle:", error);
      throw new Error("Failed to add vehicle");
    }
  }


  /**
   * @desc Add a vehicle to Typesense
   * @param {Object} vehicle - Vehicle object
   */
  async addVehicleToTypesense(vehicle) {
    try {
      const typesenseDocument = {
        id: vehicle.id,
        name: vehicle.name,
        manufacturer: vehicle.manufacturer.name,
        model: vehicle.model.name,
        dailyRate: vehicle.dailyRate,
        category: vehicle.category,
        transmission: vehicle.transmission,
        yearOfManufacture: vehicle.yearOfManufacture,
        fuelType : vehicle.fuelType,
        seatingCapacity : vehicle.seatingCapacity
      };

      await typesenseClient.collections('vehicles').documents().create(typesenseDocument);
      console.log(`Vehicle added to Typesense: ${vehicle.id}`);
    } catch (error) {
      console.error("Error adding vehicle to Typesense:", error);
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

   /**
   * @desc Update a vehicle
   * @param {string} id - Vehicle ID
   * @param {Object} input - Updated vehicle data
   * @returns {Object} Updated vehicle object
   */
   async updateVehicle(id, input) {
    try {
      const existingVehicle = await this.vehicleRepository.findVehicleById(id);
      if (!existingVehicle) {
        throw new Error("Vehicle not found");
      }

      // Handle image updates
      let primaryImageUrl = existingVehicle.primaryImage;
      if (input.primaryImage) {
        await this.fileService.deleteFile(getFilenameFromUrl(existingVehicle.primaryImage));
        primaryImageUrl = await this.fileService.uploadFile(input.primaryImage, 'vehicles');
      }

      let otherImageUrls = existingVehicle.otherImages;
      if (input.otherImages && input.otherImages.length > 0) {
        for (const oldImageUrl of existingVehicle.otherImages) {
          await this.fileService.deleteFile(getFilenameFromUrl(oldImageUrl));
        }
        otherImageUrls = await Promise.all(input.otherImages.map(file => this.fileService.uploadFile(file, 'vehicles')));
      }

      const updatedVehicleData = {
        ...input,
        primaryImage: primaryImageUrl,
        otherImages: otherImageUrls,
      };

      const updatedVehicle = await this.vehicleRepository.updateVehicle(id, updatedVehicleData);

      // Update Typesense
      await this.updateVehicleInTypesense(updatedVehicle);

      return updatedVehicle;
    } catch (error) {
      console.error("Error updating vehicle:", error);
      throw new Error(`Failed to update vehicle: ${error.message}`);
    }
  } 

    /**
   * @desc Update a vehicle in Typesense
   * @param {Object} vehicle - Updated vehicle object
   */
    async updateVehicleInTypesense(vehicle) {
      try {
        const typesenseDocument = {
          id: vehicle.id,
          name: vehicle.name,
          manufacturer: vehicle.manufacturer.name,
          model: vehicle.model.name,
          dailyRate: vehicle.dailyRate,
          category: vehicle.category,
          transmission: vehicle.transmission,
          yearOfManufacture: vehicle.yearOfManufacture
        };
  
        await typesenseClient.collections('vehicles').documents(vehicle.id).update(typesenseDocument);
        console.log(`Vehicle updated in Typesense: ${vehicle.id}`);
      } catch (error) {
        console.error("Error updating vehicle in Typesense:", error);
      }
    }


  /**
   * @desc Delete a vehicle by its ID
   * @param {string} id - ID of the vehicle to delete
   * @returns {Object} Deleted vehicle object
   */
  async deleteVehicle(id) {
    try {
      const vehicle = await this.vehicleRepository.findVehicleById(id);
      if (!vehicle) {
        throw new Error("Vehicle not found");
      }

      // Delete images
      await this.fileService.deleteFile(getFilenameFromUrl(vehicle.primaryImage));
      for (const imageUrl of vehicle.otherImages) {
        await this.fileService.deleteFile(getFilenameFromUrl(imageUrl));
      }

      const deletedVehicle = await this.vehicleRepository.deleteVehicle(id);

      // Delete from Typesense
      await this.deleteVehicleFromTypesense(id);

      console.log(`Vehicle deleted from database: ${id}`);
      return deletedVehicle;
    } catch (error) {
      console.error("Error in deleteVehicle:", error);
      throw new Error("Failed to delete vehicle");
    }
  }

    /**
   * @desc Delete a vehicle from Typesense
   * @param {string} id - Vehicle ID
   */
    async deleteVehicleFromTypesense(id) {
      try {
        await typesenseClient.collections('vehicles').documents(id).delete();
        console.log(`Vehicle deleted from Typesense: ${id}`);
      } catch (error) {
        console.error("Error deleting vehicle from Typesense:", error);
      }
    }


  
  /**
 * @desc Search for vehicles using Typesense
 * @param {string} query - Search query
 * @param {Object} filters - Filter options (minPrice, maxPrice, sortBy)
 * @returns {Promise<Array>} Array of matching vehicle objects
 */
async searchVehicles(query, { minPrice, maxPrice, sortBy } = {}) {
  try {

      const searchParameters = {
          q: query,
          query_by: 'name,manufacturer,model',
          sort_by: sortBy || 'dailyRate:asc',
          filter_by: '',
          per_page: 100
      };

      // Build filter conditions array
      const filterConditions = [];

      if (minPrice) {
          filterConditions.push(`dailyRate:>=${minPrice}`);
      }

      if (maxPrice) {
          filterConditions.push(`dailyRate:<=${maxPrice}`);
      }

      // Join filter conditions if they exist
      if (filterConditions.length > 0) {
          searchParameters.filter_by = filterConditions.join(' && ');
      }

      console.log('Search parameters:', searchParameters);

      // Perform the search
      const searchResults = await typesenseClient
          .collections('vehicles')
          .documents()
          .search(searchParameters);

      console.log(`Found ${searchResults.hits.length} results`);

      // Extract vehicle IDs from search results
      const vehicleIds = searchResults.hits.map(hit => hit.document.id);

      if (vehicleIds.length === 0) {
          return [];
      }

      // Fetch complete vehicle details from database
      const vehicles = await this.vehicleRepository.findVehiclesByIds(vehicleIds);

      // Maintain the order from search results
      const orderedVehicles = vehicleIds
          .map(id => vehicles.find(vehicle => vehicle.id === id))
          .filter(Boolean);

      return orderedVehicles;

  } catch (error) {
      console.error("Error in searchVehicles:", error);
      throw new Error(`Failed to search vehicles: ${error.message}`);
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