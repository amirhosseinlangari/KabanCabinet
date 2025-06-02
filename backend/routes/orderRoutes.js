/**
 * Order Routes - API endpoints for handling orders
 * Includes routes for creating, retrieving, updating, and exporting orders
 */

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { generateExcel } = require('../utils/excelExport');
const path = require('path');
const fs = require('fs');
const { protect, isAdmin } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalPrice } = req.body;
    
    // بررسی وجود آیتم‌های سفارش
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'سفارش باید حداقل شامل یک محصول باشد'
      });
    }
    
    // ایجاد سفارش جدید
    const order = new Order({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      totalPrice
    });
    
    const createdOrder = await order.save();
    
    res.status(201).json({
      success: true,
      message: 'سفارش با موفقیت ثبت شد',
      data: createdOrder
    });
  } catch (error) {
    console.error('خطا در ایجاد سفارش:', error);
    res.status(400).json({
      success: false,
      message: 'خطا در ایجاد سفارش',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/orders
 * @desc    Get all orders with pagination
 * @access  Private
 */
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    
    // ایجاد شرط‌های کوئری
    const query = {};
    if (status) query.status = status;
    
    // اجرای کوئری با پیجینیشن
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'fullName email');
    
    // شمارش کل سفارش‌ها
    const totalOrders = await Order.countDocuments(query);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        total: totalOrders,
        page: parseInt(page),
        pages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (error) {
    console.error('خطا در دریافت سفارش‌ها:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت لیست سفارش‌ها',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get a single order by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'سفارش مورد نظر یافت نشد'
      });
    }
    
    // اطمینان از دسترسی کاربر به سفارش (فقط سفارش خود کاربر یا مدیر)
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'شما اجازه دسترسی به این سفارش را ندارید'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('خطا در دریافت جزئیات سفارش:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت جزئیات سفارش',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/orders/:id
 * @desc    Update an order
 * @access  Private
 */
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { status, trackingCode } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'سفارش مورد نظر یافت نشد'
      });
    }
    
    // بروزرسانی وضعیت
    if (status) order.status = status;
    
    // بروزرسانی کد رهگیری
    if (trackingCode) order.trackingCode = trackingCode;
    
    // افزودن تاریخچه وضعیت
    order.statusHistory.push({
      status: status || order.status,
      timestamp: Date.now(),
      comment: req.body.comment
    });
    
    const updatedOrder = await order.save();
    
    res.json({
      success: true,
      message: 'وضعیت سفارش با موفقیت بروزرسانی شد',
      data: updatedOrder
    });
  } catch (error) {
    console.error('خطا در بروزرسانی وضعیت سفارش:', error);
    res.status(400).json({
      success: false,
      message: 'خطا در بروزرسانی وضعیت سفارش',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete an order
 * @access  Private
 */
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'سفارش یافت نشد'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'سفارش با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در حذف سفارش'
    });
  }
});

/**
 * @route   GET /api/orders/export/excel
 * @desc    Export orders to Excel
 * @access  Private
 */
router.get('/export/excel', protect, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    // Build filter
    const filter = {};
    
    // Add date filter if provided
    if (startDate || endDate) {
      filter.orderDate = {};
      if (startDate) filter.orderDate.$gte = new Date(startDate);
      if (endDate) filter.orderDate.$lte = new Date(endDate);
    }
    
    // Add status filter if provided
    if (status) filter.status = status;
    
    // Get filtered orders
    const orders = await Order.find(filter).sort({ orderDate: -1 });
    
    // Generate Excel file
    const { filePath, fileName } = await generateExcel(orders);
    
    // Send file
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        return res.status(500).json({
          success: false,
          message: 'خطا در دانلود فایل'
        });
      }
      
      // Delete file after download
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
    });
  } catch (error) {
    console.error('Error exporting orders to Excel:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در صدور اکسل سفارش‌ها'
    });
  }
});

/**
 * دریافت سفارش‌های کاربر فعلی
 * GET /api/orders/my-orders
 */
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('خطا در دریافت سفارش‌های کاربر:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت سفارش‌های شما',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * لغو سفارش توسط کاربر
 * PUT /api/orders/:id/cancel
 */
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'سفارش مورد نظر یافت نشد'
      });
    }
    
    // بررسی دسترسی کاربر به سفارش
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'شما اجازه لغو این سفارش را ندارید'
      });
    }
    
    // بررسی امکان لغو سفارش
    if (['delivered', 'shipped', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `امکان لغو سفارش در وضعیت ${order.status} وجود ندارد`
      });
    }
    
    // تغییر وضعیت سفارش به لغو شده
    order.status = 'cancelled';
    
    // افزودن به تاریخچه وضعیت
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: Date.now(),
      comment: req.body.reason || 'لغو توسط کاربر'
    });
    
    const updatedOrder = await order.save();
    
    res.json({
      success: true,
      message: 'سفارش با موفقیت لغو شد',
      data: updatedOrder
    });
  } catch (error) {
    console.error('خطا در لغو سفارش:', error);
    res.status(400).json({
      success: false,
      message: 'خطا در لغو سفارش',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Export the router
module.exports = router; 