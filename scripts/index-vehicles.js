    // scripts/index-vehicles.js
    import { fileURLToPath } from 'url';
    import path from 'path';
    import typesenseClient from '../src/config/typesense-config.js';
    import { prisma } from '../src/config/prisma.js';

    async function clearAndReindexVehicles() {
    try {
        console.log('Starting fresh indexing process...');

        // First, try to delete the existing collection completely
        try {
        await typesenseClient.collections('vehicles').delete();
        console.log('Existing collection deleted successfully');
        } catch (error) {
        if (error.httpStatus === 404) {
            console.log('No existing collection found, proceeding with creation');
        } else {
            console.error('Error deleting collection:', error);
        }
        }

        // Create fresh schema
        const schema = {
        name: 'vehicles',
        fields: [
            { name: 'id', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'manufacturer', type: 'string' },
            { name: 'model', type: 'string' },
            { name: 'dailyRate', type: 'float' },
            { name: 'category', type: 'string' },
            { name: 'transmission', type: 'string' },
            { name: 'yearOfManufacture', type: 'int32' }
        ]
        };

        // Create new collection with schema
        await typesenseClient.collections().create(schema);
        console.log('Created new collection with schema');

        // Fetch all vehicles with their relationships
        const vehicles = await prisma.vehicle.findMany({
        include: {
            manufacturer: true,
            model: true
        }
        });

        console.log(`Found ${vehicles.length} vehicles to index`);

        // Prepare documents for Typesense
        const documents = vehicles.map(vehicle => ({
        id: vehicle.id,
        name: vehicle.name,
        manufacturer: vehicle.manufacturer.name,
        model: vehicle.model.name,
        dailyRate: vehicle.dailyRate,
        category: vehicle.category,
        transmission: vehicle.transmission,
        yearOfManufacture: vehicle.yearOfManufacture
        }));

        // Import documents
        if (documents.length > 0) {
        const results = await typesenseClient
            .collections('vehicles')
            .documents()
            .import(documents);

        console.log(`Successfully indexed ${documents.length} vehicles`);
        
        // Check for any import errors
        const failedItems = results.filter(item => item.success === false);
        if (failedItems.length > 0) {
            console.warn(`Warning: ${failedItems.length} items failed to import`);
            console.warn('Failed items:', failedItems);
        }
        } else {
        console.log('No vehicles found to index');
        }

        return {
        success: true,
        message: `Successfully reindexed ${documents.length} vehicles`
        };

    } catch (error) {
        console.error('Error during indexing process:', error);
        return {
        success: false,
        message: `Indexing failed: ${error.message}`
        };
    } finally {
        await prisma.$disconnect();
    }
    }   
    // Immediately execute when run directly
(async () => {
    try {
      console.log('Starting reindexing process...');
      const result = await clearAndReindexVehicles();
      console.log('Indexing completed:', result);
      process.exit(0);
    } catch (error) {
      console.error('Script failed:', error);
      process.exit(1);
    }
  })();




    // Export for use in other files
    export default clearAndReindexVehicles; 
