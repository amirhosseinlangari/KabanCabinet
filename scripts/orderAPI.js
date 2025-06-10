/**
 * کابینت کابان - سیستم مدیریت سفارش‌ها
 * مدیریت ارتباط با API سفارش‌ها
 */

// تنظیمات API
const API_URL = 'https://www.kabancabinet.ir/api';

/**
 * کلاس مدیریت سبد خرید و سفارش‌ها
 */
class OrderManager {
  constructor() {
    this.baseUrl = 'http://127.0.0.1:5000/api';
    this.cart = this.loadCart() || {
      items: [],
      totalPrice: 0,
      discount: 0,
      finalPrice: 0
    };
    
    // اگر از localStorage دیتا لود شده، قیمت‌ها را بازمحاسبه می‌کنیم
    if (this.cart.items.length > 0) {
      this.recalculateCart();
    }
  }
  
  /**
   * بارگذاری سبد خرید از localStorage
   */
  loadCart() {
    const savedCart = localStorage.getItem('kaban_cart');
    return savedCart ? JSON.parse(savedCart) : null;
  }
  
  /**
   * ذخیره سبد خرید در localStorage
   */
  saveCart() {
    localStorage.setItem('kaban_cart', JSON.stringify(this.cart));
    this.updateCartUI();
  }
  
  /**
   * افزودن محصول به سبد خرید
   */
  addToCart(product) {
    const existingItem = this.cart.items.find(item => 
      item.productId === product.id && item.productType === product.type
    );
    
    if (existingItem) {
      existingItem.quantity += product.quantity || 1;
      existingItem.totalItemPrice = existingItem.quantity * existingItem.unitPrice;
    } else {
      this.cart.items.push({
        productId: product.id,
        productName: product.name,
        productType: product.type,
        quantity: product.quantity || 1,
        unitPrice: product.price,
        totalItemPrice: (product.quantity || 1) * product.price
      });
    }
    
    this.recalculateCart();
    this.saveCart();
    
    // نمایش نوتیفیکیشن اضافه شدن به سبد خرید
    this.showNotification(`${product.name} به سبد خرید اضافه شد`);
  }
  
  /**
   * حذف محصول از سبد خرید
   */
  removeFromCart(productId) {
    this.cart.items = this.cart.items.filter(item => item.productId !== productId);
    this.recalculateCart();
    this.saveCart();
  }
  
  /**
   * تغییر تعداد یک محصول در سبد خرید
   */
  updateQuantity(productId, quantity) {
    const item = this.cart.items.find(item => item.productId === productId);
    if (item) {
      if (quantity <= 0) {
        return this.removeFromCart(productId);
      }
      
      item.quantity = quantity;
      item.totalItemPrice = item.quantity * item.unitPrice;
      this.recalculateCart();
      this.saveCart();
    }
  }
  
  /**
   * اعمال کد تخفیف به سبد خرید
   */
  applyDiscount(discountCode) {
    // در یک پروژه واقعی، این بخش باید با API تخفیف ارتباط برقرار کند
    return new Promise((resolve, reject) => {
      // شبیه‌سازی درخواست API
      setTimeout(() => {
        if (discountCode === 'KABAN20') {
          // 20% تخفیف
          this.cart.discount = Math.round(this.cart.totalPrice * 0.2);
          this.cart.finalPrice = this.cart.totalPrice - this.cart.discount;
          this.saveCart();
          resolve({
            success: true,
            message: 'کد تخفیف با موفقیت اعمال شد',
            discount: this.cart.discount
          });
        } else {
          reject({
            success: false,
            message: 'کد تخفیف نامعتبر است'
          });
        }
      }, 500);
    });
  }
  
  /**
   * بازمحاسبه قیمت‌های سبد خرید
   */
  recalculateCart() {
    this.cart.totalPrice = this.cart.items.reduce((total, item) => total + item.totalItemPrice, 0);
    // حفظ درصد تخفیف فعلی
    if (this.cart.discount > 0) {
      const discountRate = this.cart.discount / (this.cart.finalPrice + this.cart.discount);
      this.cart.discount = Math.round(this.cart.totalPrice * discountRate);
    }
    this.cart.finalPrice = this.cart.totalPrice - this.cart.discount;
  }
  
