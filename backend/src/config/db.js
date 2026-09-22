const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance using Mongoose.
 * If MongoDB is not reachable, logs a warning and allows the server to run in demo mode.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/personal_data_vault';

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    console.log(`[MongoDB] Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.warn(`[MongoDB] Notice: MongoDB is not available (${error.message}).`);
    console.warn(`[MongoDB] Running backend in standalone mode. File upload & C++ chunking are fully functional.`);
  }
};

module.exports = connectDB;

