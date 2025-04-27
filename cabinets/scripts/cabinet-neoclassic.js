/**
 * کدهای جاوااسکریپت اختصاصی برای صفحه کابینت نئو کلاسیک
 */

// تابع راه‌اندازی مخصوص صفحه کابینت نئو کلاسیک
function initCabinetPage() {
    // اضافه کردن قابلیت تغییر عکس‌ها در گالری
    setupGallery();
    
    // اضافه کردن قابلیت پرسش و پاسخ
    setupFAQAccordion();
    
    // راه‌اندازی اسلایدر طرح‌های نئو کلاسیک
    setupDesignSlider();
    
    // راه‌اندازی افکت‌های تزئینی نئو کلاسیک
    setupNeoclassicEffects();
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
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (!faqItems.length) return;
    
    faqItems.forEach(item => {
        const question = item.querySelector('h3');
        const answer = item.querySelector('p');
        
        if (!question || !answer) return;
        
        question.addEventListener('click', function() {
            // بررسی وضعیت فعلی
            const isActive = item.classList.contains('active');
            
            // بستن همه آیتم‌ها
            document.querySelectorAll('.faq-item').forEach(faqItem => {
                faqItem.classList.remove('active');
            });
            
            // باز کردن آیتم فعلی (اگر قبلاً باز نبوده)
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/**
 * راه‌اندازی اسلایدر طرح‌های نئو کلاسیک
 */
function setupDesignSlider() {
    const slider = document.querySelector('.design-slider');
    const sliderItems = document.querySelectorAll('.design-item');
    const nextButton = document.querySelector('.design-next');
    const prevButton = document.querySelector('.design-prev');
    
    if (!slider || !sliderItems.length || !nextButton || !prevButton) return;
    
    let currentIndex = 0;
    const itemCount = sliderItems.length;
    
    // تنظیم اسلایدها
    function updateSlider() {
        const itemWidth = sliderItems[0].offsetWidth;
        slider.style.transform = `translateX(${currentIndex * itemWidth * -1}px)`;
        
        // به‌روزرسانی وضعیت دکمه‌ها
        prevButton.disabled = currentIndex <= 0;
        nextButton.disabled = currentIndex >= itemCount - 1;
        
        // به‌روزرسانی کلاس فعال
        sliderItems.forEach((item, index) => {
            item.classList.toggle('active', index === currentIndex);
        });
    }
    
    // دکمه بعدی
    nextButton.addEventListener('click', function() {
        if (currentIndex < itemCount - 1) {
            currentIndex++;
            updateSlider();
        }
    });
    
    // دکمه قبلی
    prevButton.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    });
    
    // تنظیم اسلایدر در حالت اولیه
    updateSlider();
    
    // به‌روزرسانی موقعیت با تغییر سایز صفحه
    window.addEventListener('resize', updateSlider);
}

/**
 * راه‌اندازی افکت‌های تزئینی نئو کلاسیک
 */
function setupNeoclassicEffects() {
    // افکت‌های نئو کلاسیک (طرح‌های تزئینی و ...)
    const decorElements = document.querySelectorAll('.neoclassic-decor');
    
    if (!decorElements.length) return;
    
    // اضافه کردن کلاس‌های متفاوت به المان‌های تزئینی
    decorElements.forEach((element, index) => {
        // ایجاد تنوع در انیمیشن‌ها با استفاده از شماره ایندکس
        const delay = (index % 5) * 0.2;
        element.style.animationDelay = `${delay}s`;
        
        // اضافه کردن کلاس‌های متنوع براساس موقعیت
        if (index % 3 === 0) {
            element.classList.add('decor-small');
        } else if (index % 3 === 1) {
            element.classList.add('decor-medium');
        } else {
            element.classList.add('decor-large');
        }
    });
    
    // افکت پارالاکس برای پس‌زمینه
    const parallaxBg = document.querySelector('.neoclassic-parallax');
    if (parallaxBg) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.pageYOffset;
            parallaxBg.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
        });
    }
    
    // افکت برجسته شدن عناصر با اسکرول
    const fadeElements = document.querySelectorAll('.fade-in-element');
    
    if (fadeElements.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        fadeElements.forEach(el => {
            observer.observe(el);
        });
    }
} 