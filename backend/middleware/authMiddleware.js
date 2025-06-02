const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * میدلور محافظت از مسیرها 
 * این میدلور توکن کاربر را بررسی می‌کند و در صورت معتبر بودن، اطلاعات کاربر را به req.user اضافه می‌کند
 */
const protect = async (req, res, next) => {
  let token;
  
  // بررسی وجود هدر Authorization و شروع آن با Bearer
  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // جدا کردن توکن از هدر
      token = req.headers.authorization.split(' ')[1];
      
      // بررسی اعتبار توکن
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // دریافت اطلاعات کاربر و ذخیره در req.user
      // فیلد password حذف می‌شود
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'توکن معتبر است اما کاربر یافت نشد'
        });
      }
      
      next();
    } catch (error) {
      console.error('خطا در احراز هویت:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'توکن نامعتبر است'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'توکن منقضی شده است'
        });
      }
      
      res.status(401).json({
        success: false,
        message: 'احراز هویت ناموفق بود'
      });
    }
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'توکن احراز هویت یافت نشد'
    });
  }
};

/**
 * میدلور بررسی نقش ادمین 
 * این میدلور بررسی می‌کند که آیا کاربر دارای نقش ادمین است یا خیر
 * این میدلور باید بعد از میدلور protect استفاده شود
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'شما دسترسی به این بخش را ندارید'
    });
  }
};

module.exports = { protect, isAdmin }; 