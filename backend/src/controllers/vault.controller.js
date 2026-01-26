const vaultService = require('../services/vault.service');
const auditService = require('../services/audit.service');
const logger = require('../utils/logger');

exports.createVault = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const vault = await vaultService.createVault(req.user.userId, name, description);

        await auditService.log({
            vaultId: vault._id,
            actorId: req.user.userId,
            action: 'vault_created',
            targetId: vault._id,
            targetType: 'vault',
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        logger.info('Vault created', { vaultId: vault._id, userId: req.user.userId });

        res.status(201).json({
            success: true,
            data: { vault }
        });
    } catch (error) {
        next(error);
    }
};

exports.getUserVaults = async (req, res, next) => {
    try {
        const vaults = await vaultService.getUserVaults(req.user.userId);

        res.json({
            success: true,
            data: { vaults }
        });
    } catch (error) {
        next(error);
    }
};

exports.getVault = async (req, res, next) => {
    try {
        const vault = await vaultService.getVaultById(req.params.vaultId);

        res.json({
            success: true,
            data: { vault }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateVault = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const vault = await vaultService.updateVault(req.params.vaultId, { name, description });

        await auditService.log({
            vaultId: vault._id,
            actorId: req.user.userId,
            action: 'vault_updated',
            targetId: vault._id,
            targetType: 'vault',
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            data: { vault }
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteVault = async (req, res, next) => {
    try {
        await vaultService.deleteVault(req.params.vaultId);

        await auditService.log({
            vaultId: req.params.vaultId,
            actorId: req.user.userId,
            action: 'vault_deleted',
            targetId: req.params.vaultId,
            targetType: 'vault',
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            data: { message: 'Vault deleted successfully' }
        });
    } catch (error) {
        next(error);
    }
};

exports.addMember = async (req, res, next) => {
    try {
        const { email, role } = req.body;
        const member = await vaultService.addMember(
            req.params.vaultId,
            email,
            role,
            req.user.userId
        );

        await auditService.log({
            vaultId: req.params.vaultId,
            actorId: req.user.userId,
            action: 'member_added',
            targetId: member.userId._id,
            targetType: 'member',
            details: new Map([['role', role]]),
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(201).json({
            success: true,
            data: { member }
        });
    } catch (error) {
        next(error);
    }
};

exports.getMembers = async (req, res, next) => {
    try {
        const members = await vaultService.getMembers(req.params.vaultId);

        res.json({
            success: true,
            data: { members }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateMemberRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const member = await vaultService.updateMemberRole(
            req.params.vaultId,
            req.params.userId,
            role
        );

        await auditService.log({
            vaultId: req.params.vaultId,
            actorId: req.user.userId,
            action: 'member_role_changed',
            targetId: req.params.userId,
            targetType: 'member',
            details: new Map([['newRole', role]]),
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            data: { member }
        });
    } catch (error) {
        next(error);
    }
};

exports.removeMember = async (req, res, next) => {
    try {
        await vaultService.removeMember(req.params.vaultId, req.params.userId);

        await auditService.log({
            vaultId: req.params.vaultId,
            actorId: req.user.userId,
            action: 'member_removed',
            targetId: req.params.userId,
            targetType: 'member',
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            data: { message: 'Member removed successfully' }
        });
    } catch (error) {
        next(error);
    }
};