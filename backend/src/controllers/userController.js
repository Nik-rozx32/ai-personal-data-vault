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
      role: req.user.role
    });
  } catch (error) {
    console.error('[User Controller - getMe Error]:', error);
    return res.status(500).json({
      message: 'Server error retrieving user profile'
    });
  }
};

module.exports = {
  getMe
};
