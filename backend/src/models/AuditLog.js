const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    vaultId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vault',
        required: true
    },
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'vault_created',
            'vault_updated',
            'vault_deleted',
            'member_added',
            'member_removed',
            'member_role_changed',
            'media_uploaded',
            'media_accessed',
            'media_deleted',
            'comment_added',
            'comment_deleted'
        ]
    },
    targetId: mongoose.Schema.Types.ObjectId,
    targetType: {
        type: String,
        enum: ['vault', 'member', 'media', 'comment']
    },
    details: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

auditLogSchema.index({ vaultId: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1 });

// Optional: TTL index to expire logs after 1 year
// auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);