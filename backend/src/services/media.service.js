const MediaItem = require('../models/MediaItem');
const Vault = require('../models/Vault');
const Comment = require('../models/Comment');
const { s3Client, bucketName } = require('../config/storage');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { NotFoundError } = require('../utils/errors');

/**
 * Uploads media to Cloudflare R2 and creates a database record.
 */
const uploadMedia = async (vaultId, userId, file, metadata = {}) => {
    const { description, capturedAt, tags } = metadata;

    // 1. Generate a unique key for the file in the bucket
    const fileKey = `vaults/${vaultId}/${uuidv4()}${path.extname(file.originalname)}`;

    // 2. Read file content from temp storage
    const fileContent = fs.readFileSync(file.path);

    // 3. Upload to R2 using PutObjectCommand (SDK v3 style)
    const uploadParams = {
        Bucket: bucketName,
        Key: fileKey,
        Body: fileContent,
        ContentType: file.mimetype
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // 4. Determine media type (image or video)
    const mediaType = file.mimetype.startsWith('image/') ? 'image' : 'video';

    // 5. Create media item in MongoDB
    const mediaItem = new MediaItem({
        vaultId,
        mediaType,
        mediaUrl: fileKey, // Store the relative key, not the full URL
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy: userId,
        description: description || file.originalname,
        capturedAt: capturedAt || Date.now(),
        tags: tags || []
    });

    await mediaItem.save();

    // 6. Update vault media count
    await Vault.findByIdAndUpdate(vaultId, { $inc: { mediaCount: 1 } });

    // 7. Clean up temp file
    fs.unlinkSync(file.path);

    return mediaItem;
};

/**
 * Retrieves a list of media for a vault.
 */
const getMedia = async (vaultId, filters = {}) => {
    const { page = 1, limit = 50, type } = filters;
    const skip = (page - 1) * limit;

    const query = { vaultId };
    if (type) {
        query.mediaType = type;
    }

    const media = await MediaItem.find(query)
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await MediaItem.countDocuments(query);

    // Generate signed URLs for all items in the list
    const mediaWithUrls = await Promise.all(media.map(async (item) => {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: item.mediaUrl,
        });
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return {
            ...item.toObject(),
            signedUrl
        };
    }));

    return {
        media: mediaWithUrls,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Retrieves a single media item and generates a temporary signed URL for viewing.
 */
const getMediaItem = async (mediaId) => {
    const media = await MediaItem.findById(mediaId)
        .populate('uploadedBy', 'name email');

    if (!media) {
        throw new NotFoundError('Media not found');
    }

    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: media.mediaUrl,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return {
        ...media.toObject(),
        signedUrl
    };
};

/**
 * Deletes media from R2 and database.
 */
const deleteMedia = async (vaultId, mediaId) => {
    const media = await MediaItem.findOne({ _id: mediaId, vaultId });
    if (!media) {
        throw new NotFoundError('Media not found');
    }

    // 1. Delete from R2
    const deleteParams = {
        Bucket: bucketName,
        Key: media.mediaUrl
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));

    // 2. Delete comments
    await Comment.deleteMany({ mediaId });

    // 3. Delete from DB
    await MediaItem.findByIdAndDelete(mediaId);

    // 4. Update vault media count
    await Vault.findByIdAndUpdate(vaultId, { $inc: { mediaCount: -1 } });

    return true;
};

/**
 * Deletes all media associated with a vault from R2 and database.
 */
const deleteAllVaultMedia = async (vaultId) => {
    const media = await MediaItem.find({ vaultId });
    if (media.length === 0) return true;

    // 1. Delete all from R2
    const deleteParams = {
        Bucket: bucketName,
        Delete: {
            Objects: media.map(item => ({ Key: item.mediaUrl }))
        }
    };
    await s3Client.send(new DeleteObjectsCommand(deleteParams));

    // 2. Delete all comments for these media items
    const mediaIds = media.map(m => m._id);
    await Comment.deleteMany({ mediaId: { $in: mediaIds } });

    // 3. Delete all from DB
    await MediaItem.deleteMany({ vaultId });

    return true;
};

module.exports = {
    uploadMedia,
    getMedia,
    getMediaItem,
    deleteMedia,
    deleteAllVaultMedia
};