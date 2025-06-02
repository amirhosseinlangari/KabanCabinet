/**
 * کدهای جاوااسکریپت اختصاصی برای صفحه اصلی کابینت کابان
 * Homepage specific JavaScript for Kaban Cabinet
 */

/**
 * تابع اصلی راه‌اندازی برای صفحه اصلی
 * Main initialization function for the homepage
 */
function initIndexPage() {
    // راه‌اندازی انیمیشن‌های صفحه اصلی - Setup homepage animations
    setupHomeAnimations();
    
    // راه‌اندازی اسلایدر محصولات - Setup product slider if exists
    setupProductSlider();
}

/**
 * راه‌اندازی انیمیشن‌های صفحه اصلی
 * Set up animations for the homepage elements
 */
function setupHomeAnimations() {
    // انیمیشن تایپ کردن - Typing animation
    setupTypingAnimation();
    
    // انیمیشن کارت‌های کابینت - Cabinet cards animation
    setupCabinetCardAnimations();
}

/**
 * انیمیشن تایپ کردن برای متن
 * Setup typing text animation effect
 */
function setupTypingAnimation() {
    const typingText = document.querySelector('.typing-text');
    if (!typingText) return;
    
    // بازنشانی انیمیشن
    typingText.classList.remove('typing-animation');
    
    // شروع مجدد انیمیشن با تأخیر
    setTimeout(() => {
        typingText.classList.add('typing-animation');
    }, 100);
}

/**
 * انیمیشن ظاهر شدن برای کارت‌های کابینت
 * Setup fade-in effect for cabinet cards
 */
function setupCabinetCardAnimations() {
    const cabinetCards = document.querySelectorAll('.cabinet-card');
    if (!cabinetCards.length) return;
    
    cabinetCards.forEach((card, index) => {
        // اعمال تأخیر متفاوت برای هر کارت
        setTimeout(() => {
            card.classList.add('fade-in');
        }, 300 + (index * 150));
    });
}

/**
 * راه‌اندازی اسلایدر محصولات
 * Set up product slider with navigation buttons
 */
function setupProductSlider() {
    const slider = document.querySelector('.cabinet-container');
    const prevButton = document.querySelector('.slider-prev');
    const nextButton = document.querySelector('.slider-next');
    
    if (!slider || !prevButton || !nextButton) return;
    
    let scrollAmount = 0;
    const scrollStep = 300; // مقدار اسکرول در هر کلیک
    
    // دکمه بعدی - Next button handler
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
    
    // دکمه قبلی - Previous button handler
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
    
    /**
     * به‌روزرسانی وضعیت دکمه‌ها
     * Update button enabled/disabled state based on scroll position
     */
    function updateButtonState() {
        prevButton.disabled = scrollAmount <= 0;
        nextButton.disabled = scrollAmount >= slider.scrollWidth - slider.clientWidth;
        
        // اضافه کردن کلاس غیرفعال - Add disabled class for styling
        prevButton.classList.toggle('disabled', scrollAmount <= 0);
        nextButton.classList.toggle('disabled', scrollAmount >= slider.scrollWidth - slider.clientWidth);
    }
    
    // به‌روزرسانی اولیه وضعیت دکمه‌ها - Initial button state update
    updateButtonState();
}

// راه‌اندازی صفحه پس از بارگذاری کامل - Initialize page after DOM is fully loaded
document.addEventListener('DOMContentLoaded', initIndexPage); 