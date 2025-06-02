const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ثبت نام کاربر جدید
router.post('/register', async (req, res) => {
    try {
        console.log('Received registration request:', req.body);
        
        const { name, email, phone, password } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'لطفاً تمام فیلدها را پر کنید'
            });
        }

        // Check if email exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'این ایمیل قبلاً ثبت شده است'
            });
        }

        // Check if phone exists
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: 'این شماره موبایل قبلاً ثبت شده است'
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            phone,
            password // Will be hashed by the pre-save middleware
        });

        await user.save();
        console.log('User saved:', user._id);

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'ثبت نام با موفقیت انجام شد',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در ثبت نام'
        });
    }
});

// ورود کاربر
router.post('/login', async (req, res) => {
    try {
        console.log('Login request received:', req.body);
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'لطفاً ایمیل و رمز عبور را وارد کنید'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        console.log('User found:', user ? 'yes' : 'no');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'ایمیل یا رمز عبور اشتباه است'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch ? 'yes' : 'no');

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'ایمیل یا رمز عبور اشتباه است'
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        console.log('Login successful for:', email);

        res.json({
            success: true,
            message: 'ورود موفقیت‌آمیز',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در ورود به سیستم'
        });
    }
});

module.exports = router; 