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
  AlertTriangle, 
  Layers, 
  Wind,
  Gauge,
  Building2,
  ArrowRight,
  ArrowLeft,
  Route,
  Activity
} from 'lucide-react';
import { WaterDevice, WaterPipeRun, WaterStatus, WaterDeviceType, LanLocation, LanZone } from '../types/utilityNetworks';
import { showConfirm, showSuccess, showWarning } from '../utils/swal';

interface WaterViewProps {
  locations: LanLocation[];
  zones: LanZone[];
  devices: WaterDevice[];
  pipes: WaterPipeRun[];
  onSaveLocation?: (loc: Partial<LanLocation>) => void;
  onDeleteLocation?: (id: string) => void;
  onSaveZone?: (zone: Partial<LanZone>) => void;
  onDeleteZone?: (id: string) => void;
  onSaveDevice: (device: Partial<WaterDevice>) => void;
  onDeleteDevice: (id: string) => void;
  onSavePipe?: (pipe: Partial<WaterPipeRun>) => void;
  onDeletePipe?: (id: string) => void;
  onOpenAddLocationModal: () => void;
  onOpenEditLocationModal: (loc: LanLocation) => void;
  onOpenAddZoneModal: (locationId?: string) => void;
  onOpenEditZoneModal: (zone: LanZone) => void;
  onOpenAddDeviceModal: (locationId?: string, zoneId?: string) => void;
  onOpenEditDeviceModal: (device: WaterDevice) => void;
  onOpenAddPipeModal: (locationId?: string, zoneId?: string) => void;
  onOpenEditPipeModal: (pipe: WaterPipeRun) => void;
}

