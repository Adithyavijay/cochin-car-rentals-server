import { v4 as uuidv4 } from "uuid";
import minioConfig from "../config/minio.js";
import axios from 'axios';

class FileService {
  constructor() {
    this.minioClient = null;
  }

  /**
   * @desc Initialize MinIO client if not already initialized
   */
  async initializeMinioClient() {
    if (!this.minioClient) {
      this.minioClient = await minioConfig.initialize();
    }
    return this.minioClient;
  }

  /**
   * @desc Upload a file to MinIO
   * @param {Object} uploadObject - File upload object
   * @param {string} bucketName - Name of the bucket to upload to
   * @returns {string} URL of the uploaded file
   */
  async uploadFile(uploadObject, bucketName) {
    await this.initializeMinioClient();
    
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

    await this.ensureBucketExists(bucketName);
    await this.minioClient.putObject(bucketName, fileName, buffer, buffer.length, metaData);
    return `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${fileName}`;
  }

  /**
   * @desc Check if a bucket exists in MinIO, create if it doesn't
   * @param {string} bucketName - Name of the bucket
   */
  async ensureBucketExists(bucketName) {
    await this.initializeMinioClient();
    
    const bucketExists = await this.minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(bucketName, "us-east-1");
      // Set up bucket policy for public access
      await minioConfig.updateBucketPolicyWithCORS(bucketName);
      console.log(`'${bucketName}' bucket created and configured.`);
    }
  }

  /**
   * @desc Delete a file from MinIO
   * @param {string} filename - Name of the file to delete
   * @param {string} bucketName - Name of the bucket
   */
  async deleteFile(filename, bucketName = 'vehicles') {
    await this.initializeMinioClient();
    
    try {
      await this.minioClient.removeObject(bucketName, filename);
      console.log(`Deleted file: ${filename} from bucket: ${bucketName}`);
    } catch (err) {
      console.error(`Error deleting file ${filename}:`, err);
      throw err;
    }
  }

  /**
   * @desc Download image from Google Drive and upload to MinIO
   * @param {string} driveLink - Google Drive link of the image
   * @param {string} bucketName - Name of the bucket to upload to
   * @returns {string} URL of the uploaded file in MinIO
   */
  async downloadAndUploadImage(driveLink, bucketName) {
    await this.initializeMinioClient();
    
    try {
      const fileId = this.extractFileIdFromDriveLink(driveLink);
      if (!fileId) {
        throw new Error('Invalid Google Drive link');
      }

      const directLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
      
      const response = await axios({
        method: 'get',
        url: directLink,
        responseType: 'arraybuffer'
      });

      const fileName = `${uuidv4()}.jpg`;
      const fileObject = {
        buffer: response.data,
        mimetype: response.headers['content-type'],
        filename: fileName
      };

      await this.ensureBucketExists(bucketName);
      await this.minioClient.putObject(
        bucketName,
        fileName,
        fileObject.buffer,
        fileObject.buffer.length,
        { 'Content-Type': fileObject.mimetype }
      );

      return `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${fileName}`;
    } catch (error) {
      console.error('Error downloading and uploading image:', error);
      throw error;
    }
  }

  /**
   * @desc Extract file ID from Google Drive link
   * @param {string} driveLink - Google Drive link
   * @returns {string|null} File ID or null if invalid link
   */
  extractFileIdFromDriveLink(driveLink) {
    const match = driveLink.match(/[-\w]{25,}/);
    return match ? match[0] : null;
  }
}

export default new FileService();