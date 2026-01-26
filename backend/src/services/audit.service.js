const AuditLog = require('../models/AuditLog');

const log = async (logData) => {
    const auditLog = new AuditLog(logData);
    await auditLog.save();
    return auditLog;
};

const getAuditLogs = async (vaultId, filters = {}) => {
    const { page = 1, limit = 50, action } = filters;
    const skip = (page - 1) * limit;

    const query = { vaultId };
    if (action) {
        query.action = action;
    }

    const logs = await AuditLog.find(query)
        .populate('actorId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(query);

    return {
        logs,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

module.exports = {
    log,
    getAuditLogs
};