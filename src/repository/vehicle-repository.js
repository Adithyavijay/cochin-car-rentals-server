import { prisma } from "../config/prisma.js";

class VehicleRepository {
    /**
     * @desc Create a new vehicle in the database
     * @param {Object} vehicleData - Vehicle data to be stored
     * @returns {Object} Created vehicle object
     */
    async createVehicle(vehicleData) {
        return prisma.vehicle.create({
            data: vehicleData,
            include: {
                manufacturer: true,
                model: true,
            },
        });
    }

    /**
     * @desc Find a vehicle by its ID
     * @param {string} id - ID of the vehicle to find
     * @returns {Object} Found vehicle object
     */
    async findVehicleById(id) {
        return prisma.vehicle.findUnique({
            where: { id },
            include: {
                manufacturer: true,
                model: true,
            },
        });
    }

    /**
     * @desc Fetch all vehicles from the database
     * @returns {Array} Array of vehicle objects
     */
    async getAllVehicles() {
        return prisma.vehicle.findMany({
            include: {
                manufacturer: true,
                model: true,
            },
        });
    }

    /**
     * @desc Update an existing vehicle in the database
     * @param {string} id - ID of the vehicle to update
     * @param {Object} updateData - Updated vehicle data
     * @returns {Object} Updated vehicle object
     */
    async updateVehicle(id, updateData) {
        return prisma.vehicle.update({
            where: { id },
            data: updateData,
            include: {
                manufacturer: true,
                model: true,
            },
        });
    }

    /**
     * @desc Delete a vehicle from the database
     * @param {string} id - ID of the vehicle to delete
     * @returns {Object} Deleted vehicle object
     */
    async deleteVehicle(id) {
        return prisma.vehicle.delete({
            where: { id },
            include: {
                manufacturer: true,
                model: true,
            },
        });
    }
    /**
     * @desc Find a vehicle by manufacturer name and model name
     * @param {string} manufacturerName - Name of the manufacturer
     * @param {string} modelName - Name of the model
     * @returns {Promise<Object|null>} Found vehicle object or null if not found
     */
    /**
     * @desc Find a vehicle by name, manufacturer name, and model name (case-insensitive and ignoring spaces)
     * @param {string} name - Name of the vehicle
     * @param {string} manufacturerName - Name of the manufacturer
     * @param {string} modelName - Name of the model
     * @returns {Promise<Object|null>} Found vehicle object or null if not found
     */
    async findByNameManufacturerAndModel(name, manufacturerName, modelName) {
        try {
            const vehicle = await prisma.vehicle.findFirst({
                where: {
                    name: {
                        equals: name,
                        mode: "insensitive",
                    },
                    manufacturer: {
                        name: {
                            equals: manufacturerName,
                            mode: "insensitive",
                        },
                    },
                    model: {
                        name: {
                            equals: modelName,
                            mode: "insensitive",
                        },
                    },
                },
                include: {
                    manufacturer: true,
                    model: true,
                },
            });

            return vehicle;
        } catch (error) {
            console.error("Error in findByNameManufacturerAndModel:", error);
            return null;
        }
    }

    /**
     * @desc Find multiple vehicles by their IDs
     * @param {string[]} ids - Array of vehicle IDs
     * @returns {Promise<Array>} Array of vehicle objects with their relationships
     */
    async findVehiclesByIds(ids) {
        try {
            const vehicles = await prisma.vehicle.findMany({
                where: {
                    id: {
                        in: ids,
                    },
                },
                include: {
                    manufacturer: true,
                    model: true,
                },
                orderBy: {
                    name: "asc", // Default ordering, will be overridden by Typesense order
                },
            });

            // Add error handling for no vehicles found
            if (!vehicles || vehicles.length === 0) {
                console.log(`No vehicles found for ids: ${ids.join(", ")}`);
                return [];
            }

            return vehicles;
        } catch (error) {
            console.error("Error in findVehiclesByIds:", error);
            throw new Error(
                `Failed to fetch vehicles by ids: ${error.message}`
            );
        }
    }
    /**
     * @desc Fetch all available vehicles from database
     * @returns {Promise<Array>} Promise resolving to array of available vehicles
     */
    async getAvailableVehicles() {
        try {
            console.log("Repository: Fetching from database");
            const vehicles = await prisma.vehicle.findMany({
                where: {
                    availableQuantity: {
                        gt: 0,
                    },
                    maintenanceStatus: {
                        not: "IN_MAINTENANCE",
                    },
                },
                include: {
                    manufacturer: true,
                    model: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            console.log(
                `Repository: Found ${vehicles.length} available vehicles`
            );
            return vehicles;
        } catch (error) {
            console.error("Repository Error:", error);
            throw new Error("Database error while fetching vehicles");
        }
    }
}

export default new VehicleRepository();
