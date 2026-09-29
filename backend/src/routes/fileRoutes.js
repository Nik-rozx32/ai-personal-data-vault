const express = require('express');
const router = express.Router();
const { listFiles, uploadFile, deleteFile } = require('../controllers/fileController');
const { upload } = require('../middleware/upload');
const { protect } = require('../middleware/auth');

/**
 * File Management Routes
 * All endpoints require a valid JWT Bearer token.
 * The userId is extracted from the JWT by the protect middleware.
 */
router.get('/', protect, listFiles);
router.post('/upload', protect, upload.single('file'), uploadFile);
router.post('/chunk', protect, upload.single('file'), uploadFile); // Alias for compatibility
router.delete('/:id', protect, deleteFile);

module.exports = router;
