/**
 * کدهای جاوااسکریپت اختصاصی برای صفحه کابینت ممبران
 */

// تابع راه‌اندازی مخصوص صفحه کابینت ممبران
function initCabinetPage() {
    // اضافه کردن قابلیت تغییر عکس‌ها در گالری
    setupGallery();
    
    // اضافه کردن قابلیت پرسش و پاسخ
    setupFAQAccordion();
    
    // راه‌اندازی تب‌های مقایسه
    setupCompareTabs();
    
    // راه‌اندازی نمودار مقایسه قیمت
    setupPriceChart();
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
 * راه‌اندازی تب‌های مقایسه کابینت ممبران
 */
function setupCompareTabs() {
    const tabButtons = document.querySelectorAll('.compare-tab-button');
    const tabContents = document.querySelectorAll('.compare-tab-content');
    
    if (!tabButtons.length || !tabContents.length) return;
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // حذف کلاس فعال از همه دکمه‌ها
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // حذف کلاس فعال از همه محتوا
            tabContents.forEach(content => content.classList.remove('active'));
            
            // اضافه کردن کلاس فعال به دکمه فعلی
            this.classList.add('active');
            
            // نمایش محتوای مرتبط
            const targetTab = this.getAttribute('data-tab');
            const targetContent = document.querySelector(`.compare-tab-content[data-tab="${targetTab}"]`);
            
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
    
    // فعال کردن اولین تب به صورت پیش‌فرض
    if (tabButtons.length > 0 && tabContents.length > 0) {
        tabButtons[0].classList.add('active');
        tabContents[0].classList.add('active');
    }
}

/**
 * راه‌اندازی نمودار مقایسه قیمت
 */
function setupPriceChart() {
    const chartContainer = document.querySelector('.price-chart-container');
    
    if (!chartContainer || typeof Chart === 'undefined') return;
    
    // داده‌های نمودار
    const cabinetTypes = ['ممبران', 'هایگلاس', 'MDF', 'نئوکلاسیک', 'فلزی'];
    const priceRanges = [
        [2500000, 5000000],  // ممبران
        [3000000, 6000000],  // هایگلاس
        [1800000, 4000000],  // MDF
        [3500000, 7000000],  // نئوکلاسیک
        [4000000, 8000000]   // فلزی
    ];
    
    // تنظیم رنگ‌ها بسته به حالت سایت (روشن/تاریک)
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // ایجاد نمودار
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: cabinetTypes,
            datasets: [
                {
                    label: 'حداقل قیمت (تومان)',
                    data: priceRanges.map(range => range[0]),
                    backgroundColor: 'rgba(212, 180, 131, 0.6)',
                    borderColor: 'rgba(212, 180, 131, 1)',
                    borderWidth: 1
                },
                {
                    label: 'حداکثر قیمت (تومان)',
                    data: priceRanges.map(range => range[1]),
                    backgroundColor: 'rgba(165, 132, 82, 0.6)',
                    borderColor: 'rgba(165, 132, 82, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                },
                x: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            }
        }
    });
} 