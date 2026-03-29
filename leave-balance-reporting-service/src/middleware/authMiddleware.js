const jwt = require('jsonwebtoken');

// 1. Protect routes (Ensure user is logged in via JWT)
const protect = async (req, res, next) => {
  let token;

  // Check if header contains Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from string like "Bearer eyJhbGc..."
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey123');

      // Attach decoded user payload to request
      req.user = decoded; 
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// 2. Role Based Access Control (Ensure user has correct specific role)
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is in the allowed roles array
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: User role '${req.user ? req.user.role : 'Unknown'}' is not authorized to access this route.` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
