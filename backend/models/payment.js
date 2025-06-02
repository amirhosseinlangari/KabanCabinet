const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Payment Schema
 */
const PaymentSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  method: {
    type: String,
    enum: ['cash', 'card', 'online'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'awaiting_payment', 'completed', 'failed', 'canceled', 'refunded'],
    default: 'pending'
  },
  trackingCode: {
    type: String,
    default: null
  },
  gatewayResponse: {
    type: Object,
    default: null
  },
  gatewayRefId: {
    type: String,
    default: null
  },
  verificationDetails: {
    type: Object,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
PaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // If status is changed to completed, set paidAt to current time
  if (this.isModified('status') && this.status === 'completed' && !this.paidAt) {
    this.paidAt = Date.now();
  }
  
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema); 