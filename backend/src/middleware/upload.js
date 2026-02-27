const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const { ValidationError } = require('../utils/errors');

// Define the absolute path to the uploads directory (at project root)
const uploadDir = path.join(__dirname, '../../uploads');

// Create the directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/x-matroska', 'video/mkv'];

    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
    const ext = path.extname(file.originalname).toLowerCase();

    // Accept if the mimetype is correct, OR if it's an .mkv file (to bypass browser confusion)
    if (allowedTypes.includes(file.mimetype) || ext === '.mkv') {
        cb(null, true);
    } else {
        // Log the actual mimetype the browser sent so you can debug future failed uploads
        logger.warn(`File upload rejected: ${file.originalname} | Mimetype sent by browser: ${file.mimetype}`, {
            fileName: file.originalname,
            vaultId: req.params.vaultId
        });
        cb(new ValidationError('Invalid file type. Only images and videos are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_VIDEO_SIZE) || 524288000 // 500MB default
    }
});

module.exports = { upload };
