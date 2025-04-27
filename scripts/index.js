/**
 * کدهای جاوااسکریپت اختصاصی برای صفحه اصلی کابینت کابان
 */

// تابع راه‌اندازی مخصوص صفحه اصلی
function initIndexPage() {
    // راه‌اندازی انیمیشن‌های صفحه اصلی
    setupHomeAnimations();
    
    // راه‌اندازی اسلایدر محصولات
    setupProductSlider();
}

/**
 * راه‌اندازی انیمیشن‌های صفحه اصلی
 */
function setupHomeAnimations() {
    // افکت تایپ کردن برای متن
    const typingText = document.querySelector('.typing-text');
    if (typingText) {
        // حذف کلاس برای شروع مجدد انیمیشن
        typingText.classList.remove('typing-animation');
        // اضافه کردن کلاس پس از تأخیر کوتاه برای اعمال انیمیشن مجدد
        setTimeout(() => {
            typingText.classList.add('typing-animation');
        }, 100);
    }
    
    // افکت فید این برای کارت‌های کابینت
    const cabinetCards = document.querySelectorAll('.cabinet-card');
    if (cabinetCards.length) {
        cabinetCards.forEach((card, index) => {
            // اعمال تأخیر متفاوت برای هر کارت
            setTimeout(() => {
                card.classList.add('fade-in');
            }, 300 + (index * 150));
        });
    }
}

/**
 * راه‌اندازی اسلایدر محصولات
 */
function setupProductSlider() {
    const slider = document.querySelector('.cabinet-container');
    const prevButton = document.querySelector('.slider-prev');
    const nextButton = document.querySelector('.slider-next');
    
    if (!slider || !prevButton || !nextButton) return;
    
    let scrollAmount = 0;
    const scrollStep = 300; // مقدار اسکرول در هر کلیک
    
    // دکمه بعدی
    nextButton.addEventListener('click', () => {
        scrollAmount += scrollStep;
        
        // محدود کردن اسکرول به عرض محتوای اسلایدر
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        scrollAmount = Math.min(scrollAmount, maxScroll);
        
        slider.scroll({
            left: scrollAmount,
            behavior: 'smooth'
        });
        
        // به‌روزرسانی وضعیت دکمه‌ها
        updateButtonState();
    });
    
    // دکمه قبلی
    prevButton.addEventListener('click', () => {
        scrollAmount -= scrollStep;
        
        // محدود کردن اسکرول به صفر
        scrollAmount = Math.max(scrollAmount, 0);
        
        slider.scroll({
            left: scrollAmount,
            behavior: 'smooth'
        });
        
        // به‌روزرسانی وضعیت دکمه‌ها
        updateButtonState();
    });
    
    // به‌روزرسانی وضعیت دکمه‌ها
    function updateButtonState() {
        prevButton.disabled = scrollAmount <= 0;
        nextButton.disabled = scrollAmount >= slider.scrollWidth - slider.clientWidth;
    }
    
    // به‌روزرسانی اولیه
    updateButtonState();
}

// افزودن رویداد DOMContentLoaded برای اجرای تابع راه‌اندازی
document.addEventListener('DOMContentLoaded', initIndexPage); 