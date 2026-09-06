import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Power, 
  Gauge, 
  Calendar, 
  User, 
  MapPin, 
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { ElectricityDevice, ElectricalStatus, ElectricityDeviceType } from '../types/utilityNetworks';
import { showConfirm, showSuccess } from '../utils/swal';

interface ElectricityViewProps {
  devices: ElectricityDevice[];
  onSaveDevice: (device: Partial<ElectricityDevice>) => void;
  onDeleteDevice: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (device: ElectricityDevice) => void;
}

export const ElectricityView: React.FC<ElectricityViewProps> = ({
  devices,
  onDeleteDevice,
  onOpenAddModal,
  onOpenEditModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Perhitungan Statistik
  const stats = useMemo(() => {
    const total = devices.length;
    const normal = devices.filter(d => d.status === 'normal').length;
    const warningOrCritical = devices.filter(d => d.status === 'warning' || d.status === 'critical').length;
    const totalCapacityWatt = devices.reduce((sum, d) => sum + (d.capacityWatt || 0), 0);
    const totalLoadWatt = devices.reduce((sum, d) => sum + (d.currentLoadWatt || 0), 0);
    const overallLoadPct = totalCapacityWatt > 0 ? Math.round((totalLoadWatt / totalCapacityWatt) * 100) : 0;

    return { total, normal, warningOrCritical, totalCapacityWatt, totalLoadWatt, overallLoadPct };
  }, [devices]);

  // Filtering
  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchSearch = 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.code && d.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        d.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.brand && d.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.pic && d.pic.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = filterType === 'all' || d.type === filterType;
      const matchStatus = filterStatus === 'all' || d.status === filterStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [devices, searchQuery, filterType, filterStatus]);

  const getStatusBadge = (status: ElectricalStatus) => {
    switch (status) {
      case 'normal':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><CheckCircle2 className="w-3 h-3" /> Normal</span>;
      case 'warning':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800"><Activity className="w-3 h-3" /> Peringatan</span>;
      case 'critical':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900 animate-pulse"><ShieldAlert className="w-3 h-3" /> Kritis</span>;
      case 'maintenance':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Perawatan</span>;
      case 'off':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700"><Power className="w-3 h-3" /> Nonaktif</span>;
    }
  };

  const getTypeLabel = (type: ElectricityDeviceType) => {
    switch (type) {
      case 'panel_mdp': return 'Panel MDP';
      case 'panel_sdp': return 'Panel SDP';
      case 'trafo': return 'Transformator (Trafo)';
      case 'genset': return 'Genset Cadangan';
      case 'ups': return 'UPS Backup';
      case 'mcb': return 'MCB / Breaker';
      case 'kwh_meter': return 'KWH Meter';
      case 'pdu_stopkontak': return 'PDU / Stop Kontak';
      case 'stabilizer': return 'Stabilizer / AVR';
      case 'inverter': return 'Inverter Solar/Power';
      default: return 'Komponen Listrik';
    }
  };

  const handleDelete = async (dev: ElectricityDevice) => {
    const confirmed = await showConfirm({
      title: 'Hapus Perangkat Listrik?',
      text: `Perangkat "${dev.name}" (${dev.code || dev.location}) akan dihapus permanen dari sistem.`,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (confirmed) {
      onDeleteDevice(dev.id);
      showSuccess('Perangkat listrik berhasil dihapus!');
    }
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* 4 KPI Ringkasan Kelistrikan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Perangkat</span>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-800/60">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.total}</span>
            <span className="text-xs font-medium text-slate-500">Unit Terpasang</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Panel MDP/SDP, Genset, Trafo, dan UPS</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kondisi Normal</span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/60">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{stats.normal}</span>
            <span className="text-xs font-medium text-slate-500">Operasional Baik</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">{stats.warningOrCritical} unit butuh perhatian / perbaikan</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Daya Terpasang</span>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800/60">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {(stats.totalCapacityWatt / 1000).toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-500">kVA / kW</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Kapasitas suplai total gedung & server</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Beban Berjalan</span>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800/60">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600">{stats.overallLoadPct}%</span>
            <span className="text-xs font-medium text-slate-500">{(stats.totalLoadWatt / 1000).toFixed(1)} kW Terpakai</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${stats.overallLoadPct > 80 ? 'bg-rose-500' : stats.overallLoadPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, stats.overallLoadPct)}%` }}
            />
          </div>
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
              placeholder="Cari perangkat listrik, kode, lokasi, PIC..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="all">Semua Tipe Hardware</option>
            <option value="panel_mdp">Panel MDP</option>
            <option value="panel_sdp">Panel SDP</option>
            <option value="trafo">Trafo Listrik</option>
            <option value="genset">Genset</option>
            <option value="ups">UPS</option>
            <option value="mcb">MCB / Box</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="all">Semua Status</option>
            <option value="normal">Normal</option>
            <option value="warning">Peringatan</option>
            <option value="critical">Kritis</option>
            <option value="maintenance">Perawatan</option>
            <option value="off">Nonaktif</option>
          </select>
        </div>

        {/* Tombol Tambah */}
        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Perangkat Listrik</span>
        </button>
      </div>

      {/* Tabel Data Perangkat Listrik */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Nama & Kode</th>
                <th className="py-3.5 px-4">Tipe Hardware</th>
                <th className="py-3.5 px-4">Lokasi Penempatan</th>
                <th className="py-3.5 px-4">Fasa & Tegangan</th>
                <th className="py-3.5 px-4">Beban / Kapasitas</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">PIC / Teknisi</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Zap className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-500" />
                    <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">Tidak ada perangkat listrik ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Silakan sesuaikan filter pencarian atau tambahkan perangkat baru.</p>
                  </td>
                </tr>
              ) : (
                filteredDevices.map(device => {
                  const loadPct = (device.capacityWatt && device.capacityWatt > 0 && device.currentLoadWatt)
                    ? Math.round((device.currentLoadWatt / device.capacityWatt) * 100)
                    : 0;

                  return (
                    <tr key={device.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Nama & Kode */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-800/50 flex-shrink-0">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">{device.name}</div>
                            {device.code && (
                              <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {device.code}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Tipe Hardware */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {getTypeLabel(device.type)}
                        </span>
                        {device.brand && (
                          <div className="text-[11px] text-slate-400">
                            {device.brand} {device.model || ''}
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

                      {/* Fasa & Volt */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                          {device.phase === '3_phase' ? '3 Phase (380V)' : '1 Phase (220V)'}
                        </span>
                        {device.currentAmpere && (
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            Breaker: {device.currentAmpere}A
                          </div>
                        )}
                      </td>

                      {/* Beban / Kapasitas */}
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {device.currentLoadWatt ? (device.currentLoadWatt / 1000).toFixed(1) : 0} kW
                          </span>
                          <span className="text-slate-400">
                            / {device.capacityWatt ? (device.capacityWatt / 1000).toFixed(1) : 0} kW
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${loadPct > 80 ? 'bg-rose-500' : loadPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, loadPct)}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(device.status)}
                      </td>

                      {/* PIC */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-800 dark:text-slate-200 font-semibold">{device.pic || '-'}</div>
                        {device.lastMaintenance && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Maint: {device.lastMaintenance}</span>
                          </div>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onOpenEditModal(device)}
                            title="Edit Data"
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
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
