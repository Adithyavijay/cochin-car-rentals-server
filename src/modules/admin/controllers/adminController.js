import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createAdminRepository } from '../repository/AdminRepository.js';

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

/**
 * @desc Create admin controller
 * @param {Object} prisma - Prisma client instance
 * @returns {Object} Object containing controller functions
 */
export function createAdminController(prisma) {
    const repository = createAdminRepository(prisma);
    
    return {  
        /**
         * @desc Authenticate admin and generate JWT token
         * @param {string} email - Admin's email
         * @param {string} password - Admin's password
         * @param {Object} res - Express response object
         * @returns {string} Authentication status message
         */ 
        
        async login(email, password, res) {
            try { 
                
                const admin = await repository.findAdminByEmail(email);
                if (!admin) {
                    throw new Error("Invalid credentials");
                }

                const isValid = await bcrypt.compare(password, admin.password);
                if (!isValid) {
                    throw new Error("Invalid credentials");
                }

                const token = jwt.sign(
                    { adminId: admin.id },
                    process.env.JWT_SECRET,
                    { expiresIn: `${THIRTY_DAYS_IN_SECONDS}s` }
                );  

                res.cookie("adminToken", token, {
                    httpOnly: true,
                    maxAge: THIRTY_DAYS_IN_SECONDS * 1000,
                    sameSite: "lax",
                    secure: true,
                    path: "/",
                });

                return "Authentication successful";
            } catch (error) {
                console.error("Login error:", error);
                throw new Error("Authentication failed");
            }
        },

        /**
         * @desc Add a new vehicle
         * @param {Object} input - Vehicle input data
         * @returns {Object} Created vehicle object
         */
        async addVehicle(input) {
            try {
                await repository.ensureBucketExists("vehicles");

                const primaryImageUrl = await repository.uploadFile(input.primaryImage);
                const otherImageUrls = await Promise.all(input.otherImages.map(repository.uploadFile));

                const vehicleData = {
                    ...input,
                    primaryImage: primaryImageUrl,
                    otherImages: otherImageUrls,
                };

                const vehicle = await repository.createVehicle(vehicleData);
                console.log(`Vehicle added to database: ${vehicle.id}`);
                return vehicle;
            } catch (error) {
                console.error("Error in addVehicle:", error);
                throw new Error("Failed to add vehicle");
            }
        },

        /**
         * @desc Get all vehicles
         * @returns {Array} Array of vehicle objects
         */
        async getAllVehicles() {
            try {
                return await repository.getAllVehicles();
            } catch (err) {
                console.error(err);
                throw new Error("Failed to fetch vehicles");
            }
        },
    };
}