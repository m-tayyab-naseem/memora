const MediaItem = require('../models/MediaItem');
const Vault = require('../models/Vault');
const { s3, bucketName } = require('../config/storage');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { NotFoundError } = require('../utils/errors');

const uploadMedia = async (vaultId, userId, file, description) => {
    const fileKey = `vaults/${vaultId}/${uuidv4()}${path.extname(file.originalname)}`;

    const fileContent = fs.readFileSync(file.path);

    // Upload to S3
    const uploadParams = {
        Bucket: bucketName,
        Key: fileKey,
        Body: fileContent,
        ContentType: file.mimetype
    };

    await s3.upload(uploadParams).promise();

    // Determine media type
    const mediaType = file.mimetype.startsWith('image/') ? 'image' : 'video';

    // Create media item
    const mediaItem = new MediaItem({
        vaultId,
        mediaType,
        mediaUrl: fileKey,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy: userId,
        description
    });

    await mediaItem.save();

    // Update vault media count
    await Vault.findByIdAndUpdate(vaultId, { $inc: { mediaCount: 1 } });

    // Delete temp file
    fs.unlinkSync(file.path);

    return mediaItem;
};

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

    return {
        media,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

const getMediaItem = async (mediaId) => {
    const media = await MediaItem.findById(mediaId)
        .populate('uploadedBy', 'name email');

    if (!media) {
        throw new NotFoundError('Media not found');
    }

    // Generate signed URL for access
    const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: media.mediaUrl,
        Expires: 3600 // 1 hour
    });

    return {
        ...media.toObject(),
        signedUrl
    };
};

module.exports = {
    uploadMedia,
    getMedia,
    getMediaItem
};