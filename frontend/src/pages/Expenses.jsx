import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../api/client';
import { Plus, Search, Edit2, Trash2, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = ['rent', 'utilities', 'salaries', 'marketing', 'supplies', 'travel', 'food', 'insurance', 'maintenance', 'software', 'taxes', 'miscellaneous'];
const paymentMethods = ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'other'];

const categoryColors = {
  rent: '#3b82f6', utilities: '#f59e0b', salaries: '#8b5cf6', marketing: '#ec4899',
  supplies: '#06b6d4', travel: '#f97316', food: '#22c55e', insurance: '#6366f1',
  maintenance: '#14b8a6', software: '#a855f7', taxes: '#ef4444', miscellaneous: '#64748b'
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [form, setForm] = useState({
    amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash', isRecurring: false, notes: ''
  });
  const { t } = useLanguage();

  useEffect(() => { loadExpenses(); }, [filterCategory]);

  const loadExpenses = async () => {
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      const res = await getExpenses(params);
      setExpenses(res.data.expenses);
    } catch { toast.error('Failed to load expenses'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateExpense(editId, { ...form, amount: parseFloat(form.amount) });
        toast.success('Expense updated');
      } else {
        await createExpense({ ...form, amount: parseFloat(form.amount) });
        toast.success('Expense added with AI categorization!');
      }
      resetForm();
      loadExpenses();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving expense'); }
  };

  const handleEdit = (expense) => {
    setEditId(expense._id);
    setForm({
      amount: expense.amount.toString(),
      description: expense.description,
      category: expense.category,
      date: expense.date.split('T')[0],
      paymentMethod: expense.paymentMethod,
      isRecurring: expense.isRecurring,
      notes: expense.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('expenses.deleteConfirm'))) return;
    try {
      await deleteExpense(id);
      toast.success('Expense deleted');
      loadExpenses();
    } catch { toast.error('Failed to delete'); }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditId(null);
    setForm({ amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'cash', isRecurring: false, notes: '' });
  };

  const filtered = expenses.filter(exp =>
    exp.description.toLowerCase().includes(search.toLowerCase()) ||
    exp.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('expenses.title')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Track and manage your business expenses</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> {t('expenses.addExpense')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input type="text" className="input-field pl-11" placeholder={`${t('common.search')}...`}
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <select className="input-field pl-11 min-w-[180px]" value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('expenses.date')}</th>
                <th>{t('expenses.description')}</th>
                <th>{t('expenses.category')}</th>
                <th>{t('expenses.amount')}</th>
                <th>{t('expenses.paymentMethod')}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>{t('expenses.noExpenses')}</td></tr>
              ) : filtered.map(exp => (
                <tr key={exp._id}>
                  <td className="whitespace-nowrap">{new Date(exp.date).toLocaleDateString('en-IN')}</td>
                  <td>
                    <p className="font-medium">{exp.description}</p>
                    {exp.isRecurring && <span className="text-xs text-blue-500">↻ Recurring</span>}
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: categoryColors[exp.category] + '20',
                      color: categoryColors[exp.category]
                    }}>
                      {exp.category}
                    </span>
                  </td>
                  <td className="font-semibold">₹{exp.amount.toLocaleString('en-IN')}</td>
                  <td className="capitalize">{exp.paymentMethod.replace('_', ' ')}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(exp)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors dark:hover:bg-blue-900/30"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(exp._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors dark:hover:bg-red-900/30"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {editId ? t('expenses.editExpense') : t('expenses.addExpense')}
              </h2>
              <button onClick={resetForm} className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('expenses.amount')}</label>
                  <input type="number" className="input-field" placeholder="5000" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })} required min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('expenses.date')}</label>
                  <input type="date" className="input-field" value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('expenses.description')}</label>
                <input type="text" className="input-field" placeholder="Office electricity bill..." value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                {!editId && <p className="text-xs mt-1 text-blue-500">💡 AI will auto-categorize based on your description</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('expenses.category')}</label>
                  <select className="input-field" value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Auto (AI)</option>
                    {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('expenses.paymentMethod')}</label>
                  <select className="input-field" value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                    {paymentMethods.map(m => <option key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Notes</label>
                <textarea className="input-field" rows={2} placeholder="Optional notes..." value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="recurring" checked={form.isRecurring}
                  onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} className="w-4 h-4 rounded" />
                <label htmlFor="recurring" className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('expenses.recurring')}</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">{t('common.save')}</button>
                <button type="button" onClick={resetForm} className="btn-secondary">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
