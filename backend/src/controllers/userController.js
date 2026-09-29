const Document = require('../models/Document');
const { ConnectedAccount } = require('../models/ConnectedAccount');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/users/me
 * @access  Private (Requires valid JWT)
 */
const getMe = async (req, res) => {
  try {
    // req.user is populated by protect middleware
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized: User context not found'
      });
    }

    return res.status(200).json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt
    });
  } catch (error) {
    console.error('[User Controller - getMe Error]:', error);
    return res.status(500).json({
      message: 'Server error retrieving user profile'
    });
  }
};

/**
 * @desc    Get database statistics for authenticated user
 * @route   GET /api/users/stats
 * @access  Private (Requires valid JWT)
 */
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Real aggregate metrics directly from MongoDB
    const totalFiles = await Document.countDocuments({ userId });
    const documents = await Document.find({ userId }).select('sizeBytes').lean();
    const totalStorageBytes = documents.reduce((acc, doc) => acc + (doc.sizeBytes || 0), 0);

    const connectedAccountsCount = await ConnectedAccount.countDocuments({
      userId,
      status: 'active'
    });

    const recentActivityCount = await ActivityLog.countDocuments({ userId });

    return res.status(200).json({
      totalFiles,
      totalStorageBytes,
      connectedAccountsCount,
      recentActivityCount
    });
  } catch (error) {
    console.error('[User Controller - getUserStats Error]:', error);
    return res.status(500).json({
      message: 'Server error retrieving user statistics'
    });
  }
};

module.exports = {
  getMe,
  getUserStats
};
