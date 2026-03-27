import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n';
import { getTaxEstimate } from '../api/client';
import StatCard from '../components/StatCard';
import { Calculator, Receipt, Percent, TrendingUp, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';

const formatCurrency = (val) => `₹${Math.round(val).toLocaleString('en-IN')}`;

const TaxEstimation = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => { loadTax(); }, []);

  const loadTax = async () => {
    try { const res = await getTaxEstimate(); setData(res.data); }
    catch { toast.error('Failed to load tax data'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="spinner" /></div>;
  if (!data) return null;

  const { actual, projected } = data;

  const breakdownData = (actual.expenseBreakdown || []).map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    amount: item.total
  }));

  const taxSummary = [
    { label: t('tax.taxableIncome'), value: formatCurrency(actual.taxableIncome) },
    { label: 'Income Tax', value: formatCurrency(actual.incomeTax) },
    { label: 'Health & Education Cess (4%)', value: formatCurrency(actual.cess) },
    { label: t('tax.estimatedTax'), value: formatCurrency(actual.totalTax), highlight: true },
    { label: t('tax.gstPayable'), value: formatCurrency(actual.gstPayable) },
    { label: t('tax.effectiveRate'), value: `${actual.totalTax > 0 ? data.effectiveTaxRate : 0}%` },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('tax.title')}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Financial Year: {new Date(data.financialYear.start).toLocaleDateString('en-IN')} — {new Date(data.financialYear.end).toLocaleDateString('en-IN')}
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatCurrency(actual.totalRevenue)} icon={TrendingUp} color="green" />
        <StatCard title="Total Expenses" value={formatCurrency(actual.totalExpenses)} icon={Receipt} color="red" />
        <StatCard title={t('tax.estimatedTax')} value={formatCurrency(actual.totalTax)} icon={Calculator} color="purple" />
        <StatCard title={t('tax.quarterly')} value={formatCurrency(data.quarterlyAdvanceTax)} icon={IndianRupee} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tax Breakdown */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Tax Breakdown</h3>
          <div className="space-y-3">
            {taxSummary.map((item, i) => (
              <div key={i} className={`flex justify-between items-center py-2 ${item.highlight ? 'border-t-2 pt-3 mt-2' : 'border-b'}`}
                style={{ borderColor: 'var(--border-color)' }}>
                <span className={`text-sm ${item.highlight ? 'font-bold text-base' : ''}`} style={{ color: item.highlight ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {item.label}
                </span>
                <span className={`font-semibold ${item.highlight ? 'text-lg text-blue-500' : ''}`} style={{ color: item.highlight ? undefined : 'var(--text-primary)' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Projected Annual */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('tax.projected')}</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Projected Annual Revenue</p>
              <p className="text-2xl font-bold text-emerald-500">{formatCurrency(projected.annualRevenue)}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Projected Annual Expenses</p>
              <p className="text-2xl font-bold text-red-500">{formatCurrency(projected.annualExpenses)}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Projected Annual Tax</p>
              <p className="text-2xl font-bold text-blue-500">{formatCurrency(projected.totalTax)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deductible Expenses Chart */}
      {breakdownData.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Deductible Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={breakdownData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12 }}
                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
              />
              <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                {breakdownData.map((_, i) => (
                  <Cell key={i} fill={['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1', '#84cc16', '#64748b'][i % 12]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Info Note */}
      <div className="glass-card p-4 border-l-4 border-blue-500">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          💡 <strong>Note:</strong> Tax estimates are based on Indian New Tax Regime (FY 2024-25). Actual tax liability may vary based on deductions, exemptions, and professional advice. Consult a CA for accurate filing.
        </p>
      </div>
    </div>
  );
};

export default TaxEstimation;
