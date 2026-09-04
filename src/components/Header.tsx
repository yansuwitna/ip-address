import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 flex items-center bg-white sticky top-0 z-30 font-poppins flex-shrink-0">
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
          Dashboard
        </h1>
      </div>
    </header>
  );
};
