const express = require('express');
const Expense = require('../models/Expense');
const Revenue = require('../models/Revenue');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Indian tax slabs for businesses (FY 2024-25)
const calculateIncomeTax = (taxableIncome) => {
  // New tax regime slabs
  let tax = 0;
  if (taxableIncome <= 300000) {
    tax = 0;
  } else if (taxableIncome <= 700000) {
    tax = (taxableIncome - 300000) * 0.05;
  } else if (taxableIncome <= 1000000) {
    tax = 20000 + (taxableIncome - 700000) * 0.10;
  } else if (taxableIncome <= 1200000) {
    tax = 50000 + (taxableIncome - 1000000) * 0.15;
  } else if (taxableIncome <= 1500000) {
    tax = 80000 + (taxableIncome - 1200000) * 0.20;
  } else {
    tax = 140000 + (taxableIncome - 1500000) * 0.30;
  }

  // Add 4% health and education cess
  const cess = tax * 0.04;
  return { tax, cess, total: tax + cess };
};

// @route   GET /api/tax/estimate
// @desc    Estimate tax based on revenue and expenses
router.get('/estimate', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { financialYear } = req.query;

    // Determine financial year dates
    let fyStart, fyEnd;
    if (financialYear) {
      const year = parseInt(financialYear);
      fyStart = new Date(year, 3, 1); // April 1
      fyEnd = new Date(year + 1, 2, 31); // March 31
    } else {
      // Current financial year
      const now = new Date();
      const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      fyStart = new Date(currentYear, 3, 1);
      fyEnd = new Date(currentYear + 1, 2, 31);
    }

    // Get total revenue for FY
    const revenueResult = await Revenue.aggregate([
      { $match: { user: userId, date: { $gte: fyStart, $lte: fyEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get total deductible expenses for FY
    const expenseResult = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: fyStart, $lte: fyEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenses = expenseResult[0]?.total || 0;

    // Expense breakdown for tax purposes
    const expenseBreakdown = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: fyStart, $lte: fyEnd } } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const taxableIncome = Math.max(0, totalRevenue - totalExpenses);
    const incomeTax = calculateIncomeTax(taxableIncome);

    // GST estimation (18% on services)
    const gstCollected = totalRevenue * 0.18;
    const gstPaid = totalExpenses * 0.18;
    const gstPayable = Math.max(0, gstCollected - gstPaid);

    // Quarterly advance tax
    const quarterlyTax = incomeTax.total / 4;

    // Monthly revenue for projection
    const monthsElapsed = Math.max(1, Math.ceil((new Date() - fyStart) / (30 * 24 * 60 * 60 * 1000)));
    const projectedAnnualRevenue = (totalRevenue / monthsElapsed) * 12;
    const projectedAnnualExpenses = (totalExpenses / monthsElapsed) * 12;
    const projectedTaxableIncome = Math.max(0, projectedAnnualRevenue - projectedAnnualExpenses);
    const projectedTax = calculateIncomeTax(projectedTaxableIncome);

    res.json({
      financialYear: {
        start: fyStart,
        end: fyEnd
      },
      actual: {
        totalRevenue,
        totalExpenses,
        taxableIncome,
        incomeTax: incomeTax.tax,
        cess: incomeTax.cess,
        totalTax: incomeTax.total,
        gstPayable,
        expenseBreakdown
      },
      projected: {
        annualRevenue: Math.round(projectedAnnualRevenue),
        annualExpenses: Math.round(projectedAnnualExpenses),
        taxableIncome: Math.round(projectedTaxableIncome),
        totalTax: Math.round(projectedTax.total)
      },
      quarterlyAdvanceTax: Math.round(quarterlyTax),
      effectiveTaxRate: taxableIncome > 0
        ? ((incomeTax.total / taxableIncome) * 100).toFixed(2)
        : '0.00'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