export const WaterView: React.FC<WaterViewProps> = ({
  locations,
  zones,
  devices,
  pipes,
  onDeleteLocation,
  onDeleteZone,
  onDeleteDevice,
  onDeletePipe,
  onOpenAddLocationModal,
  onOpenEditLocationModal,
  onOpenAddZoneModal,
  onOpenEditZoneModal,
  onOpenAddDeviceModal,
  onOpenEditDeviceModal,
  onOpenAddPipeModal,
  onOpenEditPipeModal
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'devices' | 'pipes'>('devices');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const activeLocation = useMemo(() => {
    return locations.find(l => l.id === selectedLocationId) || null;
  }, [locations, selectedLocationId]);

  const activeZone = useMemo(() => {
    return zones.find(z => z.id === selectedZoneId) || null;
  }, [zones, selectedZoneId]);

  const locationZones = useMemo(() => {
    if (!selectedLocationId) return [];
    return zones.filter(z => z.locationId === selectedLocationId);
  }, [zones, selectedLocationId]);

  const contextDevices = useMemo(() => {
    if (selectedZoneId) {
      return devices.filter(d => d.zoneId === selectedZoneId);
    }
    if (selectedLocationId) {
      return devices.filter(d => d.locationId === selectedLocationId);
    }
    return devices;
  }, [devices, selectedLocationId, selectedZoneId]);

  const contextPipes = useMemo(() => {
    if (selectedZoneId) {
      return pipes.filter(p => p.zoneId === selectedZoneId);
    }
    if (selectedLocationId) {
      return pipes.filter(p => p.locationId === selectedLocationId);
    }
    return pipes;
  }, [pipes, selectedLocationId, selectedZoneId]);

  const stats = useMemo(() => {
    const total = contextDevices.length;
    const active = contextDevices.filter(d => d.status === 'active').length;
    const leakingOrIssue = contextDevices.filter(d => d.status === 'leaking' || d.status === 'maintenance').length;
    const totalTankCapacity = contextDevices.reduce((sum, d) => sum + (d.tankCapacityLiter || 0), 0);
    const totalFlowRate = contextDevices.reduce((sum, d) => sum + (d.flowRateLpm || 0), 0);
    const totalPipes = contextPipes.length;

    return { total, active, leakingOrIssue, totalTankCapacity, totalFlowRate, totalPipes };
  }, [contextDevices, contextPipes]);

  const filteredDevices = useMemo(() => {
    return contextDevices.filter(d => {
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
  }, [contextDevices, searchQuery, filterType, filterStatus]);

  const filteredPipes = useMemo(() => {
    return contextPipes.filter(p => {
      const src = p.sourcePoint || p.sourceLocation || '';
      const tgt = p.targetPoint || p.targetLocation || '';
      const code = p.pipeCode || '';
      const dia = p.pipeDiameter || p.diameterInch || '';
      const matchSearch = 
        code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        src.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tgt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.pipeType && p.pipeType.toLowerCase().includes(searchQuery.toLowerCase())) ||
        dia.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.pathwayRoute && p.pathwayRoute.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [contextPipes, searchQuery, filterStatus]);

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

  const handleDeleteLocationItem = async (loc: LanLocation) => {
    const locZones = zones.filter(z => z.locationId === loc.id);
    const locDevs = devices.filter(d => d.locationId === loc.id);
    const locPipes = pipes.filter(p => p.locationId === loc.id);

    if (locZones.length > 0 || locDevs.length > 0 || locPipes.length > 0) {
      const details = [];
      if (locZones.length > 0) details.push(`${locZones.length} jaringan air`);
      if (locDevs.length > 0) details.push(`${locDevs.length} pompa/toren`);
      if (locPipes.length > 0) details.push(`${locPipes.length} jalur pipa air`);

      await showWarning(
        'Lokasi Tidak Dapat Dihapus!',
        `Lokasi "${loc.name}" masih memiliki ${details.join(', ')}. Kosongkan data di dalamnya terlebih dahulu.`
      );
      return;
    }

    const confirmed = await showConfirm({
      title: 'Hapus Lokasi?',
      text: `Apakah Anda yakin ingin menghapus lokasi "${loc.name}"?`,
      confirmButtonText: 'Ya, Hapus Lokasi',
      cancelButtonText: 'Batal'
    });
    if (confirmed && onDeleteLocation) {
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
    const zonePipes = pipes.filter(p => p.zoneId === zone.id);

    if (zoneDevs.length > 0 || zonePipes.length > 0) {
      const details = [];
      if (zoneDevs.length > 0) details.push(`${zoneDevs.length} perangkat`);
      if (zonePipes.length > 0) details.push(`${zonePipes.length} jalur pipa`);

      await showWarning(
        'Jaringan Air Tidak Dapat Dihapus!',
        `Jaringan "${zone.name}" masih memiliki ${details.join(' dan ')}. Kosongkan perangkat dan pipa di dalamnya terlebih dahulu.`
      );
      return;
    }

    const confirmed = await showConfirm({
      title: 'Hapus Jaringan Air?',
      text: `Apakah Anda yakin ingin menghapus jaringan "${zone.name}"?`,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (confirmed && onDeleteZone) {
      onDeleteZone(zone.id);
      if (selectedZoneId === zone.id) {
        setSelectedZoneId(null);
      }
      showSuccess('Jaringan air berhasil dihapus!');
    }
  };

  const handleDeleteDevice = async (dev: WaterDevice) => {
    const confirmed = await showConfirm({
      title: 'Hapus Perangkat Air / Irigasi?',
      text: `Perangkat "${dev.name}" (${dev.code || dev.location}) akan dihapus permanen dari sistem.`,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (confirmed) {
      onDeleteDevice(dev.id);
      showSuccess('Perangkat air berhasil dihapus!');
    }
  };

  const handleDeletePipe = async (pipe: WaterPipeRun) => {
    const confirmed = await showConfirm({
      title: 'Hapus Jalur Pipa Air?',
      text: `Hapus rute jalur "${pipe.pipeCode}"?`,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (confirmed && onDeletePipe) {
      onDeletePipe(pipe.id);
      showSuccess('Jalur pipa air berhasil dihapus!');
    }
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      {/* TINGKAT 1: DAFTAR LOKASI */}
      {selectedLocationId === null && (
        <div className="space-y-6">
          <div className="bg-slate-300 dark:bg-slate-800/95 border border-slate-400/80 dark:border-slate-700 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
                <Building2 className="w-6 h-6 text-cyan-600" />
                <span>Daftar Lokasi Jaringan Air & Irigasi</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Pilih lokasi tempat instalasi plumbing atau irigasi untuk melihat daftar jaringan distribusi air di dalamnya
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <span className="text-xs font-bold px-3 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-center sm:text-left">
                {locations.length} Lokasi Terdata
              </span>
              <button
                onClick={onOpenAddLocationModal}
                className="w-full sm:w-auto px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                Mulai dengan menambahkan lokasi sistem jaringan air pertama Anda.
              </p>
              <button
                onClick={onOpenAddLocationModal}
                className="mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-600/25 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Lokasi Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {locations.map((loc) => {
                const locZones = zones.filter(z => z.locationId === loc.id);
                const locDevices = devices.filter(d => d.locationId === loc.id);
                const locPipes = pipes.filter(p => p.locationId === loc.id);
                const totalLiter = locDevices.reduce((sum, d) => sum + (d.tankCapacityLiter || 0), 0);

                return (
                  <div
                    key={loc.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                          <Droplets className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditLocationModal(loc);
                            }}
                            className="p-1.5 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Lokasi"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLocationItem(loc);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Hapus Lokasi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {loc.code || 'LOKASI'}
                        </span>
                        <h3 className="text-base font-bold text-slate-800 dark:text-white mt-1.5 line-clamp-1">
                          {loc.name}
                        </h3>
                        {loc.address && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {loc.address}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                            {locZones.length}
                          </span>
                          <span className="block text-[10px] text-slate-400">Jaringan Air</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                            {locDevices.length}
                          </span>
                          <span className="block text-[10px] text-slate-400">Pompa/Toren</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                            {locPipes.length}
                          </span>
                          <span className="block text-[10px] text-slate-400">Jalur Pipa</span>
                        </div>
                      </div>

                      {totalLiter > 0 && (
                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                          <span>Kapasitas Cadangan:</span>
                          <span className="font-bold text-cyan-600 dark:text-cyan-400">{totalLiter.toLocaleString('id-ID')} Liter</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedLocationId(loc.id);
                        setSelectedZoneId(null);
                      }}
                      className="mt-4 w-full py-2.5 px-4 bg-cyan-50 hover:bg-cyan-600 text-cyan-700 hover:text-white dark:bg-cyan-950/30 dark:hover:bg-cyan-600 dark:text-cyan-300 dark:hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Buka Jaringan Air</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TINGKAT 2: DAFTAR JARINGAN DISTRIBUSI AIR DI LOKASI TERPILIH */}
      {selectedLocationId !== null && selectedZoneId === null && activeLocation && (
        <div className="space-y-6">
          <div className="bg-slate-300 dark:bg-slate-800/95 border border-slate-400/80 dark:border-slate-700 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => setSelectedLocationId(null)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:underline cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Daftar Lokasi</span>
                </button>
                <span className="text-slate-400">/</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{activeLocation.name}</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
                <Layers className="w-6 h-6 text-cyan-600" />
                <span>Daftar Jaringan Air - {activeLocation.name}</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Pilih atau tambah jaringan air (misal: Jalur Air Bersih Gedung, Jalur Irigasi Taman & Kebun)
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setSelectedLocationId(null)}
                className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                onClick={() => onOpenAddZoneModal(activeLocation.id)}
                className="w-full sm:w-auto px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jaringan</span>
              </button>
            </div>
          </div>

          {locationZones.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Layers className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-600 opacity-60" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">Belum ada Jaringan Air di {activeLocation.name}</h4>
              <p className="text-xs max-w-md mx-auto">
                Buat nama jaringan air pertama (misalnya: Jaringan Air Bersih, Jaringan Irigasi Sprinkler Kebun).
              </p>
              <button
                onClick={() => onOpenAddZoneModal(activeLocation.id)}
                className="mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-600/25 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jaringan Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {locationZones.map((zone) => {
                const zoneDevices = devices.filter(d => d.zoneId === zone.id);
                const zonePipes = pipes.filter(p => p.zoneId === zone.id);

                return (
                  <div
                    key={zone.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                          <Droplets className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditZoneModal(zone);
                            }}
                            className="p-1.5 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Jaringan"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteZoneItem(zone);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Hapus Jaringan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                          {zone.code || 'JARINGAN'}
                        </span>
                        <h3 className="text-base font-bold text-slate-800 dark:text-white mt-1.5 line-clamp-1">
                          {zone.name}
                        </h3>
                        {zone.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {zone.notes}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                            {zoneDevices.length}
                          </span>
                          <span className="block text-[10px] text-slate-400">Pompa / Tangki</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                            {zonePipes.length}
                          </span>
                          <span className="block text-[10px] text-slate-400">Jalur Pipa Air</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedZoneId(zone.id)}
                      className="mt-4 w-full py-2.5 px-4 bg-cyan-50 hover:bg-cyan-600 text-cyan-700 hover:text-white dark:bg-cyan-950/30 dark:hover:bg-cyan-600 dark:text-cyan-300 dark:hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Buka Pompa & Jalur Pipa</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TINGKAT 3: DETAIL JARINGAN (POMPA/TOREN & JALUR PIPA AIR) */}
      {selectedLocationId !== null && selectedZoneId !== null && activeLocation && activeZone && (
        <div className="space-y-6">
          <div className="bg-slate-300 dark:bg-slate-800/95 border border-slate-400/80 dark:border-slate-700 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => setSelectedLocationId(null)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:underline cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{activeLocation.name}</span>
                </button>
                <span className="text-slate-400">/</span>
                <button
                  onClick={() => setSelectedZoneId(null)}
                  className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:underline cursor-pointer"
                >
                  Daftar Jaringan
                </button>
                <span className="text-slate-400">/</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{activeZone.name}</span>
              </div>

              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
                <Droplets className="w-6 h-6 text-cyan-600" />
                <span>{activeZone.name}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30">
                  {activeLocation.name}
                </span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Kelola pompa, toren air, katup solenoid, dan pencatatan rute jalur pipa air
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setSelectedZoneId(null)}
                className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              {activeSubTab === 'devices' ? (
                <button
                  onClick={() => onOpenAddDeviceModal(activeLocation.id, activeZone.id)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Perangkat Baru</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenAddPipeModal(activeLocation.id, activeZone.id)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Catat Jalur Baru</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 KPI Ringkasan Irigasi & Air */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Alat Air</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.total}</h3>
                </div>
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded-2xl">
                  <Droplets className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                <span className="font-bold text-emerald-600">{stats.active} aktif</span>
                <span>•</span>
                <span>{stats.leakingOrIssue} kendala/bocor</span>
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kapasitas Toren</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                    {stats.totalTankCapacity.toLocaleString('id-ID')} L
                  </h3>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <Gauge className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Volume tampungan cadangan</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Debit Total Pompa</p>
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {stats.totalFlowRate.toLocaleString('id-ID')} LPM
                  </h3>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <Wind className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Liter Per Menit kumulatif</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jalur Pipa Distribusi</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.totalPipes}</h3>
                </div>
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded-2xl">
                  <Route className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Pipa PVC / PPR / HDPE aktif</p>
            </div>
          </div>

          {/* Sub Tab Switching */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => {
                setActiveSubTab('devices');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'devices'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Droplets className="w-4 h-4" />
              <span>Pompa, Toren & Katup ({contextDevices.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab('pipes');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'pipes'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Route className="w-4 h-4" />
              <span>Pencatatan Jalur Pipa ({contextPipes.length})</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeSubTab === 'devices' ? "Cari nama alat, kode, lokasi, PIC..." : "Cari kode label pipa, titik asal, tujuan..."}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              {activeSubTab === 'devices' && (
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-hidden focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">Semua Tipe Alat Air</option>
                  <option value="pump_submersible">Pompa Submersible</option>
                  <option value="pump_booster">Pompa Booster</option>
                  <option value="water_tank">Toren Air</option>
                  <option value="valve_solenoid">Katup Solenoid</option>
                  <option value="valve_manual">Stop Kran Manual</option>
                  <option value="sprinkler_zone">Sprinkler Zone</option>
                  <option value="filter_water">Filter Air</option>
                </select>
              )}

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-hidden focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">Semua Status</option>
                <option value="active">Mengalir Aktif / Normal</option>
                <option value="standby">Siaga (Standby)</option>
                <option value="leaking">Bocor / Masalah</option>
                <option value="maintenance">Perbaikan</option>
                <option value="off">Ditutup / Off</option>
              </select>
            </div>
          </div>

          {/* TAB 1: Komponen Pompa & Tangki */}
          {activeSubTab === 'devices' && (
            <div>
              {filteredDevices.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
                  <Droplets className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 opacity-60" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Tidak ada perangkat ditemukan</h4>
                  <p className="text-xs">
                    {searchQuery ? 'Coba ubah kata kunci pencarian Anda.' : 'Belum ada perangkat air di jaringan ini. Klik tombol di atas untuk menambah.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDevices.map((dev) => (
                    <div
                      key={dev.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                              <Droplets className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {getTypeLabel(dev.type)}
                              </span>
                              <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                                {dev.name}
                              </h4>
                            </div>
                          </div>
                          {getStatusBadge(dev.status)}
                        </div>

                        <div className="mt-4 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Lokasi:</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{dev.location}</span>
                          </div>
                          {dev.code && (
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                              <span>Kode Alat:</span>
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{dev.code}</span>
                            </div>
                          )}
                          {dev.tankCapacityLiter && (
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                              <span>Kapasitas Tangki:</span>
                              <span className="font-bold text-cyan-600 dark:text-cyan-400">{dev.tankCapacityLiter.toLocaleString('id-ID')} Liter</span>
                            </div>
                          )}
                          {dev.flowRateLpm && (
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                              <span>Debit Aliran:</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{dev.flowRateLpm} LPM</span>
                            </div>
                          )}
                          {dev.pressureBar && (
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                              <span>Tekanan Operasional:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{dev.pressureBar} Bar</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenEditDeviceModal(dev)}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 text-slate-600 dark:text-slate-300 hover:text-cyan-600 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteDevice(dev)}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-600 dark:text-slate-300 hover:text-rose-600 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Pencatatan Jalur Pipa Air */}
          {activeSubTab === 'pipes' && (
            <div>
              {filteredPipes.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
                  <Route className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 opacity-60" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada rute jalur pipa</h4>
                  <p className="text-xs">
                    Catat rute pipa dari toren / pompa ke solenoid, sprinkler, atau kran.
                  </p>
                  <button
                    onClick={() => onOpenAddPipeModal(activeLocation.id, activeZone.id)}
                    className="mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-600/25 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Catat Jalur Baru</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPipes.map((pipe) => {
                    const src = pipe.sourcePoint || pipe.sourceLocation || '';
                    const tgt = pipe.targetPoint || pipe.targetLocation || '';
                    const len = pipe.lengthMeter || pipe.lengthMeters || 0;
                    const dia = pipe.pipeDiameter || pipe.diameterInch || '';

                    return (
                      <div
                        key={pipe.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                                <Route className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">
                                  {pipe.pipeCode}
                                </span>
                                <span className="block text-[10px] text-slate-400">{pipe.pipeType} {dia ? `(${dia})` : ''}</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              pipe.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              pipe.status === 'leaking' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {pipe.status === 'active' ? 'Mengalir' : pipe.status === 'leaking' ? 'Bocor' : pipe.status}
                            </span>
                          </div>

                          <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Titik Asal (Pompa / Toren / Sumber):</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{src}</span>
                            </div>
                            <div className="flex items-center justify-center text-cyan-500 py-0.5">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Titik Tujuan (Kran / Solenoid / Ruang):</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{tgt}</span>
                            </div>
                          </div>

                          <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            {len > 0 && (
                              <div className="flex justify-between">
                                <span>Estimasi Panjang:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{len} Meter</span>
                              </div>
                            )}
                            {pipe.pressureBar && (
                              <div className="flex justify-between">
                                <span>Tekanan Pipa:</span>
                                <span className="font-bold text-cyan-600 dark:text-cyan-400">{pipe.pressureBar} Bar</span>
                              </div>
                            )}
                            {pipe.pathwayRoute && (
                              <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                Rute: {pipe.pathwayRoute}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenEditPipeModal(pipe)}
                            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 text-slate-600 dark:text-slate-300 hover:text-cyan-600 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeletePipe(pipe)}
                            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-600 dark:text-slate-300 hover:text-rose-600 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
