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
  Globe,
  Zap,
  Video,
  Droplets,
  Layers,
  Cpu,
  Users
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceCategory, IPService, DnsRecord, SubDomainRecord } from '../types/ipam';
import { ElectricityDevice, CctvDevice, WaterDevice, LanDevice, LanCableRun } from '../types/utilityNetworks';
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
  electricityDevices?: ElectricityDevice[];
  cctvDevices?: CctvDevice[];
  waterDevices?: WaterDevice[];
  lanDevices?: LanDevice[];
  lanCables?: LanCableRun[];
  onImportData: (data: {
    groups?: IPGroup[];
    allocations?: IPAllocation[];
    categories?: DeviceCategory[];
    users?: UserAccount[];
    services?: IPService[];
    dnsRecords?: DnsRecord[];
    subDomains?: SubDomainRecord[];
    electricityDevices?: ElectricityDevice[];
    cctvDevices?: CctvDevice[];
    waterDevices?: WaterDevice[];
    lanDevices?: LanDevice[];
    lanCables?: LanCableRun[];
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
  electricityDevices = [],
  cctvDevices = [],
  waterDevices = [],
  lanDevices = [],
  lanCables = [],
  onImportData,
  onWipeAllData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasBackedUp, setHasBackedUp] = useState(false);

  // Restore Modal State
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<any>(null);
  
  // Checkboxes
  const [restoreLan, setRestoreLan] = useState(true);
  const [restoreIpam, setRestoreIpam] = useState(true);
  const [restoreElectricity, setRestoreElectricity] = useState(true);
  const [restoreCctv, setRestoreCctv] = useState(true);
  const [restoreWater, setRestoreWater] = useState(true);
  const [restoreDns, setRestoreDns] = useState(true);
  const [restoreSub, setRestoreSub] = useState(true);
  const [restoreServices, setRestoreServices] = useState(true);
  const [restoreCategories, setRestoreCategories] = useState(true);
  const [restoreUsers, setRestoreUsers] = useState(true);

  const handleDownloadFullBackup = () => {
    exportBackupJson(
      groups, 
      allocations, 
      categories, 
      users, 
      services, 
      dnsRecords, 
      subDomains,
      electricityDevices,
      cctvDevices,
      waterDevices,
      lanDevices,
      lanCables
    );
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
        setRestoreElectricity(true);
        setRestoreCctv(true);
        setRestoreWater(true);
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
    if (restoreLan) {
      dataToRestore.lanDevices = pendingRestoreData.lanDevices;
      dataToRestore.lanCables = pendingRestoreData.lanCables;
    }
    if (restoreIpam) {
      dataToRestore.groups = pendingRestoreData.groups;
      dataToRestore.allocations = pendingRestoreData.allocations;
    }
    if (restoreElectricity) dataToRestore.electricityDevices = pendingRestoreData.electricityDevices;
    if (restoreCctv) dataToRestore.cctvDevices = pendingRestoreData.cctvDevices;
    if (restoreWater) dataToRestore.waterDevices = pendingRestoreData.waterDevices;
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
      text: 'PERINGATAN FATAL: Seluruh data LAN, Listrik, CCTV, AIR, DNS, layanan, kategori, dan akun akan dihapus permanen dari database SQLite.\n\nApakah Anda benar-benar yakin?',
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
              Pusat Cadangan Data Terpadu
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kelola pencadangan, ekspor, dan pemulihan database SQLite (LAN, Listrik, CCTV, AIR).
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

      {/* Grid Menu Cadangan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card Ekspor Excel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800/60">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Ekspor Laporan Spreadsheet (XLSX)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unduh data per subnet IP ke dalam format Microsoft Excel.</p>
            </div>
          </div>
          <button
            onClick={handleExportAllToXlsx}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Semua Subnet ke Excel</span>
          </button>
        </div>

        {/* Card Impor / Restore JSON */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800/60">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Pulihkan Data (Impor JSON)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Muat berkas cadangan JSON ke database SQLite backend.</p>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-600/20"
          >
            <Upload className="w-4 h-4" />
            <span>Pilih Berkas Cadangan JSON</span>
          </button>
        </div>

      </div>

      {/* Area Bahaya (Wipe Data) */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200">Area Kritis: Hapus Bersih Seluruh Data</h3>
            <p className="text-xs text-rose-700/80 dark:text-rose-400/80">
              Tindakan ini akan mengosongkan seluruh tabel database SQLite.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {hasBackedUp ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Unlock className="w-4 h-4" /> Cadangan telah diunduh. Kunci penghapusan dibuka.
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <Lock className="w-4 h-4" /> Kunci aktif: Unduh cadangan JSON terlebih dahulu untuk membuka tombol hapus.
              </span>
            )}
          </div>
          <button
            onClick={handleWipeAll}
            disabled={!hasBackedUp}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              hasBackedUp 
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30 cursor-pointer' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Bersih Database</span>
          </button>
        </div>
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
                File cadangan berhasil dibaca. Silakan centang data mana saja yang ingin Anda pulihkan:
              </p>
              
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-4 rounded-xl max-h-[60vh] overflow-y-auto">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={restoreLan} onChange={() => setRestoreLan(!restoreLan)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                    Jaringan LAN - Fisik & Jalur ({pendingRestoreData.lanCables?.length || 0} Jalur Kabel, {pendingRestoreData.lanDevices?.length || 0} Switch/Rack)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={restoreIpam} onChange={() => setRestoreIpam(!restoreIpam)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                    Alamat IP (IPAM) ({pendingRestoreData.groups?.length || 0} Subnet, {pendingRestoreData.allocations?.length || 0} Host)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={restoreElectricity} onChange={() => setRestoreElectricity(!restoreElectricity)} className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-amber-500 transition-colors">
                    Jaringan Listrik ({pendingRestoreData.electricityDevices?.length || 0} Perangkat)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={restoreCctv} onChange={() => setRestoreCctv(!restoreCctv)} className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-rose-600 transition-colors">
                    Jaringan CCTV ({pendingRestoreData.cctvDevices?.length || 0} Kamera/NVR)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={restoreWater} onChange={() => setRestoreWater(!restoreWater)} className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-cyan-600 transition-colors">
                    Jaringan AIR & Irigasi ({pendingRestoreData.waterDevices?.length || 0} Titik)
                  </span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={restoreDns} onChange={() => setRestoreDns(!restoreDns)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                    Data Domain Utama ({pendingRestoreData.dnsRecords?.length || 0} record)
                  </span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={restoreSub} onChange={() => setRestoreSub(!restoreSub)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                    Data Sub-Domain ({pendingRestoreData.subDomains?.length || 0} sub)
                  </span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={restoreCategories} onChange={() => setRestoreCategories(!restoreCategories)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                    Kategori Perangkat ({pendingRestoreData.categories?.length || 0} tipe)
                  </span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={restoreUsers} onChange={() => setRestoreUsers(!restoreUsers)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
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
                className="justify-center px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
              >
                Pulihkan Data Terpilih
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
