const express = require('express');
const Reminder = require('../models/Reminder');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reminders
// @desc    Get all reminders for user
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const reminders = await Reminder.find(query).sort({ dueDate: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reminders/upcoming
// @desc    Get upcoming reminders (next 7 days)
router.get('/upcoming', protect, async (req, res) => {
  try {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const reminders = await Reminder.find({
      user: req.user._id,
      dueDate: { $gte: now, $lte: nextWeek },
      status: { $in: ['pending', 'sent'] }
    }).sort({ dueDate: 1 });

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/reminders
// @desc    Create a reminder
router.post('/', protect, async (req, res) => {
  try {
    const { title, amount, dueDate, contactName, contactEmail, recurring, recurringFrequency, notes } = req.body;

    const reminder = await Reminder.create({
      user: req.user._id,
      title,
      amount,
      dueDate,
      contactName: contactName || '',
      contactEmail: contactEmail || '',
      recurring: recurring || false,
      recurringFrequency: recurringFrequency || null,
      notes: notes || ''
    });

    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/reminders/:id
// @desc    Update a reminder
router.put('/:id', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });

    Object.keys(req.body).forEach(key => {
      reminder[key] = req.body[key];
    });

    const updated = await reminder.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/reminders/:id
// @desc    Delete a reminder
router.delete('/:id', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
