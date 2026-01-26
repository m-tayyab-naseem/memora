const express = require('express');
const authRoutes = require('./auth.routes');
const vaultRoutes = require('./vault.routes');
const mediaRoutes = require('./media.routes');
const commentRoutes = require('./comment.routes');
const auditRoutes = require('./audit.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/vaults', vaultRoutes);
router.use('/media', mediaRoutes);
router.use('/comments', commentRoutes);
router.use('/audit', auditRoutes);

module.exports = router;