const express = require('express');
const Expense = require('../models/Expense');
const Revenue = require('../models/Revenue');
const Invoice = require('../models/Invoice');
const Reminder = require('../models/Reminder');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard
// @desc    Get complete dashboard data
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total revenue (all time)
    const totalRevenueResult = await Revenue.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Total expenses (all time)
    const totalExpensesResult = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenses = totalExpensesResult[0]?.total || 0;

    // This month revenue
    const thisMonthRevenueResult = await Revenue.aggregate([
      { $match: { user: userId, date: { $gte: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const thisMonthRevenue = thisMonthRevenueResult[0]?.total || 0;

    // This month expenses
    const thisMonthExpensesResult = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const thisMonthExpenses = thisMonthExpensesResult[0]?.total || 0;

    // Last month revenue for comparison
    const lastMonthRevenueResult = await Revenue.aggregate([
      { $match: { user: userId, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const lastMonthRevenue = lastMonthRevenueResult[0]?.total || 0;

    // Last month expenses for comparison
    const lastMonthExpensesResult = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const lastMonthExpenses = lastMonthExpensesResult[0]?.total || 0;

    // Monthly trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRevenue = await Revenue.aggregate([
      { $match: { user: userId, date: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyExpenses = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Expense breakdown by category
    const expensesByCategory = await Expense.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Recent transactions
    const recentExpenses = await Expense.find({ user: userId })
      .sort({ date: -1 }).limit(5);
    const recentRevenues = await Revenue.find({ user: userId })
      .sort({ date: -1 }).limit(5);

    // Pending invoices
    const pendingInvoices = await Invoice.countDocuments({
      user: userId,
      status: { $in: ['draft', 'sent'] }
    });

    const overdueInvoices = await Invoice.countDocuments({
      user: userId,
      status: 'overdue'
    });

    // Upcoming reminders
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingReminders = await Reminder.find({
      user: userId,
      dueDate: { $gte: now, $lte: nextWeek },
      status: { $in: ['pending', 'sent'] }
    }).sort({ dueDate: 1 }).limit(5);

    // Calculate trends
    const revenueChange = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    const expenseChange = lastMonthExpenses > 0
      ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100).toFixed(1)
      : 0;

    res.json({
      overview: {
        totalRevenue,
        totalExpenses,
        profit: totalRevenue - totalExpenses,
        thisMonthRevenue,
        thisMonthExpenses,
        thisMonthProfit: thisMonthRevenue - thisMonthExpenses,
        revenueChange: parseFloat(revenueChange),
        expenseChange: parseFloat(expenseChange)
      },
      charts: {
        monthlyRevenue,
        monthlyExpenses,
        expensesByCategory
      },
      recent: {
        expenses: recentExpenses,
        revenues: recentRevenues
      },
      alerts: {
        pendingInvoices,
        overdueInvoices,
        upcomingReminders
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
