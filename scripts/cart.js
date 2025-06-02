document.addEventListener('DOMContentLoaded', function() {
    console.log("Cart script loaded");
    
    // مقداردهی اولیه سبد خرید
    initializeCart();
    
    // بروزرسانی تعداد آیتم‌های سبد خرید
    updateCartBadge();
    
    // اضافه کردن event listener به دکمه‌های سبد خرید
    setupAddToCartButtons();
});

function initializeCart() {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
}

function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    console.log("Found add to cart buttons:", addToCartButtons.length);
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });
}

function handleAddToCart(e) {
    e.preventDefault();
    
    if (!isUserLoggedIn()) {
        showNotification('لطفا ابتدا وارد حساب کاربری خود شوید', 'error');
        // Save current URL for redirect after login
        sessionStorage.setItem('loginRedirect', window.location.href);
        // Redirect to login page
        window.location.href = '/account/login.html';
        return;
    }
    
    const button = e.currentTarget;
    const productData = {
        id: button.getAttribute('data-product-id'),
        name: button.getAttribute('data-product-name'),
        price: parseFloat(button.getAttribute('data-product-price')),
        image: button.getAttribute('data-product-image')
    };
    
    console.log("Adding product to cart:", productData);
    
    if (!validateProductData(productData)) {
        console.error("Invalid product data:", productData);
        showNotification('خطا در افزودن محصول به سبد خرید', 'error');
        return;
    }
    
    addToCart(productData);
}

function validateProductData(data) {
    return data && 
           data.id && 
           data.name && 
           !isNaN(data.price) && 
           data.price > 0;
}

function addToCart(productData) {
    try {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item => item.id === productData.id);
        
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({
                ...productData,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        showNotification('محصول با موفقیت به سبد خرید اضافه شد', 'success');
        
        console.log('Cart updated:', cart);
    } catch (error) {
        console.error("Error adding to cart:", error);
        showNotification('خطا در افزودن محصول به سبد خرید', 'error');
    }
}

function updateCartBadge() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(badge => {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'block' : 'none';
        });
        
        console.log("Cart badge updated: count =", totalItems);
    } catch (error) {
        console.error("Error updating cart badge:", error);
    }
}

function isUserLoggedIn() {
    const authToken = localStorage.getItem('auth_token');
    const kabanToken = localStorage.getItem('kabanToken');
    return !!authToken || !!kabanToken;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}