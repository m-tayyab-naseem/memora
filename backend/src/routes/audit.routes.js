const express = require('express');
const { param, query } = require('express-validator');
const auditController = require('../controllers/audit.controller');
const { authenticate } = require('../middleware/auth');
const { checkVaultAccess, checkVaultRole } = require('../middleware/vaultAccess');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/:vaultId',
    authenticate,
    [
        param('vaultId').isMongoId().withMessage('Invalid vault ID'),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('action').optional().isString()
    ],
    validate,
    checkVaultAccess,
    checkVaultRole(['owner']),
    auditController.getAuditLogs
);

module.exports = router;