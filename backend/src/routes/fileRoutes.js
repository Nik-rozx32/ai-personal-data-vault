const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/fileController');
const { upload } = require('../middleware/upload');
const { protect } = require('../middleware/auth');

/**
 * File Upload & C++ Chunking Routes
 * Protected: requires a valid JWT Bearer token.
 * The userId is extracted from the JWT by the protect middleware —
 * we never trust a userId from the request body/query.
 */
router.post('/chunk', protect, upload.single('file'), uploadFile);
router.post('/upload', protect, upload.single('file'), uploadFile);

module.exports = router;
