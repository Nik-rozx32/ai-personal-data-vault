const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Get activity log for the authenticated user
 * @route   GET /api/activity
 * @access  Private (JWT required)
 */
const getMyActivity = async (req, res) => {
  try {
    const userId = req.user._id;

    // Pagination params
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const skip = parseInt(req.query.skip) || 0;

    const logs = await ActivityLog.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ActivityLog.countDocuments({ userId });

    return res.status(200).json({
      total,
      limit,
      skip,
      logs
    });
  } catch (error) {
    console.error('[Activity Controller - getMyActivity Error]:', error);
    return res.status(500).json({
      message: 'Server error retrieving activity logs'
    });
  }
};

module.exports = { getMyActivity };
