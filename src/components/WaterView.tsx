import React, { useState, useMemo } from 'react';
import { 
  Droplets, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  MapPin, 
  Power, 
  Calendar, 
  AlertTriangle, 
  Layers, 
  Wind,
  Gauge
} from 'lucide-react';
import { WaterDevice, WaterStatus, WaterDeviceType } from '../types/utilityNetworks';
import { showConfirm, showSuccess } from '../utils/swal';

interface WaterViewProps {
  devices: WaterDevice[];
  onSaveDevice: (device: Partial<WaterDevice>) => void;
  onDeleteDevice: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (device: WaterDevice) => void;
}

export const WaterView: React.FC<WaterViewProps> = ({
  devices,
  onDeleteDevice,
  onOpenAddModal,
  onOpenEditModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Statistik Ringkasan Irigasi & Air
  const stats = useMemo(() => {
    const total = devices.length;
    const active = devices.filter(d => d.status === 'active').length;
    const leakingOrIssue = devices.filter(d => d.status === 'leaking' || d.status === 'maintenance').length;
    const totalTankCapacity = devices.reduce((sum, d) => sum + (d.tankCapacityLiter || 0), 0);
    const totalFlowRate = devices.reduce((sum, d) => sum + (d.flowRateLpm || 0), 0);

    return { total, active, leakingOrIssue, totalTankCapacity, totalFlowRate };
  }, [devices]);

  // Filtering
  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchSearch = 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.code && d.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        d.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.zoneArea && d.zoneArea.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.pic && d.pic.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = filterType === 'all' || d.type === filterType;
      const matchStatus = filterStatus === 'all' || d.status === filterStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [devices, searchQuery, filterType, filterStatus]);

  const getStatusBadge = (status: WaterStatus) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800"><CheckCircle2 className="w-3 h-3" /> Mengalir Aktif</span>;
      case 'standby':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Siaga (Standby)</span>;
      case 'leaking':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900 animate-pulse"><AlertTriangle className="w-3 h-3" /> Bocor / Cek Pipa</span>;
      case 'maintenance':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Perbaikan</span>;
      case 'off':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700"><Power className="w-3 h-3" /> Ditutup</span>;
    }
  };

  const getTypeLabel = (type: WaterDeviceType) => {
    switch (type) {
      case 'pump_submersible': return 'Pompa Submersible';
      case 'pump_booster': return 'Pompa Booster';
      case 'water_tank': return 'Toren / Tandon Air';
      case 'valve_solenoid': return 'Katup Solenoid Otomatis';
      case 'valve_manual': return 'Stop Kran Manual';
      case 'flow_meter': return 'Flow Meter Debit';
      case 'water_level_sensor': return 'Sensor Level Tangki';
      case 'pressure_sensor': return 'Sensor Tekanan Air';
      case 'sprinkler_zone': return 'Sistem Sprinkler Kebun';
      case 'filter_water': return 'Filter Tabung Air';
      default: return 'Alat Air / Irigasi';
    }
  };

  const handleDelete = async (dev: WaterDevice) => {
    const confirmed = await showConfirm({
      title: 'Hapus Perangkat Air / Irigasi?',
      text: `Perangkat "${dev.name}" (${dev.code || dev.location}) akan dihapus permanen dari sistem.`,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (confirmed) {
      onDeleteDevice(dev.id);
      showSuccess('Perangkat air & irigasi berhasil dihapus!');
    }
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* 4 KPI Ringkasan Air & Irigasi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Titik Jalur Air</span>
            <div className="p-2.5 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 rounded-2xl border border-cyan-100 dark:border-cyan-800/60">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.total}</span>
            <span className="text-xs font-medium text-slate-500">Unit Terpasang</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Pompa, valve solenoid, pipa, dan sprinkler</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Normal</span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/60">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{stats.active}</span>
            <span className="text-xs font-medium text-slate-500">Aliran Lancar</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">{stats.leakingOrIssue} titik dalam perbaikan / kebocoran</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kapasitas Toren</span>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800/60">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.totalTankCapacity.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-500">Liter</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Cadangan air penampungan gedung & irigasi</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Debit Aliran Total</span>
            <div className="p-2.5 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-2xl border border-teal-100 dark:border-teal-800/60">
              <Wind className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-teal-600">{stats.totalFlowRate}</span>
            <span className="text-xs font-medium text-slate-500">Liter / Menit</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Daya alir pompa dan katup irigasi gabungan</p>
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
              placeholder="Cari pompa, toren, katup, zona irigasi, lokasi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="all">Semua Jenis Perangkat</option>
            <option value="pump_submersible">Pompa Celup / Sumur</option>
            <option value="pump_booster">Pompa Booster</option>
            <option value="water_tank">Toren Air</option>
            <option value="valve_solenoid">Katup Solenoid</option>
            <option value="sprinkler_zone">Sistem Sprinkler</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="standby">Siaga (Standby)</option>
            <option value="leaking">Bocor / Cek</option>
            <option value="maintenance">Perawatan</option>
            <option value="off">Mati</option>
          </select>
        </div>

        {/* Tombol Tambah */}
        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Perangkat Air & Irigasi</span>
        </button>
      </div>

      {/* Tabel Data Perangkat Air & Irigasi */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Nama & Kode</th>
                <th className="py-3.5 px-4">Tipe Hardware</th>
                <th className="py-3.5 px-4">Lokasi & Zona Irigasi</th>
                <th className="py-3.5 px-4">Pipa & Tekanan</th>
                <th className="py-3.5 px-4">Debit / Level Toren</th>
                <th className="py-3.5 px-4">Status Aliran</th>
                <th className="py-3.5 px-4">PIC</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Droplets className="w-10 h-10 mx-auto mb-2 opacity-30 text-cyan-500" />
                    <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">Tidak ada perangkat air & irigasi</p>
                    <p className="text-xs text-slate-400 mt-1">Silakan tambahkan data pompa, toren, atau pipa irigasi.</p>
                  </td>
                </tr>
              ) : (
                filteredDevices.map(device => {
                  return (
                    <tr key={device.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Nama & Kode */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 rounded-xl border border-cyan-200 dark:border-cyan-800/50 flex-shrink-0">
                            <Droplets className="w-4 h-4" />
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
                        {device.powerWatt && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Daya Listrik: {device.powerWatt} Watt
                          </div>
                        )}
                      </td>

                      {/* Lokasi & Zona */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{device.location}</span>
                        </div>
                        {device.zoneArea && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                            {device.zoneArea}
                          </span>
                        )}
                      </td>

                      {/* Pipa & Tekanan */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                        <div className="text-slate-800 dark:text-slate-200 font-bold">
                          {device.pipeDiameter || '-'}
                        </div>
                        {device.pressureBar && (
                          <div className="text-[11px] text-slate-400">
                            {device.pressureBar} Bar
                          </div>
                        )}
                      </td>

                      {/* Debit / Level Toren */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {device.type === 'water_tank' ? (
                          <div>
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-bold text-cyan-600">{device.currentWaterLevelPct || 0}% Isi</span>
                              <span className="text-slate-400">{device.tankCapacityLiter?.toLocaleString()} L</span>
                            </div>
                            <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full bg-cyan-500 rounded-full" 
                                style={{ width: `${device.currentWaterLevelPct || 0}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {device.flowRateLpm ? `${device.flowRateLpm} LPM` : '-'}
                            </span>
                            {device.sourceSupply && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Sumber: {device.sourceSupply}
                              </div>
                            )}
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
                        {device.installationDate && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Pasang: {device.installationDate}</span>
                          </div>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onOpenEditModal(device)}
                            title="Edit Data"
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-cyan-600 rounded-lg transition-colors cursor-pointer"
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
