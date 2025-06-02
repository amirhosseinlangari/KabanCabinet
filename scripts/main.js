/**
 * کدهای جاوااسکریپت سایت کابینت کابان
 * Core JavaScript functionalities for Kaban Cabinet website
 */

// ===== DOM Element Cache =====
// کش کردن انتخاب‌های DOM برای بهبود عملکرد
const menuToggle = document.querySelector('.menu-toggle');
const navContainer = document.querySelector('.nav-container');
const overlay = document.querySelector('.overlay');
const dropdowns = document.querySelectorAll('.dropdown-cabinet, .dropdown-mahsool');
const darkModeToggle = document.getElementById('darkModeToggle');
const mobileDarkMode = document.getElementById('mobileDarkMode');
const menuLinks = document.querySelectorAll('.nav-container a:not(.cabinet):not(.mahsool)');

// ===== Dark Mode Functions =====
/**
 * تغییر حالت دارک مود و ذخیره در localStorage
 * Toggle dark mode and store preference in localStorage
 */
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
}

// ===== Mobile Menu Functions =====
/**
 * بررسی عرض پنجره و مدیریت نمایش منو
 * Check window width and manage menu display
 */
function checkMenuDisplay() {
    if (!menuToggle) return;
    
    const isMobile = window.innerWidth <= 768;
    
    menuToggle.style.display = isMobile ? 'flex' : 'none';
    
    if (!isMobile && navContainer && navContainer.classList.contains('active')) {
        closeMenu();
    }
    
    if (!isMobile && navContainer) {
        navContainer.style.right = '';
        navContainer.style.visibility = 'visible';
        navContainer.style.pointerEvents = 'auto';
    }
}

/**
 * بستن منو و زیرمنوها
 * Close menu and all submenus
 */
function closeMenu() {
    if (!menuToggle || !navContainer || !overlay) return;
    
    menuToggle.classList.remove('active');
    navContainer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
    });
}

// ===== Event Listeners =====

// رویدادهای دکمه دارک مود
if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);
if (mobileDarkMode) mobileDarkMode.addEventListener('click', toggleDarkMode);

// ممانعت از بستن منو با کلیک روی خود منو
if (navContainer) {
    navContainer.addEventListener('click', function(event) {
        event.stopPropagation();
    });
}

// رویداد کلیک دکمه همبرگر
if (menuToggle) {
    menuToggle.addEventListener('click', function(event) {
        event.stopPropagation();
        
        this.classList.toggle('active');
        if (navContainer) navContainer.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
        
        document.body.style.overflow = navContainer && navContainer.classList.contains('active') ? 'hidden' : '';
    });
}

// رویداد کلیک روی اورلی
if (overlay) {
    overlay.addEventListener('click', closeMenu);
}

// بستن منو با کلیک بیرون از منو - با استفاده از throttle برای بهبود عملکرد
let documentClickTimeout;
document.addEventListener('click', function() {
    if (documentClickTimeout) clearTimeout(documentClickTimeout);
    
    documentClickTimeout = setTimeout(() => {
        if (navContainer && navContainer.classList.contains('active') && window.innerWidth <= 768) {
            closeMenu();
        }
    }, 10);
});

// ===== Submenu Management =====
// باز و بسته کردن زیرمنوها
dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('a');
    
    if (link) {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                
                if (dropdown.classList.contains('active')) {
                    dropdown.classList.remove('active');
                } else {
                    dropdowns.forEach(d => {
                        if (d !== dropdown) {
                            d.classList.remove('active');
                        }
                    });
                    
                    dropdown.classList.add('active');
                }
            }
        });
    }
});

// بستن منو با کلیک روی لینک‌های آن
menuLinks.forEach(link => {
    link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            closeMenu();
        }
    });
});

// ===== Page Initialization =====
// استفاده از DOMContentLoaded به جای load برای عملکرد سریع‌تر
document.addEventListener('DOMContentLoaded', () => {
    // تنظیم حالت دارک مود
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
    
    // بررسی نمایش منو
    checkMenuDisplay();

    // دریافت محصولات از API بک‌اند
    loadProducts();

    updateLoginButtons();

    const logoutLink = document.querySelector('.logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.authManager.logout();
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    updateCartButtonVisibility();
});

/**
 * دریافت محصولات از API بک‌اند
 * این تابع محصولات را از API دریافت کرده و در صفحه نمایش می‌دهد
 */
function loadProducts() {
    try {
        // دریافت محصولات از API
        fetch('http://localhost:3000/api/products')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    displayProducts(data.products, document.querySelector('.products-container'));
                } else {
                    console.error('خطا در دریافت محصولات:', data.message);
                }
            })
            .catch(error => {
                console.error('خطا در دریافت محصولات:', error);
            });
    } catch (error) {
        console.error('خطا در بارگذاری محصولات:', error);
    }
}

/**
 * نمایش محصولات در صفحه
 * @param {Array} products - آرایه‌ای از محصولات دریافت شده از API
 * @param {HTMLElement} container - المان HTML برای نمایش محصولات
 */
