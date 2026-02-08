const express = require('express');
const { param, query } = require('express-validator');
const mediaController = require('../controllers/media.controller');
const { authenticate } = require('../middleware/auth');
const { checkVaultAccess, checkVaultRole } = require('../middleware/vaultAccess');
const { validate } = require('../middleware/validate');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.post('/:vaultId/upload',
    authenticate,
    [param('vaultId').isMongoId().withMessage('Invalid vault ID')],
    validate,
    checkVaultAccess,
    checkVaultRole(['owner', 'editor']),
    upload.single('media'),
    mediaController.uploadMedia
);

router.get('/:vaultId',
    authenticate,
    [
        param('vaultId').isMongoId().withMessage('Invalid vault ID'),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('type').optional().isIn(['image', 'video'])
    ],
    validate,
    checkVaultAccess,
    mediaController.getMedia
);

router.get('/:vaultId/:mediaId',
    authenticate,
    [
        param('vaultId').isMongoId().withMessage('Invalid vault ID'),
        param('mediaId').isMongoId().withMessage('Invalid media ID')
    ],
    validate,
    checkVaultAccess,
    mediaController.getMediaItem
);

router.delete('/:vaultId/:mediaId',
    authenticate,
    [
        param('vaultId').isMongoId().withMessage('Invalid vault ID'),
        param('mediaId').isMongoId().withMessage('Invalid media ID')
    ],
    validate,
    checkVaultAccess,
    checkVaultRole(['owner', 'editor']),
    mediaController.deleteMedia
);

module.exports = router;