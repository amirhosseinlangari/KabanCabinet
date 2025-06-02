const express = require('express');
const router = express.Router();
const { auth, register, login, logout, validateSession, getProfile } = require('../controllers/authController');

// مسیرهای عمومی
router.post('/register', register);
router.post('/login', login);

// مسیرهای محافظت شده
router.post('/logout', auth, logout);
router.post('/validate', auth, validateSession);
router.get('/profile', auth, getProfile);

module.exports = router; 