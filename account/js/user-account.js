// User account functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Check if user is logged in
    checkLoginStatus();
    
    // Login form submit event
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            if (validateLoginForm(email, password)) {
                login(email, password, remember);
            }
        });
    }
    
    // Register form submit event
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('registerEmail').value;
            const mobile = document.getElementById('mobile').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;
            
            if (validateRegisterForm(firstName, lastName, email, mobile, password, confirmPassword, terms)) {
                register(firstName, lastName, email, mobile, password);
            }
        });
    }
    
    // Logout button click event
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Function to validate login form
    function validateLoginForm(email, password) {
        // Clear previous error messages
        clearErrors();
        
        let isValid = true;
        
        // Validate email
        if (!email) {
            showError('email', 'لطفا ایمیل یا شماره موبایل خود را وارد کنید');
            isValid = false;
        }
        
        // Validate password
        if (!password) {
            showError('password', 'لطفا رمز عبور خود را وارد کنید');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Function to validate register form
    function validateRegisterForm(firstName, lastName, email, mobile, password, confirmPassword, terms) {
        // Clear previous error messages
        clearErrors();
        
        let isValid = true;
        
        // Validate first name
        if (!firstName) {
            showError('firstName', 'لطفا نام خود را وارد کنید');
            isValid = false;
        }
        
        // Validate last name
        if (!lastName) {
            showError('lastName', 'لطفا نام خانوادگی خود را وارد کنید');
            isValid = false;
        }
        
        // Validate email
        if (!email) {
            showError('registerEmail', 'لطفا ایمیل خود را وارد کنید');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('registerEmail', 'لطفا یک ایمیل معتبر وارد کنید');
            isValid = false;
        }
        
        // Validate mobile
        if (!mobile) {
            showError('mobile', 'لطفا شماره موبایل خود را وارد کنید');
            isValid = false;
        } else if (!isValidMobile(mobile)) {
            showError('mobile', 'لطفا یک شماره موبایل معتبر وارد کنید');
            isValid = false;
        }
        
        // Validate password
        if (!password) {
            showError('registerPassword', 'لطفا رمز عبور خود را وارد کنید');
            isValid = false;
        } else if (password.length < 8) {
            showError('registerPassword', 'رمز عبور باید حداقل 8 کاراکتر باشد');
            isValid = false;
        }
        
        // Validate confirm password
        if (!confirmPassword) {
            showError('confirmPassword', 'لطفا تکرار رمز عبور را وارد کنید');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError('confirmPassword', 'تکرار رمز عبور مطابقت ندارد');
            isValid = false;
        }
        
        // Validate terms
        if (!terms) {
            showError('terms', 'لطفا قوانین و مقررات را مطالعه و قبول کنید');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Function to login
    function login(email, password, remember) {
        // In a real application, this would be an API call to the server
        // For demonstration purposes, we'll use localStorage
        
        // Simulate API call delay
        showLoading('loginBtn');
        
        setTimeout(() => {
            // Simple validation for demo
            if (email === 'demo@example.com' && password === 'password') {
                // Store user data
                const user = {
                    id: 1,
                    firstName: 'کاربر',
                    lastName: 'کابان',
                    email: email,
                    mobile: '09121773915',
                    isLoggedIn: true
                };
                
                // Save user data to localStorage
                localStorage.setItem('kabanUser', JSON.stringify(user));
                
                // Set login token
                if (remember) {
                    localStorage.setItem('kabanToken', 'demo-token-xyz');
                } else {
                    sessionStorage.setItem('kabanToken', 'demo-token-xyz');
                }
                
                // Show success message
                showNotification('ورود با موفقیت انجام شد', 'success');
                
                // Redirect to homepage
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
            } else {
                showError('loginForm', 'ایمیل یا رمز عبور اشتباه است');
                showNotification('اطلاعات ورود اشتباه است', 'error');
                hideLoading('loginBtn');
            }
        }, 1500);
    }
    
    // Function to register
    function register(firstName, lastName, email, mobile, password) {
        // In a real application, this would be an API call to the server
        // For demonstration purposes, we'll use localStorage
        
        // Simulate API call delay
        showLoading('registerBtn');
        
        setTimeout(() => {
            // Check if email already exists
            const existingUser = localStorage.getItem('kabanUser');
            if (existingUser && JSON.parse(existingUser).email === email) {
                showError('registerEmail', 'این ایمیل قبلاً ثبت شده است');
                showNotification('این ایمیل قبلاً ثبت شده است', 'error');
                hideLoading('registerBtn');
                return;
            }
            
            // Store user data
            const user = {
                id: Math.floor(Math.random() * 1000) + 1,
                firstName: firstName,
                lastName: lastName,
                email: email,
                mobile: mobile,
                isLoggedIn: true
            };
            
            // Save user data to localStorage
            localStorage.setItem('kabanUser', JSON.stringify(user));
            
            // Set login token
            localStorage.setItem('kabanToken', 'register-token-xyz');
            
            // Show success message
            showNotification('ثبت نام با موفقیت انجام شد', 'success');
            
            // Redirect to homepage
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
        }, 1500);
    }
    
    // Function to logout
    function logout() {
        // Remove user data and token
        localStorage.removeItem('kabanUser');
        localStorage.removeItem('kabanToken');
        sessionStorage.removeItem('kabanToken');
        
        // Show success message
        showNotification('خروج با موفقیت انجام شد', 'success');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1500);
    }
    
    // Function to check login status
    function checkLoginStatus() {
        const user = JSON.parse(localStorage.getItem('kabanUser'));
        const token = localStorage.getItem('kabanToken') || sessionStorage.getItem('kabanToken');
        
        if (user && token) {
            // User is logged in
            // Update UI elements based on login status
            const accountLinks = document.querySelectorAll('.account-link');
            const logoutLinks = document.querySelectorAll('.logout-link');
            const userNameElements = document.querySelectorAll('.user-name');
            
            accountLinks.forEach(link => {
                link.style.display = 'block';
            });
            
            logoutLinks.forEach(link => {
                link.style.display = 'block';
            });
            
            userNameElements.forEach(element => {
                element.textContent = `${user.firstName} ${user.lastName}`;
            });
            
            // Hide login/register buttons or forms if on those pages
            const loginContainer = document.querySelector('.login-container');
            const registerContainer = document.querySelector('.register-container');
            
            if (loginContainer) {
                loginContainer.innerHTML = `
                    <div class="already-logged-in">
                        <h3>شما وارد سیستم شده‌اید</h3>
                        <p>به حساب کاربری خود خوش آمدید ${user.firstName} ${user.lastName}</p>
                        <a href="/account/profile.html" class="btn btn-primary">حساب کاربری</a>
                        <button id="logoutBtnPage" class="btn btn-secondary">خروج</button>
                    </div>
                `;
                
                document.getElementById('logoutBtnPage').addEventListener('click', logout);
            }
            
            if (registerContainer) {
                registerContainer.innerHTML = `
                    <div class="already-logged-in">
                        <h3>شما وارد سیستم شده‌اید</h3>
                        <p>به حساب کاربری خود خوش آمدید ${user.firstName} ${user.lastName}</p>
                        <a href="/account/profile.html" class="btn btn-primary">حساب کاربری</a>
                        <button id="logoutBtnPage" class="btn btn-secondary">خروج</button>
                    </div>
                `;
                
                document.getElementById('logoutBtnPage').addEventListener('click', logout);
            }
        } else {
            // User is not logged in
            // Update UI elements based on login status
            const accountLinks = document.querySelectorAll('.account-link');
            const logoutLinks = document.querySelectorAll('.logout-link');
            
            accountLinks.forEach(link => {
                link.style.display = 'none';
            });
            
            logoutLinks.forEach(link => {
                link.style.display = 'none';
            });
        }
    }
    
    // Helper functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidMobile(mobile) {
        // Simple mobile validation for Iranian numbers
        const mobileRegex = /^09[0-9]{9}$/;
        return mobileRegex.test(mobile);
    }
    
    function showError(elementId, message) {
        const element = document.getElementById(elementId);
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        if (element) {
            // If element is an input, add error class and insert error message after it
            if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
                element.classList.add('error');
                element.parentNode.insertBefore(errorElement, element.nextSibling);
            } else if (element.tagName === 'FORM') {
                // If element is a form, add error message at the top
                element.prepend(errorElement);
            } else {
                // For other elements, insert error message after it
                element.parentNode.insertBefore(errorElement, element.nextSibling);
            }
        }
    }
    
    function clearErrors() {
        // Remove all error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(message => {
            message.remove();
        });
        
        // Remove error class from inputs
        const errorInputs = document.querySelectorAll('.error');
        errorInputs.forEach(input => {
            input.classList.remove('error');
        });
    }
    
    function showLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = true;
            button.innerHTML = '<span class="loading-spinner"></span> در حال پردازش...';
        }
    }
    
    function hideLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = false;
            if (buttonId === 'loginBtn') {
                button.textContent = 'ورود';
            } else if (buttonId === 'registerBtn') {
                button.textContent = 'ثبت نام';
            }
        }
    }
    
    function showNotification(message, type = 'success') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('account-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'account-notification';
            notification.className = `account-notification ${type}`;
            document.body.appendChild(notification);
            
            // Add style for notification
            const style = document.createElement('style');
            style.textContent = `
                .account-notification {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    padding: 15px 25px;
                    border-radius: 30px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    transform: translateY(-100px);
                    opacity: 0;
                    transition: all 0.5s ease;
                }
                .account-notification.success {
                    background-color: #f1c68e;
                    color: #fff;
                }
                .account-notification.error {
                    background-color: #e74c3c;
                    color: #fff;
                }
                .account-notification.show {
                    transform: translateY(0);
                    opacity: 1;
                }
                body.dark-mode .account-notification.success {
                    background-color: #e6a95f;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
                }
                body.dark-mode .account-notification.error {
                    background-color: #c0392b;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
                }
                .loading-spinner {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: #fff;
                    animation: spin 1s ease-in-out infinite;
                    margin-right: 8px;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .error-message {
                    color: #e74c3c;
                    font-size: 12px;
                    margin-top: 5px;
                }
                .error {
                    border-color: #e74c3c !important;
                }
                .already-logged-in {
                    text-align: center;
                    padding: 20px;
                    background-color: #f8f9fa;
                    border-radius: 10px;
                    margin: 20px 0;
                }
                .already-logged-in h3 {
                    color: #333;
                    margin-bottom: 10px;
                }
                .already-logged-in p {
                    margin-bottom: 20px;
                }
                body.dark-mode .already-logged-in {
                    background-color: #343a40;
                }
                body.dark-mode .already-logged-in h3 {
                    color: #f8f9fa;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Set message and show notification
        notification.textContent = message;
        notification.className = `account-notification ${type}`;
        notification.classList.add('show');
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}); 