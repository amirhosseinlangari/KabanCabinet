// Cart page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log("Cart page loaded");
    
    // Check if user is logged in - check both token keys for compatibility
    function isUserLoggedIn() {
        const isLoggedIn = !!localStorage.getItem('auth_token') || !!localStorage.getItem('kabanToken');
        console.log("Login check:", isLoggedIn);
        return isLoggedIn;
    }
    
    // If not logged in, redirect to login page
    if (!isUserLoggedIn()) {
        console.log("User not logged in, redirecting to login page");
        // Save current URL for redirect after login
        sessionStorage.setItem('loginRedirect', window.location.href);
        // Redirect to login
        window.location.href = '/account/login.html';
        return;
    }
    
    console.log("User is logged in, proceeding to load cart");
    
    // DOM elements
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCart');
    const cartSidebar = document.getElementById('cartSidebar');
    const totalItemsElement = document.getElementById('totalItems');
    const subtotalElement = document.getElementById('subtotal');
    const discountElement = document.getElementById('discount');
    const totalPriceElement = document.getElementById('totalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Function to update cart icon - removed reference to undefined cart variable
    function updateCartIcon() {
        try {
            const cartData = JSON.parse(localStorage.getItem('cart')) || [];
            const cartCount = cartData.reduce((total, item) => total + (item.quantity || 0), 0);
            
            const cartBadge = document.getElementById('cart-badge');
            if (cartBadge) {
                cartBadge.textContent = cartCount;
                cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
            }
        } catch (error) {
            console.error('Error updating cart icon:', error);
        }
    }
    
    // Update cart badge on load
    updateCartIcon();
    
    // Initialize cart page
    initCartPage();
    
    // Checkout button click event
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const cartData = JSON.parse(localStorage.getItem('cart')) || [];
            if (cartData.length === 0) {
                showNotification('سبد خرید شما خالی است', 'error');
                return;
            }
            window.location.href = '/checkout.html';
        });
    }
    
    function initCartPage() {
        try {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            console.log("Cart data:", cart);
            
            // Filter out invalid items
            const validCart = cart.filter(item => 
                item && item.id && item.name && item.price !== null && item.price !== undefined);
                
            // Update the cart if items were filtered out
            if (validCart.length !== cart.length) {
                console.log("Fixing invalid cart items");
                localStorage.setItem('cart', JSON.stringify(validCart));
            }
            
            if (validCart.length === 0) {
                // Show empty cart message
                if (emptyCartMessage) {
                    emptyCartMessage.style.display = 'block';
                }
                if (cartItemsContainer) {
                    cartItemsContainer.style.display = 'none';
                }
                if (cartSidebar) {
                    cartSidebar.style.display = 'none';
                }
                console.log("Cart is empty");
                return;
            }
            
            // Hide empty cart message and show cart content
            if (emptyCartMessage) {
                emptyCartMessage.style.display = 'none';
            }
            if (cartItemsContainer) {
                cartItemsContainer.style.display = 'block';
            }
            if (cartSidebar) {
                cartSidebar.style.display = 'block';
            }
            
            // Clear existing items
            if (cartItemsContainer) {
                cartItemsContainer.innerHTML = '';
                
                // Add each item to the cart
                let totalItems = 0;
                let subtotal = 0;
                
                validCart.forEach(item => {
                    totalItems += item.quantity || 0;
                    const itemTotal = (item.price || 0) * (item.quantity || 0);
                    subtotal += itemTotal;
                    
                    console.log("Adding item to UI:", item);
                    
                    const itemElement = document.createElement('div');
                    itemElement.className = 'cart-item';
                    itemElement.innerHTML = `
                        <div class="cart-item-image">
                            <img src="${item.image || '../assets/Photo/default-product.png'}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <h3 class="cart-item-name">${item.name}</h3>
                            <div class="cart-item-price">${formatPrice(item.price || 0)} تومان</div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                                <span class="quantity">${item.quantity || 0}</span>
                                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                            </div>
                        </div>
                        <div class="cart-item-total">
                            <span>جمع: ${formatPrice(itemTotal)} تومان</span>
                            <button class="remove-item" data-id="${item.id}">حذف</button>
                        </div>
                    `;
                    
                    cartItemsContainer.appendChild(itemElement);
                });
                
                // Update summary
                if (totalItemsElement) {
                    totalItemsElement.textContent = totalItems;
                }
                if (subtotalElement) {
                    subtotalElement.textContent = `${formatPrice(subtotal)} تومان`;
                }
                
                // For now, assuming no discount
                const discount = 0;
                if (discountElement) {
                    discountElement.textContent = `${formatPrice(discount)} تومان`;
                }
                if (totalPriceElement) {
                    totalPriceElement.textContent = `${formatPrice(subtotal - discount)} تومان`;
                }
                
                console.log("Cart loaded successfully");
            }
        } catch (error) {
            console.error('Error initializing cart page:', error);
        }
    }
    
    // Helper function to format price
    function formatPrice(price) {
        if (price === null || price === undefined) {
            return "0"; // Default value for null/undefined prices
        }
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // Add event listeners for quantity buttons
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('quantity-btn')) {
                const id = e.target.dataset.id;
                const isPlus = e.target.classList.contains('plus');
                updateQuantity(id, isPlus);
            } else if (e.target.classList.contains('remove-item')) {
                const id = e.target.dataset.id;
                removeItem(id);
            }
        });
    }
    
    function updateQuantity(id, increase) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemIndex = cart.findIndex(item => item && item.id === id);
        
        if (itemIndex !== -1) {
            if (increase) {
                cart[itemIndex].quantity = (cart[itemIndex].quantity || 0) + 1;
            } else if ((cart[itemIndex].quantity || 0) > 1) {
                cart[itemIndex].quantity--;
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            initCartPage();
            // Update cart icon after modifying cart
            updateCartIcon();
        }
    }
    
    function removeItem(id) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const newCart = cart.filter(item => item && item.id !== id);
        localStorage.setItem('cart', JSON.stringify(newCart));
        initCartPage();
        // Update cart icon after modifying cart
        updateCartIcon();
    }
    
    // Function to show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification ' + type;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide and remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}); 