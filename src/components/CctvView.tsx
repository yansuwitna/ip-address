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
  Camera, 
  ExternalLink,
  WifiOff,
  Layers,
  ArrowRight,
  ArrowLeft,
  Building2,
  Route,
  ShieldCheck,
  Tag,
  Printer
} from 'lucide-react';
import { CctvDevice, CctvCableRun, CctvStatus, CctvDeviceType, LanLocation, LanZone } from '../types/utilityNetworks';
import { showConfirm, showSuccess, showWarning } from '../utils/swal';

interface CctvViewProps {
  locations: LanLocation[];
  zones: LanZone[];
  devices: CctvDevice[];
  cables: CctvCableRun[];
  onSaveLocation?: (loc: Partial<LanLocation>) => void;
  onDeleteLocation?: (id: string) => void;
  onSaveZone?: (zone: Partial<LanZone>) => void;
  onDeleteZone?: (id: string) => void;
  onSaveDevice: (device: Partial<CctvDevice>) => void;
  onDeleteDevice: (id: string) => void;
  onSaveCable?: (cable: Partial<CctvCableRun>) => void;
  onDeleteCable?: (id: string) => void;
  onOpenAddLocationModal: () => void;
  onOpenEditLocationModal: (loc: LanLocation) => void;
  onOpenAddZoneModal: (locationId?: string) => void;
  onOpenEditZoneModal: (zone: LanZone) => void;
  onOpenAddDeviceModal: (locationId?: string, zoneId?: string) => void;
  onOpenEditDeviceModal: (device: CctvDevice) => void;
  onOpenAddCableModal: (locationId?: string, zoneId?: string) => void;
  onOpenEditCableModal: (cable: CctvCableRun) => void;
  onOpenPrintDetail?: (location: LanLocation, zone: LanZone) => void;
}

