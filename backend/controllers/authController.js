const jwt = require('jsonwebtoken');
const User = require('../models/user');

// مدت زمان اعتبار توکن JWT (30 روز)
const JWT_EXPIRES_IN = '30d';

/**
 * تولید توکن JWT برای کاربر
 * @param {Object} user - آبجکت کاربر 
 * @returns {String} توکن JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * ثبت‌نام کاربر جدید
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, address } = req.body;

    // بررسی وجود کاربر با ایمیل مشابه
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'کاربری با این ایمیل قبلاً ثبت‌نام کرده است'
      });
    }

    // ایجاد کاربر جدید
    const user = new User({
      fullName,
      email,
      phoneNumber,
      password,
      address
    });

    await user.save();

    // تولید توکن JWT
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'ثبت‌نام با موفقیت انجام شد',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('خطا در ثبت‌نام کاربر:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در سرور رخ داده است',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * ورود کاربر
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // بررسی وجود کاربر
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ایمیل یا رمز عبور اشتباه است'
      });
    }

    // بررسی صحت رمز عبور
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'ایمیل یا رمز عبور اشتباه است'
      });
    }

    // بررسی فعال بودن حساب کاربری
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'حساب کاربری شما غیرفعال شده است. لطفا با پشتیبانی تماس بگیرید'
      });
    }

    // بروزرسانی آخرین زمان ورود
    user.lastLogin = Date.now();
    await user.save();

    // تولید توکن JWT
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'ورود با موفقیت انجام شد',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('خطا در ورود کاربر:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در سرور رخ داده است',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * دریافت اطلاعات کاربر فعلی
 * GET /api/auth/me
 */
exports.getCurrentUser = async (req, res) => {
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
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('خطا در دریافت اطلاعات کاربر:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در سرور رخ داده است',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * بروزرسانی اطلاعات کاربر
 * PUT /api/auth/me
 */
exports.updateUser = async (req, res) => {
  try {
    const { fullName, phoneNumber, address } = req.body;
    
    // فیلدهای قابل بروزرسانی
    const updates = {
      fullName,
      phoneNumber,
      address,
      updatedAt: Date.now()
    };

    // حذف فیلدهای undefined
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
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
      message: 'اطلاعات کاربر با موفقیت بروزرسانی شد',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('خطا در بروزرسانی اطلاعات کاربر:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در سرور رخ داده است',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * تغییر رمز عبور کاربر
 * PUT /api/auth/password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // بررسی وجود پسوردهای وارد شده
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'رمز عبور فعلی و جدید الزامی است'
      });
    }

    // بررسی طول رمز عبور جدید
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'رمز عبور جدید باید حداقل 6 کاراکتر باشد'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    // بررسی صحت رمز عبور فعلی
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
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
    res.status(500).json({
      success: false,
      message: 'خطا در سرور رخ داده است',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 