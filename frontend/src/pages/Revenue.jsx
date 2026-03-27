import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n';
import { getRevenues, createRevenue, updateRevenue, deleteRevenue } from '../api/client';
import { Plus, Edit2, Trash2, X, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const revenueCategories = ['sales', 'services', 'investments', 'grants', 'other'];

const Revenue = () => {
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ amount: '', source: '', category: 'sales', date: new Date().toISOString().split('T')[0], description: '' });
  const { t } = useLanguage();

  useEffect(() => { loadRevenues(); }, []);

  const loadRevenues = async () => {
    try {
      const res = await getRevenues();
      setRevenues(res.data.revenues);
    } catch { toast.error('Failed to load revenue'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateRevenue(editId, { ...form, amount: parseFloat(form.amount) });
        toast.success('Revenue updated');
      } else {
        await createRevenue({ ...form, amount: parseFloat(form.amount) });
        toast.success('Revenue added');
      }
      resetForm();
      loadRevenues();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving revenue'); }
  };

  const handleEdit = (rev) => {
    setEditId(rev._id);
    setForm({ amount: rev.amount.toString(), source: rev.source, category: rev.category, date: rev.date.split('T')[0], description: rev.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this revenue entry?')) return;
    try { await deleteRevenue(id); toast.success('Revenue deleted'); loadRevenues(); } catch { toast.error('Failed to delete'); }
  };

  const resetForm = () => {
    setShowModal(false); setEditId(null);
    setForm({ amount: '', source: '', category: 'sales', date: new Date().toISOString().split('T')[0], description: '' });
  };

  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('nav.revenue')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Track your income sources</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Revenue</button>
      </div>

      {/* Total */}
      <div className="glass-card p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center"><TrendingUp size={22} className="text-white" /></div>
        <div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Revenue</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Source</th><th>Category</th><th>Amount</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {revenues.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No revenue entries yet</td></tr>
              ) : revenues.map(rev => (
                <tr key={rev._id}>
                  <td className="whitespace-nowrap">{new Date(rev.date).toLocaleDateString('en-IN')}</td>
                  <td className="font-medium">{rev.source}</td>
                  <td><span className="badge badge-success capitalize">{rev.category}</span></td>
                  <td className="font-semibold text-emerald-500">+₹{rev.amount.toLocaleString('en-IN')}</td>
                  <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{rev.description || '-'}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(rev)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 dark:hover:bg-blue-900/30"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(rev._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 dark:hover:bg-red-900/30"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{editId ? 'Edit Revenue' : 'Add Revenue'}</h2>
              <button onClick={resetForm} className="p-2" style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Amount (₹)</label>
                  <input type="number" className="input-field" placeholder="100000" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })} required min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date</label>
                  <input type="date" className="input-field" value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Source</label>
                <input type="text" className="input-field" placeholder="Client name or source" value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category</label>
                <select className="input-field" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {revenueCategories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea className="input-field" rows={2} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
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

export default Revenue;