function displayProducts(products, container) {
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="no-products">محصولی برای نمایش وجود ندارد</div>';
        return;
    }

    container.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const imageUrl = product.images && product.images.length > 0 
            ? product.images[0] 
            : '../assets/Photo/default-product.png';
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                ${product.inStock ? '<span class="badge in-stock">موجود</span>' : '<span class="badge out-of-stock">ناموجود</span>'}
            </div>
            <div class="product-details">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description?.substring(0, 100) || ''}...</p>
                <div class="product-price">${formatPrice(product.price)} تومان</div>
                <div class="product-actions">
                    <button class="btn view-product" data-id="${product._id}">مشاهده جزئیات</button>
                    <button class="btn add-to-cart-btn" 
                        data-id="${product._id}"
                        data-name="${product.name}"
                        data-price="${product.price}"
                        data-image="${imageUrl}"
                        ${!product.inStock ? 'disabled' : ''}>
                        ${product.inStock ? 'افزودن به سبد' : 'ناموجود'}
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(productCard);
    });
}

/**
 * فرمت کردن قیمت به صورت خوانا با جداکننده هزارگان
 * @param {Number} price - قیمت محصول
 * @returns {String} قیمت فرمت شده با جداکننده هزارگان
 */
function formatPrice(price) {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0';
}

/**
 * اضافه کردن رویدادها به دکمه‌های محصول
 */
function addProductEventListeners() {
    // رویداد دکمه مشاهده جزئیات
    document.querySelectorAll('.view-product').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            window.location.href = `mahsool/product.html?id=${productId}`;
        });
    });
    
    // رویداد دکمه افزودن به سبد خرید
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            
            // دریافت اطلاعات محصول از API
            fetch(`http://localhost:3000/api/products/${productId}`)
                .then(res => res.json())
                .then(product => {
                    // استفاده از کلاس OrderManager موجود برای افزودن به سبد خرید
                    if (window.orderManager) {
                        window.orderManager.addToCart({
                            id: product._id,
                            name: product.name,
                            type: product.category,
                            price: product.price,
                            quantity: 1
                        });
                    } else {
                        console.error('OrderManager در دسترس نیست');
                        alert('محصول به سبد خرید اضافه شد');
                    }
                })
                .catch(error => {
                    console.error("خطا در افزودن به سبد خرید:", error);
                    alert('خطا در افزودن محصول به سبد خرید');
                });
        });
    });
}

// debounce کردن resize برای کاهش فراخوانی‌های مکرر
let resizeTimeout;
window.addEventListener('resize', function() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    
    resizeTimeout = setTimeout(checkMenuDisplay, 100);
});

function updateLoginButtons() {
    // 인증 상태 확인: localStorage에서 직접 토큰 확인
    const isLoggedIn = !!localStorage.getItem('auth_token') || !!localStorage.getItem('kabanToken');
    
    const loginButtons = document.querySelectorAll('.login-register');
    const accountLink = document.querySelector('.account-link');
    const accountDropdown = document.querySelector('.dropdown-account');
    
    // 모든 로그인 버튼 숨기기/표시하기
    loginButtons.forEach(button => {
        button.style.display = isLoggedIn ? 'none' : 'flex';
    });
    
    // 계정 링크 및 드롭다운 표시/숨기기
    if (accountLink) {
        accountLink.style.display = isLoggedIn ? 'flex' : 'none';
    }
    
    if (accountDropdown) {
        accountDropdown.style.display = isLoggedIn ? 'block' : 'none';
    }

    // 모바일 메뉴에서 로그인 버튼 숨기기
    const mobileLoginButton = document.getElementById('login-register-menu');
    if (mobileLoginButton) {
        mobileLoginButton.style.display = isLoggedIn ? 'none' : 'flex';
    }

    // 데스크탑 메뉴에서 로그인 버튼 숨기기
    const desktopLoginButton = document.getElementById('login-register-menu-desktop');
    if (desktopLoginButton) {
        desktopLoginButton.style.display = isLoggedIn ? 'none' : 'flex';
    }
}

// Update when login status changes
window.addEventListener('storage', (e) => {
    if (e.key === 'isLoggedIn' || e.key === 'auth_token' || e.key === 'session_id') {
        updateLoginButtons();
    }
});

// تابع مدیریت خروج کاربر
function handleLogout() {
    // حذف اطلاعات کاربر از localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('kabanToken');
    localStorage.removeItem('user_data');
    localStorage.removeItem('kabanUser');
    localStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('kabanToken');
    
    // نمایش پیام موفقیت
    showNotification('خروج با موفقیت انجام شد', 'success');
    
    // انتقال به صفحه اصلی
    setTimeout(() => {
        window.location.replace('../index.html');
    }, 1500);
}

// Function to update cart button visibility based on login status
function updateCartButtonVisibility() {
    const isLoggedIn = !!localStorage.getItem('kabanToken') || !!localStorage.getItem('auth_token');
    const cartLinks = document.querySelectorAll('.cart-link');
    
    cartLinks.forEach(link => {
        link.style.display = isLoggedIn ? 'flex' : 'none';
    });
}

// Update cart button visibility when login status changes
window.addEventListener('storage', (e) => {
    if (e.key === 'kabanToken' || e.key === 'auth_token') {
        updateCartButtonVisibility();
    }
}); 