const express = require('express');
const router = express.Router();
const { getMe } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Protected User Endpoints (Require valid Bearer token)
router.get('/me', protect, getMe);

module.exports = router;
