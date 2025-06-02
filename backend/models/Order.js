/**
 * Order Model - Schema for storing customer orders in MongoDB
 * This model includes all necessary fields for tracking cabinet orders
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Order Item Schema
 */
const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  options: {
    type: Map,
    of: String,
    default: {}
  },
  totalPrice: {
    type: Number,
    required: true
  }
});

/**
 * Status History Schema
 */
const StatusHistorySchema = new Schema({
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  },
  comment: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

/**
 * Customer Schema
 */
const CustomerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String
  }
});

/**
 * Shipping Address Schema
 */
const ShippingSchema = new Schema({
  fullName: {
    type: String,
    required: [true, 'نام و نام خانوادگی الزامی است']
  },
  address: {
    type: String,
    required: [true, 'آدرس الزامی است']
  },
  city: {
    type: String,
    required: [true, 'شهر الزامی است']
  },
  postalCode: {
    type: String,
    required: [true, 'کد پستی الزامی است']
  },
  phone: {
    type: String,
    required: [true, 'شماره تماس الزامی است']
  }
});

/**
 * Order Schema
 */
const OrderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'کاربر باید مشخص شود']
  },
  items: [OrderItemSchema],
  shippingAddress: ShippingSchema,
  paymentMethod: {
    type: String,
    enum: ['online', 'transfer', 'cod'],
    required: [true, 'روش پرداخت باید مشخص شود']
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    updateTime: { type: String },
    receipt: { type: String }
  },
  totalPrice: {
    type: Number,
    required: [true, 'مبلغ کل سفارش الزامی است'],
    min: [0, 'مبلغ کل نمی‌تواند منفی باشد']
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingCode: {
    type: String
  },
  statusHistory: [StatusHistorySchema],
  deliveredAt: {
    type: Date
  },
  note: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add status history on create
OrderSchema.pre('save', function(next) {
  // Update the updatedAt field
  this.updatedAt = Date.now();
  
  // Add initial status to history if new
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      comment: 'سفارش ایجاد شد'
    });
  }
  
  next();
});

// Virtual for formatted date
OrderSchema.virtual('formattedOrderDate').get(function() {
  return this.createdAt.toLocaleDateString('fa-IR');
});

// Virtual for total quantity
OrderSchema.virtual('totalQuantity').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Pre-save middleware to ensure finalPrice is calculated correctly
OrderSchema.pre('save', function(next) {
  // Calculate total price from items if not provided
  if (!this.totalPrice) {
    this.totalPrice = this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }
  
  // Ensure finalPrice is calculated correctly
  this.finalPrice = this.totalPrice - this.discount;
  next();
});

// متد برای بررسی وضعیت پرداخت
OrderSchema.methods.updatePaymentStatus = function(paymentData) {
  this.isPaid = true;
  this.paidAt = Date.now();
  this.paymentResult = paymentData;
  
  // اضافه کردن به تاریخچه وضعیت
  this.statusHistory.push({
    status: this.status,
    comment: 'پرداخت با موفقیت انجام شد'
  });
  
  return this.save();
};

// متد برای بروزرسانی وضعیت تحویل
OrderSchema.methods.updateDeliveryStatus = function(status, comment) {
  this.status = status;
  
  if (status === 'delivered') {
    this.deliveredAt = Date.now();
  }
  
  // اضافه کردن به تاریخچه وضعیت
  this.statusHistory.push({
    status,
    comment: comment || `وضعیت به ${status} تغییر یافت`
  });
  
  return this.save();
};

// ایجاد مجموعه از اسناد برای جستجوی سریع‌تر
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

// Create and export the Order model
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

module.exports = Order;