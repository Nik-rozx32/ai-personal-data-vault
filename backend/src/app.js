const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const activityRoutes = require('./routes/activityRoutes');
const googleDriveRoutes = require('./routes/googleDriveRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Parse incoming JSON requests
app.use(express.json());

// Parse incoming URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Health-check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'AI Personal Data Vault Backend is running',
    version: '2.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/integrations/google-drive', googleDriveRoutes);
app.use('/api/ai', aiRoutes);

module.exports = app;
