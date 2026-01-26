const authService = require('../services/auth.service');
const logger = require('../utils/logger');

exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const result = await authService.register(name, email, password);

        logger.info('User registered successfully', { email });

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        logger.info('User logged in', { email });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refreshToken(refreshToken);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.getCurrentUser = async (req, res, next) => {
    try {
        const user = await authService.getUserById(req.user.userId);

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};