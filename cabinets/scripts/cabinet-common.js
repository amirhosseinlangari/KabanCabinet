/**
 * کدهای مشترک جاوااسکریپت برای صفحات کابینت کابان
 */

// کش کردن انتخاب‌های DOM برای بهبود عملکرد
const menuToggle = document.querySelector('.menu-toggle');
const navContainer = document.querySelector('.nav-container');
const overlay = document.querySelector('.overlay');
const dropdowns = document.querySelectorAll('.dropdown-cabinet, .dropdown-mahsool');
const darkModeToggle = document.getElementById('darkModeToggle');
const mobileDarkMode = document.getElementById('mobileDarkMode');
const menuLinks = document.querySelectorAll('.nav-container a:not(.cabinet):not(.mahsool)');
const cabinetLink = document.querySelector('.cabinet');
const mahsoolLink = document.querySelector('.mahsool');

// ===== تنظیمات دارک مود =====

/**
 * تغییر حالت دارک مود و ذخیره در localStorage
 */
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
}

// رویدادهای دکمه دارک مود
if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);
if (mobileDarkMode) mobileDarkMode.addEventListener('click', toggleDarkMode);

// ===== مدیریت منوی موبایل =====

/**
 * بررسی عرض پنجره و نمایش/پنهان کردن دکمه همبرگر
 */
function checkMenuDisplay() {
    if (!menuToggle) return; // محافظت در برابر عناصر ناموجود
    
    const isMobile = window.innerWidth <= 768;
    
    // فقط در حالت موبایل نمایش داده شود
    menuToggle.style.display = isMobile ? 'flex' : 'none';
    
    // بستن منو اگر باز است و در حالت دسکتاپ هستیم
    if (!isMobile && navContainer && navContainer.classList.contains('active')) {
        closeMenu();
    }
    
    // اطمینان از نمایش منو در حالت دسکتاپ
    if (!isMobile && navContainer) {
        navContainer.style.right = '';
        navContainer.style.visibility = 'visible';
        navContainer.style.pointerEvents = 'auto';
    }
}

/**
 * بستن منو و زیرمنوها
 */
function closeMenu() {
    if (!menuToggle || !navContainer || !overlay) return;
    
    menuToggle.classList.remove('active');
    navContainer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // بستن تمام زیرمنوها فقط اگر منو بسته شود
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
    });
}

// اضافه کردن رویدادها فقط اگر عناصر موردنظر موجود باشند
if (navContainer) {
    // ممانعت از بستن منو با کلیک روی خود منو
    navContainer.addEventListener('click', function(event) {
        event.stopPropagation();
    });
}

if (menuToggle) {
    // رویداد کلیک دکمه همبرگر
    menuToggle.addEventListener('click', function(event) {
        event.stopPropagation();
        
        this.classList.toggle('active');
        if (navContainer) navContainer.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
        
        // قفل کردن اسکرول صفحه هنگام باز بودن منو
        document.body.style.overflow = navContainer && navContainer.classList.contains('active') ? 'hidden' : '';
    });
}

if (overlay) {
    // بستن منو با کلیک روی اورلی
    overlay.addEventListener('click', closeMenu);
}

// از استفاده از throttle برای بهبود عملکرد در رویدادهای مکرر
let documentClickTimeout;
document.addEventListener('click', function() {
    if (documentClickTimeout) clearTimeout(documentClickTimeout);
    
    documentClickTimeout = setTimeout(() => {
        // اگر منو باز است و عرض صفحه کمتر از 768 پیکسل است
        if (navContainer && navContainer.classList.contains('active') && window.innerWidth <= 768) {
            closeMenu();
        }
    }, 10);
});

// ===== مدیریت زیرمنوها =====

// باز و بسته کردن زیرمنوها
dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('a');
    
    if (link) {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                
                // اگر منو فعال است، آن را غیرفعال کن
                if (dropdown.classList.contains('active')) {
                    dropdown.classList.remove('active');
                } else {
                    // بستن سایر منوهای باز قبل از باز کردن منوی جدید
                    dropdowns.forEach(d => {
                        if (d !== dropdown) {
                            d.classList.remove('active');
                        }
                    });
                    
                    dropdown.classList.add('active');
                }
            }
        });
    }
});

// بستن منو با کلیک روی لینک‌های آن
menuLinks.forEach(link => {
    link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            closeMenu();
        }
    });
});

// ===== رویدادهای بارگذاری و تغییر اندازه =====

// استفاده از DOMContentLoaded به جای load برای عملکرد سریع‌تر
document.addEventListener('DOMContentLoaded', () => {
    // تنظیم حالت دارک مود
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
    
    // بررسی نمایش منو
    checkMenuDisplay();
    
    // اجرای تابع راه‌اندازی مخصوص صفحه (در صورت وجود)
    if (typeof initCabinetPage === 'function') {
        initCabinetPage();
    }
});

// debounce کردن resize برای کاهش فراخوانی‌های مکرر
let resizeTimeout;
window.addEventListener('resize', function() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    
    resizeTimeout = setTimeout(checkMenuDisplay, 100);
}); 