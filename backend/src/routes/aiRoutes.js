const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { searchAI } = require('../controllers/aiController');

// All AI routes require authentication
router.post('/search', protect, searchAI);

module.exports = router;
