import React, { useRef, useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileJson, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Trash2, 
  ShieldAlert,
  Globe
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceCategory, IPService, DnsRecord } from '../types/ipam';
import { UserAccount } from '../types/auth';
import { exportBackupJson, parseImportJson, exportToXlsx } from '../utils/exportImport';
import { showConfirm, showSuccess, showError, showWarning } from '../utils/swal';

interface BackupViewProps {
  groups: IPGroup[];
  allocations: IPAllocation[];
  categories: DeviceCategory[];
  users: UserAccount[];
  services?: IPService[];
  dnsRecords?: DnsRecord[];
  onImportData: (data: {
    groups: IPGroup[];
    allocations: IPAllocation[];
    categories?: DeviceCategory[];
    users?: UserAccount[];
    services?: IPService[];
    dnsRecords?: DnsRecord[];
  }) => void;
  onWipeAllData: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  groups,
  allocations,
  categories,
  users,
  services = [],
  dnsRecords = [],
  onImportData,
  onWipeAllData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasBackedUp, setHasBackedUp] = useState(false);

  const handleDownloadFullBackup = () => {
    exportBackupJson(groups, allocations, categories, users, services, dnsRecords);
    setHasBackedUp(true);
    showSuccess('Cadangan Berhasil Diunduh', 'Berkas cadangan format JSON berhasil disimpan.');
  };

  const handleExportAllToXlsx = () => {
    if (groups.length === 0) {
      showWarning('Data Kosong', 'Tidak ada grup subnet IP untuk diekspor ke format Excel.');
      return;
    }
    groups.forEach((group, index) => {
      setTimeout(() => {
        const groupAllocs = allocations.filter(a => a.groupId === group.id);
        exportToXlsx(group, groupAllocs, services, categories);
      }, index * 200);
    });
    showSuccess('Ekspor Berjalan', `Mengekspor ${groups.length} berkas spreadsheet per subnet.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseImportJson(content);
        const details = [
          `• ${parsed.groups.length} Grup Subnet IP`,
          `• ${parsed.allocations.length} Alokasi Host IP`,
          parsed.dnsRecords ? `• ${parsed.dnsRecords.length} Catatan DNS Server` : null,
          parsed.services ? `• ${parsed.services.length} Layanan & Port Terdaftar` : null,
          parsed.categories ? `• ${parsed.categories.length} Kategori Perangkat` : null,
          parsed.users ? `• ${parsed.users.length} Akun Pengguna Sistem` : null
        ].filter(Boolean).join('\n');

        const confirmed = await showConfirm({
          title: 'Pulihkan Data dari Cadangan?',
          text: `Validasi file cadangan berhasil:\n${details}\n\nSeluruh data yang ada saat ini akan ditimpa dengan data cadangan ini. Lanjutkan?`,
          confirmButtonText: 'Ya, Pulihkan Sekarang',
          cancelButtonText: 'Batal',
          isDanger: true
        });

        if (confirmed) {
          onImportData(parsed);
          showSuccess('Pemulihan Sukses', 'Semua data sistem berhasil dipulihkan dari berkas cadangan!');
        }
      } catch (err: any) {
        showError('Gagal Mengimpor Cadangan', err.message || 'Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleWipeAll = async () => {
    if (!hasBackedUp) {
      showWarning(
        'Aksi Ditolak',
        'Anda wajib mengunduh cadangan data terlebih dahulu melalui tombol "Cadangan Lengkap" sebelum menghapus bersih database!'
      );
      return;
    }

    const confirmFirst = await showConfirm({
      title: 'Hapus SEMUA Data Sistem?',
      text: 'PERINGATAN KRUSIAL: Seluruh Grup Subnet IP, Alokasi Host, Catatan DNS, Layanan & Port, Kategori, dan Akun Pengguna akan dihapus bersih total.',
      confirmButtonText: 'Lanjutkan Tahap Akhir',
      cancelButtonText: 'Batal',
      isDanger: true
    });

    if (!confirmFirst) return;

    const confirmFinal = await showConfirm({
      title: 'KONFIRMASI TERAKHIR: Bersihkan Database?',
      text: 'Tindakan pembersihan bersih ini bersifat permanen dan tidak dapat dibatalkan. Apakah Anda benar-benar yakin?',
      confirmButtonText: 'Ya, Hapus Bersih Total',
      cancelButtonText: 'Batal',
      isDanger: true
    });

    if (confirmFinal) {
      onWipeAllData();
      showSuccess('Database Bersih', 'Semua data aktif telah berhasil dihapus bersih dari sistem.');
    }
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Cadangan & Manajemen Data IP & DNS
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ekspor seluruh data subnet, host, DNS, layanan, dan pulihkan dari berkas JSON.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadFullBackup}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Cadangan Lengkap (JSON)</span>
        </button>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Ekspor Cadangan */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Ekspor Data Sistem (Backup)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Simpan data lokal ke dalam berkas cadangan offline yang aman.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span>Grup Subnet IP:</span>
                <strong className="text-slate-900 dark:text-slate-100">{groups.length} grup</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span>Alokasi Host IP:</span>
                <strong className="text-slate-900 dark:text-slate-100">{allocations.length} entri</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span>Catatan DNS Server:</span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{dnsRecords.length} record</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span>Layanan & Port Terdaftar:</span>
                <strong className="text-slate-900 dark:text-slate-100">{services.length} layanan</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Kategori Perangkat:</span>
                <strong className="text-slate-900 dark:text-slate-100">{categories.length} tipe</strong>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleDownloadFullBackup}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Berkas JSON (.json)</span>
            </button>

            <button
              onClick={handleExportAllToXlsx}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Semua Subnet ke Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Card 2: Pulihkan Data (Restore) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Pemulihan Data (Restore)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pulihkan kembali seluruh data dari berkas JSON yang telah dicadangkan.
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Memulihkan data akan menggantikan data subnet, host IP, DNS, dan akun saat ini dengan data yang ada di dalam berkas cadangan JSON.
              </p>
            </div>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Pilih Berkas Cadangan (.json)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Danger Zone: Wipe All Data */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200">
                Zona Bahaya: Hapus Bersih Seluruh Data Sistem
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
                Menghapus total semua subnet, alokasi IP, DNS, port layanan, kategori, dan akun pengguna.
              </p>
            </div>
          </div>

          <button
            onClick={handleWipeAll}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              hasBackedUp
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30 cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            {hasBackedUp ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>Hapus Bersih Database</span>
          </button>
        </div>

        {!hasBackedUp && (
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            * Tombol hapus terkunci demi keamanan. Silakan klik tombol "Unduh Cadangan Lengkap" terlebih dahulu untuk membuka kunci tombol ini.
          </p>
        )}
      </div>

    </div>
  );
};
