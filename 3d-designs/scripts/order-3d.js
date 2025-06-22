// مدیریت صفحه سفارش طراحی سه‌بعدی
document.addEventListener('DOMContentLoaded', function() {
    console.log("Order 3D script loaded");
    
    // مقداردهی اولیه
    initializeOrderForm();
    
    // اضافه کردن event listeners
    setupFileUploads();
    setupFormValidation();
    setupFormSubmission();
});

// مقداردهی اولیه فرم
function initializeOrderForm() {
    // بررسی ورود کاربر
    if (!isUserLoggedIn()) {
        showNotification('لطفا ابتدا وارد حساب کاربری خود شوید', 'error');
        // ذخیره URL فعلی برای بازگشت بعد از ورود
        sessionStorage.setItem('loginRedirect', window.location.href);
        // انتقال به صفحه ورود
        setTimeout(() => {
            window.location.href = '../account/login.html';
        }, 2000);
        return;
    }
    
    console.log("Order form initialized");
}

// تنظیم آپلود فایل‌ها
function setupFileUploads() {
    // آپلود نقشه
    const blueprintInput = document.getElementById('blueprintFile');
    const blueprintPreview = document.getElementById('blueprintPreview');
    
    if (blueprintInput) {
        blueprintInput.addEventListener('change', function(e) {
            handleFileUpload(e.target.files[0], blueprintPreview, 'blueprint');
        });
    }
    
    // آپلود تصاویر مرجع
    const referenceInput = document.getElementById('referenceImages');
    const referencePreview = document.getElementById('referencePreview');
    
    if (referenceInput) {
        referenceInput.addEventListener('change', function(e) {
            handleMultipleFileUpload(e.target.files, referencePreview, 'reference');
        });
    }
}

// مدیریت آپلود فایل تکی
function handleFileUpload(file, previewContainer, type) {
    if (!file) return;
    
    // بررسی نوع فایل
    if (!validateFileType(file, type)) {
        showNotification('نوع فایل انتخاب شده مجاز نیست', 'error');
        return;
    }
    
    // بررسی اندازه فایل (حداکثر 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('حجم فایل نباید بیشتر از 10 مگابایت باشد', 'error');
        return;
    }
    
    // ایجاد پیش‌نمایش
    createFilePreview(file, previewContainer, type);
    
    showNotification('فایل با موفقیت آپلود شد', 'success');
}

// مدیریت آپلود چندین فایل
function handleMultipleFileUpload(files, previewContainer, type) {
    if (!files || files.length === 0) return;
    
    // حذف پیش‌نمایش‌های قبلی
    previewContainer.innerHTML = '';
    
    Array.from(files).forEach((file, index) => {
        if (index < 5) { // حداکثر 5 فایل
            handleFileUpload(file, previewContainer, type);
        }
    });
    
    if (files.length > 5) {
        showNotification('حداکثر 5 فایل قابل آپلود است', 'warning');
    }
}

// اعتبارسنجی نوع فایل
function validateFileType(file, type) {
    const allowedTypes = {
        blueprint: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
        reference: ['image/jpeg', 'image/jpg', 'image/png']
    };
    
    return allowedTypes[type].includes(file.type);
}

// ایجاد پیش‌نمایش فایل
function createFilePreview(file, container, type) {
    const previewItem = document.createElement('div');
    previewItem.className = 'file-preview-item uploaded';
    
    if (file.type.startsWith('image/')) {
        // برای تصاویر
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        previewItem.appendChild(img);
    } else {
        // برای PDF و سایر فایل‌ها
        const fileIcon = document.createElement('div');
        fileIcon.style.cssText = `
            width: 100%;
            height: 120px;
            background: var(--card-bg-color);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: var(--nav-bg-color);
        `;
        fileIcon.textContent = '📄';
        previewItem.appendChild(fileIcon);
    }
    
    // اطلاعات فایل
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    fileInfo.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 0.25rem;">${file.name}</div>
        <div>${formatFileSize(file.size)}</div>
    `;
    previewItem.appendChild(fileInfo);
    
    // دکمه حذف
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-file';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = () => {
        previewItem.remove();
        showNotification('فایل حذف شد', 'success');
    };
    previewItem.appendChild(removeBtn);
    
    container.appendChild(previewItem);
}

// فرمت کردن اندازه فایل
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// تنظیم اعتبارسنجی فرم
function setupFormValidation() {
    const form = document.getElementById('order3dForm');
    
    if (form) {
        // اعتبارسنجی شماره تماس
        const phoneInput = document.getElementById('customerPhone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                // فقط اعداد و کاراکترهای مجاز
                e.target.value = e.target.value.replace(/[^0-9+\-\s]/g, '');
            });
        }
        
        // اعتبارسنجی ایمیل
        const emailInput = document.getElementById('customerEmail');
        if (emailInput) {
            emailInput.addEventListener('blur', function(e) {
                if (e.target.value && !isValidEmail(e.target.value)) {
                    showFieldError(e.target, 'ایمیل وارد شده معتبر نیست');
                } else {
                    clearFieldError(e.target);
                }
            });
        }
    }
}

// بررسی اعتبار ایمیل
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// نمایش خطای فیلد
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ff6b6b;
        font-size: 0.8rem;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    `;
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#ff6b6b';
}

// پاک کردن خطای فیلد
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.style.borderColor = '';
}