export const CctvView: React.FC<CctvViewProps> = ({
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
  onOpenEditCableModal,
  onOpenPrintDetail
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'devices' | 'cables'>('devices');
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
    return zones.filter(z => z.locationId === selectedLocationId && z.systemType === 'cctv');
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

  const contextCables = useMemo(() => {
    if (selectedZoneId) {
      return cables.filter(c => c.zoneId === selectedZoneId);
    }
    if (selectedLocationId) {
      return cables.filter(c => c.locationId === selectedLocationId);
    }
    return cables;
  }, [cables, selectedLocationId, selectedZoneId]);

  const stats = useMemo(() => {
    const total = contextDevices.length;
    const cameras = contextDevices.filter(d => d.type.startsWith('camera_ip')).length;
    const nvrCount = contextDevices.filter(d => d.type === 'nvr' || d.type === 'dvr').length;
    const online = contextDevices.filter(d => d.status === 'online' || d.status === 'recording').length;
    const offlineOrIssue = contextDevices.filter(d => d.status === 'offline' || d.status === 'issue').length;
    const onlinePct = total > 0 ? Math.round((online / total) * 100) : 0;
    const totalCables = contextCables.length;

    return { total, cameras, nvrCount, online, offlineOrIssue, onlinePct, totalCables };
  }, [contextDevices, contextCables]);

  const filteredDevices = useMemo(() => {
    return contextDevices.filter(d => {
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
  }, [contextDevices, searchQuery, filterType, filterStatus]);

  const filteredCables = useMemo(() => {
    return contextCables.filter(c => {
      const src = c.sourcePoint || c.sourceLocation || '';
      const tgt = c.targetPoint || c.targetLocation || '';
      const matchSearch = 
        c.cableCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        src.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tgt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.cableType && c.cableType.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.pathwayRoute && c.pathwayRoute.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = filterStatus === 'all' || c.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [contextCables, searchQuery, filterStatus]);

  const getStatusBadge = (status: CctvStatus) => {
    switch (status) {
      case 'recording':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900"><span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" /> Merekam (REC)</span>;
      case 'online':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><CheckCircle2 className="w-3 h-3" /> Online</span>;
      case 'issue':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800"><Activity className="w-3 h-3" /> Gangguan</span>;
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

  const handleDeleteLocationItem = async (loc: LanLocation) => {
    const locZones = zones.filter(z => z.locationId === loc.id && z.systemType === 'cctv');
    const locDevs = devices.filter(d => d.locationId === loc.id);
    const locCbls = cables.filter(c => c.locationId === loc.id);

    if (locZones.length > 0 || locDevs.length > 0 || locCbls.length > 0) {
      const details = [];
      if (locZones.length > 0) details.push(`${locZones.length} area CCTV`);
      if (locDevs.length > 0) details.push(`${locDevs.length} kamera/NVR`);
      if (locCbls.length > 0) details.push(`${locCbls.length} jalur kabel CCTV`);

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
    const zoneCbls = cables.filter(c => c.zoneId === zone.id);

    if (zoneDevs.length > 0 || zoneCbls.length > 0) {
      const details = [];
      if (zoneDevs.length > 0) details.push(`${zoneDevs.length} kamera/NVR`);
      if (zoneCbls.length > 0) details.push(`${zoneCbls.length} jalur kabel`);

      await showWarning(
        'Jaringan CCTV Tidak Dapat Dihapus!',
        `Jaringan "${zone.name}" masih memiliki ${details.join(' dan ')}. Kosongkan perangkat dan jalur kabel di dalamnya terlebih dahulu.`
      );
      return;
    }

    const confirmed = await showConfirm({
      title: 'Hapus Jaringan CCTV?',
      text: `Apakah Anda yakin ingin menghapus jaringan "${zone.name}"?`,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (confirmed && onDeleteZone) {
      onDeleteZone(zone.id);
      if (selectedZoneId === zone.id) {
        setSelectedZoneId(null);
      }
      showSuccess('Jaringan CCTV berhasil dihapus!');
    }
  };

  const handleDeleteDevice = async (dev: CctvDevice) => {
    const confirmed = await showConfirm({
      title: 'Hapus Perangkat CCTV?',
      text: `Perangkat "${dev.name}" (${dev.ipAddress || dev.location}) akan dihapus permanen dari sistem.`,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (confirmed) {
      onDeleteDevice(dev.id);
      showSuccess('Perangkat CCTV berhasil dihapus!');
    }
  };

  const handleDeleteCable = async (cable: CctvCableRun) => {
    const confirmed = await showConfirm({
      title: 'Hapus Jalur Kabel CCTV?',
      text: `Hapus rute jalur "${cable.cableCode}"?`,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (confirmed && onDeleteCable) {
      onDeleteCable(cable.id);
      showSuccess('Jalur kabel CCTV berhasil dihapus!');
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
                <Building2 className="w-6 h-6 text-indigo-600" />
                <span>Daftar Lokasi Jaringan CCTV</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Pilih lokasi properti untuk melihat cakupan zona surveillance dan kamera CCTV di dalamnya
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <span className="text-xs font-bold px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-center sm:text-left">
                {locations.length} Lokasi Terdata
              </span>
              <button
                onClick={onOpenAddLocationModal}
                className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                Mulai dengan menambahkan lokasi penempatan sistem kamera CCTV pertama Anda.
              </p>
              <button
                onClick={onOpenAddLocationModal}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Lokasi Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {locations.map((loc) => {
                const locZones = zones.filter(z => z.locationId === loc.id && z.systemType === 'cctv');
                const locDevices = devices.filter(d => d.locationId === loc.id);
                const locCables = cables.filter(c => c.locationId === loc.id);
                const onlineCam = locDevices.filter(d => d.status === 'online' || d.status === 'recording').length;

                return (
                  <div
                    key={loc.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                          <Video className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditLocationModal(loc);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
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
                          <span className="block text-[10px] text-slate-400">Jaringan Area</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                            {locDevices.length}
                          </span>
                          <span className="block text-[10px] text-slate-400">Perangkat</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                            {locCables.length}
                          </span>
                          <span className="block text-[10px] text-slate-400">Jalur Kabel</span>
                        </div>
                      </div>

                      {locDevices.length > 0 && (
                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                          <span>Status Siaga:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{onlineCam} dari {locDevices.length} Aktif</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedLocationId(loc.id);
                        setSelectedZoneId(null);
                      }}
                      className="mt-4 w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:bg-indigo-950/30 dark:hover:bg-indigo-600 dark:text-indigo-300 dark:hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Buka Jaringan CCTV</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TINGKAT 2: DAFTAR JARINGAN CCTV DI LOKASI TERPILIH */}
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
                <Layers className="w-6 h-6 text-indigo-600" />
                <span>Daftar Jaringan CCTV - {activeLocation.name}</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Pilih atau tambah jaringan CCTV (misal: Area Parkir & Gerbang, Area Koridor & Lobi)
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setSelectedLocationId(null)}
                className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                onClick={() => onOpenAddZoneModal(activeLocation.id)}
                className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jaringan</span>
              </button>
            </div>
          </div>

          {locationZones.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Layers className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-600 opacity-60" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">Belum ada Jaringan CCTV di {activeLocation.name}</h4>
              <p className="text-xs max-w-md mx-auto">
                Buat nama jaringan CCTV pertama (misalnya: Jaringan CCTV Perimeter, CCTV Lantai 1, CCTV Ruang Server).
              </p>
              <button
                onClick={() => onOpenAddZoneModal(activeLocation.id)}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jaringan Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {locationZones.map((zone) => {
                const zoneDevices = devices.filter(d => d.zoneId === zone.id);
                const zoneCables = cables.filter(c => c.zoneId === zone.id);

                return (
                  <div
                    key={zone.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                          <Video className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditZoneModal(zone);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
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
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
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
                          <span className="block text-[10px] text-slate-400">Kamera / NVR</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                            {zoneCables.length}
                          </span>
                          <span className="block text-[10px] text-slate-400">Jalur Kabel CCTV</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedZoneId(zone.id)}
                      className="mt-4 w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:bg-indigo-950/30 dark:hover:bg-indigo-600 dark:text-indigo-300 dark:hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Buka Kamera & Jalur</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TINGKAT 3: DETAIL JARINGAN (KAMERA/NVR & JALUR KABEL CCTV) */}
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
                <Video className="w-6 h-6 text-indigo-600" />
                <span>{activeZone.name}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30">
                  {activeLocation.name}
                </span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Pantau kamera IP, perekam NVR/DVR, dan rute kabel transmisi PoE surveillance
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              {onOpenPrintDetail && activeLocation && activeZone && (
                <button
                  onClick={() => onOpenPrintDetail(activeLocation, activeZone)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Detail</span>
                </button>
              )}
              <button
                onClick={() => setSelectedZoneId(null)}
                className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              {activeSubTab === 'devices' ? (
                <button
                  onClick={() => onOpenAddDeviceModal(activeLocation.id, activeZone.id)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Perangkat Baru</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenAddCableModal(activeLocation.id, activeZone.id)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Catat Jalur Baru</span>
                </button>
              )}
            </div>
          </div>

          {/* KPI Ringkasan CCTV */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Perangkat</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.total}</h3>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Video className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">{stats.cameras}</span> Kamera • <span className="font-bold text-slate-700 dark:text-slate-300">{stats.nvrCount}</span> NVR/DVR
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kamera Online</p>
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.online}</h3>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Ketersediaan Streaming: <span className="font-bold text-emerald-600">{stats.onlinePct}%</span>
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Offline / Masalah</p>
                  <h3 className={`text-2xl font-bold mt-1 ${stats.offlineOrIssue > 0 ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>
                    {stats.offlineOrIssue}
                  </h3>
                </div>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Perlu pengecekan sinyal / kabel</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jalur Kabel CCTV</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.totalCables}</h3>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Route className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Tarikan kabel PoE / Coaxial</p>
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
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Perangkat CCTV & NVR ({contextDevices.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab('cables');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'cables'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Route className="w-4 h-4" />
              <span>Pencatatan Jalur Kabel ({contextCables.length})</span>
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
                placeholder={activeSubTab === 'devices' ? "Cari nama kamera, IP address, lokasi..." : "Cari label kabel, titik asal, tujuan..."}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              {activeSubTab === 'devices' && (
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Semua Tipe CCTV</option>
                  <option value="camera_ip_dome">Dome Camera (Indoor)</option>
                  <option value="camera_ip_bullet">Bullet Camera (Outdoor)</option>
                  <option value="camera_ip_ptz">Speed Dome PTZ</option>
                  <option value="nvr">NVR Recorder</option>
                  <option value="dvr">DVR Analog</option>
                  <option value="switch_poe">Switch PoE CCTV</option>
                </select>
              )}

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Semua Status</option>
                <option value="online">Online / Normal</option>
                <option value="recording">Recording</option>
                <option value="issue">Gangguan</option>
                <option value="offline">Offline / Putus</option>
                <option value="maintenance">Perawatan</option>
              </select>
            </div>
          </div>

          {/* TAB 1: Perangkat Kamera & Perekam */}
          {activeSubTab === 'devices' && (
            <div>
              {filteredDevices.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
                  <Video className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 opacity-60" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Tidak ada perangkat ditemukan</h4>
                  <p className="text-xs">
                    {searchQuery ? 'Coba ubah kata kunci pencarian Anda.' : 'Belum ada perangkat CCTV di jaringan ini. Klik tombol di atas untuk menambah.'}
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
                            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                              <Camera className="w-5 h-5" />
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
                          {dev.ipAddress && (
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                              <span>IP Address:</span>
                              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{dev.ipAddress}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>Brand & Resolusi:</span>
                            <span className="text-slate-700 dark:text-slate-300">
                              {dev.brand || 'Generic'} {dev.resolution ? `(${dev.resolution})` : ''}
                            </span>
                          </div>
                          {dev.streamUrl && (
                            <div className="pt-1">
                              <a
                                href={dev.streamUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline"
                              >
                                <span>Buka RTSP / Web UI</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenEditDeviceModal(dev)}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
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

          {/* TAB 2: Pencatatan Jalur Kabel CCTV */}
          {activeSubTab === 'cables' && (
            <div>
              {filteredCables.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
                  <Route className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 opacity-60" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada jalur kabel CCTV</h4>
                  <p className="text-xs">
                    Catat rute kabel dari Switch PoE / NVR ke kamera surveillance.
                  </p>
                  <button
                    onClick={() => onOpenAddCableModal(activeLocation.id, activeZone.id)}
                    className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Catat Jalur Baru</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCables.map((cable) => {
                    const src = cable.sourcePoint || cable.sourceLocation || '';
                    const tgt = cable.targetPoint || cable.targetLocation || '';
                    const len = cable.lengthMeter || cable.lengthMeters || 0;

                    return (
                      <div
                        key={cable.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                                <Route className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">
                                  {cable.cableCode}
                                </span>
                                <span className="block text-[10px] text-slate-400">{cable.cableType}</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              cable.status === 'connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              cable.status === 'fault' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {cable.status === 'connected' ? 'Normal' : cable.status === 'fault' ? 'Putus' : cable.status}
                            </span>
                          </div>

                          <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Titik Asal (Switch PoE / NVR):</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{src}</span>
                            </div>
                            <div className="flex items-center justify-center text-indigo-500 py-0.5">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Titik Tujuan (Kamera CCTV):</span>
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
                            {cable.pathwayRoute && (
                              <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                Rute: {cable.pathwayRoute}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenEditCableModal(cable)}
                            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCable(cable)}
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
