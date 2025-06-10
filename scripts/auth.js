/**
 * سیستم احراز هویت کابینت کابان
 * Authentication system for Kaban Cabinet
 */

class AuthManager {
    constructor() {
        this.baseUrl = 'https://www.kabancabinet.ir/api';
        this.tokenKey = 'auth_token';
        this.userKey = 'user_data';
        this.sessionKey = 'session_id';
        
        // اضافه کردن مقادیر سازگار برای سایر بخش‌های برنامه
        this.compatTokenKey = 'kabanToken';
        this.compatUserKey = 'kabanUser';
    }

    /**
     * ثبت نام کاربر جدید
     * @param {Object} userData - اطلاعات کاربر
     * @returns {Promise} نتیجه ثبت نام
     */
    async register(userData) {
        try {
            console.log('Attempting to register with:', userData);
            
            const response = await fetch(`${this.baseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (!response.ok) {
                if (data.errors) {
                    // نمایش خطاهای اعتبارسنجی
                    Object.keys(data.errors).forEach(field => {
                        showError(field, data.errors[field]);
                    });
                }
                throw new Error(data.message || 'خطا در ثبت نام');
            }

            // Store auth data
            localStorage.setItem(this.tokenKey, data.token);
            localStorage.setItem(this.userKey, JSON.stringify(data.user));
            
            // Redirect to homepage after successful registration
            window.location.href = '/index.html';
            
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            if (error.message === 'Failed to fetch') {
                showError('general', 'خطا در اتصال به سرور. لطفاً مطمئن شوید که سرور در حال اجراست');
            } else {
                showError('general', error.message || 'خطا در ثبت نام');
            }
            throw error;
        }
    }

    /**
     * ورود کاربر
     * @param {string} email - ایمیل کاربر
     * @param {string} password - رمز عبور
     * @returns {Promise} نتیجه ورود
     */
    async login(email, password) {
        try {
            console.log('AuthManager: Attempting login for:', email);
            
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            console.log('AuthManager: Response status:', response.status);
            const data = await response.json();
            console.log('AuthManager: Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'خطا در ورود');
            }

            if (data.token) {
                // ذخیره توکن در هر دو فرمت برای سازگاری
                localStorage.setItem(this.tokenKey, data.token);
                localStorage.setItem(this.compatTokenKey, data.token); 
                
                // ذخیره اطلاعات کاربر در هر دو فرمت
                localStorage.setItem(this.userKey, JSON.stringify(data.user));
                localStorage.setItem(this.compatUserKey, JSON.stringify(data.user));
                
                // تنظیم یک فلگ برای نشان دادن وضعیت ورود
                localStorage.setItem('isLoggedIn', 'true');
                
                console.log('AuthManager: Login successful, token stored in both formats');
            }

            return data;
        } catch (error) {
            console.error('AuthManager: Login error:', error);
            throw error;
        }
    }

    /**
     * خروج کاربر
     */
    async logout() {
        try {
            const sessionId = localStorage.getItem(this.sessionKey);
            if (sessionId) {
                await fetch(`${this.baseUrl}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.getToken()}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ sessionId })
                });
            }
        } catch (error) {
            console.error('خطا در خروج:', error);
        } finally {
            this.clearAuthData();
            window.location.href = window.location.origin + '/index.html';
        }
    }

    /**
     * بررسی وضعیت ورود کاربر
     * @returns {boolean} آیا کاربر لاگین کرده است
     */
    isAuthenticated() {
        return !!this.getToken() && !!this.getSessionId();
    }

    /**
     * دریافت توکن کاربر
     * @returns {string|null} توکن کاربر
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * دریافت شناسه نشست
     * @returns {string|null} شناسه نشست
     */
    getSessionId() {
        return localStorage.getItem(this.sessionKey);
    }

    /**
     * دریافت اطلاعات کاربر
     * @returns {Object|null} اطلاعات کاربر
     */
    getUser() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    /**
     * ذخیره اطلاعات احراز هویت
     * @param {string} token - توکن کاربر
     * @param {Object} user - اطلاعات کاربر
     * @param {string} sessionId - شناسه نشست
     */
    async setAuthData(token, user, sessionId) {
        // ذخیره اطلاعات در localStorage
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
        localStorage.setItem(this.sessionKey, sessionId);
        localStorage.setItem('isLoggedIn', 'true');

        // ذخیره اطلاعات در دیتابیس
        try {
            await fetch(`${this.baseUrl}/auth/session`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    sessionId,
                    deviceInfo: this.getDeviceInfo()
                })
            });
        } catch (error) {
            console.error('خطا در ذخیره اطلاعات نشست:', error);
        }
    }

    /**
     * پاک کردن اطلاعات احراز هویت
     */
    clearAuthData() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.sessionKey);
        localStorage.removeItem('isLoggedIn');
    }

    /**
     * بررسی اعتبار توکن
     * @returns {Promise<boolean>} آیا توکن معتبر است
     */
    async validateToken() {
        try {
            const token = this.getToken();
            const sessionId = this.getSessionId();
            
            if (!token || !sessionId) return false;

            const response = await fetch(`${this.baseUrl}/auth/validate`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionId })
            });

            if (!response.ok) {
                this.clearAuthData();
                return false;
            }

            return true;
        } catch (error) {
            console.error('خطا در بررسی اعتبار توکن:', error);
            this.clearAuthData();
            return false;
        }
    }

    /**
     * دریافت اطلاعات دستگاه کاربر
     * @returns {Object} اطلاعات دستگاه
     */
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    isLoggedIn() {
        // بررسی وجود توکن در هر دو کلید
        return !!localStorage.getItem(this.tokenKey) || 
               !!localStorage.getItem(this.compatTokenKey);
    }
}

