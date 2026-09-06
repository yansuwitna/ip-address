import React, { useState, useMemo } from 'react';
import { 
  Video, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  Radio, 
  HardDrive, 
  Camera, 
  ExternalLink,
  WifiOff,
  Sliders
} from 'lucide-react';
import { CctvDevice, CctvStatus, CctvDeviceType } from '../types/utilityNetworks';
import { showConfirm, showSuccess } from '../utils/swal';

interface CctvViewProps {
  devices: CctvDevice[];
  onSaveDevice: (device: Partial<CctvDevice>) => void;
  onDeleteDevice: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (device: CctvDevice) => void;
}

export const CctvView: React.FC<CctvViewProps> = ({
  devices,
  onDeleteDevice,
  onOpenAddModal,
  onOpenEditModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // KPI Statistik CCTV
  const stats = useMemo(() => {
    const total = devices.length;
    const cameras = devices.filter(d => d.type.startsWith('camera_ip')).length;
    const nvrCount = devices.filter(d => d.type === 'nvr' || d.type === 'dvr').length;
    const online = devices.filter(d => d.status === 'online' || d.status === 'recording').length;
    const offlineOrIssue = devices.filter(d => d.status === 'offline' || d.status === 'issue').length;
    const onlinePct = total > 0 ? Math.round((online / total) * 100) : 0;

    return { total, cameras, nvrCount, online, offlineOrIssue, onlinePct };
  }, [devices]);

  // Filtering
  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchSearch = 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.ipAddress && d.ipAddress.toLowerCase().includes(searchQuery.toLowerCase())) ||
        d.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.brand && d.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.pic && d.pic.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = filterType === 'all' || d.type === filterType;
      const matchStatus = filterStatus === 'all' || d.status === filterStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [devices, searchQuery, filterType, filterStatus]);

  const getStatusBadge = (status: CctvStatus) => {
    switch (status) {
      case 'recording':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900"><span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" /> Merekam (REC)</span>;
      case 'online':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><CheckCircle2 className="w-3 h-3" /> Online</span>;
      case 'issue':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800"><Activity className="w-3 h-3" /> Gangguan Signal</span>;
      case 'offline':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700"><WifiOff className="w-3 h-3" /> Offline</span>;
      case 'maintenance':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Perbaikan</span>;
    }
  };

  const getTypeLabel = (type: CctvDeviceType) => {
    switch (type) {
      case 'camera_ip_dome': return 'Dome Camera (Indoor)';
      case 'camera_ip_bullet': return 'Bullet Camera (Outdoor)';
      case 'camera_ip_ptz': return 'Speed Dome PTZ';
      case 'nvr': return 'NVR Recorder';
      case 'dvr': return 'DVR Analog';
      case 'switch_poe': return 'Switch PoE CCTV';
      case 'storage_nas': return 'NAS Storage';
      case 'monitor_matrix': return 'Monitor Matrix';
      default: return 'Perangkat CCTV';
    }
  };

  const handleDelete = async (dev: CctvDevice) => {
    const confirmed = await showConfirm({
      title: 'Hapus Perangkat CCTV?',
      text: `Perangkat CCTV "${dev.name}" (${dev.ipAddress || dev.location}) akan dihapus permanen dari sistem.`,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (confirmed) {
      onDeleteDevice(dev.id);
      showSuccess('Perangkat CCTV berhasil dihapus!');
    }
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* 4 KPI Ringkasan CCTV */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total CCTV & Alat</span>
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/60">
              <Video className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.total}</span>
            <span className="text-xs font-medium text-slate-500">Titik Perangkat</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">{stats.cameras} Kamera IP & {stats.nvrCount} NVR Server</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Online & REC</span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/60">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{stats.online}</span>
            <span className="text-xs font-medium text-slate-500">Feed Beroperasi</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">{stats.onlinePct}% dari total seluruh kamera aktif</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perhatian / Masalah</span>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-800/60">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{stats.offlineOrIssue}</span>
            <span className="text-xs font-medium text-slate-500">Kamera Kendala</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Kamera offline atau koneksi terganggu</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Keamanan & PIC</span>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800/60">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">24/7</span>
            <span className="text-xs font-medium text-slate-500">Continuous REC</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Penyimpanan rekaman hingga 60 hari</p>
        </div>
      </div>

      {/* Action Header & Filtering Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search & Filters */}
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama kamera, IP, lokasi, arah pandang..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="all">Semua Tipe Hardware</option>
            <option value="camera_ip_dome">Dome (Indoor)</option>
            <option value="camera_ip_bullet">Bullet (Outdoor)</option>
            <option value="camera_ip_ptz">PTZ Speed Dome</option>
            <option value="nvr">NVR Recorder</option>
            <option value="switch_poe">Switch PoE</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="all">Semua Status</option>
            <option value="online">Online</option>
            <option value="recording">Recording</option>
            <option value="issue">Gangguan</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        {/* Tombol Tambah */}
        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Perangkat CCTV</span>
        </button>
      </div>

      {/* Tabel Data Perangkat CCTV */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Nama & Model</th>
                <th className="py-3.5 px-4">Tipe Kamera</th>
                <th className="py-3.5 px-4">Alamat IP & Port PoE</th>
                <th className="py-3.5 px-4">Lokasi & Sudut Pantau</th>
                <th className="py-3.5 px-4">Resolusi & CH</th>
                <th className="py-3.5 px-4">Status Stream</th>
                <th className="py-3.5 px-4">PIC</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Video className="w-10 h-10 mx-auto mb-2 opacity-30 text-rose-500" />
                    <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">Tidak ada data perangkat CCTV</p>
                    <p className="text-xs text-slate-400 mt-1">Silakan tambahkan kamera IP atau sesuaikan filter pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredDevices.map(device => {
                  return (
                    <tr key={device.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Nama & Model */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900/50 flex-shrink-0">
                            <Video className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">{device.name}</div>
                            <div className="text-[11px] text-slate-400">
                              {device.brand || 'Generic'} {device.model ? `• ${device.model}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tipe Kamera */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {getTypeLabel(device.type)}
                        </span>
                      </td>

                      {/* Alamat IP & PoE */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {device.ipAddress ? (
                          <div className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                            {device.ipAddress}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                        {device.poePort && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {device.poePort}
                          </div>
                        )}
                      </td>

                      {/* Lokasi */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{device.location}</span>
                        </div>
                      </td>

                      {/* Resolusi & Channel */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {device.resolution || '1080p Full HD'}
                        </span>
                        {device.channelNumber && (
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            CH #{device.channelNumber}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(device.status)}
                      </td>

                      {/* PIC */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-800 dark:text-slate-200 font-semibold">{device.pic || '-'}</div>
                        {device.storageDays && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            <span>Retensi: {device.storageDays} Hari</span>
                          </div>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          {device.rtspUrl && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(device.rtspUrl || '');
                                showSuccess('RTSP Stream URL disalin ke clipboard!');
                              }}
                              title="Salin RTSP Stream URL"
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onOpenEditModal(device)}
                            title="Edit Data"
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(device)}
                            title="Hapus"
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
