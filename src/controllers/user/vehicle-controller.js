    import vehicleRepository from "../../repository/vehicle-repository.js";
    import typesenseClient from '../../config/typesense-config.js'

    class VehicleController {
      constructor() {
        this.vehicleRepository = vehicleRepository;
       
      }

      /**
       * @desc Get all available vehicles for rent
       * @returns {Promise<Array>} Array of available vehicles
       */
      async getAvailableVehiclesForRent() { 
      
        try {
          console.log('Controller: Getting available vehicles');
          const vehicles = await this.vehicleRepository.getAvailableVehicles();
          return vehicles;
        } catch (error) {
          console.error('Controller Error:', error);
          throw new Error(' ailed to get available vehicles');
        }
      } 

      
  /**
     * @desc Get all available vehicles for rent
     * @returns {Promise<Array>} Array of available vehicles
     */
  async getAvailableVehiclesForRent() {
    try {
      console.log('Controller: Getting available vehicles');
      const vehicles = await this.vehicleRepository.getAvailableVehicles();
      return vehicles;
    } catch (error) {
      console.error('Controller Error:', error);
      throw new Error('Failed to get available vehicles');
    }
  }

  /**
   * @desc Search vehicles with filters and return complete vehicle data
   * @param {Object} searchInput - Search parameters and filters
   * @returns {Promise<Object>} Search results with vehicles and facets
   */
  async searchVehicles(searchInput) {
    try { 
     
      // Destructure with default values
      const {
        searchTerm = '',
        priceRange = { min: 0, max: Number.MAX_SAFE_INTEGER },
        categories = [],
        transmission = [],
        fuelType = [],
        manufacturers = [],
        seatingCapacity = [],
        page = 1,
        limit = 10
      } = searchInput;

      // Build search parameters
      const searchParameters = {
        q: searchTerm || '*',
        query_by: 'name,manufacturer,model',
        sort_by: 'dailyRate:asc',
        page,
        per_page: limit,
        facet_by: 'manufacturer,category,transmission,fuelType,seatingCapacity',
        max_facet_values: 100,
        filter_by: this.constructFilterString({
          priceRange,
          categories,
          transmission,
          fuelType,
          manufacturers,
          seatingCapacity
        })
      };
      // Execute search
      const searchResults = await typesenseClient
        .collections('vehicles')
        .documents()
        .search(searchParameters);
      // Process results
      return this.processSearchResults(searchResults);
    } catch (error) {
      console.error('Error in searchVehicles:', error);
      throw new Error(`Search operation failed: ${error.message}`);
    }
  }

  /** 
   * @desc Construct filter string for Typesense query
   * @param {Object} filters - Filter parameters
   * @returns {string} Formatted filter string
   */
  constructFilterString({ priceRange, categories, transmission, fuelType, manufacturers, seatingCapacity }) {
    const filterConditions = [];

    // Price range filters
    if (priceRange?.min > 0) {
      filterConditions.push(`dailyRate:>=${priceRange.min}`);
    }
    if (priceRange?.max < Number.MAX_SAFE_INTEGER) {
      filterConditions.push(`dailyRate:<=${priceRange.max}`);
    }

    // Array-based filters
    const arrayFilters = {
      category: categories,
      transmission: transmission,
      fuelType: fuelType,
      manufacturer: manufacturers,
      seatingCapacity: seatingCapacity
    };
    // Add array filters if they have values
    Object.entries(arrayFilters).forEach(([key, values]) => {
      if (values && values.length > 0) {
        filterConditions.push(`${key}:[${values.join(',')}]`);
      }
    });
    console.log(filterConditions)
    return filterConditions.length > 0 ? filterConditions.join(' && ') : '';
  }

  /**
   * @desc Process and format search results
   * @param {Object} searchResults - Raw search results from Typesense
   * @returns {Promise<Object>} Formatted search results
   */
  async processSearchResults(searchResults) {   
    console.log(searchResults.facet_counts[0]) 
    if(!searchResults.hits){
      return {
        results : [],
        totalCount: 0,
        facets : this.formatFacets([])
      }
    }
    
    const vehicleIds = searchResults.hits.map(hit => hit.document.id);
    
    // Handle no results case
    if (vehicleIds.length === 0) {
      return {
        results: [],
        totalCount: 0,
        facets: this.formatFacets(searchResults.facet_counts)
      };
    }
    // Fetch and order vehicles
    const vehicles = await this.vehicleRepository.findVehiclesByIds(vehicleIds);
    const orderedVehicles = this.maintainSearchOrder(vehicleIds, vehicles);

    return {
      results: orderedVehicles,
      totalCount: searchResults.found,
      facets: this.formatFacets(searchResults.facet_counts)
    };
  }

  /**
   * @desc Maintain the order of vehicles as returned by search
   * @param {Array} orderedIds - Array of IDs in desired order
   * @param {Array} vehicles - Array of vehicle objects
   * @returns {Array} Ordered array of vehicles
   */
  maintainSearchOrder(orderedIds, vehicles) {
    return orderedIds
      .map(id => vehicles.find(vehicle => vehicle.id === id))
      .filter(Boolean);
  }

  /**
   * @desc Format facet results for response
   * @param {Object} facets - Raw facet data
   * @returns {Object} Formatted facets
   */
  formatFacets(facetCounts = []) {
    // Initialize empty result
    const result = {
      manufacturers: [],
      categories: [],
      transmission: [],
      fuelTypes: [],
      seatingCapacity: []
    };
  
    // If no facet counts, return empty structure
    if (!Array.isArray(facetCounts)) {
      return result;
    }
  
    // Process each facet
    facetCounts.forEach(facet => {
      const { field_name, counts } = facet;
      
      // Format the counts
      const formattedCounts = counts?.map(count => ({
        value: count.value,
        count: count.count
      })) || [];
  
      // Map to appropriate field
      switch(field_name) {
        case 'manufacturer':
          result.manufacturers = formattedCounts;
          break;
        case 'category':
          result.categories = formattedCounts;
          break;
        case 'transmission':
          result.transmission = formattedCounts;
          break;
        case 'fuelType':
          result.fuelTypes = formattedCounts;
          break;
        case 'seatingCapacity':
          result.seatingCapacity = formattedCounts;
          break;
      }
    });
  
    return result;
  }
  
  // verifying typesense schema 

  async verifySchema() {
    try {
      const collection = await typesenseClient.collections('vehicles').retrieve();
      console.log('Current schema:', JSON.stringify(collection, null, 2));
      
      // Test search to verify facets
      const testSearch = await typesenseClient
        .collections('vehicles')
        .documents()
        .search({
          q: '*',
          facet_by: 'manufacturer,category,transmission,fuelType,seatingCapacity'
        });
        
      console.log('Facet test:', {
        totalHits: testSearch.found,
        facetsPresent: Object.keys(testSearch.facets || {})
      });
    } catch (error) {
      console.error('Schema verification failed:', error);
    }
  }
    }

    export default new VehicleController();