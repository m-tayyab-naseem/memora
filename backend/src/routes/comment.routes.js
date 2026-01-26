const express = require('express');
const { body, param, query } = require('express-validator');
const commentController = require('../controllers/comment.controller');
const { authenticate } = require('../middleware/auth');
const { checkMediaAccess } = require('../middleware/mediaAccess');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.post('/:mediaId',
    authenticate,
    [
        param('mediaId').isMongoId().withMessage('Invalid media ID'),
        body('text').trim().notEmpty().withMessage('Comment text is required')
    ],
    validate,
    checkMediaAccess,
    commentController.addComment
);

router.get('/:mediaId',
    authenticate,
    [
        param('mediaId').isMongoId().withMessage('Invalid media ID'),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 })
    ],
    validate,
    checkMediaAccess,
    commentController.getComments
);

module.exports = router;