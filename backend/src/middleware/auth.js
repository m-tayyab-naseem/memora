const { verifyAccessToken } = require('../utils/jwt');
const { AuthenticationError } = require('../utils/errors');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError('No token provided');
        }

        const token = authHeader.substring(7);
        const decoded = verifyAccessToken(token);

        req.user = {
            userId: decoded.userId,
            email: decoded.email
        };

        next();
    } catch (error) {
        next(new AuthenticationError(error.message));
    }
};

module.exports = { authenticate };