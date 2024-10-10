import { Client } from 'minio';

const minioClient = new Client({
    endPoint: '192.168.10.173',
    port: 9000,
    useSSL: false,
    accessKey: 'cK0LQLhljCi0j87zgzV8',
    secretKey: 'UhRlfMHq7Y64sijTQOmgrcyYkl55L5TPVUwSSXHy'
}); 

export const updateBucketPolicyWithCORS = async (bucketName) => {
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
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        console.log(`Bucket policy for ${bucketName} updated successfully`);
    } catch (err) {
        console.error(`Error updating bucket policy for ${bucketName}:`, err);
        throw err;
    }
};

export default minioClient;