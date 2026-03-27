const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  source: {
    type: String,
    required: [true, 'Revenue source is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['sales', 'services', 'investments', 'grants', 'other'],
    default: 'sales'
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  invoiceRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    default: null
  }
}, {
  timestamps: true
});

revenueSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Revenue', revenueSchema);
