// انتخاب عناصر منو
const menuToggle = document.querySelector('.menu-toggle');
const navContainer = document.querySelector('.nav-container');
const overlay = document.querySelector('.overlay');
const dropdowns = document.querySelectorAll('.dropdown-cabinet, .dropdown-mahsool');
const darkModeToggle = document.getElementById('darkModeToggle');
const mobileDarkMode = document.getElementById('mobileDarkMode');

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
});

// تابع باز و بسته کردن منوی موبایل
menuToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    navContainer.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = navContainer.classList.contains('active') ? 'hidden' : '';
});

// بستن منو با کلیک روی اورلی
overlay.addEventListener('click', function() {
    menuToggle.classList.remove('active');
    navContainer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // بستن تمام زیرمنوها
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
    });
});

// اضافه کردن رویداد کلیک برای منوهای کشویی در موبایل
dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('a');
    
    link.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            dropdown.classList.toggle('active');
            
            // بستن سایر منوهای کشویی
            dropdowns.forEach(item => {
                if (item !== dropdown) {
                    item.classList.remove('active');
                }
            });
        }
    });
});

// تنظیم مجدد منو در هنگام تغییر اندازه صفحه
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        menuToggle.classList.remove('active');
        navContainer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
});

// انیمیشن تیلت برای تصویر k
const imageContainer = document.querySelector('.image-container');
const kabanImage = document.querySelector('.kaban-image');

if (imageContainer && kabanImage) {
    imageContainer.addEventListener('mousemove', (e) => {
        if (window.innerWidth > 768) { // فقط در دسکتاپ اجرا شود
            const rect = imageContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // محاسبه موقعیت نسبی موس (از 0 تا 1)
            const relativeX = x / rect.width;
            const relativeY = y / rect.height;
            
            // محاسبه زاویه چرخش (افزایش زاویه برای عمق بیشتر)
            const rotateY = 15 * (0.5 - relativeX);
            const rotateX = 10 * (relativeY - 0.5);
            
            // اعمال ترنسفورم با مقیاس کوچکتر و بدون translateZ
            kabanImage.classList.add('tilt');
            kabanImage.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.03)`;
        }
    });
    
    imageContainer.addEventListener('mouseleave', () => {
        kabanImage.classList.remove('tilt');
        kabanImage.style.transform = 'rotateY(0) rotateX(0) scale(1)';
    });
    
    imageContainer.addEventListener('mouseenter', () => {
        kabanImage.style.transition = 'transform 0.15s ease-out';
    });
} 