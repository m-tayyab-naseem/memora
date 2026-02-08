const mongoose = require('mongoose');

const vaultMemberSchema = new mongoose.Schema({
    vaultId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vault',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['owner', 'editor', 'viewer'],
        required: true
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

vaultMemberSchema.index({ vaultId: 1, userId: 1 }, { unique: true });
vaultMemberSchema.index({ userId: 1 });

module.exports = mongoose.model('VaultMember', vaultMemberSchema);