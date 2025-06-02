const express = require('express');
const router = express.Router();
const { checkAuth } = require('../utils/auth');
const Cart = require('../models/cart');
const Product = require('../models/product');

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', checkAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user's cart or create a new one
    let cart = await Cart.findOne({ userId }).populate('items.product');
    
    if (!cart) {
      cart = new Cart({ 
        userId, 
        items: [],
        totalPrice: 0,
        discount: 0,
        finalPrice: 0
      });
      await cart.save();
    }
    
    res.json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در دریافت سبد خرید' 
    });
  }
});

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 * @access  Private
 */
router.post('/add', checkAuth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'شناسه محصول الزامی است'
      });
    }
    
    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد'
      });
    }
    
    // Check if product is in stock
    if (!product.inStock || product.countInStock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'موجودی محصول کافی نیست'
      });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ 
        userId, 
        items: [],
        totalPrice: 0,
        discount: 0,
        finalPrice: 0
      });
    }
    
    // Check if product already in cart
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId
    );
    
    if (itemIndex > -1) {
      // Update existing item
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].totalPrice = cart.items[itemIndex].quantity * product.price;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        name: product.name,
        price: product.price,
        quantity,
        totalPrice: quantity * product.price,
        image: product.images[0] || ''
      });
    }
    
    // Calculate totals
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    cart.finalPrice = cart.totalPrice - cart.discount;
    
    await cart.save();
    
    res.json({
      success: true,
      message: 'محصول به سبد خرید اضافه شد',
      cart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در افزودن به سبد خرید' 
    });
  }
});

/**
 * @route   POST /api/cart/update/:itemId
 * @desc    Update item quantity
 * @access  Private
 */
router.post('/update/:itemId', checkAuth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;
    
    // Validate inputs
    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'تعداد باید بزرگتر از صفر باشد'
      });
    }
    
    // Find cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'سبد خرید یافت نشد'
      });
    }
    
    // Find item
    const itemIndex = cart.items.findIndex(item => 
      item._id.toString() === itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'محصول در سبد خرید یافت نشد'
      });
    }
    
    if (quantity === 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].totalPrice = quantity * cart.items[itemIndex].price;
    }
    
    // Recalculate totals
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Apply existing discount if any
    if (cart.discountCode) {
      // Logic for recalculating discount would go here
      const discountRate = cart.discount / (cart.totalPrice + cart.discount);
      cart.discount = Math.round(cart.totalPrice * discountRate);
    }
    
    cart.finalPrice = cart.totalPrice - cart.discount;
    
    await cart.save();
    
    res.json({
      success: true,
      message: 'سبد خرید بروزرسانی شد',
      cart
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در بروزرسانی سبد خرید' 
    });
  }
});

/**
 * @route   DELETE /api/cart/item/:itemId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/item/:itemId', checkAuth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;
    
    // Find cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'سبد خرید یافت نشد'
      });
    }
    
    // Find and remove item
    const itemIndex = cart.items.findIndex(item => 
      item._id.toString() === itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'محصول در سبد خرید یافت نشد'
      });
    }
    
    // Remove item
    cart.items.splice(itemIndex, 1);
    
    // Recalculate totals
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Apply existing discount if any
    if (cart.discountCode) {
      // Logic for recalculating discount would go here
      const discountRate = cart.discount / (cart.totalPrice + cart.discount);
      cart.discount = Math.round(cart.totalPrice * discountRate);
    }
    
    cart.finalPrice = cart.totalPrice - cart.discount;
    
    await cart.save();
    
    res.json({
      success: true,
      message: 'محصول از سبد خرید حذف شد',
      cart
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در حذف از سبد خرید' 
    });
  }
});

/**
 * @route   POST /api/cart/discount
 * @desc    Apply discount to cart
 * @access  Private
 */
router.post('/discount', checkAuth, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    
    // Validate inputs
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'کد تخفیف الزامی است'
      });
    }
    
    // TODO: Validate discount code from database
    // This is a simplified example
    let discountPercent = 0;
    
    if (code === 'KABAN20') {
      discountPercent = 0.2; // 20% off
    } else if (code === 'SUMMER10') {
      discountPercent = 0.1; // 10% off
    } else {
      return res.status(400).json({
        success: false,
        message: 'کد تخفیف نامعتبر است'
      });
    }
    
    // Find cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'سبد خرید یافت نشد'
      });
    }
    
    // Apply discount
    cart.discountCode = code;
    cart.discount = Math.round(cart.totalPrice * discountPercent);
    cart.finalPrice = cart.totalPrice - cart.discount;
    
    await cart.save();
    
    res.json({
      success: true,
      message: 'کد تخفیف با موفقیت اعمال شد',
      cart
    });
  } catch (error) {
    console.error('Error applying discount:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در اعمال کد تخفیف' 
    });
  }
});

/**
 * @route   DELETE /api/cart
 * @desc    Clear cart
 * @access  Private
 */
router.delete('/', checkAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find and update cart
    await Cart.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          items: [],
          totalPrice: 0,
          discount: 0,
          finalPrice: 0,
          discountCode: null
        } 
      },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'سبد خرید خالی شد'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در خالی کردن سبد خرید' 
    });
  }
});

module.exports = router; 