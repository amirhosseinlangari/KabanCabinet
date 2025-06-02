const User = require('../models/User');
const jwt = require('jsonwebtoken');

// میدلور بررسی توکن
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'لطفا وارد حساب کاربری خود شوید' });
    }
};

// بررسی تکراری نبودن نام کاربری و ایمیل
const checkUniqueFields = async (username, email) => {
    const errors = {};
    
    // بررسی نام کاربری
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        errors.username = 'این نام کاربری قبلاً استفاده شده است';
    }

    // بررسی ایمیل
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        errors.email = 'این ایمیل قبلاً ثبت شده است';
    }

    return Object.keys(errors).length > 0 ? errors : null;
};

// ثبت نام کاربر جدید
exports.register = async (req, res) => {
    try {
        const { username, name, email, password, phone } = req.body;

        // بررسی تکراری نبودن نام کاربری و ایمیل
        const uniqueErrors = await checkUniqueFields(username, email);
        if (uniqueErrors) {
            return res.status(400).json({ errors: uniqueErrors });
        }

        // ایجاد کاربر جدید
        const user = new User({
            username,
            name,
            email,
            password,
            phone
        });

        await user.save();

        // تولید توکن و نشست
        const token = user.generateAuthToken();
        const sessionId = user.generateSessionId();

        // ذخیره نشست
        await user.addSession(sessionId, {
            userAgent: req.headers['user-agent'],
            platform: req.headers['sec-ch-ua-platform']
        });

        // ارسال پاسخ
        res.status(201).json({
            message: 'ثبت نام با موفقیت انجام شد',
            token,
            sessionId,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        // بررسی خطاهای اعتبارسنجی Mongoose
        if (error.name === 'ValidationError') {
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ errors });
        }
        res.status(500).json({ message: 'خطا در ثبت نام' });
    }
};

// ورود کاربر
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // پیدا کردن کاربر با نام کاربری یا ایمیل
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });
        }

        // بررسی رمز عبور
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });
        }

        // تولید توکن و نشست
        const token = user.generateAuthToken();
        const sessionId = user.generateSessionId();

        // ذخیره نشست
        await user.addSession(sessionId, {
            userAgent: req.headers['user-agent'],
            platform: req.headers['sec-ch-ua-platform']
        });

        // ارسال پاسخ
        res.json({
            message: 'ورود موفقیت‌آمیز',
            token,
            sessionId,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'خطا در ورود' });
    }
};

// خروج کاربر
exports.logout = async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        // حذف نشست
        await req.user.removeSession(sessionId);
        
        res.json({ message: 'خروج موفقیت‌آمیز' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// بررسی اعتبار توکن و نشست
exports.validateSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (!req.user.isValidSession(sessionId)) {
            return res.status(401).json({ message: 'نشست نامعتبر است' });
        }

        res.json({ valid: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// دریافت اطلاعات کاربر
exports.getProfile = async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                username: req.user.username,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    auth,
    register: exports.register,
    login: exports.login,
    logout: exports.logout,
    validateSession: exports.validateSession,
    getProfile: exports.getProfile
}; 