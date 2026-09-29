const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMyActivity } = require('../controllers/activityController');

// All activity routes require a valid JWT
router.get('/', protect, getMyActivity);

module.exports = router;
