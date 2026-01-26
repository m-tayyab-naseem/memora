const MediaItem = require('../models/MediaItem');
const VaultMember = require('../models/VaultMember');
const { NotFoundError, AuthorizationError } = require('../utils/errors');

const checkMediaAccess = async (req, res, next) => {
    try {
        const { mediaId } = req.params;
        const userId = req.user.userId;

        const media = await MediaItem.findById(mediaId);
        if (!media) {
            throw new NotFoundError('Media not found');
        }

        const membership = await VaultMember.findOne({
            vaultId: media.vaultId,
            userId
        });

        if (!membership) {
            throw new AuthorizationError('You do not have access to this media');
        }

        req.media = media;
        req.vaultMembership = membership;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { checkMediaAccess };