import { v4 as uuidv4 } from "uuid";
import minioClient from "../config/minio.js";
import axios from 'axios';

  /* 
    @desc All the functions related to minio like uploading a file to mino , removing a file to minio etc .
  */

class FileService {
  /**
   * @desc Upload a file to MinIO
   * @param {Object} uploadObject - File upload object
   * @param {string} bucketName - Name of the bucket to upload to
   * @returns {string} URL of the uploaded file
   */
  async uploadFile(uploadObject, bucketName) {
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
    await minioClient.putObject(bucketName, fileName, buffer, buffer.length, metaData);
    return `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${fileName}`;
  }

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
  } 

  async deleteFile(filename) {
    try {
      await minioClient.removeObject('vehicles', filename);
      console.log(`Deleted file: ${filename}`);
    } catch (err) {
      console.error(`Error deleting file ${filename}:`, err);
    }
  }  

   /**
   * @desc Download image from Google Drive and upload to MinIO
   * @param {string} driveLink - Google Drive link of the image
   * @param {string} bucketName - Name of the bucket to upload to
   * @returns {string} URL of the uploaded file in MinIO
   */
   async downloadAndUploadImage(driveLink, bucketName) {
    try {
      // Extract file ID from Google Drive link
      const fileId = this.extractFileIdFromDriveLink(driveLink);
      if (!fileId) {
        throw new Error('Invalid Google Drive link');
      }

      // Construct direct download link
      const directLink = `https://drive.google.com/uc?export=download&id=${fileId}`;

      // Download the file
      const response = await axios({
        method: 'get',
        url: directLink,
        responseType: 'arraybuffer'
      });

      // Generate a unique filename
      const fileName = `${uuidv4()}.jpg`; // Assuming all images are JPEGs. Adjust if needed.

      // Prepare the file object for MinIO upload
      const fileObject = {
        buffer: response.data,
        mimetype: response.headers['content-type'],
        filename: fileName
      };

      // Upload to MinIO
      await this.ensureBucketExists(bucketName);
      await minioClient.putObject(bucketName, fileName, fileObject.buffer, fileObject.buffer.length, {
        'Content-Type': fileObject.mimetype
      });

      // Return the public URL
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