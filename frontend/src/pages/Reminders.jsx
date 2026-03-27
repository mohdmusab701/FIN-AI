import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n';
import { getReminders, createReminder, updateReminder, deleteReminder } from '../api/client';
import { Plus, Edit2, Trash2, X, Bell, Check, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { badge: 'badge-warning', icon: Clock },
  sent: { badge: 'badge-info', icon: Bell },
  paid: { badge: 'badge-success', icon: Check },
  overdue: { badge: 'badge-danger', icon: AlertTriangle }
};

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: '', amount: '', dueDate: '', contactName: '', contactEmail: '',
    recurring: false, recurringFrequency: null, notes: ''
  });
  const { t } = useLanguage();

  useEffect(() => { loadReminders(); }, []);

  const loadReminders = async () => {
    try { const res = await getReminders(); setReminders(res.data); }
    catch { toast.error('Failed to load reminders'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, amount: parseFloat(form.amount) };
      if (editId) { await updateReminder(editId, data); toast.success('Reminder updated'); }
      else { await createReminder(data); toast.success('Reminder created'); }
      resetForm(); loadReminders();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleEdit = (rem) => {
    setEditId(rem._id);
    setForm({
      title: rem.title, amount: rem.amount.toString(), dueDate: rem.dueDate.split('T')[0],
      contactName: rem.contactName || '', contactEmail: rem.contactEmail || '',
      recurring: rem.recurring, recurringFrequency: rem.recurringFrequency, notes: rem.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try { await deleteReminder(id); toast.success('Deleted'); loadReminders(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleStatusChange = async (id, status) => {
    try { await updateReminder(id, { status }); loadReminders(); }
    catch { toast.error('Failed to update'); }
  };

  const resetForm = () => {
    setShowModal(false); setEditId(null);
    setForm({ title: '', amount: '', dueDate: '', contactName: '', contactEmail: '', recurring: false, recurringFrequency: null, notes: '' });
  };

  const isOverdue = (date) => new Date(date) < new Date();
  const daysUntil = (date) => {
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return 'Due today';
    return `${diff} days left`;
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('reminders.title')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Never miss a payment deadline</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> {t('reminders.addReminder')}</button>
      </div>

      {/* Reminder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reminders.length === 0 ? (
          <div className="col-span-full text-center py-16 glass-card">
            <Bell size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No reminders yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create your first payment reminder</p>
          </div>
        ) : reminders.map(rem => {
          const StatusIcon = statusConfig[rem.status]?.icon || Clock;
          return (
            <div key={rem._id} className={`glass-card p-5 border-l-4 ${isOverdue(rem.dueDate) && rem.status !== 'paid' ? 'border-red-500' : rem.status === 'paid' ? 'border-emerald-500' : 'border-blue-500'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StatusIcon size={16} className={rem.status === 'paid' ? 'text-emerald-500' : isOverdue(rem.dueDate) ? 'text-red-500' : 'text-blue-500'} />
                  <select value={rem.status} onChange={(e) => handleStatusChange(rem._id, e.target.value)}
                    className={`badge ${statusConfig[rem.status]?.badge} cursor-pointer border-0 text-xs`}>
                    {['pending', 'sent', 'paid', 'overdue'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(rem)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 dark:hover:bg-blue-900/30"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(rem._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 dark:hover:bg-red-900/30"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{rem.title}</h3>
              <p className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>₹{rem.amount.toLocaleString('en-IN')}</p>
              <div className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <p>📅 {new Date(rem.dueDate).toLocaleDateString('en-IN')} — <span className={isOverdue(rem.dueDate) && rem.status !== 'paid' ? 'text-red-500 font-medium' : ''}>{daysUntil(rem.dueDate)}</span></p>
                {rem.contactName && <p>👤 {rem.contactName}</p>}
                {rem.recurring && <p>🔄 Recurring: {rem.recurringFrequency}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{editId ? 'Edit Reminder' : t('reminders.addReminder')}</h2>
              <button onClick={resetForm} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Title</label>
                <input type="text" className="input-field" placeholder="Office Rent" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Amount (₹)</label>
                  <input type="number" className="input-field" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required min="0" /></div>
                <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Due Date</label>
                  <input type="date" className="input-field" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Contact Name</label>
                  <input type="text" className="input-field" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Contact Email</label>
                  <input type="email" className="input-field" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} /></div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="recur" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="recur" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Recurring payment</label>
                {form.recurring && (
                  <select className="input-field w-40" value={form.recurringFrequency || ''} onChange={(e) => setForm({ ...form, recurringFrequency: e.target.value })}>
                    <option value="">Select</option>{['weekly', 'monthly', 'quarterly', 'yearly'].map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                  </select>
                )}
              </div>
              <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Notes</label>
                <textarea className="input-field" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
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

export default Reminders;
