// src/config/minio.js

import { Client } from 'minio';

class MinioConfig {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return this.client;

        // Simply connect to the running MinIO server
        this.client = new Client({
            endPoint: 'localhost',  // or '127.0.0.1'
            port: 9000,
            useSSL: false,
            accessKey: 'cK0LQLhljCi0j87zgzV8',
            secretKey: 'UhRlfMHq7Y64sijTQOmgrcyYkl55L5TPVUwSSXHy'
        });

        try {
            // Test the connection by listing buckets
            await this.client.listBuckets();
            this.initialized = true;
            console.log('Successfully connected to MinIO server');
        } catch (error) {
            console.error('Failed to connect to MinIO:', error);
            throw error;
        }

        return this.client;
    }

    async updateBucketPolicyWithCORS(bucketName) {
        if (!this.initialized) {
            await this.initialize();
        }

        const policy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Principal: { AWS: ['*'] },
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${bucketName}/*`]
                },
                {
                    Effect: 'Allow',
                    Principal: { AWS: ['*'] },
                    Action: ['s3:GetBucketLocation', 's3:ListBucket'],
                    Resource: [`arn:aws:s3:::${bucketName}`]
                }
            ]
        };

        try {
            await this.client.setBucketPolicy(bucketName, JSON.stringify(policy));
            console.log(`Bucket policy for ${bucketName} updated successfully`);
        } catch (err) {
            console.error(`Error updating bucket policy for ${bucketName}:`, err);
            throw err;
        }
    }
}

// Create and export a singleton instance
export default new MinioConfig();