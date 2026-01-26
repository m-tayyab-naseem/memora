const Comment = require('../models/Comment');
const MediaItem = require('../models/MediaItem');
const auditService = require('../services/audit.service');

exports.addComment = async (req, res, next) => {
    try {
        const { text } = req.body;
        const { mediaId } = req.params;

        const comment = new Comment({
            mediaId,
            userId: req.user.userId,
            text
        });

        await comment.save();
        await comment.populate('userId', 'name email');

        // Increment comment count
        await MediaItem.findByIdAndUpdate(mediaId, { $inc: { commentCount: 1 } });

        await auditService.log({
            vaultId: req.media.vaultId,
            actorId: req.user.userId,
            action: 'comment_added',
            targetId: comment._id,
            targetType: 'comment',
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(201).json({
            success: true,
            data: { comment }
        });
    } catch (error) {
        next(error);
    }
};

exports.getComments = async (req, res, next) => {
    try {
        const { mediaId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        const comments = await Comment.find({ mediaId, isDeleted: false })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Comment.countDocuments({ mediaId, isDeleted: false });

        res.json({
            success: true,
            data: {
                comments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};