const mongoose = require('mongoose');

// Configure connection event handlers
mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from MongoDB instance.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Successfully reconnected to MongoDB.');
});

/**
 * Connect to MongoDB instance using Mongoose.
 * Reads MONGODB_URI from environment variables.
 * Handles and surfaces connection errors properly.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-personal-data-vault';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    console.log(`[MongoDB] Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection failed to ${mongoUri}: ${error.message}`);
    console.error('[MongoDB] Ensure MongoDB Community Server is running (e.g. net start MongoDB).');
    throw error;
  }
};

module.exports = connectDB;
