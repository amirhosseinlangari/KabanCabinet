/**
 * اسکریپت‌های مخصوص وبلاگ کابان
 */

document.addEventListener('DOMContentLoaded', function() {
    // انیمیشن برای ظاهر شدن پست‌ها
    const blogPosts = document.querySelectorAll('.blog-post');
    
    if (blogPosts.length > 0) {
        blogPosts.forEach((post, index) => {
            setTimeout(() => {
                post.style.opacity = '1';
                post.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }
    
    // عملکرد فرم جستجو
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
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
    
    // عملکرد فرم خبرنامه
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input').value.trim();
            
            if (email && validateEmail(email)) {
                // در نسخه واقعی، اینجا باید ایمیل به سرور ارسال شود
                this.innerHTML = '<p class="success-message">ایمیل شما با موفقیت ثبت شد.</p>';
            } else {
                const errorMsg = document.createElement('p');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'لطفاً یک ایمیل معتبر وارد کنید.';
                errorMsg.style.color = 'red';
                errorMsg.style.fontSize = '0.9rem';
                errorMsg.style.marginTop = '5px';
                
                // حذف پیام‌های خطای قبلی
                const previousError = this.querySelector('.error-message');
                if (previousError) {
                    previousError.remove();
                }
                
                this.appendChild(errorMsg);
            }
        });
    }
    
    // اعتبارسنجی ایمیل
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    
    // اضافه کردن کلاس active به لینک‌های منو در صفحه فعلی
    function setActiveMenuItem() {
        const currentPath = window.location.pathname;
        const menuLinks = document.querySelectorAll('.nav-container a');
        
        menuLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (currentPath.includes(linkPath) && linkPath !== '#' && linkPath !== '/' && linkPath !== '') {
                // حذف کلاس active-link از همه لینک‌ها
                menuLinks.forEach(l => l.classList.remove('active-link'));
                // اضافه کردن کلاس active-link به لینک فعلی
                link.classList.add('active-link');
                
                // اگر لینک در داخل زیرمنو است، منوی والد را هم فعال کن
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
    
    // فراخوانی تابع تنظیم منو
    setActiveMenuItem();
}); 