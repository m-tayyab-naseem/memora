const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.post('/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters')
            .matches(/\d/)
            .withMessage('Password must contain at least one number')
            .matches(/[a-zA-Z]/)
            .withMessage('Password must contain at least one letter')
    ],
    validate,
    authController.register
);

router.post('/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    validate,
    authController.login
);

router.post('/refresh',
    [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
    validate,
    authController.refreshToken
);

router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;