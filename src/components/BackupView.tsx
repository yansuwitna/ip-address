import React, { useRef } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  FileSpreadsheet, 
  FileJson, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { IPGroup, IPAllocation } from '../types/ipam';
import { exportBackupJson, parseImportJson, exportToCsv } from '../utils/exportImport';

interface BackupViewProps {
  groups: IPGroup[];
  allocations: IPAllocation[];
  onImportData: (groups: IPGroup[], allocations: IPAllocation[]) => void;
  onResetDemo: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  groups,
  allocations,
  onImportData,
  onResetDemo
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
        if (window.confirm(`Validasi berhasil: Ditemukan ${parsed.groups.length} Grup IP dan ${parsed.allocations.length} Alokasi Host. Lanjutkan impor?`)) {
          onImportData(parsed.groups, parsed.allocations);
          alert('Data berhasil diimpor!');
        }
      } catch (err: any) {
        alert('Gagal mengimpor file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Pusat Cadangan & Manajemen Data
            </h2>
            <p className="text-xs text-slate-500">
              Unduh salinan cadangan database atau pulihkan data dari file JSON/CSV.
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Backup JSON */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Cadangan Lengkap (JSON)
              </h3>
              <p className="text-xs text-slate-500">
                Ekspor seluruh konfigurasi {groups.length} grup dan {allocations.length} data IP.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Format JSON menyimpan seluruh metadata lengkap termasuk status ping, alokasi host, dan konfigurasi CIDR untuk migrasi atau pemulihan darurat.
          </p>

          <button
            onClick={() => exportBackupJson(groups, allocations)}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Cadangan JSON</span>
          </button>
        </div>

        {/* Restore JSON */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Pulihkan Cadangan (Restore)
              </h3>
              <p className="text-xs text-slate-500">
                Impor file cadangan JSON yang telah disimpan sebelumnya.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Pilih berkas JSON cadangan dari komputer Anda. Sistem akan memvalidasi skema data sebelum menimpa konfigurasi saat ini.
          </p>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Pilih File Backup JSON</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
        </div>

      </div>

      {/* CSV Export by Group */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Ekspor Laporan Spreadsheet (CSV)
            </h3>
            <p className="text-xs text-slate-500">
              Unduh data inventaris IP per grup subnet untuk dibuka di Microsoft Excel
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map(group => {
            const groupAllocs = allocations.filter(a => a.groupId === group.id);
            return (
              <div 
                key={group.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-xs text-slate-800 truncate">
                    {group.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {group.cidr} • {groupAllocs.length} Alokasi
                  </div>
                </div>

                <button
                  onClick={() => exportToCsv(group, groupAllocs)}
                  title={`Unduh CSV ${group.name}`}
                  className="p-2 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Danger Zone: Reset Demo */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Reset ke Data Demo Awal</span>
          </h3>
          <p className="text-xs text-rose-700 mt-1">
            Mengembalikan seluruh database ke sampel standar (LAN Kantor, Server DMZ, dan CCTV). Seluruh perubahan Anda akan ditimpa.
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('PERINGATAN: Seluruh data kustom Anda akan di-reset ke sampel awal. Lanjutkan?')) {
              onResetDemo();
              alert('Database berhasil di-reset ke demo data!');
            }
          }}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Muat Ulang Demo Data</span>
        </button>
      </div>

    </div>
  );
};
