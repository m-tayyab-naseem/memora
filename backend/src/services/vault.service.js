const Vault = require('../models/Vault');
const VaultMember = require('../models/VaultMember');
const User = require('../models/User');
const { NotFoundError, AuthorizationError, ConflictError } = require('../utils/errors');

const createVault = async (userId, name, description) => {
    const vault = new Vault({
        name,
        description,
        ownerId: userId
    });

    await vault.save();

    // Add creator as owner
    await VaultMember.create({
        vaultId: vault._id,
        userId,
        role: 'owner',
        invitedBy: userId
    });

    return vault;
};

const getUserVaults = async (userId) => {
    const memberships = await VaultMember.find({ userId })
        .populate('vaultId')
        .sort({ createdAt: -1 });

    const vaults = memberships
        .filter(m => m.vaultId && !m.vaultId.isDeleted)
        .map(m => ({
            ...m.vaultId.toObject(),
            userRole: m.role
        }));

    return vaults;
};

const getVaultById = async (vaultId) => {
    const vault = await Vault.findOne({ _id: vaultId, isDeleted: false });
    if (!vault) {
        throw new NotFoundError('Vault not found');
    }
    return vault;
};

const updateVault = async (vaultId, updates) => {
    const vault = await Vault.findOneAndUpdate(
        { _id: vaultId, isDeleted: false },
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!vault) {
        throw new NotFoundError('Vault not found');
    }

    return vault;
};

const deleteVault = async (vaultId) => {
    const vault = await Vault.findOneAndUpdate(
        { _id: vaultId, isDeleted: false },
        { isDeleted: true },
        { new: true }
    );

    if (!vault) {
        throw new NotFoundError('Vault not found');
    }

    return vault;
};

const addMember = async (vaultId, email, role, invitedBy) => {
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
        throw new NotFoundError('User not found');
    }

    const existing = await VaultMember.findOne({ vaultId, userId: user._id });
    if (existing) {
        throw new ConflictError('User is already a member');
    }

    const member = await VaultMember.create({
        vaultId,
        userId: user._id,
        role,
        invitedBy
    });

    await Vault.findByIdAndUpdate(vaultId, { $inc: { memberCount: 1 } });

    return member.populate('userId', 'name email');
};

const getMembers = async (vaultId) => {
    const members = await VaultMember.find({ vaultId })
        .populate('userId', 'name email')
        .populate('invitedBy', 'name email')
        .sort({ createdAt: -1 });

    return members;
};

const updateMemberRole = async (vaultId, userId, newRole) => {
    const member = await VaultMember.findOne({ vaultId, userId });
    if (!member) {
        throw new NotFoundError('Member not found');
    }

    // Prevent removing last owner
    if (member.role === 'owner' && newRole !== 'owner') {
        const ownerCount = await VaultMember.countDocuments({ vaultId, role: 'owner' });
        if (ownerCount <= 1) {
            throw new AuthorizationError('Cannot change role of the last owner');
        }
    }

    member.role = newRole;
    await member.save();

    return member.populate('userId', 'name email');
};

const removeMember = async (vaultId, userId) => {
    const member = await VaultMember.findOne({ vaultId, userId });
    if (!member) {
        throw new NotFoundError('Member not found');
    }

    // Prevent removing last owner
    if (member.role === 'owner') {
        const ownerCount = await VaultMember.countDocuments({ vaultId, role: 'owner' });
        if (ownerCount <= 1) {
            throw new AuthorizationError('Cannot remove the last owner');
        }
    }

    await VaultMember.deleteOne({ vaultId, userId });
    await Vault.findByIdAndUpdate(vaultId, { $inc: { memberCount: -1 } });

    return member;
};

module.exports = {
    createVault,
    getUserVaults,
    getVaultById,
    updateVault,
    deleteVault,
    addMember,
    getMembers,
    updateMemberRole,
    removeMember
};