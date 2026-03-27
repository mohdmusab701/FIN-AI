const express = require('express');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');
const { categorizeExpense } = require('../services/aiService');

const router = express.Router();

// @route   GET /api/expenses
// @desc    Get all expenses for user
router.get('/', protect, async (req, res) => {
  try {
    const { category, startDate, endDate, sort, page = 1, limit = 50 } = req.query;
    const query = { user: req.user._id };

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sortOption = sort === 'amount' ? { amount: -1 } : { date: -1 };

    const expenses = await Expense.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/expenses/summary
// @desc    Get expense summary by category
router.get('/summary', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchQuery = { user: req.user._id };

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const summary = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const totalExpenses = summary.reduce((sum, cat) => sum + cat.total, 0);

    res.json({ summary, totalExpenses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/expenses/monthly
// @desc    Get monthly expense trends
router.get('/monthly', protect, async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const monthly = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json(monthly);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/expenses
// @desc    Create an expense with AI categorization
router.post('/', protect, async (req, res) => {
  try {
    const { amount, description, category, date, paymentMethod, isRecurring, recurringFrequency, notes } = req.body;

    // AI auto-categorization if no category provided
    let finalCategory = category;
    if (!category || category === 'miscellaneous') {
      try {
        finalCategory = await categorizeExpense(description);
      } catch (aiError) {
        console.error('AI categorization failed:', aiError.message);
        finalCategory = category || 'miscellaneous';
      }
    }

    const expense = await Expense.create({
      user: req.user._id,
      amount,
      description,
      category: finalCategory,
      date: date || Date.now(),
      paymentMethod: paymentMethod || 'cash',
      isRecurring: isRecurring || false,
      recurringFrequency: recurringFrequency || null,
      notes: notes || ''
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update an expense
router.put('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const updates = req.body;

    // Re-categorize if description changed and no manual category set
    if (updates.description && updates.description !== expense.description && !updates.category) {
      try {
        updates.category = await categorizeExpense(updates.description);
      } catch (aiError) {
        console.error('AI re-categorization failed:', aiError.message);
      }
    }

    Object.keys(updates).forEach(key => {
      expense[key] = updates[key];
    });

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
