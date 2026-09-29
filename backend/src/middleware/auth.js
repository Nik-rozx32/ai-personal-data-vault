const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware to protect routes requiring valid JWT
 * Accepts Bearer token in Authorization header, or token query param for browser redirects.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized: No authentication token provided'
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[Auth Middleware] JWT_SECRET is not configured in .env');
      return res.status(500).json({
        message: 'Internal server error: Authentication configuration missing'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Attach user object from MongoDB to request (excluding passwordHash)
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        message: 'Unauthorized: User belonging to this token no longer exists'
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Unauthorized: Token has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      message: 'Unauthorized: Invalid authentication token'
    });
  }
};

module.exports = { protect };