  /**
   * بروزرسانی UI سبد خرید
   */
  updateCartUI() {
    // المان‌های سبد خرید را پیدا و بروزرسانی می‌کنیم
    const cartCountElement = document.querySelector('.cart-count');
    const cartItemsElement = document.querySelector('.cart-items');
    const cartTotalElement = document.querySelector('.cart-total');
    
    if (cartCountElement) {
      cartCountElement.textContent = this.cart.items.length;
    }
    
    if (cartTotalElement) {
      cartTotalElement.textContent = this.formatPrice(this.cart.finalPrice) + ' تومان';
    }
    
    if (cartItemsElement) {
      if (this.cart.items.length === 0) {
        cartItemsElement.innerHTML = '<div class="empty-cart">سبد خرید شما خالی است</div>';
        return;
      }
      
      cartItemsElement.innerHTML = '';
      
      this.cart.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
          <div class="cart-item-name">${item.productName} (${item.productType})</div>
          <div class="cart-item-price">${this.formatPrice(item.totalItemPrice)} تومان</div>
          <div class="cart-item-quantity">
            <button class="quantity-decrease" data-id="${item.productId}">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-increase" data-id="${item.productId}">+</button>
          </div>
          <button class="remove-item" data-id="${item.productId}">×</button>
        `;
        
        cartItemsElement.appendChild(itemElement);
      });
      
      // اضافه کردن اطلاعات تخفیف و قیمت نهایی
      const summaryElement = document.createElement('div');
      summaryElement.className = 'cart-summary';
      summaryElement.innerHTML = `
        <div class="cart-subtotal">
          <span>جمع کل:</span>
          <span>${this.formatPrice(this.cart.totalPrice)} تومان</span>
        </div>
        ${this.cart.discount > 0 ? `
        <div class="cart-discount">
          <span>تخفیف:</span>
          <span>${this.formatPrice(this.cart.discount)} تومان</span>
        </div>
        ` : ''}
        <div class="cart-final">
          <span>مبلغ قابل پرداخت:</span>
          <span>${this.formatPrice(this.cart.finalPrice)} تومان</span>
        </div>
      `;
      
      cartItemsElement.appendChild(summaryElement);
      
      // اضافه کردن دکمه ثبت سفارش
      const checkoutButton = document.createElement('button');
      checkoutButton.className = 'checkout-button';
      checkoutButton.textContent = 'ادامه فرآیند خرید';
      checkoutButton.addEventListener('click', () => this.redirectToCheckout());
      
      cartItemsElement.appendChild(checkoutButton);
      
      // اضافه کردن لیسنرهای دکمه‌ها
      document.querySelectorAll('.quantity-decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          const item = this.cart.items.find(item => item.productId === id);
          if (item) this.updateQuantity(id, item.quantity - 1);
        });
      });
      
      document.querySelectorAll('.quantity-increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          const item = this.cart.items.find(item => item.productId === id);
          if (item) this.updateQuantity(id, item.quantity + 1);
        });
      });
      
      document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          this.removeFromCart(id);
        });
      });
    }
  }
  
  /**
   * فرمت کردن اعداد قیمت با جداکننده هزارگان
   */
  formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  /**
   * نمایش نوتیفیکیشن
   */
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // نمایش نوتیفیکیشن با انیمیشن
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // حذف نوتیفیکیشن بعد از چند ثانیه
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
  
  /**
   * هدایت به صفحه تکمیل خرید
   */
  redirectToCheckout() {
    window.location.href = '/checkout.html';
  }
  
  /**
   * تکمیل فرآیند سفارش
   */
  async submitOrder(customerData) {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('لطفا ابتدا وارد حساب کاربری خود شوید');
    }

    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: this.cart.items,
          customerData,
          totalPrice: this.cart.totalPrice,
          discount: this.cart.discount,
          finalPrice: this.cart.finalPrice
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'خطا در ثبت سفارش');
      }

      const data = await response.json();
      this.clearCart();
      return data;
    } catch (error) {
      console.error('Error submitting order:', error);
      throw error;
    }
  }
  
  /**
   * پاک کردن سبد خرید
   */
  clearCart() {
    this.cart = {
      items: [],
      totalPrice: 0,
      discount: 0,
      finalPrice: 0
    };
    this.saveCart();
  }
  
  /**
   * دریافت فایل اکسل سفارش‌ها (برای پنل ادمین)
   */
  static getOrdersExcel(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    window.open(`${API_URL}/orders/export/excel?${params.toString()}`, '_blank');
  }
  
  /**
   * دریافت لیست سفارش‌ها (برای پنل ادمین)
   */
  static async getOrders(page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_URL}/orders?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('خطا در دریافت سفارش‌ها');
      }
      
      return await response.json();
    } catch (error) {
      console.error('خطا در دریافت سفارش‌ها:', error);
      return {
        success: false,
        message: error.message || 'خطا در دریافت سفارش‌ها'
      };
    }
  }

  getAuthToken() {
    return localStorage.getItem('auth_token');
  }

  isUserLoggedIn() {
    const token = this.getAuthToken();
    const user = JSON.parse(localStorage.getItem('user_data'));
    return !!(token && user);
  }
}

// برای دسترسی سریع در window
window.orderManager = new OrderManager(); 