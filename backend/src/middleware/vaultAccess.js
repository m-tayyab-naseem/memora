const VaultMember = require('../models/VaultMember');
const Vault = require('../models/Vault');
const { NotFoundError, AuthorizationError } = require('../utils/errors');

const checkVaultAccess = async (req, res, next) => {
    try {
        const { vaultId } = req.params;
        const userId = req.user.userId;

        const vault = await Vault.findOne({ _id: vaultId, isDeleted: false });
        if (!vault) {
            throw new NotFoundError('Vault not found');
        }

        const membership = await VaultMember.findOne({ vaultId, userId });
        if (!membership) {
            throw new AuthorizationError('You do not have access to this vault');
        }

        req.vaultMembership = membership;
        req.vault = vault;
        next();
    } catch (error) {
        next(error);
    }
};

const checkVaultRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.vaultMembership) {
            return next(new AuthorizationError('Vault membership not found'));
        }

        if (!allowedRoles.includes(req.vaultMembership.role)) {
            return next(new AuthorizationError('Insufficient permissions'));
        }

        next();
    };
};

module.exports = { checkVaultAccess, checkVaultRole };