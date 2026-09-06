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
  ArrowLeft,
  MapPin, 
  Building2,
  ChevronRight,
  FolderTree,
  Sliders, 
  Tag,
  Boxes,
  Zap,
  Radio,
  FileSpreadsheet,
  Activity,
  Maximize2,
  Phone,
  Info
} from 'lucide-react';
import { 
  LanDevice, 
  LanCableRun, 
  LanLocation, 
  LanZone, 
  LanDeviceType, 
  LanCableType, 
  CableRunStatus 
} from '../types/utilityNetworks';
import { showConfirm, showSuccess, showWarning } from '../utils/swal';

interface LanViewProps {
  locations: LanLocation[];
  zones: LanZone[];
  devices: LanDevice[];
  cables: LanCableRun[];
  onSaveLocation: (loc: Partial<LanLocation>) => void;
  onDeleteLocation: (id: string) => void;
  onSaveZone: (zone: Partial<LanZone>) => void;
  onDeleteZone: (id: string) => void;
  onSaveDevice: (device: Partial<LanDevice>) => void;
  onDeleteDevice: (id: string) => void;
  onSaveCable: (cable: Partial<LanCableRun>) => void;
  onDeleteCable: (id: string) => void;
  onOpenAddLocationModal: () => void;
  onOpenEditLocationModal: (loc: LanLocation) => void;
  onOpenAddZoneModal: (locationId?: string) => void;
  onOpenEditZoneModal: (zone: LanZone) => void;
  onOpenAddDeviceModal: (locationId?: string, zoneId?: string) => void;
  onOpenEditDeviceModal: (device: LanDevice) => void;
  onOpenAddCableModal: (locationId?: string, zoneId?: string) => void;
  onOpenEditCableModal: (cable: LanCableRun) => void;
}

