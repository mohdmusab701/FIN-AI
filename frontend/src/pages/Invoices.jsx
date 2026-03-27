import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, downloadInvoicePDF } from '../api/client';
import { Plus, Download, Eye, Trash2, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const statusBadge = {
  draft: 'badge-neutral', sent: 'badge-info', paid: 'badge-success', overdue: 'badge-danger', cancelled: 'badge-neutral'
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [form, setForm] = useState({
    clientName: '', clientEmail: '', clientAddress: '', taxRate: 18,
    dueDate: '', notes: '',
    items: [{ description: '', quantity: 1, rate: 0 }]
  });
  const { t } = useLanguage();

  useEffect(() => { loadInvoices(); }, []);

  const loadInvoices = async () => {
    try { const res = await getInvoices(); setInvoices(res.data.invoices); }
    catch { toast.error('Failed to load invoices'); }
    finally { setLoading(false); }
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', quantity: 1, rate: 0 }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, field, value) => {
    const items = [...form.items];
    items[i][field] = field === 'quantity' || field === 'rate' ? parseFloat(value) || 0 : value;
    setForm({ ...form, items });
  };

  const subtotal = form.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = (subtotal * form.taxRate) / 100;
  const total = subtotal + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createInvoice({ ...form, items: form.items.filter(i => i.description) });
      toast.success('Invoice created!');
      resetForm();
      loadInvoices();
    } catch (err) { toast.error(err.response?.data?.message || 'Error creating invoice'); }
  };

  const handleDownload = async (id, invoiceNumber) => {
    try {
      const res = await downloadInvoicePDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoiceNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('Failed to generate PDF'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateInvoice(id, { status });
      toast.success(`Invoice marked as ${status}`);
      loadInvoices();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try { await deleteInvoice(id); toast.success('Invoice deleted'); loadInvoices(); }
    catch { toast.error('Failed to delete'); }
  };

  const resetForm = () => {
    setShowModal(false);
    setForm({ clientName: '', clientEmail: '', clientAddress: '', taxRate: 18, dueDate: '', notes: '', items: [{ description: '', quantity: 1, rate: 0 }] });
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('invoices.title')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Create and manage professional invoices</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> {t('invoices.createInvoice')}</button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Invoice #</th><th>Client</th><th>Amount</th><th>Status</th><th>Due Date</th><th>Actions</th></tr></thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No invoices yet</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv._id}>
                  <td className="font-mono text-sm">{inv.invoiceNumber}</td>
                  <td>
                    <p className="font-medium">{inv.clientName}</p>
                    {inv.clientEmail && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{inv.clientEmail}</p>}
                  </td>
                  <td className="font-semibold">₹{inv.total.toLocaleString('en-IN')}</td>
                  <td>
                    <select className={`badge ${statusBadge[inv.status]} cursor-pointer border-0`}
                      value={inv.status} onChange={(e) => handleStatusChange(inv._id, e.target.value)}>
                      {['draft', 'sent', 'paid', 'overdue', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="whitespace-nowrap">{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setViewInvoice(inv)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 dark:hover:bg-blue-900/30" title="View"><Eye size={16} /></button>
                      <button onClick={() => handleDownload(inv._id, inv.invoiceNumber)} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-500 dark:hover:bg-emerald-900/30" title="Download PDF"><Download size={16} /></button>
                      <button onClick={() => handleDelete(inv._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 dark:hover:bg-red-900/30" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Invoice Modal */}
      {viewInvoice && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setViewInvoice(null)}>
          <div className="modal-content max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-blue-500" />
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{viewInvoice.invoiceNumber}</h2>
                  <span className={`badge ${statusBadge[viewInvoice.status]}`}>{viewInvoice.status}</span>
                </div>
              </div>
              <button onClick={() => setViewInvoice(null)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="font-medium" style={{ color: 'var(--text-secondary)' }}>Client</p><p style={{ color: 'var(--text-primary)' }}>{viewInvoice.clientName}</p></div>
                <div><p className="font-medium" style={{ color: 'var(--text-secondary)' }}>Due Date</p><p style={{ color: 'var(--text-primary)' }}>{new Date(viewInvoice.dueDate).toLocaleDateString('en-IN')}</p></div>
              </div>
              <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                <table className="w-full text-sm">
                  <thead><tr style={{ background: 'var(--bg-tertiary)' }}><th className="p-3 text-left">Item</th><th className="p-3 text-right">Qty</th><th className="p-3 text-right">Rate</th><th className="p-3 text-right">Amount</th></tr></thead>
                  <tbody>
                    {viewInvoice.items.map((item, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border-color)' }}>
                        <td className="p-3">{item.description}</td><td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">₹{item.rate.toLocaleString('en-IN')}</td><td className="p-3 text-right font-medium">₹{item.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-2 text-right">
                <p style={{ color: 'var(--text-secondary)' }}>Subtotal: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>₹{viewInvoice.subtotal.toLocaleString('en-IN')}</span></p>
                <p style={{ color: 'var(--text-secondary)' }}>Tax ({viewInvoice.taxRate}%): <span className="font-medium" style={{ color: 'var(--text-primary)' }}>₹{viewInvoice.taxAmount.toLocaleString('en-IN')}</span></p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Total: ₹{viewInvoice.total.toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => handleDownload(viewInvoice._id, viewInvoice.invoiceNumber)} className="btn-primary w-full flex items-center justify-center gap-2">
                <Download size={18} /> {t('invoices.downloadPDF')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div className="modal-content max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('invoices.createInvoice')}</h2>
              <button onClick={resetForm} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('invoices.clientName')}</label>
                  <input type="text" className="input-field" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required /></div>
                <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('invoices.clientEmail')}</label>
                  <input type="email" className="input-field" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('invoices.dueDate')}</label>
                  <input type="date" className="input-field" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Client Address</label>
                <input type="text" className="input-field" value={form.clientAddress} onChange={(e) => setForm({ ...form, clientAddress: e.target.value })} /></div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Items</label>
                  <button type="button" onClick={addItem} className="text-blue-500 text-sm font-medium hover:text-blue-600">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="text" className="input-field flex-1" placeholder="Description" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} />
                      <input type="number" className="input-field w-20" placeholder="Qty" min={1} value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} />
                      <input type="number" className="input-field w-28" placeholder="Rate ₹" min={0} value={item.rate} onChange={(e) => updateItem(i, 'rate', e.target.value)} />
                      <span className="text-sm font-medium w-24 text-right" style={{ color: 'var(--text-primary)' }}>₹{(item.quantity * item.rate).toLocaleString('en-IN')}</span>
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tax Rate (%)</label>
                  <input type="number" className="input-field" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })} min={0} />
                </div>
                <div className="text-right space-y-1 pt-5">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Subtotal: ₹{subtotal.toLocaleString('en-IN')}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tax: ₹{taxAmount.toLocaleString('en-IN')}</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Total: ₹{total.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Notes</label>
                <textarea className="input-field" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Create Invoice</button>
                <button type="button" onClick={resetForm} className="btn-secondary">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
