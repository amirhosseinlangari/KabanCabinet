const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');

/**
 * Middleware to check authentication
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const checkAuth = async (req, res, next) => {
  try {
    // Get token from the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'دسترسی غیرمجاز. لطفا وارد شوید'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'کاربر پیدا نشد. لطفا مجددا وارد شوید'
      });
    }
    
    // Check if token is valid
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        message: 'نشست شما منقضی شده است. لطفا مجددا وارد شوید'
      });
    }
    
    // Add user info to request
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'توکن نامعتبر است. لطفا مجددا وارد شوید'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'نشست شما منقضی شده است. لطفا مجددا وارد شوید'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطا در احراز هویت'
    });
  }
};

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @param {boolean} isAdmin - Is user admin
 * @param {boolean} remember - Remember user (extended expiration)
 * @returns {string} - JWT token
 */
const generateToken = (id, isAdmin = false, remember = false) => {
  const expiresIn = remember ? '30d' : '1d';
  
  return jwt.sign(
    { id, isAdmin },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Hash password
 * @param {string} password - Plain password
 * @returns {string} - Hashed password
 */
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  
  return `${salt}:${hash}`;
};

/**
 * Verify password
 * @param {string} password - Plain password
 * @param {string} hashedPassword - Hashed password from DB
 * @returns {boolean} - Is password valid
 */
const verifyPassword = (password, hashedPassword) => {
  const [salt, storedHash] = hashedPassword.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  
  return storedHash === hash;
};

/**
 * Generate password reset token
 * @returns {string} - Reset token
 */
const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Token expires in 10 minutes
  const expiresAt = Date.now() + 10 * 60 * 1000;
  
  return {
    resetToken,
    hashedToken,
    expiresAt
  };
};

module.exports = {
  checkAuth,
  generateToken,
  hashPassword,
  verifyPassword,
  generateResetToken
}; 