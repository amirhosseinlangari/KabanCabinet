const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * مدل کاربر
 * User Schema
 */
const UserSchema = new Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'لطفا یک ایمیل معتبر وارد کنید']
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  address: {
    street: String,
    city: String,
    postalCode: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// میدلور برای هش کردن پسورد قبل از ذخیره
UserSchema.pre('save', async function(next) {
  // بروزرسانی تاریخ آپدیت
  this.updatedAt = Date.now();
  
  // اگر پسورد تغییر نکرده باشد، نیازی به هش کردن مجدد نیست
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // هش کردن پسورد با bcryptjs
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// متد برای بررسی صحت پسورد
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// متد برای ساخت توکن JWT
UserSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// متد برای دریافت اطلاعات عمومی کاربر (بدون پسورد)
UserSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', UserSchema); 