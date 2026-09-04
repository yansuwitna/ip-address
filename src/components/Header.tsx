import React from 'react';
import { Menu, Globe, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  title?: string;
  onViewHome?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  title = 'Dashboard', 
  onViewHome,
  theme = 'light',
  onToggleTheme 
}) => {
  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-30 font-poppins flex-shrink-0">
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer lg:hidden"
            title="Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="font-extrabold text-xl text-slate-900 dark:text-slate-100 tracking-tight leading-none">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2.5">
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            title={`Ganti tema (${theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'})`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Mode Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Mode Gelap</span>
              </>
            )}
          </button>
        )}

        {onViewHome && (
          <button
            onClick={onViewHome}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Lihat Halaman Depan (Home)</span>
          </button>
        )}
      </div>
    </header>
  );
};
