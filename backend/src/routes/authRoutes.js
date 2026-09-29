const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public Auth Endpoints
router.post('/register', register);
router.post('/login', login);

// Protected Auth Endpoints
router.post('/logout', protect, logout);

module.exports = router;
