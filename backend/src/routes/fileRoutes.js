const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { uploadFile } = require('../controllers/fileController');
const { upload } = require('../middleware/upload');
const User = require('../models/User');

// Middleware that optionally attaches user if valid JWT is provided, but does not block demo/testing requests
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (token && process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-passwordHash');
        if (user) req.user = user;
      }
    } catch (e) {
      // In offline/demo mode, continue without error
    }
  }
  next();
};

// File Upload & C++ Chunking Routes (supports both /chunk and /upload)
router.post('/chunk', optionalAuth, upload.single('file'), uploadFile);
router.post('/upload', optionalAuth, upload.single('file'), uploadFile);

module.exports = router;

