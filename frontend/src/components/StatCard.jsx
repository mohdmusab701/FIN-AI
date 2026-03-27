import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => {
  const colorMap = {
    blue: { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
    red: { bg: 'from-red-500 to-red-600', light: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
    purple: { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
    orange: { bg: 'from-orange-500 to-orange-600', light: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
  };

  const colors = colorMap[color] || colorMap.blue;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg`}
        >
          {Icon && <Icon size={20} className="text-white" />}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
            <TrendIcon size={14} />
            <span>{Math.abs(trendValue || 0)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{title}</p>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
    </div>
  );
};

export default StatCard;
