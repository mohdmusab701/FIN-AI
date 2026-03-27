require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Revenue = require('../models/Revenue');
const Invoice = require('../models/Invoice');
const Reminder = require('../models/Reminder');

const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();
    console.log('🗑️  Clearing existing data...');

    await User.deleteMany({});
    await Expense.deleteMany({});
    await Revenue.deleteMany({});
    await Invoice.deleteMany({});
    await Reminder.deleteMany({});

    // Create test user
    console.log('👤 Creating test user...');
    const user = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@finai.com',
      password: 'password123',
      businessName: 'Kumar Tech Solutions',
      businessType: 'technology',
      monthlyRevenue: 500000,
      language: 'en'
    });

    // Create expenses for last 6 months
    console.log('💰 Creating expenses...');
    const expenseData = [];
    const categories = ['rent', 'utilities', 'salaries', 'marketing', 'supplies', 'travel', 'food', 'software', 'maintenance', 'insurance'];
    const descriptions = {
      rent: ['Office rent - Sector 62 Noida', 'Co-working space monthly'],
      utilities: ['Electricity bill', 'Internet broadband bill', 'Water supply charges'],
      salaries: ['Developer salary', 'Designer salary', 'Intern stipend', 'Accountant salary'],
      marketing: ['Google Ads campaign', 'Facebook ads', 'LinkedIn premium', 'Business cards printing'],
      supplies: ['Printer cartridges', 'Office stationery', 'Laptop accessories', 'USB drives'],
      travel: ['Client meeting travel', 'Conference trip Delhi', 'Cab charges', 'Metro recharge'],
      food: ['Team lunch', 'Client dinner', 'Office snacks', 'Coffee supplies'],
      software: ['AWS hosting', 'GitHub subscription', 'Figma license', 'Slack premium'],
      maintenance: ['AC servicing', 'Computer repair', 'Plumbing fix', 'UPS battery replacement'],
      insurance: ['Business insurance premium', 'Employee health insurance']
    };
    const amounts = {
      rent: [25000, 35000],
      utilities: [3000, 5000, 2000],
      salaries: [45000, 35000, 15000, 25000],
      marketing: [10000, 8000, 2500, 3000],
      supplies: [2000, 1500, 5000, 800],
      travel: [5000, 12000, 2000, 1500],
      food: [4000, 6000, 2500, 1800],
      software: [8000, 1000, 3500, 700],
      maintenance: [3000, 5000, 1500, 4000],
      insurance: [12000, 20000]
    };

    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
      const date = new Date();
      date.setMonth(date.getMonth() - monthOffset);

      for (const category of categories) {
        const descs = descriptions[category];
        const amts = amounts[category];
        const idx = Math.floor(Math.random() * descs.length);

        expenseData.push({
          user: user._id,
          amount: amts[idx % amts.length] + Math.floor(Math.random() * 2000),
          description: descs[idx],
          category,
          date: new Date(date.getFullYear(), date.getMonth(), Math.floor(Math.random() * 25) + 1),
          paymentMethod: ['cash', 'bank_transfer', 'upi', 'credit_card'][Math.floor(Math.random() * 4)],
          isRecurring: ['rent', 'salaries', 'utilities', 'software'].includes(category),
          recurringFrequency: ['rent', 'salaries', 'utilities', 'software'].includes(category) ? 'monthly' : null
        });
      }
    }

    await Expense.insertMany(expenseData);
    console.log(`  ✅ Created ${expenseData.length} expenses`);

    // Create revenue entries
    console.log('📈 Creating revenue entries...');
    const revenueData = [];
    const clients = [
      { name: 'Infosys Ltd', amount: 150000 },
      { name: 'TCS Digital', amount: 120000 },
      { name: 'Wipro Solutions', amount: 80000 },
      { name: 'Startup Hub', amount: 50000 },
      { name: 'Local Business Client', amount: 30000 }
    ];

    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
      const date = new Date();
      date.setMonth(date.getMonth() - monthOffset);

      for (const client of clients) {
        const variation = Math.floor(Math.random() * 30000) - 10000;
        revenueData.push({
          user: user._id,
          amount: client.amount + variation,
          source: client.name,
          category: 'services',
          date: new Date(date.getFullYear(), date.getMonth(), Math.floor(Math.random() * 25) + 1),
          description: `Monthly service contract - ${client.name}`
        });
      }
    }

    await Revenue.insertMany(revenueData);
    console.log(`  ✅ Created ${revenueData.length} revenue entries`);

    // Create invoices
    console.log('📄 Creating invoices...');
    const invoices = [];
    const invoiceClients = [
      { name: 'Infosys Ltd', email: 'accounts@infosys.com', address: 'Electronic City, Bangalore' },
      { name: 'TCS Digital', email: 'billing@tcs.com', address: 'Rajiv Gandhi IT Park, Chandigarh' },
      { name: 'Startup Hub', email: 'finance@startuphub.in', address: 'Connaught Place, New Delhi' }
    ];

    for (let i = 0; i < invoiceClients.length; i++) {
      const client = invoiceClients[i];
      const items = [
        { description: 'Web Development Services', quantity: 1, rate: 80000, amount: 80000 },
        { description: 'UI/UX Design', quantity: 1, rate: 30000, amount: 30000 },
        { description: 'Server Maintenance', quantity: 1, rate: 15000, amount: 15000 }
      ];
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = subtotal * 0.18;

      invoices.push({
        user: user._id,
        invoiceNumber: `INV-202603-${String(i + 1).padStart(4, '0')}`,
        clientName: client.name,
        clientEmail: client.email,
        clientAddress: client.address,
        items,
        subtotal,
        taxRate: 18,
        taxAmount,
        total: subtotal + taxAmount,
        status: ['paid', 'sent', 'draft'][i],
        issueDate: new Date(),
        dueDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000))
      });
    }

    await Invoice.insertMany(invoices);
    console.log(`  ✅ Created ${invoices.length} invoices`);

    // Create reminders
    console.log('🔔 Creating reminders...');
    const reminders = [
      {
        user: user._id,
        title: 'Office Rent Payment',
        amount: 35000,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        contactName: 'Landlord - Mr. Sharma',
        contactEmail: 'sharma.landlord@gmail.com',
        status: 'pending',
        recurring: true,
        recurringFrequency: 'monthly'
      },
      {
        user: user._id,
        title: 'GST Payment Q4',
        amount: 45000,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        contactName: 'Tax Consultant',
        contactEmail: 'taxconsultant@gmail.com',
        status: 'pending',
        recurring: true,
        recurringFrequency: 'quarterly'
      },
      {
        user: user._id,
        title: 'Infosys Invoice Follow-up',
        amount: 147500,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        contactName: 'Infosys Accounts',
        contactEmail: 'accounts@infosys.com',
        status: 'sent'
      },
      {
        user: user._id,
        title: 'AWS Hosting Renewal',
        amount: 8500,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        contactName: 'AWS Billing',
        status: 'pending',
        recurring: true,
        recurringFrequency: 'monthly'
      }
    ];

    await Reminder.insertMany(reminders);
    console.log(`  ✅ Created ${reminders.length} reminders`);

    console.log('\n🎉 Seed data created successfully!');
    console.log('📧 Test Login: rajesh@finai.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