// تنظیم ارسال فرم
function setupFormSubmission() {
    const form = document.getElementById('order3dForm');
    const submitBtn = document.getElementById('submitOrder');
    
    if (form && submitBtn) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission();
        });
    }
}

// مدیریت ارسال فرم
function handleFormSubmission() {
    const submitBtn = document.getElementById('submitOrder');
    
    // بررسی اعتبارسنجی
    if (!validateForm()) {
        return;
    }
    
    // تغییر وضعیت دکمه
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '<span class="btn-icon">⏳</span>در حال پردازش...';
    
    // جمع‌آوری اطلاعات فرم
    const formData = collectFormData();
    
    // شبیه‌سازی ارسال به سرور
    setTimeout(() => {
        // افزودن به سبد خرید
        addOrderToCart(formData);
        
        // بازگرداندن وضعیت دکمه
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = '<span class="btn-icon">🛒</span>ثبت سفارش و افزودن به سبد خرید';
        
        // انتقال به صفحه سبد خرید
        setTimeout(() => {
            window.location.href = '../checkout.html';
        }, 1500);
    }, 2000);
}

// اعتبارسنجی فرم
function validateForm() {
    const requiredFields = [
        'projectType',
        'roomSize',
        'style',
        'customerName',
        'customerPhone',
        'agreeTerms'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (!field || !field.value.trim()) {
            showFieldError(field, 'این فیلد الزامی است');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    
    // بررسی آپلود نقشه
    const blueprintPreview = document.getElementById('blueprintPreview');
    if (!blueprintPreview || blueprintPreview.children.length === 0) {
        showNotification('لطفا نقشه کابینت را آپلود کنید', 'error');
        isValid = false;
    }
    
    if (!isValid) {
        showNotification('لطفا تمام فیلدهای الزامی را تکمیل کنید', 'error');
    }
    
    return isValid;
}

// جمع‌آوری اطلاعات فرم
function collectFormData() {
    const formData = {
        id: '3d-design-' + Date.now(),
        name: 'طراحی سه‌بعدی کابینت',
        price: 400000,
        image: '../assets/icon/3d-design-icon.png',
        type: '3d-design',
        projectDetails: {
            projectType: document.getElementById('projectType').value,
            roomSize: document.getElementById('roomSize').value,
            style: document.getElementById('style').value,
            colorScheme: document.getElementById('colorScheme').value,
            specialRequirements: document.getElementById('specialRequirements').value
        },
        customerInfo: {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value,
            address: document.getElementById('customerAddress').value
        },
        files: {
            blueprint: getUploadedFiles('blueprintPreview'),
            references: getUploadedFiles('referencePreview')
        },
        orderDate: new Date().toISOString(),
        status: 'pending'
    };
    
    return formData;
}

// دریافت فایل‌های آپلود شده
function getUploadedFiles(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    
    const files = [];
    const previewItems = container.querySelectorAll('.file-preview-item');
    
    previewItems.forEach(item => {
        const fileName = item.querySelector('.file-info div:first-child').textContent;
        files.push(fileName);
    });
    
    return files;
}

// افزودن سفارش به سبد خرید
function addOrderToCart(orderData) {
    try {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // بررسی وجود سفارش مشابه
        const existingOrderIndex = cart.findIndex(item => item.type === '3d-design');
        
        if (existingOrderIndex > -1) {
            // جایگزینی سفارش قبلی
            cart[existingOrderIndex] = {
                ...orderData,
                quantity: 1
            };
        } else {
            // افزودن سفارش جدید
            cart.push({
                ...orderData,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // ذخیره جزئیات سفارش در localStorage جداگانه
        localStorage.setItem('3d-design-order', JSON.stringify(orderData));
        
        // بروزرسانی badge سبد خرید
        updateCartBadge();
        
        showNotification('سفارش طراحی سه‌بعدی با موفقیت به سبد خرید اضافه شد', 'success');
        
        console.log('3D Design order added to cart:', orderData);
        
    } catch (error) {
        console.error("Error adding order to cart:", error);
        showNotification('خطا در افزودن سفارش به سبد خرید', 'error');
    }
}

// بررسی ورود کاربر
function isUserLoggedIn() {
    const authToken = localStorage.getItem('auth_token');
    const kabanToken = localStorage.getItem('kabanToken');
    return !!authToken || !!kabanToken;
}

// نمایش اعلان
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// بروزرسانی badge سبد خرید
function updateCartBadge() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(badge => {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'block' : 'none';
        });
        
        console.log("Cart badge updated: count =", totalItems);
    } catch (error) {
        console.error("Error updating cart badge:", error);
    }
}

// --- Dark/Light Mode Toggle ---
const darkModeToggle = document.getElementById('darkModeToggle');
if (darkModeToggle) {
    function setDarkMode(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            darkModeToggle.querySelector('.moon').style.display = 'none';
            darkModeToggle.querySelector('.sun').style.display = 'inline-block';
        } else {
            document.body.classList.remove('dark-mode');
            darkModeToggle.querySelector('.moon').style.display = 'inline-block';
            darkModeToggle.querySelector('.sun').style.display = 'none';
        }
    }
    // Load from localStorage
    const darkPref = localStorage.getItem('darkMode') === 'true';
    setDarkMode(darkPref);
    darkModeToggle.addEventListener('click', function() {
        const isDark = !document.body.classList.contains('dark-mode');
        setDarkMode(isDark);
        localStorage.setItem('darkMode', isDark);
    });
} 