const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Cart Item Schema
 */
const CartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
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
    min: 1,
    default: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: ''
  }
});

/**
 * Cart Schema
 */
const CartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [CartItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  discount: {
    type: Number,
    required: true,
    default: 0
  },
  finalPrice: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', CartSchema); 