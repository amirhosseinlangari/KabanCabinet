const express = require('express');
const router = express.Router();
const { checkAuth } = require('../utils/auth');
const Order = require('../models/order');
const Cart = require('../models/cart');
const Payment = require('../models/payment');
const { generateOrderId } = require('../utils/helpers');

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/', checkAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    // Parse page and limit to integers
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const skip = (pageInt - 1) * limitInt;
    
    // Get total count for pagination
    const totalOrders = await Order.countDocuments({ userId });
    
    // Get orders with pagination
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitInt);
    
    res.json({
      success: true,
      orders,
      pagination: {
        total: totalOrders,
        page: pageInt,
        limit: limitInt,
        pages: Math.ceil(totalOrders / limitInt)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در دریافت سفارش‌ها' 
    });
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    
    // Find order
    const order = await Order.findOne({ 
      _id: orderId,
      userId 
    }).populate('items.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'سفارش یافت نشد'
      });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در دریافت اطلاعات سفارش' 
    });
  }
});

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', checkAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      name, 
      phone, 
      email,
      address,
      paymentMethod,
      notes
    } = req.body;
    
    // Validate required fields
    if (!name || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'اطلاعات ناقص است. نام، تلفن و آدرس الزامی هستند'
      });
    }
    
    // Get user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'سبد خرید خالی است'
      });
    }
    
    // Generate unique order ID
    const orderNumber = generateOrderId();
    
    // Create order
    const order = new Order({
      orderNumber,
      userId,
      customer: {
        name,
        phone,
        email
      },
      shipping: {
        address
      },
      items: cart.items,
      totalPrice: cart.totalPrice,
      discount: cart.discount,
      finalPrice: cart.finalPrice,
      paymentMethod,
      notes
    });
    
    await order.save();
    
    // Create initial payment record
    const payment = new Payment({
      orderId: order._id,
      userId,
      amount: order.finalPrice,
      method: paymentMethod,
      status: paymentMethod === 'cash' ? 'pending' : 'awaiting_payment'
    });
    
    await payment.save();
    
    // Clear the cart
    cart.items = [];
    cart.totalPrice = 0;
    cart.discount = 0;
    cart.finalPrice = 0;
    cart.discountCode = null;
    await cart.save();
    
    res.status(201).json({
      success: true,
      message: 'سفارش با موفقیت ثبت شد',
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در ثبت سفارش' 
    });
  }
});

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel an order
 * @access  Private
 */
router.put('/:id/cancel', checkAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    
    // Find order
    const order = await Order.findOne({ 
      _id: orderId,
      userId 
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'سفارش یافت نشد'
      });
    }
    
    // Check if order can be canceled
    if (['delivered', 'canceled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'این سفارش قابل لغو نیست'
      });
    }
    
    // Update order status
    order.status = 'canceled';
    order.statusHistory.push({
      status: 'canceled',
      description: 'سفارش توسط مشتری لغو شد'
    });
    
    await order.save();
    
    // Update payment status if exists
    await Payment.updateMany(
      { orderId: order._id },
      { $set: { status: 'canceled' } }
    );
    
    res.json({
      success: true,
      message: 'سفارش با موفقیت لغو شد',
      order
    });
  } catch (error) {
    console.error('Error canceling order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در لغو سفارش' 
    });
  }
});

/**
 * @route   GET /api/orders/admin/all
 * @desc    Get all orders (admin only)
 * @access  Private/Admin
 */
router.get('/admin/all', checkAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'دسترسی غیرمجاز'
      });
    }
    
    const { 
      page = 1, 
      limit = 10,
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Parse page and limit to integers
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const skip = (pageInt - 1) * limitInt;
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    
    // Build sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);
    
    // Get orders with pagination
    const orders = await Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitInt)
      .populate('userId', 'name email');
    
    res.json({
      success: true,
      orders,
      pagination: {
        total: totalOrders,
        page: pageInt,
        limit: limitInt,
        pages: Math.ceil(totalOrders / limitInt)
      }
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در دریافت سفارش‌ها' 
    });
  }
});

/**
 * @route   PUT /api/orders/admin/:id/status
 * @desc    Update order status (admin only)
 * @access  Private/Admin
 */
router.put('/admin/:id/status', checkAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'دسترسی غیرمجاز'
      });
    }
    
    const orderId = req.params.id;
    const { status, description } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'canceled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'وضعیت نامعتبر است'
      });
    }
    
    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'سفارش یافت نشد'
      });
    }
    
    // Update order status
    order.status = status;
    order.statusHistory.push({
      status,
      description: description || `وضعیت سفارش به "${status}" تغییر یافت`
    });
    
    await order.save();
    
    // If status is 'delivered', update payment to 'completed' for cash payments
    if (status === 'delivered' && order.paymentMethod === 'cash') {
      await Payment.updateMany(
        { orderId: order._id },
        { $set: { status: 'completed' } }
      );
    }
    
    // If status is 'canceled', update payment to 'canceled'
    if (status === 'canceled') {
      await Payment.updateMany(
        { orderId: order._id },
        { $set: { status: 'canceled' } }
      );
    }
    
    res.json({
      success: true,
      message: 'وضعیت سفارش با موفقیت بروزرسانی شد',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در بروزرسانی وضعیت سفارش' 
    });
  }
});

module.exports = router; 