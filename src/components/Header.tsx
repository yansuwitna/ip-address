import React from 'react';
import { Menu, Globe } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  title?: string;
  onViewHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, title = 'Dashboard', onViewHome }) => {
  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 flex items-center justify-between bg-white sticky top-0 z-30 font-poppins flex-shrink-0">
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer lg:hidden"
            title="Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="font-extrabold text-xl text-slate-900 tracking-tight leading-none">
          {title}
        </h1>
      </div>

      {onViewHome && (
        <button
          onClick={onViewHome}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>Lihat Halaman Depan (Home)</span>
        </button>
      )}
    </header>
  );
};

