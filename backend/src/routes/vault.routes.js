const express = require('express');
const { body, param } = require('express-validator');
const vaultController = require('../controllers/vault.controller');
const { authenticate } = require('../middleware/auth');
const { checkVaultAccess, checkVaultRole } = require('../middleware/vaultAccess');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.post('/',
    authenticate,
    [
        body('name').trim().notEmpty().withMessage('Vault name is required'),
        body('description').optional().trim()
    ],
    validate,
    vaultController.createVault
);

router.get('/', authenticate, vaultController.getUserVaults);

router.get('/:vaultId',
    authenticate,
    [param('vaultId').isMongoId().withMessage('Invalid vault ID')],
    validate,
    checkVaultAccess,
    vaultController.getVault
);

router.patch('/:vaultId',
    authenticate,
    [
        param('vaultId').isMongoId().withMessage('Invalid vault ID'),
        body('name').optional().trim().notEmpty(),
        body('description').optional().trim()
    ],
    validate,
    checkVaultAccess,
    checkVaultRole(['owner']),
    vaultController.updateVault
);

router.delete('/:vaultId',
    authenticate,
    [param('vaultId').isMongoId().withMessage('Invalid vault ID')],
    validate,
    checkVaultAccess,
    checkVaultRole(['owner']),
    vaultController.deleteVault
);

// Member management
router.post('/:vaultId/members',
    authenticate,
    [
        param('vaultId').isMongoId().withMessage('Invalid vault ID'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('role').isIn(['contributor', 'viewer']).withMessage('Invalid role')
    ],
    validate,
    checkVaultAccess,
    checkVaultRole(['owner']),
    vaultController.addMember
);

router.get('/:vaultId/members',
    authenticate,
    [param('vaultId').isMongoId().withMessage('Invalid vault ID')],
    validate,
    checkVaultAccess,
    vaultController.getMembers
);

router.patch('/:vaultId/members/:userId',
    authenticate,
    [
        param('vaultId').isMongoId().withMessage('Invalid vault ID'),
        param('userId').isMongoId().withMessage('Invalid user ID'),
        body('role').isIn(['owner', 'contributor', 'viewer']).withMessage('Invalid role')
    ],
    validate,
    checkVaultAccess,
    checkVaultRole(['owner']),
    vaultController.updateMemberRole
);

router.delete('/:vaultId/members/:userId',
    authenticate,
    [
        param('vaultId').isMongoId().withMessage('Invalid vault ID'),
        param('userId').isMongoId().withMessage('Invalid user ID')
    ],
    validate,
    checkVaultAccess,
    checkVaultRole(['owner']),
    vaultController.removeMember
);

module.exports = router;