const express = require('express');
const Expense = require('../models/Expense');
const Revenue = require('../models/Revenue');
const { protect } = require('../middleware/auth');
const { generateInsights, predictCashFlow, getFinancialAdvice, categorizeExpense } = require('../services/aiService');

const router = express.Router();

// @route   POST /api/ai/categorize
// @desc    Categorize an expense using AI
router.post('/categorize', protect, async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const category = await categorizeExpense(description);
    res.json({ category });
  } catch (error) {
    console.error('AI categorization error:', error);
    res.status(500).json({ message: 'AI categorization failed', error: error.message });
  }
});

// @route   POST /api/ai/insights
// @desc    Get AI financial insights
router.post('/insights', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Gather financial data
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [expenses, revenues, expensesByCategory] = await Promise.all([
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: threeMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Revenue.aggregate([
        { $match: { user: userId, date: { $gte: threeMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: threeMonthsAgo } } },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } }
      ])
    ]);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);
    const totalRevenue = revenues.reduce((sum, r) => sum + r.total, 0);

    const financialData = {
      businessName: req.user.businessName,
      businessType: req.user.businessType,
      period: 'Last 3 months',
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1) + '%' : '0%',
      monthlyExpenses: expenses,
      monthlyRevenue: revenues,
      topExpenseCategories: expensesByCategory.slice(0, 5)
    };

    const insights = await generateInsights(financialData);
    res.json(insights);
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ message: 'AI insights generation failed', error: error.message });
  }
});

// @route   POST /api/ai/predict
// @desc    Predict future cash flow
router.post('/predict', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [monthlyExpenses, monthlyRevenue] = await Promise.all([
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Revenue.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const historicalData = {
      businessName: req.user.businessName,
      businessType: req.user.businessType,
      monthlyExpenses,
      monthlyRevenue,
      period: 'Last 6 months'
    };

    const prediction = await predictCashFlow(historicalData);
    res.json(prediction);
  } catch (error) {
    console.error('AI prediction error:', error);
    res.status(500).json({ message: 'AI prediction failed', error: error.message });
  }
});

// @route   POST /api/ai/advice
// @desc    Get personalized financial advice
router.post('/advice', protect, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const businessProfile = {
      businessName: req.user.businessName,
      businessType: req.user.businessType,
      monthlyRevenue: req.user.monthlyRevenue
    };

    const advice = await getFinancialAdvice(businessProfile, question);
    res.json({ advice });
  } catch (error) {
    console.error('AI advice error:', error);
    res.status(500).json({ message: 'AI advice failed', error: error.message });
  }
});

module.exports = router;
