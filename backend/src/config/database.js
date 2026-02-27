const mongoose = require('mongoose');
const logger = require('../utils/logger');
const connectDB = async () => {
    try {

        const uri = process.env.MONGODB_URI;
        console.log(uri)
        await mongoose.connect(uri);
        logger.info('MongoDB connected successfully');

    } catch (error) {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    logger.error('MongoDB error:', err);
});

module.exports = connectDB;