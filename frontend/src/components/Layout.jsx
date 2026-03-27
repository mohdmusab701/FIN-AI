import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n';
import { Sun, Moon, Globe, Menu, X } from 'lucide-react';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="page-container flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Sidebar - mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed z-50">
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        }`}
      >
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8 py-4"
          style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            backdropFilter: 'blur(12px)'
          }}
        >
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: 'var(--text-primary)' }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <button
              onClick={() => changeLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all hover:scale-105"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              title={language === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
            >
              <Globe size={16} />
              <span className="text-xs font-semibold uppercase">{language}</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl transition-all hover:scale-105"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 min-h-[calc(100vh-65px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
