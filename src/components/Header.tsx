import React, { useRef } from 'react';
import { 
  Menu,
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  Search, 
  Layers,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { IPGroup, IPAllocation } from '../types/ipam';
import { User } from '../types/auth';
import { exportBackupJson, parseImportJson } from '../utils/exportImport';

interface HeaderProps {
  groups: IPGroup[];
  allocations: IPAllocation[];
  currentUser: User;
  onLogout: () => void;
  onAddGroup: () => void;
  onAddAllocation: () => void;
  onResetDemo: () => void;
  onImportData: (groups: IPGroup[], allocations: IPAllocation[]) => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  onToggleSidebar: () => void;
  currentTabTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  groups,
  allocations,
  currentUser,
  onLogout,
  onAddGroup,
  onAddAllocation,
  onResetDemo,
  onImportData,
  globalSearch,
  setGlobalSearch,
  onToggleSidebar,
  currentTabTitle
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseImportJson(content);
        if (window.confirm(`Impor berhasil diverifikasi. Lanjutkan memuat ${parsed.groups.length} Grup dan ${parsed.allocations.length} Alokasi IP?`)) {
          onImportData(parsed.groups, parsed.allocations);
        }
      } catch (err: any) {
        alert('Gagal mengimpor file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const totalUsed = allocations.filter(a => a.status === 'used').length;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs font-poppins">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Hamburger & Current Page Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer lg:hidden"
              title="Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold hidden sm:inline">NetIPAM /</span>
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  {currentTabTitle}
                </h1>
              </div>
            </div>
          </div>

          {/* Center: Global Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Cari IP, Hostname, MAC, PIC..."
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right: Quick Tools & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Quick Metrics Pill */}
            <div className="hidden xl:flex items-center space-x-3 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span><strong>{groups.length}</strong> Subnet</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span><strong>{totalUsed}</strong> IP Terpakai</span>
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-1 border-r border-slate-200 pr-2">
              <button
                onClick={() => exportBackupJson(groups, allocations)}
                title="Backup Seluruh Database (JSON)"
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                title="Restore Backup (JSON)"
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />

              <button
                onClick={onResetDemo}
                title="Muat Data Demo"
                className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={onAddAllocation}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Alokasikan IP</span>
            </button>

            {/* User Avatar & Logout */}
            <div className="flex items-center pl-1 sm:pl-2 space-x-2">
              <div className="flex items-center gap-2">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-blue-300 ring-2 ring-blue-50 shadow-2xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-300">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="hidden 2xl:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold capitalize flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{currentUser.role}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('Keluar dari sesi aplikasi?')) {
                    onLogout();
                  }
                }}
                title="Keluar (Logout)"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
