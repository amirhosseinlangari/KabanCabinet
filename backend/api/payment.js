const express = require('express');
const router = express.Router();
const { checkAuth } = require('../utils/auth');
const Payment = require('../models/payment');
const Order = require('../models/order');

/**
 * @route   GET /api/payments
 * @desc    Get user's payments
 * @access  Private
 */
router.get('/', checkAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در دریافت پرداخت‌ها' 
    });
  }
});

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment by ID
 * @access  Private
 */
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentId = req.params.id;
    
    const payment = await Payment.findOne({ 
      _id: paymentId,
      userId
    });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'پرداخت یافت نشد'
      });
    }
    
    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در دریافت اطلاعات پرداخت' 
    });
  }
});

/**
 * @route   POST /api/payments/online/request
 * @desc    Request online payment
 * @access  Private
 */
router.post('/online/request', checkAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'شناسه سفارش الزامی است'
      });
    }
    
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
    
    // Check if order is already paid
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'این سفارش قبلاً پرداخت شده است'
      });
    }
    
    // Check if payment exists
    let payment = await Payment.findOne({ 
      orderId: order._id,
      method: 'online'
    });
    
    if (!payment) {
      // Create new payment
      payment = new Payment({
        orderId: order._id,
        userId,
        amount: order.finalPrice,
        method: 'online',
        status: 'awaiting_payment'
      });
      
      await payment.save();
    } else if (['completed', 'refunded'].includes(payment.status)) {
      return res.status(400).json({
        success: false,
        message: 'این پرداخت قبلاً انجام شده یا برگشت خورده است'
      });
    }
    
    // TODO: Connect to payment gateway
    // This is a simplified simulation of payment gateway integration
    
    // Generate fake tracking code
    const trackingCode = `KBN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Update payment with tracking code
    payment.trackingCode = trackingCode;
    payment.gatewayResponse = { 
      status: 'success',
      message: 'درخواست پرداخت با موفقیت ایجاد شد'
    };
    
    await payment.save();
    
    // Return payment redirect URL
    res.json({
      success: true,
      message: 'درخواست پرداخت با موفقیت ایجاد شد',
      paymentUrl: `/checkout/payment.html?tracking=${trackingCode}`,
      trackingCode
    });
  } catch (error) {
    console.error('Error requesting payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در ایجاد درخواست پرداخت' 
    });
  }
});

/**
 * @route   POST /api/payments/online/verify
 * @desc    Verify online payment
 * @access  Public
 */
router.post('/online/verify', async (req, res) => {
  try {
    const { trackingCode, gatewayRefId } = req.body;
    
    if (!trackingCode || !gatewayRefId) {
      return res.status(400).json({
        success: false,
        message: 'اطلاعات تراکنش ناقص است'
      });
    }
    
    // Find payment
    const payment = await Payment.findOne({ trackingCode });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'تراکنش یافت نشد'
      });
    }
    
    // Check if payment is already verified
    if (payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'این تراکنش قبلاً تایید شده است'
      });
    }
    
    // TODO: Verify payment with gateway
    // This is a simplified simulation of payment verification
    
    // Simulate successful verification
    const isVerified = true;
    
    if (isVerified) {
      // Update payment status
      payment.status = 'completed';
      payment.gatewayRefId = gatewayRefId;
      payment.verificationDetails = {
        verifiedAt: new Date(),
        isVerified: true
      };
      
      await payment.save();
      
      // Update order payment status
      await Order.findByIdAndUpdate(
        payment.orderId,
        { $set: { paymentStatus: 'paid' } }
      );
      
      return res.json({
        success: true,
        message: 'پرداخت با موفقیت تایید شد',
        payment
      });
    } else {
      // Update payment as failed
      payment.status = 'failed';
      payment.verificationDetails = {
        verifiedAt: new Date(),
        isVerified: false,
        message: 'تراکنش توسط درگاه پرداخت تایید نشد'
      };
      
      await payment.save();
      
      return res.status(400).json({
        success: false,
        message: 'پرداخت تایید نشد',
        payment
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در تایید پرداخت' 
    });
  }
});

/**
 * @route   POST /api/payments/admin/update/:id
 * @desc    Update payment status (admin only)
 * @access  Private/Admin
 */
router.post('/admin/update/:id', checkAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'دسترسی غیرمجاز'
      });
    }
    
    const paymentId = req.params.id;
    const { status, trackingCode } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'awaiting_payment', 'completed', 'failed', 'canceled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'وضعیت نامعتبر است'
      });
    }
    
    // Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'پرداخت یافت نشد'
      });
    }
    
    // Update payment
    payment.status = status;
    if (trackingCode) {
      payment.trackingCode = trackingCode;
    }
    
    await payment.save();
    
    // Update order payment status if completed
    if (status === 'completed') {
      await Order.findByIdAndUpdate(
        payment.orderId,
        { $set: { paymentStatus: 'paid' } }
      );
    } else if (status === 'failed' || status === 'canceled') {
      await Order.findByIdAndUpdate(
        payment.orderId,
        { $set: { paymentStatus: 'pending' } }
      );
    } else if (status === 'refunded') {
      await Order.findByIdAndUpdate(
        payment.orderId,
        { $set: { paymentStatus: 'refunded' } }
      );
    }
    
    res.json({
      success: true,
      message: 'وضعیت پرداخت با موفقیت بروزرسانی شد',
      payment
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در بروزرسانی وضعیت پرداخت' 
    });
  }
});

module.exports = router; 