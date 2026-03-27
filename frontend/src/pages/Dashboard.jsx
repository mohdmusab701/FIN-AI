import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n';
import { getDashboard } from '../api/client';
import StatCard from '../components/StatCard';
import { DollarSign, TrendingDown, TrendingUp, FileText, Bell, AlertTriangle } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#64748b'];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatCurrency = (val) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await getDashboard();
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  if (!data) return null;

  // Prepare monthly chart data
  const revenueMap = {};
  const expenseMap = {};
  data.charts.monthlyRevenue.forEach((r) => {
    const key = `${monthNames[r._id.month - 1]} ${r._id.year}`;
    revenueMap[key] = r.total;
  });
  data.charts.monthlyExpenses.forEach((e) => {
    const key = `${monthNames[e._id.month - 1]} ${e._id.year}`;
    expenseMap[key] = e.total;
  });

  const allMonths = [...new Set([...Object.keys(revenueMap), ...Object.keys(expenseMap)])].sort();
  const trendData = allMonths.map((month) => ({
    month: month.split(' ')[0],
    revenue: revenueMap[month] || 0,
    expenses: expenseMap[month] || 0,
    profit: (revenueMap[month] || 0) - (expenseMap[month] || 0)
  }));

  const pieData = data.charts.expensesByCategory.map((cat) => ({
    name: cat._id.charAt(0).toUpperCase() + cat._id.slice(1),
    value: cat.total
  }));

  const { overview } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('dashboard.title')}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Your financial overview at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.totalRevenue')}
          value={formatCurrency(overview.totalRevenue)}
          icon={TrendingUp}
          color="green"
          trend={overview.revenueChange >= 0 ? 'up' : 'down'}
          trendValue={overview.revenueChange}
        />
        <StatCard
          title={t('dashboard.totalExpenses')}
          value={formatCurrency(overview.totalExpenses)}
          icon={TrendingDown}
          color="red"
          trend={overview.expenseChange >= 0 ? 'up' : 'down'}
          trendValue={overview.expenseChange}
        />
        <StatCard
          title={t('dashboard.netProfit')}
          value={formatCurrency(overview.profit)}
          icon={DollarSign}
          color={overview.profit >= 0 ? 'blue' : 'red'}
        />
        <StatCard
          title={`${t('dashboard.thisMonth')} Profit`}
          value={formatCurrency(overview.thisMonthProfit)}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Alerts */}
      {(data.alerts.overdueInvoices > 0 || data.alerts.upcomingReminders.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.alerts.overdueInvoices > 0 && (
            <div className="glass-card p-4 border-l-4 border-red-500 flex items-center gap-3">
              <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{data.alerts.overdueInvoices} {t('dashboard.overdueInvoices')}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Follow up to collect payments</p>
              </div>
            </div>
          )}
          {data.alerts.pendingInvoices > 0 && (
            <div className="glass-card p-4 border-l-4 border-blue-500 flex items-center gap-3">
              <FileText size={20} className="text-blue-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{data.alerts.pendingInvoices} {t('dashboard.pendingInvoices')}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Awaiting payment</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Trend */}
        <div className="xl:col-span-2 glass-card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('dashboard.monthlyTrends')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={formatCurrency} />
              <Tooltip
                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12 }}
                labelStyle={{ color: 'var(--text-primary)' }}
                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#colorRevenue)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#colorExpenses)" strokeWidth={2} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown Pie */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('dashboard.expenseBreakdown')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12 }}
                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
              />
              <Legend
                layout="vertical"
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Profit/Loss Bar Chart */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Monthly Profit / Loss</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={formatCurrency} />
            <Tooltip
              contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12 }}
              formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
            />
            <Bar dataKey="profit" name="Profit/Loss" radius={[6, 6, 0, 0]}>
              {trendData.map((entry, index) => (
                <Cell key={index} fill={entry.profit >= 0 ? '#22c55e' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions & Upcoming Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('dashboard.recentTransactions')}</h3>
          <div className="space-y-3">
            {data.recent.expenses.slice(0, 5).map((exp) => (
              <div key={exp._id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{exp.description}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{exp.category} • {new Date(exp.date).toLocaleDateString('en-IN')}</p>
                </div>
                <span className="font-semibold text-red-500 text-sm">-₹{exp.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
            {data.recent.revenues.slice(0, 3).map((rev) => (
              <div key={rev._id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{rev.source}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{rev.category} • {new Date(rev.date).toLocaleDateString('en-IN')}</p>
                </div>
                <span className="font-semibold text-emerald-500 text-sm">+₹{rev.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} style={{ color: 'var(--text-primary)' }} />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('dashboard.upcomingReminders')}</h3>
          </div>
          <div className="space-y-3">
            {data.alerts.upcomingReminders.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>No upcoming reminders</p>
            ) : (
              data.alerts.upcomingReminders.map((rem) => (
                <div key={rem._id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{rem.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Due: {new Date(rem.dueDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>₹{rem.amount.toLocaleString('en-IN')}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
