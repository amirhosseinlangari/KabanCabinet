/**
 * کدهای جاوااسکریپت سایت کابینت کابان
 */

// ===== انتخاب عناصر =====
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

// رویداد کلیک دکمه دارک مود در دسکتاپ
darkModeToggle.addEventListener('click', toggleDarkMode);

// رویداد کلیک دکمه دارک مود در موبایل
mobileDarkMode.addEventListener('click', toggleDarkMode);

// ===== مدیریت منوی موبایل =====

/**
 * بررسی عرض پنجره و نمایش/پنهان کردن دکمه همبرگر
 */
function checkMenuDisplay() {
    if (window.innerWidth <= 768) {
        // فقط در حالت موبایل نمایش داده شود
        menuToggle.style.display = 'flex';
    } else {
        // در حالت دسکتاپ و تبلت پنهان شود
        menuToggle.style.display = 'none';
        
        // بستن منو اگر باز است
        if (navContainer.classList.contains('active')) {
            closeMenu();
        }
        
        // اطمینان از نمایش منو در حالت دسکتاپ
        if (window.innerWidth > 768) {
            navContainer.style.right = '';
            navContainer.style.visibility = 'visible';
            navContainer.style.pointerEvents = 'auto';
        }
    }
}

/**
 * بستن منو و زیرمنوها
 */
function closeMenu() {
    menuToggle.classList.remove('active');
    navContainer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // بستن تمام زیرمنوها فقط اگر منو بسته شود
    if (!navContainer.classList.contains('active')) {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
}

// ممانعت از بستن منو با کلیک روی خود منو
navContainer.addEventListener('click', function(event) {
    // جلوگیری از انتشار رویداد کلیک به document
    event.stopPropagation();
});

// رویداد کلیک دکمه همبرگر
menuToggle.addEventListener('click', function(event) {
    // جلوگیری از انتشار رویداد کلیک به document
    event.stopPropagation();
    
    this.classList.toggle('active');
    navContainer.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // قفل کردن اسکرول صفحه هنگام باز بودن منو
    if (navContainer.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

// بستن منو با کلیک روی اورلی
overlay.addEventListener('click', closeMenu);

// بستن منو با کلیک روی هر جایی غیر از خود منو در حالت موبایل
document.addEventListener('click', function(event) {
    // اگر منو باز است و عرض صفحه کمتر از 768 پیکسل است
    if (navContainer.classList.contains('active') && window.innerWidth <= 768) {
        // منو را ببند (چون کلیک روی منو یا دکمه همبرگر propagate نمی‌شود)
        closeMenu();
    }
});

// ===== مدیریت زیرمنوها =====

// باز و بسته کردن زیرمنوها
dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('a');
    
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

// بررسی تنظیمات ذخیره شده هنگام بارگذاری صفحه
document.addEventListener('DOMContentLoaded', () => {
    // تنظیم حالت دارک مود
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
    
    // بررسی نمایش منو
    checkMenuDisplay();
    
    // بازنشانی زیرمنوها
    dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
});

// تنظیم مجدد منو در هنگام تغییر اندازه صفحه
window.addEventListener('resize', function() {
    checkMenuDisplay();
}); 