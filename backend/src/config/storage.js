const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    endpoint: process.env.AWS_ENDPOINT,
    s3ForcePathStyle: true
});

const bucketName = process.env.AWS_BUCKET_NAME;

module.exports = { s3, bucketName };