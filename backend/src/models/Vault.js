const mongoose = require('mongoose');

const vaultSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vault name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    memberCount: {
        type: Number,
        default: 1
    },
    mediaCount: {
        type: Number,
        default: 0
    },
    settings: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

vaultSchema.index({ ownerId: 1, createdAt: -1 });
vaultSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Vault', vaultSchema);