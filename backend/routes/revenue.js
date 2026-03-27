const express = require('express');
const Revenue = require('../models/Revenue');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/revenue
// @desc    Get all revenue entries
router.get('/', protect, async (req, res) => {
  try {
    const { category, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = { user: req.user._id };

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const revenues = await Revenue.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Revenue.countDocuments(query);

    res.json({
      revenues,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/revenue
// @desc    Add revenue entry
router.post('/', protect, async (req, res) => {
  try {
    const { amount, source, category, date, description } = req.body;

    const revenue = await Revenue.create({
      user: req.user._id,
      amount,
      source,
      category: category || 'sales',
      date: date || Date.now(),
      description: description || ''
    });

    res.status(201).json(revenue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/revenue/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const revenue = await Revenue.findOne({ _id: req.params.id, user: req.user._id });
    if (!revenue) return res.status(404).json({ message: 'Revenue entry not found' });

    Object.keys(req.body).forEach(key => {
      revenue[key] = req.body[key];
    });

    const updated = await revenue.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/revenue/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const revenue = await Revenue.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!revenue) return res.status(404).json({ message: 'Revenue entry not found' });
    res.json({ message: 'Revenue deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
