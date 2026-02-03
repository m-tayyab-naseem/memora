const mongoose = require('mongoose');

const mediaItemSchema = new mongoose.Schema({
    vaultId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vault',
        required: true
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: String,
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    capturedAt: {
        type: Date,
        default: Date.now
    },
    tags: [{
        type: String,
        trim: true
    }],
    metadata: {
        width: Number,
        height: Number,
        duration: Number
    },
    immutable: {
        type: Boolean,
        default: true
    },
    fileHash: String,
    commentCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

mediaItemSchema.index({ vaultId: 1, createdAt: -1 });
mediaItemSchema.index({ uploadedBy: 1 });

mediaItemSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.mediaUrl || update.mediaType || update.fileName) {
        return next(new Error('Cannot modify immutable media content'));
    }
    next();
});

module.exports = mongoose.model('MediaItem', mediaItemSchema);