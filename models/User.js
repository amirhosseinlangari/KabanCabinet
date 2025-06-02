const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'نام و نام خانوادگی الزامی است'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'ایمیل الزامی است'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'لطفا یک ایمیل معتبر وارد کنید']
    },
    phone: {
        type: String,
        required: [true, 'شماره موبایل الزامی است'],
        trim: true,
        match: [/^09\d{9}$/, 'لطفا یک شماره موبایل معتبر وارد کنید']
    },
    password: {
        type: String,
        required: [true, 'رمز عبور الزامی است'],
        minlength: [6, 'رمز عبور باید حداقل 6 کاراکتر باشد']
    }
}, {
    timestamps: true
});

// هش کردن رمز عبور قبل از ذخیره
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// متد مقایسه رمز عبور
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// تولید توکن JWT
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// تولید شناسه نشست
userSchema.methods.generateSessionId = function() {
    return jwt.sign(
        { id: this._id, timestamp: Date.now() },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// اضافه کردن نشست جدید
userSchema.methods.addSession = function(sessionId, deviceInfo) {
    this.activeSessions.push({
        sessionId,
        deviceInfo: {
            ...deviceInfo,
            lastActive: new Date()
        }
    });
    return this.save();
};

// حذف نشست
userSchema.methods.removeSession = function(sessionId) {
    this.activeSessions = this.activeSessions.filter(
        session => session.sessionId !== sessionId
    );
    return this.save();
};

// بررسی اعتبار نشست
userSchema.methods.isValidSession = function(sessionId) {
    return this.activeSessions.some(session => session.sessionId === sessionId);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 