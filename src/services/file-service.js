import { v4 as uuidv4 } from "uuid";
import minioClient from "../config/minio.js";

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

}

export default new FileService();