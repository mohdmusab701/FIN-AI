const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  contactName: {
    type: String,
    trim: true,
    default: ''
  },
  contactEmail: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'paid', 'overdue'],
    default: 'pending'
  },
  recurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly', null],
    default: null
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

reminderSchema.index({ user: 1, dueDate: 1 });
reminderSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
