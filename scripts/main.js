// انتخاب عناصر منو
const menuToggle = document.querySelector('.menu-toggle');
const navContainer = document.querySelector('.nav-container');
const overlay = document.querySelector('.overlay');
const dropdowns = document.querySelectorAll('.dropdown-cabinet, .dropdown-mahsool');
const darkModeToggle = document.getElementById('darkModeToggle');
const mobileDarkMode = document.getElementById('mobileDarkMode');
const menuLinks = document.querySelectorAll('.nav-container a:not(.cabinet):not(.mahsool)');
const menuButtons = document.querySelectorAll('.nav-container button');
const cabinetLink = document.querySelector('.cabinet');
const mahsoolLink = document.querySelector('.mahsool');

// تابع تغییر حالت دارک مود
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // ذخیره تنظیمات در localStorage
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
}

// دکمه دارک مود در دسکتاپ
darkModeToggle.addEventListener('click', toggleDarkMode);

// دکمه دارک مود در موبایل
mobileDarkMode.addEventListener('click', toggleDarkMode);

// بررسی تنظیمات ذخیره شده هنگام بارگذاری صفحه
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
    
    // بررسی نمایش منو
    checkMenuDisplay();
});

// بررسی عرض پنجره و نمایش/پنهان کردن دکمه همبرگر
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
            navContainer.style.transform = '';
            navContainer.style.visibility = 'visible';
            navContainer.style.pointerEvents = 'auto';
        }
    }
}

// تابع باز و بسته کردن منوی موبایل
menuToggle.addEventListener('click', function() {
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

// تابع بستن منو
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

// باز و بسته کردن زیرمنوها
dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('a');
    
    link.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            dropdown.classList.toggle('active');
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

// تنظیم مجدد منو در هنگام تغییر اندازه صفحه
window.addEventListener('resize', function() {
    checkMenuDisplay();
});

// بررسی عملکرد زیرمنوها در زمان بارگذاری
document.addEventListener('DOMContentLoaded', function() {
    // کد موجود
    
    // بازنشانی زیرمنوها
    dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
    
    // بررسی رویدادهای کلیک برای زیرمنوها
    console.log('تنظیم رویدادهای زیرمنو انجام شد');
    
    // نمایش وضعیت آمادگی زیرمنوها
    if (window.innerWidth <= 768) {
        console.log('منوی موبایل آماده است');
    }
}); 