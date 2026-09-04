import React, { useRef, useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  FileSpreadsheet, 
  FileJson, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Unlock,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceCategory } from '../types/ipam';
import { UserAccount } from '../types/auth';
import { exportBackupJson, parseImportJson, exportToXlsx } from '../utils/exportImport';

interface BackupViewProps {
  groups: IPGroup[];
  allocations: IPAllocation[];
  categories: DeviceCategory[];
  users: UserAccount[];
  onImportData: (data: {
    groups: IPGroup[];
    allocations: IPAllocation[];
    categories?: DeviceCategory[];
    users?: UserAccount[];
  }) => void;
  onResetDemo: () => void;
  onWipeAllData: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  groups,
  allocations,
  categories,
  users,
  onImportData,
  onResetDemo,
  onWipeAllData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasBackedUp, setHasBackedUp] = useState(false);

  const handleBackupComplete = () => {
    exportBackupJson(groups, allocations, categories, users);
    setHasBackedUp(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseImportJson(content);
        const details = [
          `• ${parsed.groups.length} Grup IP`,
          `• ${parsed.allocations.length} Alokasi Host`,
          parsed.categories ? `• ${parsed.categories.length} Kategori Perangkat` : null,
          parsed.users ? `• ${parsed.users.length} Akun Pengguna` : null
        ].filter(Boolean).join('\n');

        if (window.confirm(`Validasi file cadangan berhasil:\n${details}\n\nLanjutkan pemulihan data? Data yang ada saat ini akan ditimpa.`)) {
          onImportData(parsed);
          alert('Data berhasil dipulihkan dari berkas cadangan!');
        }
      } catch (err: any) {
        alert('Gagal mengimpor file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleWipeAll = () => {
    if (!hasBackedUp) {
      alert('Aksi ditolak: Anda wajib mengunduh cadangan data terlebih dahulu melalui tombol "Cadangan Lengkap"!');
      return;
    }

    const confirmFirst = window.confirm(
      'PERINGATAN KRUSIAL:\nApakah Anda yakin ingin menghapus SEMUA data aktif?\n\n' +
      'Seluruh Grup IP Subnet, Alokasi Host, Kategori Perangkat, dan Akun Pengguna akan dihapus total sehingga tidak ada data yang tertinggal.\n\n' +
      'Klik OK untuk melanjutkan.'
    );

    if (!confirmFirst) return;

    const confirmFinal = window.confirm(
      'KONFIRMASI TERAKHIR:\nApakah Anda benar-benar yakin? Tindakan ini tidak dapat dibatalkan.'
    );

    if (confirmFinal) {
      onWipeAllData();
      alert('Semua data aktif telah berhasil dihapus bersih! Tidak ada data yang tertinggal.');
    }
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Pusat Cadangan & Manajemen Data
            </h2>
            <p className="text-xs text-slate-500">
              Unduh salinan cadangan lengkap atau pulihkan data dari file JSON/XLSX.
            </p>
          </div>
        </div>

        {hasBackedUp && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Cadangan telah diunduh pada sesi ini</span>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Backup JSON */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Cadangan Lengkap (JSON)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mencadangkan seluruh data sistem IP Address
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Lengkap
              </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-700">Cakupan data yang dicadangkan:</div>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 font-medium">
                <span>• {groups.length} Grup Subnet</span>
                <span>• {allocations.length} Alokasi IP</span>
                <span>• {categories.length} Kategori Perangkat</span>
                <span>• {users.length} Akun Pengguna</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Klik tombol di bawah untuk mengunduh seluruh data dalam satu berkas JSON. Ini juga akan membuka kunci fitur <strong>Hapus Semua Data Aktif</strong>.
            </p>
          </div>

          <button
            onClick={handleBackupComplete}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Cadangkan Lengkap (Semua Data)</span>
          </button>
        </div>

        {/* Restore JSON */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Pulihkan Cadangan (Restore)
                </h3>
                <p className="text-xs text-slate-500">
                  Impor file cadangan JSON yang telah disimpan sebelumnya
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Pilih berkas JSON cadangan dari perangkat Anda. Sistem akan memvalidasi skema data secara otomatis sebelum menimpa konfigurasi saat ini.
            </p>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-800">
              Perhatian: Memulihkan cadangan akan menggantikan konfigurasi grup, alokasi, kategori, dan pengguna sesuai isi berkas.
            </div>
          </div>

          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
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

      </div>

      {/* Excel (.xlsx) Export by Group */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Ekspor Laporan Excel (.xlsx)
            </h3>
            <p className="text-xs text-slate-500">
              Unduh data inventaris IP per grup subnet dalam format Microsoft Excel (.xlsx)
            </p>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Tidak ada grup IP yang tersedia untuk diekspor ke Excel.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.map(group => {
              const groupAllocs = allocations.filter(a => a.groupId === group.id);
              return (
                <div 
                  key={group.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <div className="font-bold text-xs text-slate-800 truncate">
                      {group.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {group.cidr} • {groupAllocs.length} Alokasi
                    </div>
                  </div>

                  <button
                    onClick={() => exportToXlsx(group, groupAllocs)}
                    title={`Unduh Excel (.xlsx) ${group.name}`}
                    className="p-2 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 rounded-xl transition-all cursor-pointer flex-shrink-0"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Danger Zone: Hapus Semua Data Aktif & Reset Demo */}
      <div className="space-y-4">
        
        {/* Hapus Semua Data Aktif Card */}
        <div className={`border rounded-3xl p-6 shadow-xs transition-all ${
          hasBackedUp 
            ? 'bg-rose-50/90 border-rose-300' 
            : 'bg-slate-50/80 border-slate-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                {hasBackedUp ? (
                  <Unlock className="w-5 h-5 text-rose-600" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-400" />
                )}
                <h3 className={`font-bold text-sm ${hasBackedUp ? 'text-rose-900' : 'text-slate-700'}`}>
                  Hapus Semua Data Aktif (Bersih Total)
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  hasBackedUp 
                    ? 'bg-rose-100 text-rose-700 border-rose-300' 
                    : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}>
                  {hasBackedUp ? 'Terbuka' : 'Terkunci'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Menghapus seluruh data di dalam sistem tanpa ada data yang tertinggal (seluruh Grup IP, Alokasi Host, Kategori Perangkat, dan Akun Pengguna).
              </p>

              {!hasBackedUp ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium bg-amber-50/80 p-2.5 rounded-xl border border-amber-200">
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    Untuk keamanan, tombol ini terkunci. Anda harus mengklik <strong>"Cadangkan Lengkap"</strong> di atas terlebih dahulu.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-rose-700 font-medium bg-rose-100/60 p-2.5 rounded-xl border border-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>
                    Perhatian: Cadangan telah dibuat. Menghapus data akan membersihkan seluruh database hingga kosong sempurna.
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleWipeAll}
              disabled={!hasBackedUp}
              className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 flex-shrink-0 ${
                hasBackedUp
                  ? 'bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white shadow-md shadow-rose-600/30 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Semua Data Aktif</span>
            </button>
          </div>
        </div>

        {/* Reset Demo Data Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Muat Ulang Data Sampel Demo</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Jika database kosong atau Anda ingin bereksperimen, muat kembali data sampel standar (LAN Kantor, Server DMZ, CCTV).
            </p>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Muat kembali data sampel demo bawaan (LAN Kantor, Server DMZ, CCTV)?')) {
                onResetDemo();
                alert('Database berhasil dimuat ulang dengan data demo!');
              }
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Muat Data Demo</span>
          </button>
        </div>

      </div>

    </div>
  );
};

