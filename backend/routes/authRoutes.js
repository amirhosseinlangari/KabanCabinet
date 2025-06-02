const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * ثبت‌نام کاربر جدید
 * POST /api/auth/register
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    
    // بررسی وجود فیلدهای اجباری
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'تمامی فیلدها الزامی هستند',
        errors: {
          fullName: !fullName ? 'نام و نام خانوادگی الزامی است' : null,
          email: !email ? 'ایمیل الزامی است' : null,
          phone: !phone ? 'شماره تلفن الزامی است' : null,
          password: !password ? 'رمز عبور الزامی است' : null
        }
      });
    }

    // بررسی طول رمز عبور
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'رمز عبور باید حداقل 6 کاراکتر باشد',
        errors: {
          password: 'رمز عبور باید حداقل 6 کاراکتر باشد'
        }
      });
    }
    
    // بررسی وجود کاربر با ایمیل یا شماره تلفن مشابه
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      const errors = {};
      if (existingUser.email === email) {
        errors.email = 'این ایمیل قبلاً ثبت شده است';
      }
      if (existingUser.phone === phone) {
        errors.phone = 'این شماره تلفن قبلاً ثبت شده است';
      }
      return res.status(400).json({
        success: false,
        message: 'کاربری با این اطلاعات قبلاً ثبت‌نام کرده است',
        errors
      });
    }
    
    // ایجاد کاربر جدید
    const user = new User({
      fullName,
      email,
      phone,
      password
    });
    
    // ذخیره کاربر در دیتابیس
    await user.save();
    
    // ساخت توکن JWT
    const token = user.generateAuthToken();
    
    res.status(201).json({
      success: true,
      message: 'ثبت‌نام با موفقیت انجام شد',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('خطا در ثبت‌نام کاربر:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: 'خطا در اطلاعات ورودی',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطا در ثبت‌نام کاربر',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * ورود کاربر
 * POST /api/auth/login
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // بررسی وجود کاربر
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ایمیل یا رمز عبور نادرست است'
      });
    }
    
    // بررسی فعال بودن کاربر
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'حساب کاربری شما غیرفعال شده است'
      });
    }
    
    // بررسی صحت رمز عبور
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'ایمیل یا رمز عبور نادرست است'
      });
    }
    
    // بروزرسانی زمان آخرین ورود
    user.lastLogin = Date.now();
    await user.save();
    
    // ساخت توکن JWT
    const token = user.generateAuthToken();
    
    res.json({
      success: true,
      message: 'ورود با موفقیت انجام شد',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('خطا در ورود کاربر:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ورود به سیستم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * دریافت اطلاعات کاربر فعلی
 * GET /api/auth/me
 * @access Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        addresses: user.addresses,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('خطا در دریافت اطلاعات کاربر:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت اطلاعات کاربر',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * به‌روزرسانی اطلاعات کاربر
 * PUT /api/auth/update-profile
 * @access Private
 */
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    
    // بررسی و به‌روزرسانی کاربر
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }
    
    res.json({
      success: true,
      message: 'اطلاعات کاربر با موفقیت به‌روزرسانی شد',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('خطا در به‌روزرسانی پروفایل:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'خطا در اطلاعات ورودی',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی پروفایل',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * تغییر رمز عبور
 * PUT /api/auth/change-password
 * @access Private
 */
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // دریافت کاربر با رمز عبور
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }
    
    // بررسی صحت رمز عبور فعلی
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'رمز عبور فعلی اشتباه است'
      });
    }
    
    // تغییر رمز عبور
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'رمز عبور با موفقیت تغییر یافت'
    });
  } catch (error) {
    console.error('خطا در تغییر رمز عبور:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'خطا در اطلاعات ورودی',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطا در تغییر رمز عبور',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * درخواست بازنشانی رمز عبور
 * POST /api/auth/forgot-password
 * @access Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // بررسی وجود کاربر
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربری با این ایمیل یافت نشد'
      });
    }
    
    // تولید توکن بازنشانی رمز عبور
    const resetToken = user.generateResetPasswordToken();
    
    // ذخیره تغییرات کاربر
    await user.save();
    
    // ایجاد URL بازنشانی رمز عبور
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    // ارسال ایمیل حاوی لینک بازنشانی (در اینجا فقط URL برگردانده می‌شود)
    // TODO: پیاده‌سازی ارسال ایمیل
    
    res.json({
      success: true,
      message: 'لینک بازنشانی رمز عبور به ایمیل شما ارسال شد',
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    });
  } catch (error) {
    console.error('خطا در درخواست بازنشانی رمز عبور:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ارسال ایمیل بازنشانی رمز عبور',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * بازنشانی رمز عبور
 * POST /api/auth/reset-password/:token
 * @access Public
 */
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    
    // هش کردن توکن دریافتی
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    
    // یافتن کاربر با توکن معتبر
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'توکن نامعتبر یا منقضی شده است'
      });
    }
    
    // تنظیم رمز عبور جدید
    user.password = password;
    
    // پاک کردن فیلدهای بازنشانی رمز عبور
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    // ذخیره تغییرات
    await user.save();
    
    // ساخت توکن JWT
    const token = user.generateAuthToken();
    
    res.json({
      success: true,
      message: 'رمز عبور با موفقیت بازنشانی شد',
      token
    });
  } catch (error) {
    console.error('خطا در بازنشانی رمز عبور:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'خطا در اطلاعات ورودی',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطا در بازنشانی رمز عبور',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * افزودن آدرس جدید
 * POST /api/auth/addresses
 * @access Private
 */
router.post('/addresses', protect, async (req, res) => {
  try {
    const { title, city, address, postalCode, isDefault } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }
    
    // ایجاد آدرس جدید
    const newAddress = {
      title,
      city,
      address,
      postalCode,
      isDefault: isDefault || false
    };
    
    // اگر آدرس جدید به عنوان پیش‌فرض تنظیم شده، بقیه آدرس‌ها را از حالت پیش‌فرض خارج کن
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    // افزودن آدرس جدید
    user.addresses.push(newAddress);
    
    // اگر این اولین آدرس است، به عنوان پیش‌فرض تنظیم کن
    if (user.addresses.length === 1) {
      user.addresses[0].isDefault = true;
    }
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'آدرس با موفقیت اضافه شد',
      address: newAddress,
      addresses: user.addresses
    });
  } catch (error) {
    console.error('خطا در افزودن آدرس:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'خطا در اطلاعات ورودی',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطا در افزودن آدرس',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * به‌روزرسانی آدرس
 * PUT /api/auth/addresses/:addressId
 * @access Private
 */
router.put('/addresses/:addressId', protect, async (req, res) => {
  try {
    const { title, city, address, postalCode, isDefault } = req.body;
    const addressId = req.params.addressId;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }
    
    // بررسی وجود آدرس
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'آدرس مورد نظر یافت نشد'
      });
    }
    
    // به‌روزرسانی آدرس
    if (title) user.addresses[addressIndex].title = title;
    if (city) user.addresses[addressIndex].city = city;
    if (address) user.addresses[addressIndex].address = address;
    if (postalCode) user.addresses[addressIndex].postalCode = postalCode;
    
    // تنظیم آدرس پیش‌فرض
    if (isDefault) {
      user.addresses.forEach((addr, index) => {
        addr.isDefault = index === addressIndex;
      });
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'آدرس با موفقیت به‌روزرسانی شد',
      address: user.addresses[addressIndex],
      addresses: user.addresses
    });
  } catch (error) {
    console.error('خطا در به‌روزرسانی آدرس:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'خطا در اطلاعات ورودی',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی آدرس',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * حذف آدرس
 * DELETE /api/auth/addresses/:addressId
 * @access Private
 */
router.delete('/addresses/:addressId', protect, async (req, res) => {
  try {
    const addressId = req.params.addressId;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }
    
    // بررسی وجود آدرس
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'آدرس مورد نظر یافت نشد'
      });
    }
    
    // بررسی آدرس پیش‌فرض
    const isDefault = user.addresses[addressIndex].isDefault;
    
    // حذف آدرس
    user.addresses.splice(addressIndex, 1);
    
    // اگر آدرس حذف شده پیش‌فرض بود، تنظیم اولین آدرس به عنوان پیش‌فرض
    if (isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'آدرس با موفقیت حذف شد',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('خطا در حذف آدرس:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در حذف آدرس',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 