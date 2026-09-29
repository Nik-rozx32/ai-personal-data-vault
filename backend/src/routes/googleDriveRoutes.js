const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  initiateOAuth,
  oauthCallback,
  getConnectionStatus,
  disconnectGoogleDrive,
  listFiles,
  searchFiles,
  retrieveAndIndexDocument
} = require('../controllers/googleDriveController');

// OAuth flow — connect initiates redirect, callback is called by Google (no JWT)
router.get('/connect', protect, initiateOAuth);
router.get('/callback', oauthCallback); // Public — Google redirects here

// Connection management
router.get('/status', protect, getConnectionStatus);
router.delete('/disconnect', protect, disconnectGoogleDrive);

// File operations
router.get('/files', protect, listFiles);
router.get('/search', protect, searchFiles);
router.post('/retrieve', protect, retrieveAndIndexDocument);

module.exports = router;
