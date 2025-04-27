/**
 * کدهای جاوااسکریپت اختصاصی برای صفحه کابینت فلزی
 */

// تابع راه‌اندازی مخصوص صفحه کابینت فلزی
function initCabinetPage() {
    // اضافه کردن قابلیت تغییر عکس‌ها در گالری
    setupGallery();
    
    // اضافه کردن قابلیت پرسش و پاسخ
    setupFAQAccordion();
    
    // راه‌اندازی افکت‌های متحرک با اسکرول
    setupScrollAnimations();
    
    // راه‌اندازی مدال مقایسه
    setupComparisonModal();
}

/**
 * راه‌اندازی گالری تصاویر
 */
function setupGallery() {
    const galleryThumbs = document.querySelectorAll('.gallery-thumb');
    const mainImage = document.querySelector('.main-image img');
    
    if (!galleryThumbs.length || !mainImage) return;
    
    galleryThumbs.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // تغییر عکس اصلی
            const newSrc = this.getAttribute('data-src') || this.src;
            mainImage.src = newSrc;
            
            // تغییر کلاس فعال
            galleryThumbs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

/**
 * راه‌اندازی سیستم پرسش و پاسخ آکاردئونی
 */
function setupFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item h3');
    
    if (!faqItems.length) return;
    
    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            const content = this.nextElementSibling;
            
            // بررسی وضعیت فعلی
            const isActive = this.classList.contains('active');
            
            // بستن همه آیتم‌ها
            document.querySelectorAll('.faq-item h3').forEach(h => {
                h.classList.remove('active');
                if (h.nextElementSibling) h.nextElementSibling.classList.remove('active');
            });
            
            // باز کردن آیتم فعلی (اگر قبلاً باز نبوده)
            if (!isActive) {
                this.classList.add('active');
                if (content) content.classList.add('active');
            }
        });
    });
}

/**
 * راه‌اندازی افکت‌های متحرک با اسکرول
 */
function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (!animatedElements.length) return;
    
    // تنظیم IntersectionObserver برای تشخیص المان‌ها در دید
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // حذف observer پس از نمایش المان برای بهبود عملکرد
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,  // المان باید حداقل 10٪ در دید باشد
        rootMargin: '0px 0px -100px 0px'  // مارجین منفی برای شروع انیمیشن زودتر
    });
    
    // اضافه کردن المان‌ها به observer
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

/**
 * راه‌اندازی مدال مقایسه کابینت فلزی با سایر انواع
 */
function setupComparisonModal() {
    const compareBtns = document.querySelectorAll('.compare-button');
    const comparisonModal = document.querySelector('.comparison-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    
    if (!compareBtns.length || !comparisonModal || !closeModalBtn) return;
    
    // باز کردن مدال
    compareBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const compareType = this.getAttribute('data-compare');
            if (compareType) {
                // نمایش بخش مقایسه مناسب
                document.querySelectorAll('.comparison-content').forEach(content => {
                    content.style.display = 'none';
                });
                
                const targetContent = document.querySelector(`.comparison-content[data-type="${compareType}"]`);
                if (targetContent) targetContent.style.display = 'block';
            }
            
            // نمایش مدال
            comparisonModal.classList.add('active');
            document.body.style.overflow = 'hidden';  // غیرفعال کردن اسکرول
        });
    });
    
    // بستن مدال
    closeModalBtn.addEventListener('click', function() {
        comparisonModal.classList.remove('active');
        document.body.style.overflow = '';  // فعال کردن مجدد اسکرول
    });
    
    // بستن مدال با کلیک بیرون آن
    comparisonModal.addEventListener('click', function(e) {
        if (e.target === comparisonModal) {
            comparisonModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
} 