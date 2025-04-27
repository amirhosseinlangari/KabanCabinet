/**
 * کدهای جاوااسکریپت اختصاصی برای صفحه کابینت MDF
 */

// تابع راه‌اندازی مخصوص صفحه کابینت MDF
function initCabinetPage() {
    // اضافه کردن قابلیت تغییر عکس‌ها در گالری
    setupGallery();
    
    // اضافه کردن قابلیت پرسش و پاسخ
    setupFAQAccordion();
    
    // نمایش محتوای بیشتر با کلیک
    setupReadMore();
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
 * راه‌اندازی قابلیت نمایش/پنهان کردن متن اضافی
 */
function setupReadMore() {
    const readMoreButtons = document.querySelectorAll('.read-more-btn');
    
    if (!readMoreButtons.length) return;
    
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            
            if (!targetElement) return;
            
            // تغییر وضعیت نمایش متن
            targetElement.classList.toggle('expanded');
            
            // تغییر متن دکمه
            this.textContent = targetElement.classList.contains('expanded') 
                ? 'نمایش کمتر' 
                : 'ادامه مطلب';
        });
    });
} 