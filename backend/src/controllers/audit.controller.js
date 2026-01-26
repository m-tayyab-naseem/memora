const auditService = require('../services/audit.service');

exports.getAuditLogs = async (req, res, next) => {
    try {
        const { page, limit, action } = req.query;
        const result = await auditService.getAuditLogs(req.params.vaultId, { page, limit, action });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};