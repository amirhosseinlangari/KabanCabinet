/**
 * کدهای جاوااسکریپت اختصاصی برای صفحه نمونه کار کابان
 */

// تابع راه‌اندازی مخصوص صفحه نمونه کار
function initPortfolioPage() {
    // راه‌اندازی سیستم فیلتر نمونه کارها
    setupPortfolioFilters();
    
    // راه‌اندازی انیمیشن‌های اسکرول
    setupScrollAnimations();
}

/**
 * راه‌اندازی سیستم فیلتر نمونه کارها
 */
function setupPortfolioFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    if (!filterButtons.length || !portfolioItems.length) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // حذف کلاس فعال از تمام دکمه‌ها
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // اضافه کردن کلاس فعال به دکمه کلیک شده
            this.classList.add('active');
            
            // گرفتن فیلتر از دکمه
            const filter = this.getAttribute('data-filter');
            
            // نمایش یا عدم نمایش آیتم‌ها بر اساس فیلتر
            portfolioItems.forEach(item => {
                if (filter === 'all' || item.classList.contains(filter)) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

/**
 * راه‌اندازی انیمیشن‌های اسکرول
 */
function setupScrollAnimations() {
    // اگر مرورگر از IntersectionObserver پشتیبانی می‌کند
    if ('IntersectionObserver' in window) {
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        
        // تنظیمات مشاهده‌گر
        const observerOptions = {
            root: null, // مشاهده نسبت به ویوپورت
            threshold: 0.1, // نمایش وقتی 10% از المان قابل مشاهده باشد
            rootMargin: '0px 0px -50px 0px' // حاشیه برای مشاهده (از پایین 50px زودتر)
        };
        
        // ایجاد مشاهده‌گر
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fadeInUp');
                    observer.unobserve(entry.target); // توقف مشاهده پس از ظاهر شدن
                }
            });
        }, observerOptions);
        
        // افزودن هر آیتم به مشاهده‌گر
        portfolioItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(50px)';
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(item);
        });
        
        // افزودن انیمیشن به سایر المان‌ها
        const animatedElements = document.querySelectorAll('.hero-container, .filter-container, .cta-container');
        
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(element);
        });
    }
}

// اضافه کردن کلاس انیمیشن fadeInUp
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.innerHTML = `
        .fadeInUp {
            animation: fadeInUp 0.5s ease forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // راه‌اندازی تمام قابلیت‌های صفحه
    initPortfolioPage();
}); 