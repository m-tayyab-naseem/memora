const mediaService = require('../services/media.service');
const auditService = require('../services/audit.service');
const { ValidationError } = require('../utils/errors');

exports.uploadMedia = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ValidationError('No file uploaded');
        }

        const { description } = req.body;
        const media = await mediaService.uploadMedia(
            req.params.vaultId,
            req.user.userId,
            req.file,
            description
        );

        await auditService.log({
            vaultId: req.params.vaultId,
            actorId: req.user.userId,
            action: 'media_uploaded',
            targetId: media._id,
            targetType: 'media',
            details: new Map([
                ['fileName', media.fileName],
                ['mediaType', media.mediaType]
            ]),
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(201).json({
            success: true,
            data: { media }
        });
    } catch (error) {
        next(error);
    }
};

exports.getMedia = async (req, res, next) => {
    try {
        const { page, limit, type } = req.query;
        const result = await mediaService.getMedia(req.params.vaultId, { page, limit, type });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.getMediaItem = async (req, res, next) => {
    try {
        const media = await mediaService.getMediaItem(req.params.mediaId);

        await auditService.log({
            vaultId: req.params.vaultId,
            actorId: req.user.userId,
            action: 'media_accessed',
            targetId: req.params.mediaId,
            targetType: 'media',
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            data: { media }
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteMedia = async (req, res, next) => {
    try {
        await mediaService.deleteMedia(req.params.vaultId, req.params.mediaId);

        await auditService.log({
            vaultId: req.params.vaultId,
            actorId: req.user.userId,
            action: 'media_deleted',
            targetId: req.params.mediaId,
            targetType: 'media',
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Media deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};