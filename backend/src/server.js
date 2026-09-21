const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * Initialize MongoDB connection and start Express server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start HTTP Server
    app.listen(PORT, () => {
      console.log('==================================================');
      console.log(' AI Personal Data Vault - Backend API');
      console.log(` Status       : Running`);
      console.log(` Port         : ${PORT}`);
      console.log(` Health Check : http://localhost:${PORT}/`);
      console.log('==================================================');
    });
  } catch (err) {
    console.error(`[Server] Initialization failed: ${err.message}`);
    process.exit(1);
  }
};

startServer();
