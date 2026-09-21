const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Protected File Upload & Chunking Route
router.post('/upload', protect, upload.single('file'), uploadFile);

module.exports = router;
