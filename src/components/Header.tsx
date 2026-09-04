import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs font-poppins h-16 flex items-center px-4 sm:px-6 lg:px-8">
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
        <h1 className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
          Dashboard
        </h1>
      </div>
    </header>
  );
};