export const LanView: React.FC<LanViewProps> = ({
  locations,
  zones,
  devices,
  cables,
  onDeleteLocation,
  onDeleteZone,
  onDeleteDevice,
  onDeleteCable,
  onOpenAddLocationModal,
  onOpenEditLocationModal,
  onOpenAddZoneModal,
  onOpenEditZoneModal,
  onOpenAddDeviceModal,
  onOpenEditDeviceModal,
  onOpenAddCableModal,
  onOpenEditCableModal
}) => {
  // Navigation Hirarki Bertahap:
  // selectedLocationId === null: TINGKAT 1 -> Tampilan Daftar Lokasi / Tempat (Sekolah 1, Sekolah 2, dst)
  // selectedLocationId !== null && selectedZoneId === null: TINGKAT 2 -> Tampilan Daftar Jaringan Lab di Sekolah terpilih (Lab 1, Lab 2, dst)
  // selectedLocationId !== null && selectedZoneId !== null: TINGKAT 3 -> Tampilan Detail Lab: Perangkat & Jalur Kabel
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Tab di dalam Lab (Tingkat 3): 'cables' | 'devices'
  const [activeSubTab, setActiveSubTab] = useState<'cables' | 'devices'>('cables');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Objek aktif saat ini
  const activeLocation = useMemo(() => {
    return locations.find(l => l.id === selectedLocationId) || null;
  }, [locations, selectedLocationId]);

  const activeZone = useMemo(() => {
    return zones.find(z => z.id === selectedZoneId) || null;
  }, [zones, selectedZoneId]);

  // Zona di dalam Lokasi terpilih
  const locationZones = useMemo(() => {
    if (!selectedLocationId) return [];
    return zones.filter(z => z.locationId === selectedLocationId);
  }, [zones, selectedLocationId]);

  // Perangkat di dalam konteks aktif Lab terpilih
  const contextDevices = useMemo(() => {
    if (selectedZoneId) {
      return devices.filter(d => d.zoneId === selectedZoneId);
    }
    if (selectedLocationId) {
      return devices.filter(d => d.locationId === selectedLocationId);
    }
    return devices;
  }, [devices, selectedLocationId, selectedZoneId]);

  // Kabel di dalam konteks aktif Lab terpilih
  const contextCables = useMemo(() => {
    if (selectedZoneId) {
      return cables.filter(c => c.zoneId === selectedZoneId);
    }
    if (selectedLocationId) {
      return cables.filter(c => c.locationId === selectedLocationId);
    }
    return cables;
  }, [cables, selectedLocationId, selectedZoneId]);

  // KPI STATS untuk Lab terpilih
  const stats = useMemo(() => {
    const totalCables = contextCables.length;
    const connectedCables = contextCables.filter(c => c.status === 'connected').length;
    const totalMeters = contextCables.reduce((sum, c) => sum + (c.lengthMeter || 0), 0);
    const totalDevices = contextDevices.length;
    const switches = contextDevices.filter(d => d.type.startsWith('switch')).length;
    const patchPanels = contextDevices.filter(d => d.type === 'patch_panel').length;
    const faultCables = contextCables.filter(c => c.status === 'fault').length;

    return { totalCables, connectedCables, totalMeters, totalDevices, switches, patchPanels, faultCables };
  }, [contextCables, contextDevices]);

  // Filter Jalur Kabel
  const filteredCables = useMemo(() => {
    return contextCables.filter(c => {
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
  }, [contextCables, searchQuery, filterType, filterStatus]);

  // Filter Perangkat Fisik
  const filteredDevices = useMemo(() => {
    return contextDevices.filter(d => {
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
  }, [contextDevices, searchQuery, filterType, filterStatus]);

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
      case 'switch_distribution': return 'Switch Distribusi Lab';
      case 'switch_access': return 'Switch Access';
      case 'patch_panel': return 'Patch Panel';
      case 'router_gateway': return 'Router Gateway';
      case 'otb_fiber': return 'OTB Fiber Optic';
      case 'access_point': return 'Access Point';
      case 'server_host': return 'Server Komputer / CBT';
      case 'wallplate_jack': return 'Wallplate RJ45';
      default: return 'Perangkat LAN';
    }
  };

  const handleDeleteLocationItem = async (loc: LanLocation) => {
    const locZones = zones.filter(z => z.locationId === loc.id);
    const locDevs = devices.filter(d => d.locationId === loc.id);
    const locCbls = cables.filter(c => c.locationId === loc.id);

    // Proteksi: Jika lokasi sudah memiliki jaringan lab, perangkat, atau kabel, tidak bisa dihapus
    if (locZones.length > 0 || locDevs.length > 0 || locCbls.length > 0) {
      const details = [];
      if (locZones.length > 0) details.push(`${locZones.length} jaringan lab`);
      if (locDevs.length > 0) details.push(`${locDevs.length} perangkat`);
      if (locCbls.length > 0) details.push(`${locCbls.length} jalur kabel`);

      await showWarning(
        'Lokasi Tidak Dapat Dihapus!',
        `Lokasi "${loc.name}" masih memiliki ${details.join(', ')}. Hapus atau kosongkan terlebih dahulu data di dalamnya sebelum menghapus lokasi ini.`
      );
      return;
    }

    const confirmed = await showConfirm({
      title: 'Hapus Lokasi?',
      text: `Apakah Anda yakin ingin menghapus lokasi "${loc.name}"?`,
      confirmButtonText: 'Ya, Hapus Lokasi',
      cancelButtonText: 'Batal'
    });
    if (confirmed) {
      onDeleteLocation(loc.id);
      if (selectedLocationId === loc.id) {
        setSelectedLocationId(null);
        setSelectedZoneId(null);
      }
      showSuccess('Lokasi berhasil dihapus!');
    }
  };

  const handleDeleteZoneItem = async (zone: LanZone) => {
    const zoneDevs = devices.filter(d => d.zoneId === zone.id);
    const zoneCbls = cables.filter(c => c.zoneId === zone.id);

    // Proteksi: Jika jaringan lab sudah memiliki perangkat atau jalur kabel, tidak bisa dihapus
    if (zoneDevs.length > 0 || zoneCbls.length > 0) {
      const details = [];
      if (zoneDevs.length > 0) details.push(`${zoneDevs.length} perangkat`);
      if (zoneCbls.length > 0) details.push(`${zoneCbls.length} jalur kabel`);

      await showWarning(
        'Jaringan Lab Tidak Dapat Dihapus!',
        `Jaringan "${zone.name}" masih memiliki ${details.join(' dan ')}. Hapus terlebih dahulu perangkat dan kabel di dalam lab ini sebelum menghapus jaringan lab.`
      );
      return;
    }

    const confirmed = await showConfirm({
      title: 'Hapus Jaringan Ruangan / Lab?',
      text: `Apakah Anda yakin ingin menghapus lab "${zone.name}"?`,
      confirmButtonText: 'Ya, Hapus Lab',
      cancelButtonText: 'Batal'
    });
    if (confirmed) {
      onDeleteZone(zone.id);
      if (selectedZoneId === zone.id) {
        setSelectedZoneId(null);
      }
      showSuccess('Jaringan Lab/Ruang berhasil dihapus!');
    }
  };

  const handleDeleteCableItem = async (cable: LanCableRun) => {
    const confirmed = await showConfirm({
      title: 'Hapus Jalur Kabel LAN?',
      text: `Hapus data jalur kabel kode "${cable.cableCode}"?`,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (confirmed) {
      onDeleteCable(cable.id);
      showSuccess('Jalur kabel berhasil dihapus!');
    }
  };

  const handleDeleteDeviceItem = async (device: LanDevice) => {
    // Proteksi: Jika komponen/perangkat sudah digunakan pada jalur kabel (baik titik asal maupun tujuan), tidak bisa dihapus
    const connectedCables = cables.filter(c => 
      c.sourceDeviceId === device.id || 
      c.targetDeviceId === device.id ||
      (device.name && (c.sourceDeviceName?.toLowerCase() === device.name.toLowerCase() || c.targetDeviceName?.toLowerCase() === device.name.toLowerCase()))
    );

    if (connectedCables.length > 0) {
      await showWarning(
        'Perangkat Tidak Dapat Dihapus!',
        `Perangkat "${device.name}" sedang digunakan pada ${connectedCables.length} jalur kabel (sebagai titik asal atau titik tujuan: ${connectedCables.map(c => c.cableCode).slice(0, 3).join(', ')}${connectedCables.length > 3 ? '...' : ''}). Hapus atau alihkan jalur kabel terkait terlebih dahulu.`
      );
      return;
    }

    const confirmed = await showConfirm({
      title: 'Hapus Perangkat LAN?',
      text: `Hapus perangkat "${device.name}"?`,
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
      
      {/* ========================================================================= */}
      {/* TINGKAT 1: DAFTAR LOKASI / SEKOLAH (YANG PERTAMA MUNCUL SAAT KLIK JARINGAN LAN) */}
      {/* ========================================================================= */}
      {selectedLocationId === null && (
        <div className="space-y-6">
          <div className="bg-slate-300 dark:bg-slate-800/95 border border-slate-400/80 dark:border-slate-700 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
                <Building2 className="w-6 h-6 text-blue-600" />
                <span>Daftar Lokasi Tempat Jaringan LAN</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Pilih lokasi (misal: Kantor Pusat, Gedung A, Cabang 1) untuk melihat daftar jaringan ruangan/lab di dalamnya
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <span className="text-xs font-bold px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-center sm:text-left">
                {locations.length} Lokasi Terdata
              </span>
              <button
                onClick={onOpenAddLocationModal}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Lokasi</span>
              </button>
            </div>
          </div>

          {locations.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Building2 className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-600 opacity-60" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">Belum ada Lokasi</h4>
              <p className="text-xs max-w-md mx-auto">
                Mulai dengan menambahkan lokasi tempat jaringan komputer pertama Anda (misalnya: Gedung Utama, Kantor Cabang, Kampus).
              </p>
              <button
                onClick={onOpenAddLocationModal}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/25 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Lokasi Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {locations.map(loc => {
                const locZones = zones.filter(z => z.locationId === loc.id);
                const locDevices = devices.filter(d => d.locationId === loc.id);
                const locCables = cables.filter(c => c.locationId === loc.id);

                return (
                  <div
                    key={loc.id}
                    className="p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Bar Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800/60">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditLocationModal(loc);
                            }}
                            title="Edit Data Lokasi"
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {(() => {
                            const hasLocData = locZones.length > 0 || locDevices.length > 0 || locCables.length > 0;
                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLocationItem(loc);
                                }}
                                title={hasLocData ? `Tidak dapat dihapus: masih ada ${locZones.length} lab / ${locDevices.length} perangkat / ${locCables.length} kabel` : "Hapus Lokasi"}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  hasLocData 
                                    ? 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-not-allowed opacity-60' 
                                    : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Info Lokasi */}
                      <div className="mt-4">
                        {loc.code && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {loc.code}
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1.5 leading-snug group-hover:text-blue-600 transition-colors">
                          {loc.name}
                        </h3>
                        {loc.address && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="line-clamp-1">{loc.address}</span>
                          </p>
                        )}
                        {loc.pic && (
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                            <Info className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span>PIC: {loc.pic} {loc.phone ? `(${loc.phone})` : ''}</span>
                          </p>
                        )}
                      </div>

                      {/* Stat ringkasan tingkat 2 & 3 */}
                      <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
                          <span className="text-[10px] text-slate-400 block font-medium">Jaringan Lab</span>
                          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{locZones.length}</span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
                          <span className="text-[10px] text-slate-400 block font-medium">Perangkat</span>
                          <span className="text-sm font-black text-slate-800 dark:text-slate-200">{locDevices.length}</span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
                          <span className="text-[10px] text-slate-400 block font-medium">Jalur Kabel</span>
                          <span className="text-sm font-black text-blue-600 dark:text-blue-400">{locCables.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Klik Masuk ke Tingkat 2 (Daftar Jaringan Lab) */}
                    <button
                      onClick={() => {
                        setSelectedLocationId(loc.id);
                        setSelectedZoneId(null);
                      }}
                      className="mt-5 w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
                    >
                      <span>Buka</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TINGKAT 2: DAFTAR JARINGAN RUANGAN / LAB DI DALAM LOKASI TERPILIH */}
      {/* ========================================================================= */}
      {selectedLocationId !== null && selectedZoneId === null && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                  {activeLocation?.code || 'SEKOLAH'}
                </span>
                <span className="text-xs text-slate-400">• Lokasi: {activeLocation?.address || 'Area Kampus'}</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1 flex items-center gap-2.5">
                <Network className="w-6 h-6 text-indigo-600" />
                <span>Daftar Jaringan Ruangan & Lab di {activeLocation?.name}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Klik salah satu jaringan lab di bawah ini (misal: Jaringan Lab 1, Lab 2, Lab 3) untuk melihat perangkat & jalur kabelnya
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => {
                  setSelectedLocationId(null);
                  setSelectedZoneId(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                onClick={() => onOpenAddZoneModal(selectedLocationId)}
                className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {locationZones.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Network className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-600 opacity-60" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">Belum ada Jaringan Lab di {activeLocation?.name}</h4>
              <p className="text-xs max-w-md mx-auto">
                Tambahkan jaringan ruangan pertama Anda (misal: Jaringan Lab 1 Komputer, Lab 2 RPL, Ruang Server CBT).
              </p>
              <button
                onClick={() => onOpenAddZoneModal(selectedLocationId)}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jaringan</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {locationZones.map(zone => {
                const zoneDevCount = devices.filter(d => d.zoneId === zone.id).length;
                const zoneCableCount = cables.filter(c => c.zoneId === zone.id).length;
                const zoneSwitches = devices.filter(d => d.zoneId === zone.id && d.type.startsWith('switch')).length;

                return (
                  <div
                    key={zone.id}
                    className="p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Bar Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800/60">
                          <Network className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditZoneModal(zone);
                            }}
                            title="Edit Info Lab"
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {(() => {
                            const hasZoneData = zoneDevCount > 0 || zoneCableCount > 0;
                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteZoneItem(zone);
                                }}
                                title={hasZoneData ? `Tidak dapat dihapus: masih ada ${zoneDevCount} perangkat / ${zoneCableCount} kabel di dalam lab ini` : "Hapus Lab"}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  hasZoneData 
                                    ? 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-not-allowed opacity-60' 
                                    : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Info Lab */}
                      <div className="mt-4">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {zone.code}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1.5 leading-snug group-hover:text-indigo-600 transition-colors">
                          {zone.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {zone.floor || 'Lantai 1'} • PIC: {zone.pic || '-'}
                        </p>
                        {zone.notes && (
                          <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 italic">
                            "{zone.notes}"
                          </p>
                        )}
                      </div>

                      {/* Info Stat Lab */}
                      <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="text-[10px] text-slate-400 block font-medium">Perangkat Terdata</span>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {zoneDevCount} Unit ({zoneSwitches} Switch)
                          </span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="text-[10px] text-slate-400 block font-medium">Jalur Kabel Tarikan</span>
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {zoneCableCount} Jalur
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Klik Masuk ke Tingkat 3 (Detail Lab: Perangkat & Jalur Kabel) */}
                    <button
                      onClick={() => setSelectedZoneId(zone.id)}
                      className="mt-5 w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
                    >
                      <span>Buka</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TINGKAT 3: DI DALAM LAB (PERANGKAT FISIK & PENCATATAN JALUR KABEL SERTA ARAHNYA) */}
      {/* ========================================================================= */}
      {selectedLocationId !== null && selectedZoneId !== null && activeZone && (
        <div className="space-y-6">
          
          {/* Top Lab Header Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                  {activeZone.code}
                </span>
                <span className="text-xs text-slate-400">• Lokasi: {activeLocation?.name} ({activeZone.floor || 'Lantai 1'})</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1 flex items-center gap-2">
                <Network className="w-6 h-6 text-indigo-600" />
                <span>Detail Jaringan: {activeZone.name}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Data perangkat keras dan pencatatan jalur kabel dari titik asal ke titik tujuan di dalam {activeZone.name}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setSelectedZoneId(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              {activeSubTab === 'cables' ? (
                <button
                  onClick={() => onOpenAddCableModal(selectedLocationId, selectedZoneId)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Catat Jalur Kabel ({activeZone.name})</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenAddDeviceModal(selectedLocationId, selectedZoneId)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Perangkat ({activeZone.name})</span>
                </button>
              )}
            </div>
          </div>

          {/* KPI METRICS LAB INI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perangkat Fisik</span>
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800/60">
                  <Server className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.totalDevices}</span>
                <span className="text-xs font-medium text-slate-500">Unit Hardware</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">{stats.switches} Switch & {stats.patchPanels} Patch Panel</p>
            </div>

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
              <p className="text-[11px] text-slate-400 mt-2">Rute UTP, Tray & Conduit</p>
            </div>

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
              <p className="text-[11px] text-slate-400 mt-2">{stats.faultCables} kabel mengalami kendala</p>
            </div>
          </div>

          {/* SUB-NAVIGASI: PENCATATAN JALUR KABEL VS PERANGKAT FISIK */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 w-full md:w-auto">
              <button
                onClick={() => {
                  setActiveSubTab('cables');
                  setFilterType('all');
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeSubTab === 'cables'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Cable className="w-4 h-4" />
                <span>Pencatatan Jalur Kabel ({contextCables.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveSubTab('devices');
                  setFilterType('all');
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeSubTab === 'devices'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>Perangkat Fisik Lab ({contextDevices.length})</span>
              </button>
            </div>

            {/* Action Button */}
            {activeSubTab === 'cables' ? (
              <button
                onClick={() => onOpenAddCableModal(selectedLocationId, selectedZoneId)}
                className="w-full md:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Jalur Kabel Baru ({activeZone.name})</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAddDeviceModal(selectedLocationId, selectedZoneId)}
                className="w-full md:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Perangkat Baru ({activeZone.name})</span>
              </button>
            )}
          </div>

          {/* FILTER & PENCARIAN */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={activeSubTab === 'cables' ? "Cari kode kabel, perangkat asal, tujuan, rute tray, PIC..." : "Cari nama perangkat, rack, lokasi, kode..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            {activeSubTab === 'cables' ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
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
                  className="w-full sm:w-auto px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <option value="all">Semua Status</option>
                  <option value="connected">🟢 Connected</option>
                  <option value="idle">🟡 Idle</option>
                  <option value="fault">🔴 Fault</option>
                  <option value="maintenance">🟠 Maintenance</option>
                </select>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <option value="all">Semua Jenis Perangkat</option>
                  <option value="switch_distribution">Switch Distribusi Lab</option>
                  <option value="switch_access">Switch Access</option>
                  <option value="switch_core">Switch Core</option>
                  <option value="patch_panel">Patch Panel</option>
                  <option value="router_gateway">Router Gateway</option>
                  <option value="server_host">Server Komputer / CBT</option>
                  <option value="access_point">Access Point</option>
                </select>
              </div>
            )}
          </div>

          {/* TAMPILAN KONTEN UTAMA: JALUR KABEL & ARAH TARIKAN */}
          {activeSubTab === 'cables' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Tabel Tarikan Kabel & Arah Jalur - {activeZone.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Daftar rute koneksi fisik dari titik asal menuju titik tujuan komputer / perangkat
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {filteredCables.length} Jalur Terdaftar
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Kode & Tipe</th>
                      <th className="py-3.5 px-4">Arah Dari (Titik Asal)</th>
                      <th className="py-3.5 px-4 text-center">Arah Jalur</th>
                      <th className="py-3.5 px-4">Arah Ke (Titik Tujuan)</th>
                      <th className="py-3.5 px-4">Rute & Spesifikasi</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {filteredCables.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                          <Cable className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                          Belum ada jalur kabel yang dicatat di {activeZone.name}.
                        </td>
                      </tr>
                    ) : (
                      filteredCables.map(cable => (
                        <tr key={cable.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap font-medium">
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-2 h-2 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: cable.color?.includes('Kuning') ? '#eab308' : cable.color?.includes('Merah') ? '#ef4444' : '#3b82f6' }} 
                              />
                              <div>
                                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                                  {cable.cableCode}
                                </span>
                                <div className="text-[10px] text-slate-400">
                                  {getCableTypeLabel(cable.cableType)} • {cable.color || 'Biru'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 max-w-[200px]">
                            <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                              {cable.sourceDeviceName || 'Perangkat Asal'}
                            </div>
                            {cable.sourcePort && (
                              <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 mt-0.5 border border-blue-200/60 dark:border-blue-800/60">
                                {cable.sourcePort}
                              </span>
                            )}
                            <div className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0 text-slate-300" />
                              <span>{cable.sourceLocation}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/60">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </td>

                          <td className="py-3 px-4 max-w-[200px]">
                            <div className="font-bold text-emerald-800 dark:text-emerald-300 truncate">
                              {cable.targetDeviceName || 'Perangkat / PC Tujuan'}
                            </div>
                            {cable.targetPort && (
                              <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 mt-0.5 border border-emerald-200/60 dark:border-emerald-800/60">
                                {cable.targetPort}
                              </span>
                            )}
                            <div className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0 text-slate-300" />
                              <span>{cable.targetLocation}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 max-w-[220px]">
                            {cable.pathwayRoute ? (
                              <div className="text-[11px] text-slate-700 dark:text-slate-300 truncate font-medium">
                                {cable.pathwayRoute}
                              </div>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {cable.lengthMeter ? `${cable.lengthMeter}m` : ''} • {cable.speedMbps ? (cable.speedMbps >= 1000 ? `${cable.speedMbps / 1000} Gbps` : `${cable.speedMbps} Mbps`) : ''}
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              cable.status === 'connected' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : cable.status === 'fault'
                                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                cable.status === 'connected' ? 'bg-emerald-500' : cable.status === 'fault' ? 'bg-rose-500' : 'bg-amber-500'
                              }`} />
                              <span className="capitalize">{cable.status}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onOpenEditCableModal(cable)}
                                title="Edit Jalur Kabel"
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCableItem(cable)}
                                title="Hapus Jalur Kabel"
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAMPILAN KONTEN: PERANGKAT FISIK LAN */}
          {activeSubTab === 'devices' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Tabel Perangkat Fisik LAN & Switch - {activeZone.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Data switch, router, patch panel, dan server CBT yang terpasang di ruangan {activeZone.name}
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {filteredDevices.length} Perangkat Terdaftar
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Nama Perangkat & Kode</th>
                      <th className="py-3.5 px-4">Jenis & Merek</th>
                      <th className="py-3.5 px-4">Lokasi Fisik & Rak</th>
                      <th className="py-3.5 px-4">Total Port</th>
                      <th className="py-3.5 px-4">IP & MAC Address</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {filteredDevices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                          <Server className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                          Belum ada perangkat fisik yang ditambahkan di {activeZone.name}.
                        </td>
                      </tr>
                    ) : (
                      filteredDevices.map(dev => (
                        <tr key={dev.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900 dark:text-slate-100">
                              {dev.name}
                            </div>
                            <span className="font-mono text-[10px] text-slate-400">
                              {dev.code || '-'}
                            </span>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-700 dark:text-slate-300">
                              {getDeviceTypeLabel(dev.type)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {dev.brand || '-'} {dev.model ? `(${dev.model})` : ''}
                            </div>
                          </td>

                          <td className="py-3 px-4 max-w-[200px]">
                            <div className="text-slate-800 dark:text-slate-200 truncate">
                              {dev.location}
                            </div>
                            {dev.rackNumber && (
                              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                                {dev.rackNumber}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-300">
                            {dev.totalPorts ? `${dev.totalPorts} Port` : '-'}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                            <div className="text-blue-600 dark:text-blue-400 font-bold">
                              {dev.ipAddress || '-'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {dev.macAddress || '-'}
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              dev.status === 'active' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : dev.status === 'fault'
                                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                dev.status === 'active' ? 'bg-emerald-500' : dev.status === 'fault' ? 'bg-rose-500' : 'bg-slate-400'
                              }`} />
                              <span className="capitalize">{dev.status}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onOpenEditDeviceModal(dev)}
                                title="Edit Perangkat"
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {(() => {
                                const isDeviceInUse = cables.some(c => 
                                  c.sourceDeviceId === dev.id || 
                                  c.targetDeviceId === dev.id ||
                                  (dev.name && (c.sourceDeviceName?.toLowerCase() === dev.name.toLowerCase() || c.targetDeviceName?.toLowerCase() === dev.name.toLowerCase()))
                                );
                                return (
                                  <button
                                    onClick={() => handleDeleteDeviceItem(dev)}
                                    title={isDeviceInUse ? "Tidak dapat dihapus: perangkat ini sedang digunakan pada jalur kabel" : "Hapus Perangkat"}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      isDeviceInUse 
                                        ? 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-not-allowed opacity-60' 
                                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
                                    }`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                );
                              })()}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
