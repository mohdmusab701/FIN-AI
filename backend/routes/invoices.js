const express = require('express');
const Invoice = require('../models/Invoice');
const Revenue = require('../models/Revenue');
const { protect } = require('../middleware/auth');
const { generateInvoicePDF } = require('../services/pdfService');

const router = express.Router();

// Generate unique invoice number
const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  const date = new Date();
  const prefix = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
};

// @route   GET /api/invoices
// @desc    Get all invoices for user
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Invoice.countDocuments(query);

    res.json({
      invoices,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/invoices/:id
// @desc    Get single invoice
router.get('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/invoices
// @desc    Create a new invoice
router.post('/', protect, async (req, res) => {
  try {
    const { clientName, clientEmail, clientAddress, items, taxRate, dueDate, notes } = req.body;

    // Calculate totals
    const calculatedItems = items.map(item => ({
      ...item,
      amount: item.quantity * item.rate
    }));

    const subtotal = calculatedItems.reduce((sum, item) => sum + item.amount, 0);
    const finalTaxRate = taxRate !== undefined ? taxRate : 18;
    const taxAmount = (subtotal * finalTaxRate) / 100;
    const total = subtotal + taxAmount;

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      user: req.user._id,
      invoiceNumber,
      clientName,
      clientEmail: clientEmail || '',
      clientAddress: clientAddress || '',
      items: calculatedItems,
      subtotal,
      taxRate: finalTaxRate,
      taxAmount,
      total,
      dueDate,
      notes: notes || ''
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/invoices/:id
// @desc    Update an invoice
router.put('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const { clientName, clientEmail, clientAddress, items, taxRate, dueDate, notes, status } = req.body;

    if (clientName) invoice.clientName = clientName;
    if (clientEmail !== undefined) invoice.clientEmail = clientEmail;
    if (clientAddress !== undefined) invoice.clientAddress = clientAddress;
    if (notes !== undefined) invoice.notes = notes;
    if (dueDate) invoice.dueDate = dueDate;
    if (status) invoice.status = status;

    if (items) {
      invoice.items = items.map(item => ({
        ...item,
        amount: item.quantity * item.rate
      }));
      invoice.subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
      invoice.taxRate = taxRate !== undefined ? taxRate : invoice.taxRate;
      invoice.taxAmount = (invoice.subtotal * invoice.taxRate) / 100;
      invoice.total = invoice.subtotal + invoice.taxAmount;
    }

    // If marking as paid, create revenue entry
    if (status === 'paid' && invoice.status !== 'paid') {
      await Revenue.create({
        user: req.user._id,
        amount: invoice.total,
        source: invoice.clientName,
        category: 'services',
        date: new Date(),
        description: `Payment for Invoice ${invoice.invoiceNumber}`,
        invoiceRef: invoice._id
      });
    }

    const updatedInvoice = await invoice.save();
    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/invoices/:id
// @desc    Delete an invoice
router.delete('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/invoices/:id/pdf
// @desc    Download invoice as PDF
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const pdfBuffer = await generateInvoicePDF(invoice, req.user);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
});

module.exports = router;
