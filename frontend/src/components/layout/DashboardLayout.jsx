import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import useLocalStorage from '../../hooks/useLocalStorage';

export default function DashboardLayout({ title, subtitle, children }) {
  const [theme, setTheme] = useLocalStorage('sg_theme', 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const themeButton = (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-sg-line bg-slate-200 dark:bg-[#04142f] px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 transition hover:border-sg-blue dark:hover:border-sg-green dark:hover:text-sg-green"
      title="Cambiar modo"
    >
      {theme === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-sg-bg dark:text-white transition-colors duration-200">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Header title={title} subtitle={subtitle} action={themeButton} />
          <div className="grid-bg min-h-[calc(100vh-65px)] p-3 md:p-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}