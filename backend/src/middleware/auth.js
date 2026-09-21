const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware to protect routes requiring valid JWT
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          message: 'Unauthorized: Authentication token is missing'
        });
      }

      // Verify token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('[Auth Middleware] JWT_SECRET is not configured in .env');
        return res.status(500).json({
          message: 'Internal server error: Authentication configuration missing'
        });
      }

      const decoded = jwt.verify(token, jwtSecret);

      // Attach user object to request (excluding passwordHash)
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
          message: 'Unauthorized: Token has expired'
        });
      }
      return res.status(401).json({
        message: 'Unauthorized: Invalid authentication token'
      });
    }
  }

  return res.status(401).json({
    message: 'Unauthorized: No Bearer token provided in Authorization header'
  });
};

module.exports = { protect };
