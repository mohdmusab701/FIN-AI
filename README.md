# FinAI — AI-Powered Financial Assistant

A full-stack fintech web application for small businesses, powered by AI. Track expenses, generate invoices, get intelligent financial insights, and manage your business finances with ease.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen) ![AI](https://img.shields.io/badge/OpenAI-GPT--3.5-purple)

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Authentication | JWT-based login/signup with bcrypt password hashing |
| 📊 Dashboard | Revenue, expenses, profit/loss with interactive charts |
| 💰 Expense Tracker | CRUD with AI auto-categorization (OpenAI) |
| 📈 Revenue Tracking | Track income sources and payment history |
| 📄 Invoice Generator | Create, manage, and download professional PDF invoices |
| 🔔 Payment Reminders | Never miss a payment deadline |
| 🧮 Tax Estimation | Indian tax slab calculation, GST, quarterly advance tax |
| 🤖 AI Insights | Financial advice, cost-cutting tips, cash flow predictions |
| 🎤 Voice Input | Ask AI questions using your voice (Web Speech API) |
| 🌙 Dark/Light Mode | Theme toggle with localStorage persistence |
| 🌍 Multi-language | English & Hindi support |
| 📱 Responsive | Mobile-first design with collapsible sidebar |

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS v4
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **AI:** OpenAI GPT-3.5 API
- **Charts:** Recharts
- **PDF:** PDFKit (server-side)
- **Icons:** Lucide React

## 📁 Project Structure

```
AI PFA/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── middleware/auth.js         # JWT authentication
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── Revenue.js
│   │   ├── Invoice.js
│   │   └── Reminder.js
│   ├── routes/                   # API route handlers
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── revenue.js
│   │   ├── invoices.js
│   │   ├── reminders.js
│   │   ├── dashboard.js
│   │   ├── tax.js
│   │   └── ai.js
│   ├── services/
│   │   ├── aiService.js          # OpenAI integration
│   │   └── pdfService.js         # PDF generation
│   ├── seed/seedData.js          # Sample data seeder
│   ├── server.js                 # Express entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.js         # Axios API client
│   │   ├── context/              # Auth & Theme providers
│   │   ├── i18n/                 # Translations (EN/HI)
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Page components
│   │   ├── App.jsx               # Router & providers
│   │   ├── main.jsx              # Entry point
│   │   └── index.css             # Design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🚀 Setup Guide

### Prerequisites

- **Node.js** v18+ → [Download](https://nodejs.org)
- **MongoDB** running locally or [MongoDB Atlas](https://www.mongodb.com/atlas)
- **OpenAI API Key** → [Get one here](https://platform.openai.com/api-keys)

### Step 1: Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment

**Backend** — Copy `.env.example` to `.env` and set your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finai
JWT_SECRET=your_strong_secret_key
OPENAI_API_KEY=sk-your-openai-api-key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend** — The `.env` file is pre-configured:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Seed Sample Data

```bash
cd backend
npm run seed
```

This creates a test user with 6 months of realistic financial data:
- **Email:** `rajesh@finai.com`
- **Password:** `password123`

### Step 4: Start the Application

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

## 📡 API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/dashboard` | Dashboard analytics |
| GET/POST/PUT/DELETE | `/api/expenses` | Expense CRUD |
| GET | `/api/expenses/summary` | Category breakdown |
| GET/POST/PUT/DELETE | `/api/revenue` | Revenue CRUD |
| GET/POST/PUT/DELETE | `/api/invoices` | Invoice CRUD |
| GET | `/api/invoices/:id/pdf` | Download invoice PDF |
| GET/POST/PUT/DELETE | `/api/reminders` | Reminder CRUD |
| GET | `/api/reminders/upcoming` | Next 7 days |
| GET | `/api/tax/estimate` | Tax estimation |
| POST | `/api/ai/categorize` | AI expense categorization |
| POST | `/api/ai/insights` | Financial insights |
| POST | `/api/ai/predict` | Cash flow prediction |
| POST | `/api/ai/advice` | Personalized advice |

## 🧪 Test Credentials

```
Email: rajesh@finai.com
Password: password123
Business: Kumar Tech Solutions (Technology)
```

## 📝 License

MIT — Built for educational purposes.
