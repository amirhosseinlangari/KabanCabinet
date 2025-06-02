/**
 * Checkout page functionality
 * Handles checkout flow, form validation, and order submission
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get elements
  const checkoutForm = document.getElementById('checkout-form');
  const orderItemsContainer = document.querySelector('.order-items');
  const subtotalElement = document.querySelector('.subtotal-value');
  const discountElement = document.querySelector('.discount-value');
  const finalValueElement = document.querySelector('.final-value');
  const discountInput = document.getElementById('discount-code-input');
  const applyDiscountButton = document.getElementById('apply-discount');
  const confirmationModal = document.getElementById('confirmation-modal');
  const successModal = document.getElementById('success-modal');
  const orderSummaryModal = document.querySelector('.order-summary-modal');
  const orderIdElement = document.getElementById('order-id');
  const confirmOrderButton = document.getElementById('confirm-order');
  const cancelOrderButton = document.getElementById('cancel-order');
  const closeModalButtons = document.querySelectorAll('.close-modal');
  
  // Load cart data
  loadOrderSummary();
  
  // Apply discount button click
  applyDiscountButton.addEventListener('click', function() {
    const discountCode = discountInput.value.trim();
    if (discountCode.length === 0) return;
    
    // Try to apply discount
    orderManager.applyDiscount(discountCode)
      .then(result => {
        showNotification(result.message, 'success');
        updateOrderSummary();
      })
      .catch(error => {
        showNotification(error.message, 'error');
      });
  });
  
  // Form submission
  checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Check if cart is empty
    if (orderManager.cart.items.length === 0) {
      showNotification('سبد خرید شما خالی است. لطفا ابتدا محصولی اضافه کنید.', 'error');
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      showNotification('لطفاً تمامی فیلدهای الزامی را تکمیل نمایید.', 'error');
      return;
    }
    
    // Show confirmation modal
    showConfirmationModal();
  });
  
  // Confirm order button click
  confirmOrderButton.addEventListener('click', function() {
    // Get form data
    const formData = getFormData();
    
    // Submit order
    submitOrder(formData);
  });
  
  // Cancel order button click
  cancelOrderButton.addEventListener('click', function() {
    hideModal(confirmationModal);
  });
  
  // Close modal buttons
  closeModalButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      hideModal(modal);
    });
  });
  
  /**
   * Load and display order summary
   */
  function loadOrderSummary() {
    // If cart is empty, redirect to products page
    if (!orderManager.cart || orderManager.cart.items.length === 0) {
      orderItemsContainer.innerHTML = '<div class="empty-cart">سبد خرید شما خالی است</div>';
      return;
    }
    
    // Clear container
    orderItemsContainer.innerHTML = '';
    
    // Add each item
    orderManager.cart.items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'order-item';
      
      itemElement.innerHTML = `
        <img src="images/products/${item.productType.toLowerCase()}.jpg" alt="${item.productName}" class="order-item-image">
        <div class="order-item-details">
          <div class="order-item-name">${item.productName}</div>
          <div class="order-item-type">${item.productType}</div>
          <div class="order-item-quantity">${item.quantity} عدد</div>
        </div>
        <div class="order-item-price">${formatPrice(item.totalItemPrice)} تومان</div>
      `;
      
      orderItemsContainer.appendChild(itemElement);
    });
    
    // Update totals
    updateOrderSummary();
  }
  
  /**
   * Update order summary totals
   */
  function updateOrderSummary() {
    subtotalElement.textContent = formatPrice(orderManager.cart.totalPrice) + ' تومان';
    discountElement.textContent = formatPrice(orderManager.cart.discount) + ' تومان';
    finalValueElement.textContent = formatPrice(orderManager.cart.finalPrice) + ' تومان';
  }
  
  /**
   * Validate checkout form
   * @returns {Boolean} True if valid, false otherwise
   */
  function validateForm() {
    const requiredFields = checkoutForm.querySelectorAll('[required]');
    let valid = true;
    
    requiredFields.forEach(field => {
      // Reset field styling
      field.classList.remove('error');
      
      if (!field.value.trim()) {
        field.classList.add('error');
        valid = false;
      }
      
      // Validate phone number pattern if it's the phone input
      if (field.id === 'phone' && field.value.trim()) {
        const phonePattern = /^(\+98|0)?9\d{9}$/;
        if (!phonePattern.test(field.value.trim())) {
          field.classList.add('error');
          valid = false;
        }
      }
      
      // Validate email if provided
      const emailField = document.getElementById('email');
      if (emailField.value.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailField.value.trim())) {
          emailField.classList.add('error');
          valid = false;
        }
      }
    });
    
    return valid;
  }
  
  /**
   * Get form data as an object
   * @returns {Object} Form data object
   */
  function getFormData() {
    return {
      name: document.getElementById('name').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim() || null,
      address: {
        province: document.getElementById('province').value.trim(),
        city: document.getElementById('city').value.trim(),
        street: document.getElementById('address').value.trim(),
        postalCode: document.getElementById('postalCode').value.trim() || null
      },
      paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
      notes: document.getElementById('notes').value.trim() || null
    };
  }
  
  /**
   * Show confirmation modal with order summary
   */
  function showConfirmationModal() {
    // Update order summary in modal
    orderSummaryModal.innerHTML = `
      <div class="summary-item">
        <span>تعداد محصولات:</span>
        <span>${orderManager.cart.items.length} محصول</span>
      </div>
      <div class="summary-item">
        <span>جمع کل:</span>
        <span>${formatPrice(orderManager.cart.totalPrice)} تومان</span>
      </div>
      <div class="summary-item">
        <span>تخفیف:</span>
        <span>${formatPrice(orderManager.cart.discount)} تومان</span>
      </div>
      <div class="summary-item total">
        <span>مبلغ قابل پرداخت:</span>
        <span>${formatPrice(orderManager.cart.finalPrice)} تومان</span>
      </div>
      <div class="summary-item">
        <span>روش پرداخت:</span>
        <span>${getPaymentMethodText(document.querySelector('input[name="paymentMethod"]:checked').value)}</span>
      </div>
    `;
    
    // Show modal
    showModal(confirmationModal);
  }
  
  /**
   * Submit order to API
   * @param {Object} customerData - Customer information
   */
  function submitOrder(customerData) {
    // Show loading state
    confirmOrderButton.disabled = true;
    confirmOrderButton.textContent = 'در حال ثبت سفارش...';
    
    // Submit order
    orderManager.submitOrder(customerData)
      .then(result => {
        if (result.success) {
          // Hide confirmation modal
          hideModal(confirmationModal);
          
          // Update order ID in success modal
          orderIdElement.textContent = result.orderId;
          
          // Show success modal
          showModal(successModal);
        } else {
          showNotification(result.message, 'error');
          confirmOrderButton.disabled = false;
          confirmOrderButton.textContent = 'تأیید و ثبت نهایی';
        }
      })
      .catch(error => {
        showNotification('خطا در ثبت سفارش. لطفا مجدد تلاش کنید.', 'error');
        confirmOrderButton.disabled = false;
        confirmOrderButton.textContent = 'تأیید و ثبت نهایی';
      });
  }
  
  /**
   * Show modal
   * @param {Element} modal - Modal element to show
   */
  function showModal(modal) {
    modal.style.display = 'block';
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }
  
  /**
   * Hide modal
   * @param {Element} modal - Modal element to hide
   */
  function hideModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
  
  /**
   * Format price with thousands separator
   * @param {Number} price - Price to format
   * @returns {String} Formatted price
   */
  function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  /**
   * Get payment method text
   * @param {String} method - Payment method code
   * @returns {String} Payment method text
   */
  function getPaymentMethodText(method) {
    const methods = {
      'cash': 'پرداخت نقدی هنگام تحویل',
      'card': 'پرداخت کارت به کارت',
      'online': 'پرداخت آنلاین'
    };
    
    return methods[method] || method;
  }
  
  /**
   * Show notification
   * @param {String} message - Message to show
   * @param {String} type - Notification type (success, error)
   */
  function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Hide after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}); 