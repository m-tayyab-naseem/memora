const { S3Client } = require('@aws-sdk/client-s3');

/**
 * Cloudflare R2 / S3 Compatible Storage Configuration
 * 
 * We use the AWS SDK v3 which is modular and more efficient.
 * For Cloudflare R2, the key differences are the endpoint and 
 * the requirement for 'forcePathStyle' to be true in some cases,
 * though modern R2 works well with standard settings.
 */
const s3Client = new S3Client({
    region: 'auto', // Cloudflare R2 uses 'auto' for region
    endpoint: process.env.AWS_ENDPOINT,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    // R2 requires this for compatibility with some S3 tools, 
    // though the client often handles it.
    forcePathStyle: true,
});

const bucketName = process.env.AWS_BUCKET_NAME;

module.exports = { s3Client, bucketName };