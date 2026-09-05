import React, { useRef, useState, useEffect } from 'react';
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
  Globe,
  Check
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceCategory, IPService, DnsRecord, SubDomainRecord } from '../types/ipam';
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
  subDomains?: SubDomainRecord[];
  onImportData: (data: {
    groups?: IPGroup[];
    allocations?: IPAllocation[];
    categories?: DeviceCategory[];
    users?: UserAccount[];
    services?: IPService[];
    dnsRecords?: DnsRecord[];
    subDomains?: SubDomainRecord[];
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
  subDomains = [],
  onImportData,
  onWipeAllData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasBackedUp, setHasBackedUp] = useState(false);

  // Restore Modal State
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<any>(null);
  
  // Checkboxes
  const [restoreIpam, setRestoreIpam] = useState(true);
  const [restoreDns, setRestoreDns] = useState(true);
  const [restoreSub, setRestoreSub] = useState(true);
  const [restoreServices, setRestoreServices] = useState(true);
  const [restoreCategories, setRestoreCategories] = useState(true);
  const [restoreUsers, setRestoreUsers] = useState(true);

  const handleDownloadFullBackup = () => {
    exportBackupJson(groups, allocations, categories, users, services, dnsRecords, subDomains);
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
        
        setPendingRestoreData(parsed);
        setRestoreIpam(true);
        setRestoreDns(true);
        setRestoreSub(true);
        setRestoreServices(true);
        setRestoreCategories(true);
        setRestoreUsers(true);
        setIsRestoreModalOpen(true);
        
      } catch (error) {
        showError('Pemulihan Gagal', 'Berkas JSON tidak valid atau rusak.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executeRestore = () => {
    if (!pendingRestoreData) return;
    
    const dataToRestore: any = {};
    if (restoreIpam) {
      dataToRestore.groups = pendingRestoreData.groups;
      dataToRestore.allocations = pendingRestoreData.allocations;
    }
    if (restoreDns) dataToRestore.dnsRecords = pendingRestoreData.dnsRecords;
    if (restoreSub) dataToRestore.subDomains = pendingRestoreData.subDomains;
    if (restoreServices) dataToRestore.services = pendingRestoreData.services;
    if (restoreCategories) dataToRestore.categories = pendingRestoreData.categories;
    if (restoreUsers) dataToRestore.users = pendingRestoreData.users;
    
    onImportData(dataToRestore);
    setIsRestoreModalOpen(false);
    setPendingRestoreData(null);
    showSuccess(
      'Pemulihan Sukses',
      'Data pilihan Anda berhasil dipulihkan. Anda akan otomatis dialihkan ke halaman login untuk memperbarui sesi.'
    );
  };

  const handleWipeAll = async () => {
    if (!hasBackedUp) return;
    
    const confirmed = await showConfirm({
      title: 'HAPUS BERSIH SEMUA DATA?',
      text: 'PERINGATAN FATAL: Seluruh data subnet, IP, DNS, layanan, sub-domain, kategori, dan akun akan dihapus secara permanen. Aplikasi akan kembali ke kondisi kosong seperti instalasi baru.\n\nApakah Anda benar-benar yakin?',
      confirmButtonText: 'Ya, Hapus Bersih Semuanya',
      cancelButtonText: 'Batal',
      isDanger: true
    });

    if (confirmed) {
      onWipeAllData();
      showSuccess('Database Dikosongkan', 'Seluruh data sistem telah berhasil dihapus bersih.');
    }
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Pusat Cadangan Data
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kelola pencadangan, ekspor, dan pemulihan database sistem secara lokal.
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadFullBackup}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer flex-shrink-0"
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
                <span>Grup & Alokasi IP:</span>
                <strong className="text-slate-900 dark:text-slate-100">{groups.length} grup, {allocations.length} entri</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span>DNS & Sub Domain:</span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{dnsRecords.length} record, {subDomains.length} sub</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span>Layanan & Port Terdaftar:</span>
                <strong className="text-slate-900 dark:text-slate-100">{services.length} layanan</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span>Kategori Perangkat:</span>
                <strong className="text-slate-900 dark:text-slate-100">{categories.length} tipe</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Akun Pengguna Sistem:</span>
                <strong className="text-slate-900 dark:text-slate-100">{users.length} akun</strong>
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
                Anda dapat memilih komponen data mana saja yang ingin dipulihkan. Data yang dipilih akan <strong>menimpa</strong> dan <strong>menggantikan</strong> data saat ini.
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
                Menghapus total semua subnet, alokasi IP, DNS, port layanan, kategori, sub-domain, dan akun pengguna.
              </p>
            </div>
          </div>

          <button
            onClick={handleWipeAll}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full sm:w-auto flex-shrink-0 ${
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

      {/* Restore Modal */}
      {isRestoreModalOpen && pendingRestoreData && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:items-center sm:pt-4 p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto font-poppins">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Pemulihan Cadangan Data
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                File cadangan berhasil dibaca. Silakan centang data mana saja yang ingin Anda pulihkan (ditimpa):
              </p>
              
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={restoreIpam} onChange={() => setRestoreIpam(!restoreIpam)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                    Data Subnet & Alokasi IP ({pendingRestoreData.groups?.length || 0} grup)
                  </span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={restoreDns} onChange={() => setRestoreDns(!restoreDns)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                    Data Domain Utama ({pendingRestoreData.dnsRecords?.length || 0} record)
                  </span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={restoreSub} onChange={() => setRestoreSub(!restoreSub)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                    Data Sub-Domain ({pendingRestoreData.subDomains?.length || 0} sub)
                  </span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={restoreServices} onChange={() => setRestoreServices(!restoreServices)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                    Layanan & Port ({pendingRestoreData.services?.length || 0} layanan)
                  </span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={restoreCategories} onChange={() => setRestoreCategories(!restoreCategories)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                    Kategori Perangkat ({pendingRestoreData.categories?.length || 0} tipe)
                  </span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={restoreUsers} onChange={() => setRestoreUsers(!restoreUsers)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                    Akun Pengguna ({pendingRestoreData.users?.length || 0} akun)
                  </span>
                </label>
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 dark:border-slate-800 w-full">
              <button
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setPendingRestoreData(null);
                }}
                className="justify-center px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={executeRestore}
                disabled={!restoreIpam && !restoreDns && !restoreSub && !restoreServices && !restoreCategories && !restoreUsers}
                className="flex items-center justify-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/30 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                <span>Mulai Pemulihan</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
