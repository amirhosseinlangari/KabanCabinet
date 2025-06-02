const express = require('express');
const router = express.Router();
const { 
  checkAuth, 
  generateToken, 
  hashPassword, 
  verifyPassword,
  generateResetToken
} = require('../utils/auth');
const User = require('../models/user');
const { isValidEmail, isValidMobile } = require('../utils/helpers');

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password } = req.body;
    
    // Validate input
    if (!firstName || !lastName || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'تمامی فیلدها الزامی هستند'
      });
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'فرمت ایمیل نامعتبر است'
      });
    }
    
    // Validate mobile format
    if (!isValidMobile(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'فرمت شماره موبایل نامعتبر است'
      });
    }
    
    // Check password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'رمز عبور باید حداقل 8 کاراکتر باشد'
      });
    }
    
    // Check if user with this email already exists
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(400).json({
        success: false,
        message: 'این ایمیل قبلاً ثبت شده است'
      });
    }
    
    // Check if user with this mobile already exists
    const existingUserMobile = await User.findOne({ mobile });
    if (existingUserMobile) {
      return res.status(400).json({
        success: false,
        message: 'این شماره موبایل قبلاً ثبت شده است'
      });
    }
    
    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      mobile,
      password: hashPassword(password)
    });
    
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      message: 'ثبت نام با موفقیت انجام شد',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ثبت نام کاربر'
    });
  }
});

/**
 * @route   POST /api/users/login
 * @desc    Login a user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, remember } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'ایمیل/موبایل و رمز عبور الزامی هستند'
      });
    }
    
    // Find user by email or mobile
    const user = await User.findOne({
      $or: [{ email }, { mobile: email }]
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ایمیل/موبایل یا رمز عبور اشتباه است'
      });
    }
    
    // Check password
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'ایمیل/موبایل یا رمز عبور اشتباه است'
      });
    }
    
    // Generate token
    const token = generateToken(user._id, user.isAdmin, remember);
    
    res.json({
      success: true,
      message: 'ورود با موفقیت انجام شد',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ورود کاربر'
    });
  }
});

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت پروفایل کاربر'
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', checkAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, mobile } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }
    
    // Validate email if changed
    if (email && email !== user.email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'فرمت ایمیل نامعتبر است'
        });
      }
      
      // Check if email is already in use
      const existingUserEmail = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUserEmail) {
        return res.status(400).json({
          success: false,
          message: 'این ایمیل قبلاً ثبت شده است'
        });
      }
    }
    
    // Validate mobile if changed
    if (mobile && mobile !== user.mobile) {
      if (!isValidMobile(mobile)) {
        return res.status(400).json({
          success: false,
          message: 'فرمت شماره موبایل نامعتبر است'
        });
      }
      
      // Check if mobile is already in use
      const existingUserMobile = await User.findOne({ mobile, _id: { $ne: req.user.id } });
      if (existingUserMobile) {
        return res.status(400).json({
          success: false,
          message: 'این شماره موبایل قبلاً ثبت شده است'
        });
      }
    }
    
    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'پروفایل با موفقیت بروزرسانی شد',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در بروزرسانی پروفایل کاربر'
    });
  }
});

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', checkAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'رمز عبور فعلی و جدید الزامی هستند'
      });
    }
    
    // Check new password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'رمز عبور جدید باید حداقل 8 کاراکتر باشد'
      });
    }
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }
    
    // Check current password
    const isPasswordValid = verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'رمز عبور فعلی اشتباه است'
      });
    }
    
    // Update password
    user.password = hashPassword(newPassword);
    await user.save();
    
    res.json({
      success: true,
      message: 'رمز عبور با موفقیت تغییر یافت'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در تغییر رمز عبور'
    });
  }
});

/**
 * @route   POST /api/users/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'ایمیل الزامی است'
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    // Don't reveal if user exists or not for security
    if (!user) {
      return res.json({
        success: true,
        message: 'اگر حساب کاربری با این ایمیل وجود داشته باشد، ایمیل بازیابی رمز عبور ارسال خواهد شد'
      });
    }
    
    // Generate reset token
    const { resetToken, hashedToken, expiresAt } = generateResetToken();
    
    // Update user with reset token
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiresAt;
    await user.save();
    
    // In a real app, send email with reset link
    // For demo purposes, just return the token
    // sendResetPasswordEmail(user.email, resetToken);
    
    res.json({
      success: true,
      message: 'ایمیل بازیابی رمز عبور ارسال شد',
      // Only for demo - remove in production
      resetToken
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در درخواست بازیابی رمز عبور'
    });
  }
});

/**
 * @route   POST /api/users/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'رمز عبور جدید الزامی است'
      });
    }
    
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'رمز عبور باید حداقل 8 کاراکتر باشد'
      });
    }
    
    // Hash token from params
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with token and valid expiration
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'توکن نامعتبر یا منقضی شده است'
      });
    }
    
    // Update password and clear reset token fields
    user.password = hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.json({
      success: true,
      message: 'رمز عبور با موفقیت بازیابی شد'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در بازیابی رمز عبور'
    });
  }
});

module.exports = router; 