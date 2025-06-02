/**
 * اسکریپت‌های مخصوص وبلاگ کابان
 * Kaban Cabinet Blog Specific Scripts
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all blog functionalities
    initBlogAnimations();
    initSearchForm();
    initNewsletterForm();
    setActiveMenuItem();
});

/**
 * انیمیشن برای ظاهر شدن پست‌ها
 * Initialize animations for blog posts
 */
function initBlogAnimations() {
    const blogPosts = document.querySelectorAll('.blog-post');
    
    if (!blogPosts.length) return;
    
    blogPosts.forEach((post, index) => {
        setTimeout(() => {
            post.style.opacity = '1';
            post.style.transform = 'translateY(0)';
        }, index * 150);
    });
}

/**
 * راه‌اندازی فرم جستجو
 * Initialize search form functionality
 */
function initSearchForm() {
    const searchForm = document.querySelector('.search-form');
    if (!searchForm) return;
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchQuery = this.querySelector('input').value.trim();
        
        if (searchQuery) {
            // در نسخه واقعی، اینجا باید به صفحه جستجو ریدایرکت شود
            alert('جستجو برای: ' + searchQuery);
            // برای آینده: window.location.href = 'search.html?query=' + encodeURIComponent(searchQuery);
        }
    });
}

/**
 * راه‌اندازی فرم خبرنامه
 * Initialize newsletter form with validation
 */
function initNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input').value.trim();
        
        if (email && validateEmail(email)) {
            // در نسخه واقعی، اینجا باید ایمیل به سرور ارسال شود
            this.innerHTML = '<p class="success-message">ایمیل شما با موفقیت ثبت شد.</p>';
        } else {
            showFormError(this, 'لطفاً یک ایمیل معتبر وارد کنید.');
        }
    });
}

/**
 * نمایش پیام خطا در فرم
 * Show error message in the form
 * 
 * @param {HTMLElement} form - The form element
 * @param {string} message - Error message to display
 */
function showFormError(form, message) {
    const errorMsg = document.createElement('p');
    errorMsg.className = 'error-message';
    errorMsg.textContent = message;
    errorMsg.style.color = 'red';
    errorMsg.style.fontSize = '0.9rem';
    errorMsg.style.marginTop = '5px';
    
    // حذف پیام‌های خطای قبلی - Remove previous error messages
    const previousError = form.querySelector('.error-message');
    if (previousError) {
        previousError.remove();
    }
    
    form.appendChild(errorMsg);
}

/**
 * اعتبارسنجی ایمیل
 * Validate email format using regex
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email is valid
 */
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/**
 * اضافه کردن کلاس active به لینک‌های منو در صفحه فعلی
 * Set active menu item based on current page
 */
function setActiveMenuItem() {
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.nav-container a');
    
    menuLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.includes(linkPath) && linkPath !== '#' && linkPath !== '/' && linkPath !== '') {
            // حذف کلاس active-link از همه لینک‌ها - Remove active class from all links
            menuLinks.forEach(l => l.classList.remove('active-link'));
            
            // اضافه کردن کلاس active-link به لینک فعلی - Add active class to current link
            link.classList.add('active-link');
            
            // اگر لینک در داخل زیرمنو است، منوی والد را هم فعال کن - Activate parent menu if link is in dropdown
            const parentDropdown = link.closest('.dropdown-cabinet, .dropdown-mahsool');
            if (parentDropdown) {
                const parentLink = parentDropdown.querySelector('a.cabinet, a.mahsool');
                if (parentLink) {
                    parentLink.classList.add('active-link');
                }
            }
        }
    });
} 