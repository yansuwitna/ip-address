import React, { useRef } from 'react';
import { 
  Network, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  Search, 
  Layers
} from 'lucide-react';
import { IPGroup, IPAllocation } from '../types/ipam';
import { exportBackupJson, parseImportJson } from '../utils/exportImport';

interface HeaderProps {
  groups: IPGroup[];
  allocations: IPAllocation[];
  onAddGroup: () => void;
  onResetDemo: () => void;
  onImportData: (groups: IPGroup[], allocations: IPAllocation[]) => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  groups,
  allocations,
  onAddGroup,
  onResetDemo,
  onImportData,
  globalSearch,
  setGlobalSearch
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
  const totalReserved = allocations.filter(a => a.status === 'reserved' || a.status === 'dhcp').length;

  return (
    <header className="bg-slate-800/90 backdrop-blur border-b border-slate-700/80 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20 text-white flex items-center justify-center">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-white">NetIPAM</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                IP Address & Subnet Management System
              </p>
            </div>
          </div>

          {/* Global Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Cari IP, Hostname, MAC, atau PIC..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick stats pill */}
            <div className="hidden lg:flex items-center space-x-3 px-3 py-1.5 bg-slate-900/60 rounded-lg border border-slate-700/60 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <strong>{groups.length}</strong> Subnet
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <strong>{totalUsed}</strong> Terpakai
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <strong>{totalReserved}</strong> Reservasi
              </span>
            </div>

            {/* Backup & Restore Dropdown/Buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => exportBackupJson(groups, allocations)}
                title="Backup Seluruh Database (JSON)"
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/70 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                title="Restore / Impor Backup (JSON)"
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/70 rounded-lg transition-colors"
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
                title="Muat Ulang Demo Data"
                className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-700/70 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Add Group Button */}
            <button
              onClick={onAddGroup}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium shadow-md shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Grup IP</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
