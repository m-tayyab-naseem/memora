const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { AuthenticationError, ConflictError, NotFoundError } = require('../utils/errors');

const register = async (name, email, password) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ConflictError('Email already registered');
    }

    const user = new User({
        name,
        email,
        passwordHash: password
    });

    await user.save();

    const accessToken = generateAccessToken(user._id, user.email);
    const refreshToken = generateRefreshToken(user._id);

    return {
        user,
        accessToken,
        refreshToken
    };
};

const login = async (email, password) => {
    const user = await User.findOne({ email, isDeleted: false }).select('+passwordHash');

    if (!user) {
        throw new AuthenticationError('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new AuthenticationError('Invalid credentials');
    }

    const accessToken = generateAccessToken(user._id, user.email);
    const refreshToken = generateRefreshToken(user._id);

    // Remove password from response
    user.passwordHash = undefined;

    return {
        user,
        accessToken,
        refreshToken
    };
};

const refreshToken = async (token) => {
    try {
        const decoded = verifyRefreshToken(token);
        const user = await User.findById(decoded.userId);

        if (!user || user.isDeleted) {
            throw new AuthenticationError('Invalid refresh token');
        }

        const accessToken = generateAccessToken(user._id, user.email);
        const newRefreshToken = generateRefreshToken(user._id);

        return {
            accessToken,
            refreshToken: newRefreshToken
        };
    } catch (error) {
        throw new AuthenticationError('Invalid refresh token');
    }
};

const getUserById = async (userId) => {
    const user = await User.findOne({ _id: userId, isDeleted: false });
    if (!user) {
        throw new NotFoundError('User not found');
    }
    return user;
};

module.exports = {
    register,
    login,
    refreshToken,
    getUserById
};