/**
 * کدهای جاوااسکریپت اختصاصی برای صفحه درباره ما
 * About Us Page Specific JavaScript
 */

/**
 * تابع اصلی راه‌اندازی برای صفحه درباره ما
 * Main initialization function for about us page
 */
document.addEventListener('DOMContentLoaded', function() {
    // راه‌اندازی انیمیشن‌های صفحه
    initAboutPageAnimations();
    
    // راه‌اندازی تعامل‌های صفحه
    initAboutPageInteractions();
});

/**
 * راه‌اندازی انیمیشن‌های صفحه درباره ما
 * Initialize about page animations
 */
function initAboutPageAnimations() {
    // انیمیشن برای بخش‌های مختلف هنگام اسکرول
    initScrollAnimations();
}

/**
 * راه‌اندازی انیمیشن اسکرول برای بخش‌های مختلف
 * Initialize scroll animations for different sections
 */
function initScrollAnimations() {
    // آرایه‌ای از تمام بخش‌هایی که باید انیمیشن داشته باشند
    const animatedSections = [
        document.querySelector('.about-intro'),
        document.querySelector('.about-values'),
        document.querySelector('.about-process'),
        document.querySelector('.about-team'),
        document.querySelector('.about-achievement'),
        document.querySelector('.about-cta')
    ];
    
    // گزینه‌های IntersectionObserver
    const options = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };
    
    // ایجاد IntersectionObserver برای مشاهده اسکرول
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // اگر بخش در حال نمایش است
            if (entry.isIntersecting) {
                // اضافه کردن کلاس انیمیشن
                entry.target.classList.add('section-animated');
                
                // هنگامی که بخش یک بار نمایش داده شد، دیگر نیازی به مشاهده آن نیست
                observer.unobserve(entry.target);
                
                // اگر بخش دستاوردها است، شروع انیمیشن شمارنده
                if (entry.target.classList.contains('about-achievement')) {
                    startCounters();
                }
            }
        });
    }, options);
    
    // شروع مشاهده بخش‌ها
    animatedSections.forEach(section => {
        if (section) {
            section.classList.add('section-to-animate');
            observer.observe(section);
        }
    });
    
    // اضافه کردن کلاس به کارت‌های ارزش با تأخیر
    const valueCards = document.querySelectorAll('.value-card');
    valueCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('card-visible');
        }, 300 + (index * 150));
    });
    
    // اضافه کردن کلاس به مراحل کار با تأخیر
    const processSteps = document.querySelectorAll('.process-step');
    processSteps.forEach((step, index) => {
        setTimeout(() => {
            step.classList.add('step-visible');
        }, 300 + (index * 200));
    });
}

/**
 * متغیرهای مورد نیاز برای انیمیشن شمارنده
 */
let counterStarted = false;
const speed = 2000; // سرعت انیمیشن شمارنده (میلی‌ثانیه)

/**
 * آماده‌سازی شمارنده‌ها
 * Start counter animations when the achievement section is visible
 */
function startCounters() {
    if (counterStarted) return;
    counterStarted = true;
    
    const counterElements = document.querySelectorAll('.achievement-number');
    
    counterElements.forEach(counter => {
        // حذف علامت + یا ٪ از متن
        let target = counter.textContent.replace(/[+٪]/g, '');
        target = parseInt(target, 10);
        
        // نگه‌داری مقدار فعلی
        let count = 0;
        
        // محاسبه سرعت افزایش
        const inc = Math.ceil(target / (speed / 30));
        
        // انیمیشن با استفاده از setInterval
        const updateCounter = setInterval(() => {
            if (count < target) {
                count += inc;
                if (count > target) count = target;
                
                // بررسی ویژگی‌های متن اصلی
                if (counter.textContent.includes('+')) {
                    counter.textContent = count + '+';
                } else if (counter.textContent.includes('٪')) {
                    counter.textContent = count + '٪';
                } else {
                    counter.textContent = count;
                }
            } else {
                clearInterval(updateCounter);
            }
        }, 30);
    });
}

/**
 * راه‌اندازی تعامل‌های صفحه
 * Initialize page interactions
 */
function initAboutPageInteractions() {
    // اضافه کردن کلاس active به لینک‌های منو
    highlightCurrentNavItem();
}

/**
 * پررنگ کردن آیتم فعلی در منو
 * Highlight current navigation item
 */
function highlightCurrentNavItem() {
    const aboutLink = document.querySelector('a.about');
    if (aboutLink) {
        aboutLink.classList.add('active-link');
    }
} 