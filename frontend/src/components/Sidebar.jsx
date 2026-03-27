import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n';
import {
  LayoutDashboard, Receipt, DollarSign, FileText,
  Bell, Calculator, Brain, LogOut, ChevronLeft, ChevronRight, TrendingUp
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, key: 'nav.dashboard' },
  { path: '/expenses', icon: Receipt, key: 'nav.expenses' },
  { path: '/revenue', icon: TrendingUp, key: 'nav.revenue' },
  { path: '/invoices', icon: FileText, key: 'nav.invoices' },
  { path: '/reminders', icon: Bell, key: 'nav.reminders' },
  { path: '/tax', icon: Calculator, key: 'nav.tax' },
  { path: '/ai-insights', icon: Brain, key: 'nav.aiInsights' },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { logout, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
      style={{ background: 'var(--sidebar-bg)', color: 'var(--sidebar-text)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <DollarSign size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold text-white">FinAI</h1>
            <p className="text-[10px] text-slate-400 -mt-0.5">{t('app.tagline')}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon size={20} className="flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium animate-fade-in">{t(item.key)}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-white/10 p-3 space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2 animate-fade-in">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.businessName || user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">{t('nav.logout')}</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
};

export default Sidebar;
