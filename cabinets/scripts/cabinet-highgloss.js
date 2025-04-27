/**
 * کدهای جاوااسکریپت اختصاصی برای صفحه کابینت هایگلاس
 */

// تابع راه‌اندازی مخصوص صفحه کابینت هایگلاس
function initCabinetPage() {
    // اضافه کردن قابلیت تغییر عکس‌ها در گالری
    setupGallery();
    
    // اضافه کردن قابلیت پرسش و پاسخ
    setupFAQAccordion();
    
    // راه‌اندازی اسلایدر رنگ‌ها
    setupColorPicker();
    
    // راه‌اندازی افکت هایگلاس
    setupGlossEffect();
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
 * راه‌اندازی انتخاب‌گر رنگ‌های هایگلاس
 */
function setupColorPicker() {
    const colorItems = document.querySelectorAll('.color-option');
    const demoImage = document.querySelector('.color-demo-image');
    
    if (!colorItems.length || !demoImage) return;
    
    colorItems.forEach(item => {
        item.addEventListener('click', function() {
            // تغییر عکس نمونه
            const newImageSrc = this.getAttribute('data-image');
            if (newImageSrc) {
                demoImage.src = newImageSrc;
                demoImage.classList.add('fade-in');
                setTimeout(() => demoImage.classList.remove('fade-in'), 500);
            }
            
            // تغییر کلاس فعال
            colorItems.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // نمایش نام رنگ
            const colorName = this.getAttribute('data-name') || '';
            const colorNameElement = document.querySelector('.selected-color-name');
            if (colorNameElement) {
                colorNameElement.textContent = colorName;
            }
        });
    });
}

/**
 * راه‌اندازی افکت‌های ویژه هایگلاس
 */
function setupGlossEffect() {
    const glossyElements = document.querySelectorAll('.glossy-element');
    
    if (!glossyElements.length) return;
    
    // ایجاد افکت براق با حرکت موس روی المان‌های هایگلاس
    glossyElements.forEach(element => {
        element.addEventListener('mousemove', function(e) {
            // محاسبه موقعیت نسبی ماوس روی المان
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // محاسبه درصد موقعیت
            const xPercent = Math.floor((x / rect.width) * 100);
            const yPercent = Math.floor((y / rect.height) * 100);
            
            // تنظیم متغیرهای CSS برای موقعیت هایلایت
            this.style.setProperty('--x-pos', `${xPercent}%`);
            this.style.setProperty('--y-pos', `${yPercent}%`);
            
            // فعال کردن افکت براق
            this.classList.add('highlight-active');
        });
        
        // حذف افکت با خروج ماوس
        element.addEventListener('mouseleave', function() {
            this.classList.remove('highlight-active');
        });
    });
} 