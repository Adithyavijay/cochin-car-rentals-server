import { v4 as uuidv4 } from "uuid";
import minioClient from "../../../config/minio.js";

/**
 * @desc Repository functions for admin operations
 * @param {Object} prisma - Prisma client instance
 * @returns {Object} Object containing repository functions
 * 
 * 
 */
export function createAdminRepository(prisma) {
    return {
        /**
         * @desc Find an admin by email
         * @param {string} email - Admin's email
         * @returns {Object|null} Admin object if found, null otherwise
         */
        async findAdminByEmail(email) {
            return prisma.admin.findUnique({
                where: { email },
            });
        },

        /**
         * @desc Create a new vehicle in the database
         * @param {Object} vehicleData - Vehicle data to be stored
         * @returns {Object} Created vehicle object
         */
        async createVehicle(vehicleData) {
            return prisma.vehicle.create({
                data: vehicleData,
            });
        },

        /**
         * @desc Fetch all vehicles from the database
         * @returns {Array} Array of vehicle objects
         */
        async getAllVehicles() {
            return prisma.vehicle.findMany();
        },

        /**
         * @desc Upload a file to MinIO
         * @param {Object} uploadObject - File upload object
         * @returns {string} URL of the uploaded file
         */
        async uploadFile(uploadObject) {
            const file = await uploadObject.promise;
            const { createReadStream, filename, mimetype } = file;
            const stream = createReadStream();
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);

            const fileName = `${uuidv4()}-${filename}`;
            const metaData = {
                "Content-Type": mimetype,
            };

            await minioClient.putObject('vehicles', fileName, buffer, buffer.length, metaData);
            return `${process.env.MINIO_PUBLIC_URL}/vehicles/${fileName}`;
        },

        /**
         * @desc Check if a bucket exists in MinIO, create if it doesn't
         * @param {string} bucketName - Name of the bucket
         */
        async ensureBucketExists(bucketName) {
            const bucketExists = await minioClient.bucketExists(bucketName);
            if (!bucketExists) {
                await minioClient.makeBucket(bucketName, "us-east-1");
                console.log(`'${bucketName}' bucket created.`);
            }
        },
    };
}