// ایجاد نمونه از کلاس AuthManager
const authManager = new AuthManager();

// بررسی وضعیت احراز هویت در هنگام بارگذاری صفحه
document.addEventListener('DOMContentLoaded', async () => {
    if (authManager.isAuthenticated()) {
        const isValid = await authManager.validateToken();
        if (!isValid) {
            authManager.clearAuthData();
        }
    }
});

// اضافه کردن به پنجره برای دسترسی از سایر فایل‌ها
window.authManager = authManager;

// فرم ورود
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // پاک کردن پیام‌های خطای قبلی
        clearErrors();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                showError('general', data.message || 'خطا در ورود');
                return;
            }

            // ذخیره توکن و اطلاعات کاربر
            localStorage.setItem('token', data.token);
            localStorage.setItem('sessionId', data.sessionId);
            localStorage.setItem('user', JSON.stringify(data.user));

            // نمایش پیام موفقیت
            alert('ورود موفقیت‌آمیز بود');
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Login error:', error);
            showError('general', 'خطا در ورود. لطفاً دوباره تلاش کنید.');
        }
    });
}

// فرم ثبت نام
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // پاک کردن پیام‌های خطای قبلی
        clearErrors();
        
        const username = document.getElementById('username').value;
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // بررسی تطابق رمز عبور
        if (password !== confirmPassword) {
            showError('confirmPassword', 'رمز عبور و تکرار آن مطابقت ندارند');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    name,
                    email,
                    phone,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    // نمایش خطاهای اعتبارسنجی
                    Object.keys(data.errors).forEach(field => {
                        showError(field, data.errors[field]);
                    });
                } else {
                    showError('general', data.message || 'خطا در ثبت نام');
                }
                return;
            }

            // نمایش پیام موفقیت
            alert('ثبت نام با موفقیت انجام شد');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Registration error:', error);
            showError('general', 'خطا در ثبت نام. لطفاً دوباره تلاش کنید.');
        }
    });
}

// فرم فراموشی رمز عبور
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // پاک کردن پیام‌های خطای قبلی
        clearErrors();
        
        const email = document.getElementById('email').value;

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                showError('email', data.message || 'خطا در ارسال لینک بازیابی');
                return;
            }

            // نمایش پیام موفقیت
            alert('لینک بازیابی رمز عبور به ایمیل شما ارسال شد');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Password reset error:', error);
            showError('general', 'خطا در ارسال لینک بازیابی. لطفاً دوباره تلاش کنید.');
        }
    });
}

// اعتبارسنجی شماره موبایل
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        e.target.value = value;
    });
}

// نمایش خطا
function showError(field, message) {
    const errorElement = document.getElementById(`${field}Error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// پاک کردن همه خطاها
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
} 