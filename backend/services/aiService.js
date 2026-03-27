const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Helper: send prompt to Gemini and get text response
async function askGemini(prompt) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// Categorize an expense description into a category
async function categorizeExpense(description) {
  const prompt = `You are a financial expense categorizer. Categorize the following expense into ONE of these categories: Food, Transport, Utilities, Rent, Salary, Marketing, Office Supplies, Software, Insurance, Taxes, Entertainment, Travel, Maintenance, Other.

Expense description: "${description}"

Reply with ONLY the category name, nothing else.`;

  const text = await askGemini(prompt);
  return text.trim();
}

// Generate financial insights from aggregated data
async function generateInsights(financialData) {
  const prompt = `You are an expert financial advisor for small businesses. Analyze the following financial data and provide actionable insights.

Business: ${financialData.businessName || "N/A"} (${financialData.businessType || "N/A"})
Period: ${financialData.period}
Total Revenue: ₹${financialData.totalRevenue}
Total Expenses: ₹${financialData.totalExpenses}
Profit: ₹${financialData.profit}
Profit Margin: ${financialData.profitMargin}
Top Expense Categories: ${JSON.stringify(financialData.topExpenseCategories)}

Provide your response as valid JSON with this exact structure:
{
  "summary": "Brief overall financial health summary (2-3 sentences)",
  "tips": [
    "Cost-cutting tip 1",
    "Cost-cutting tip 2"
  ],
  "warnings": [
    "Financial warning or risk 1"
  ],
  "opportunities": [
    "Growth opportunity 1",
    "Growth opportunity 2"
  ]
}

Reply with ONLY the JSON, no markdown fences or extra text.`;

  const text = await askGemini(prompt);
  try {
    return JSON.parse(text.replace(/```json\n?|```\n?/g, "").trim());
  } catch {
    return {
      summary: text.trim(),
      tips: [],
      warnings: [],
      opportunities: [],
    };
  }
}

// Predict future cash flow based on historical data
async function predictCashFlow(historicalData) {
  const prompt = `You are an expert financial analyst. Based on the following historical data, predict the cash flow for the next 3 months.

Business: ${historicalData.businessName || "N/A"} (${historicalData.businessType || "N/A"})
Period analyzed: ${historicalData.period}
Monthly Expenses: ${JSON.stringify(historicalData.monthlyExpenses)}
Monthly Revenue: ${JSON.stringify(historicalData.monthlyRevenue)}

Provide your response as valid JSON with this structure:
{
  "predictions": [
    { "month": "Month Year", "predictedRevenue": 0, "predictedExpenses": 0, "predictedProfit": 0 }
  ],
  "trend": "improving|stable|declining",
  "confidence": "high|medium|low",
  "analysis": "Brief explanation of the prediction"
}

Reply with ONLY the JSON, no markdown fences or extra text.`;

  const text = await askGemini(prompt);
  try {
    return JSON.parse(text.replace(/```json\n?|```\n?/g, "").trim());
  } catch {
    return {
      predictions: [],
      trend: "stable",
      confidence: "low",
      analysis: text.trim(),
    };
  }
}

// Get personalized financial advice
async function getFinancialAdvice(businessProfile, question) {
  const prompt = `You are a friendly and expert financial advisor for small businesses in India.

Business Profile:
- Name: ${businessProfile.businessName || "N/A"}
- Type: ${businessProfile.businessType || "N/A"}
- Monthly Revenue: ₹${businessProfile.monthlyRevenue || "N/A"}

User's Question: "${question}"

Provide clear, practical, and actionable financial advice. Keep the response concise (under 300 words).`;

  return await askGemini(prompt);
}

module.exports = {
  categorizeExpense,
  generateInsights,
  predictCashFlow,
  getFinancialAdvice,
};