import React, { useState, useMemo } from 'react';
import { 
  Network, 
  Cable, 
  Server, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ArrowRight, 
  MapPin, 
  Sliders, 
  Tag,
  Boxes,
  Zap,
  Radio,
  FileSpreadsheet
} from 'lucide-react';
import { LanDevice, LanCableRun, LanDeviceType, LanCableType, CableRunStatus } from '../types/utilityNetworks';
import { showConfirm, showSuccess } from '../utils/swal';

interface LanViewProps {
  devices: LanDevice[];
  cables: LanCableRun[];
  onSaveDevice: (device: Partial<LanDevice>) => void;
  onDeleteDevice: (id: string) => void;
  onSaveCable: (cable: Partial<LanCableRun>) => void;
  onDeleteCable: (id: string) => void;
  onOpenAddDeviceModal: () => void;
  onOpenEditDeviceModal: (device: LanDevice) => void;
  onOpenAddCableModal: () => void;
  onOpenEditCableModal: (cable: LanCableRun) => void;
}

export const LanView: React.FC<LanViewProps> = ({
  devices,
  cables,
  onDeleteDevice,
  onDeleteCable,
  onOpenAddDeviceModal,
  onOpenEditDeviceModal,
  onOpenAddCableModal,
  onOpenEditCableModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'cables' | 'devices'>('cables');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // KPI STATS LAN FISIK & JALUR KABEL
  const stats = useMemo(() => {
    const totalCables = cables.length;
    const connectedCables = cables.filter(c => c.status === 'connected').length;
    const totalMeters = cables.reduce((sum, c) => sum + (c.lengthMeter || 0), 0);
    const totalDevices = devices.length;
    const switches = devices.filter(d => d.type.startsWith('switch')).length;
    const patchPanels = devices.filter(d => d.type === 'patch_panel').length;
    const faultCables = cables.filter(c => c.status === 'fault').length;

    return { totalCables, connectedCables, totalMeters, totalDevices, switches, patchPanels, faultCables };
  }, [cables, devices]);

  // Filter Jalur Kabel
  const filteredCables = useMemo(() => {
    return cables.filter(c => {
      const matchSearch = 
        c.cableCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.sourceLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.targetLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.sourceDeviceName && c.sourceDeviceName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.targetDeviceName && c.targetDeviceName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.pathwayRoute && c.pathwayRoute.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.pic && c.pic.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = filterType === 'all' || c.cableType === filterType;
      const matchStatus = filterStatus === 'all' || c.status === filterStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [cables, searchQuery, filterType, filterStatus]);

  // Filter Perangkat Fisik
  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchSearch = 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.code && d.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        d.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.rackNumber && d.rackNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.brand && d.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = filterType === 'all' || d.type === filterType;
      const matchStatus = filterStatus === 'all' || d.status === filterStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [devices, searchQuery, filterType, filterStatus]);

  const getCableTypeLabel = (type: LanCableType) => {
    switch (type) {
      case 'cat6_utp': return 'UTP Cat6';
      case 'cat6a_stp': return 'STP Cat6A';
      case 'cat5e_utp': return 'UTP Cat5e';
      case 'fiber_sm': return 'FO Single Mode';
      case 'fiber_mm': return 'FO Multi Mode';
      case 'dac_sfp': return 'DAC SFP+';
      default: return 'Kabel LAN';
    }
  };

  const getDeviceTypeLabel = (type: LanDeviceType) => {
    switch (type) {
      case 'switch_core': return 'Switch Core (L3)';
      case 'switch_distribution': return 'Switch Distribution';
      case 'switch_access': return 'Switch Access (L2)';
      case 'patch_panel': return 'Patch Panel';
      case 'router_gateway': return 'Router Gateway';
      case 'otb_fiber': return 'OTB Fiber Optic';
      case 'access_point': return 'Access Point';
      case 'server_host': return 'Server Rack';
      case 'wallplate_jack': return 'Wallplate RJ45';
      default: return 'Perangkat LAN';
    }
  };

  const handleDeleteCableItem = async (cable: LanCableRun) => {
    const confirmed = await showConfirm({
      title: 'Hapus Jalur Kabel LAN?',
      text: `Jalur kabel "${cable.cableCode}" dari ${cable.sourceLocation} ke ${cable.targetLocation} akan dihapus.`,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (confirmed) {
      onDeleteCable(cable.id);
      showSuccess('Jalur kabel berhasil dihapus!');
    }
  };

  const handleDeleteDeviceItem = async (device: LanDevice) => {
    const confirmed = await showConfirm({
      title: 'Hapus Perangkat LAN?',
      text: `Perangkat "${device.name}" (${device.code}) akan dihapus dari sistem.`,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (confirmed) {
      onDeleteDevice(device.id);
      showSuccess('Perangkat LAN berhasil dihapus!');
    }
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* 4 KPI CARDS RINGKASAN LAN FISIK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: TOTAL JALUR KABEL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Jalur Kabel</span>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800/60">
              <Cable className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.totalCables}</span>
            <span className="text-xs font-medium text-slate-500">Tarikan Kabel</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">{stats.connectedCables} terhubung normal & aktif</p>
        </div>

        {/* KPI 2: TOTAL PERANGKAT FISIK */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hardware Perangkat</span>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800/60">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.totalDevices}</span>
            <span className="text-xs font-medium text-slate-500">Perangkat Fisik</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">{stats.switches} Switch & {stats.patchPanels} Patch Panel</p>
        </div>

        {/* KPI 3: PANJANG KABEL TERTANAM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimasi Panjang</span>
            <div className="p-2.5 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 rounded-2xl border border-cyan-100 dark:border-cyan-800/60">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.totalMeters.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-500">Meter</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Jalur UTP, STP & Fiber Optic</p>
        </div>

        {/* KPI 4: KENDALA / PUTUS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kondisi Jalur</span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/60">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{stats.totalCables > 0 ? Math.round((stats.connectedCables / stats.totalCables) * 100) : 100}%</span>
            <span className="text-xs font-medium text-slate-500">Link Aktif</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">{stats.faultCables} kabel mengalami kendala/putus</p>
        </div>
      </div>

      {/* SUB-NAVIGASI: JALUR KABEL VS PERANGKAT FISIK */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Toggle Tab */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          <button
            onClick={() => {
              setActiveSubTab('cables');
              setFilterType('all');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'cables'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Cable className="w-4 h-4" />
            <span>Pencatatan Jalur Kabel & Arah ({cables.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('devices');
              setFilterType('all');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'devices'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Perangkat Fisik LAN & Switch ({devices.length})</span>
          </button>
        </div>

        {/* Action Button */}
        {activeSubTab === 'cables' ? (
          <button
            onClick={onOpenAddCableModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jalur Kabel Baru</span>
          </button>
        ) : (
          <button
            onClick={onOpenAddDeviceModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Perangkat LAN Baru</span>
          </button>
        )}
      </div>

      {/* FILTER & PENCARIAN */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={activeSubTab === 'cables' ? "Cari kode kabel, asal, tujuan, rute tray, PIC..." : "Cari nama perangkat, rack, lokasi, kode..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        {activeSubTab === 'cables' ? (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="all">Semua Tipe Kabel</option>
              <option value="cat6_utp">UTP Cat6</option>
              <option value="cat6a_stp">STP Cat6A</option>
              <option value="cat5e_utp">UTP Cat5e</option>
              <option value="fiber_sm">FO Single Mode</option>
              <option value="fiber_mm">FO Multi Mode</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="all">Semua Status</option>
              <option value="connected">Terhubung (Connected)</option>
              <option value="idle">Siaga (Idle)</option>
              <option value="fault">Kendala / Putus (Fault)</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="all">Semua Tipe Perangkat</option>
              <option value="switch_core">Switch Core</option>
              <option value="switch_distribution">Switch Distribution</option>
              <option value="switch_access">Switch Access</option>
              <option value="patch_panel">Patch Panel</option>
              <option value="router_gateway">Router Gateway</option>
            </select>
          </div>
        )}
      </div>

      {/* TABEL 1: JALUR KABEL & ARAH (SOURCE -> TARGET) */}
      {activeSubTab === 'cables' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Label Kabel</th>
                  <th className="py-3.5 px-4">Titik Asal (Dari)</th>
                  <th className="py-3.5 px-4 text-center">Arah</th>
                  <th className="py-3.5 px-4">Titik Tujuan (Ke)</th>
                  <th className="py-3.5 px-4">Jalur & Panjang</th>
                  <th className="py-3.5 px-4">Spesifikasi Link</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredCables.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Cable className="w-10 h-10 mx-auto mb-2 opacity-30 text-blue-500" />
                      <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">Belum ada jalur kabel LAN terdaftar</p>
                      <p className="text-xs text-slate-400 mt-1">Klik "Tambah Jalur Kabel Baru" untuk mencatat tarikan kabel beserta port dan arahnya.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCables.map(cable => {
                    return (
                      <tr key={cable.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        
                        {/* Label & Tipe */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-800/50 flex-shrink-0">
                              <Cable className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold font-mono text-slate-900 dark:text-slate-100">
                                {cable.cableCode}
                              </div>
                              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {getCableTypeLabel(cable.cableType)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Titik Asal */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {cable.sourceDeviceName || 'Node Asal'}
                          </div>
                          {cable.sourcePort && (
                            <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                              {cable.sourcePort}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate max-w-[180px]">{cable.sourceLocation}</span>
                          </div>
                        </td>

                        {/* Arah Icon */}
                        <td className="py-3.5 px-2 text-center whitespace-nowrap">
                          <div className="inline-flex p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </td>

                        {/* Titik Tujuan */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {cable.targetDeviceName || 'Node Tujuan'}
                          </div>
                          {cable.targetPort && (
                            <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                              {cable.targetPort}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate max-w-[180px]">{cable.targetLocation}</span>
                          </div>
                        </td>

                        {/* Jalur & Panjang */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {cable.lengthMeter ? `${cable.lengthMeter} Meter` : '-'}
                          </div>
                          {cable.pathwayRoute && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[180px]" title={cable.pathwayRoute}>
                              Rute: {cable.pathwayRoute}
                            </div>
                          )}
                          {cable.color && (
                            <div className="text-[10px] text-slate-400">
                              Warna: {cable.color}
                            </div>
                          )}
                        </td>

                        {/* Spesifikasi Link */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-[11px] text-slate-700 dark:text-slate-300">
                            {cable.speedMbps ? (cable.speedMbps >= 1000 ? `${cable.speedMbps / 1000} Gbps` : `${cable.speedMbps} Mbps`) : '1 Gbps'}
                          </span>
                          {cable.pic && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              PIC: {cable.pic}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {cable.status === 'connected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Terhubung
                            </span>
                          )}
                          {cable.status === 'idle' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              Siaga (Idle)
                            </span>
                          )}
                          {cable.status === 'fault' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900 animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Kendala / Putus
                            </span>
                          )}
                          {cable.status === 'maintenance' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              Perawatan
                            </span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => onOpenEditCableModal(cable)}
                              title="Edit Data Jalur Kabel"
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCableItem(cable)}
                              title="Hapus Jalur Kabel"
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
      )}

      {/* TABEL 2: PERANGKAT FISIK LAN (SWITCH, PATCH PANEL, ROUTER) */}
      {activeSubTab === 'devices' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Nama Perangkat & Kode</th>
                  <th className="py-3.5 px-4">Tipe Hardware</th>
                  <th className="py-3.5 px-4">Lokasi & Rak</th>
                  <th className="py-3.5 px-4">Total Port</th>
                  <th className="py-3.5 px-4">IP Management</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">PIC</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredDevices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Server className="w-10 h-10 mx-auto mb-2 opacity-30 text-blue-500" />
                      <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">Belum ada perangkat fisik LAN</p>
                      <p className="text-xs text-slate-400 mt-1">Klik "Tambah Perangkat LAN Baru" untuk mendata switch, router, atau patch panel.</p>
                    </td>
                  </tr>
                ) : (
                  filteredDevices.map(device => {
                    return (
                      <tr key={device.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Nama & Kode */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-800/50 flex-shrink-0">
                              <Server className="w-4 h-4" />
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
                            {getDeviceTypeLabel(device.type)}
                          </span>
                          {device.brand && (
                            <div className="text-[11px] text-slate-400">
                              {device.brand} {device.model || ''}
                            </div>
                          )}
                        </td>

                        {/* Lokasi & Rak */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{device.location}</span>
                          </div>
                          {device.rackNumber && (
                            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                              Posisi: {device.rackNumber}
                            </div>
                          )}
                        </td>

                        {/* Port */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {device.totalPorts ? `${device.totalPorts} Port` : '-'}
                          </span>
                        </td>

                        {/* IP Management */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-blue-600 dark:text-blue-400 font-semibold">
                          {device.ipAddress || '-'}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {device.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {device.status}
                            </span>
                          )}
                        </td>

                        {/* PIC */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{device.pic || '-'}</div>
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => onOpenEditDeviceModal(device)}
                              title="Edit Data Perangkat"
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDeviceItem(device)}
                              title="Hapus Perangkat"
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
      )}

    </div>
  );
};
