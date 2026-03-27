import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('finai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('finai_token');
      localStorage.removeItem('finai_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Dashboard
export const getDashboard = () => API.get('/dashboard');

// Expenses
export const getExpenses = (params) => API.get('/expenses', { params });
export const getExpenseSummary = (params) => API.get('/expenses/summary', { params });
export const getMonthlyExpenses = (params) => API.get('/expenses/monthly', { params });
export const createExpense = (data) => API.post('/expenses', data);
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

// Revenue
export const getRevenues = (params) => API.get('/revenue', { params });
export const createRevenue = (data) => API.post('/revenue', data);
export const updateRevenue = (id, data) => API.put(`/revenue/${id}`, data);
export const deleteRevenue = (id) => API.delete(`/revenue/${id}`);

// Invoices
export const getInvoices = (params) => API.get('/invoices', { params });
export const getInvoice = (id) => API.get(`/invoices/${id}`);
export const createInvoice = (data) => API.post('/invoices', data);
export const updateInvoice = (id, data) => API.put(`/invoices/${id}`, data);
export const deleteInvoice = (id) => API.delete(`/invoices/${id}`);
export const downloadInvoicePDF = (id) => API.get(`/invoices/${id}/pdf`, { responseType: 'blob' });

// Reminders
export const getReminders = (params) => API.get('/reminders', { params });
export const getUpcomingReminders = () => API.get('/reminders/upcoming');
export const createReminder = (data) => API.post('/reminders', data);
export const updateReminder = (id, data) => API.put(`/reminders/${id}`, data);
export const deleteReminder = (id) => API.delete(`/reminders/${id}`);

// Tax
export const getTaxEstimate = (params) => API.get('/tax/estimate', { params });

// AI
export const categorizeExpenseAI = (data) => API.post('/ai/categorize', data);
export const getAIInsights = () => API.post('/ai/insights');
export const getAIPrediction = () => API.post('/ai/predict');
export const getAIAdvice = (data) => API.post('/ai/advice', data);

export default API;
