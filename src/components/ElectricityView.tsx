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
  ArrowRight,
  ArrowLeft,
  Building2,
  Sliders,
  Cable,
  FolderTree,
  Tag,
  Printer
} from 'lucide-react';
import { ElectricityDevice, ElectricityCableRun, ElectricalStatus, ElectricityDeviceType, LanLocation, LanZone } from '../types/utilityNetworks';
import { showConfirm, showSuccess, showWarning } from '../utils/swal';

interface ElectricityViewProps {
  locations: LanLocation[];
  zones: LanZone[];
  devices: ElectricityDevice[];
  cables: ElectricityCableRun[];
  onSaveLocation?: (loc: Partial<LanLocation>) => void;
  onDeleteLocation?: (id: string) => void;
  onSaveZone?: (zone: Partial<LanZone>) => void;
  onDeleteZone?: (id: string) => void;
  onSaveDevice: (device: Partial<ElectricityDevice>) => void;
  onDeleteDevice: (id: string) => void;
  onSaveCable?: (cable: Partial<ElectricityCableRun>) => void;
  onDeleteCable?: (id: string) => void;
  onOpenAddLocationModal: () => void;
  onOpenEditLocationModal: (loc: LanLocation) => void;
  onOpenAddZoneModal: (locationId?: string) => void;
  onOpenEditZoneModal: (zone: LanZone) => void;
  onOpenAddDeviceModal: (locationId?: string, zoneId?: string) => void;
  onOpenEditDeviceModal: (device: ElectricityDevice) => void;
  onOpenAddCableModal: (locationId?: string, zoneId?: string) => void;
  onOpenEditCableModal: (cable: ElectricityCableRun) => void;
  onOpenPrintDetail?: (location: LanLocation, zone: LanZone) => void;
}

export const ElectricityView: React.FC<ElectricityViewProps> = ({
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

  const [activeSubTab, setActiveSubTab] = useState<'components' | 'cables'>('components');
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
    return zones.filter(z => z.locationId === selectedLocationId && (z.systemType === 'electricity' || !z.systemType));
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
    const normal = contextDevices.filter(d => d.status === 'normal').length;
    const warningOrCritical = contextDevices.filter(d => d.status === 'warning' || d.status === 'critical').length;
    const totalCapacityWatt = contextDevices.reduce((sum, d) => sum + (d.capacityWatt || 0), 0);
    const totalLoadWatt = contextDevices.reduce((sum, d) => sum + (d.currentLoadWatt || 0), 0);
    const overallLoadPct = totalCapacityWatt > 0 ? Math.round((totalLoadWatt / totalCapacityWatt) * 100) : 0;
    const totalCables = contextCables.length;

    return { total, normal, warningOrCritical, totalCapacityWatt, totalLoadWatt, overallLoadPct, totalCables };
  }, [contextDevices, contextCables]);

  const filteredDevices = useMemo(() => {
    return contextDevices.filter(d => {
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

  const handleDeleteLocationItem = async (loc: LanLocation) => {
    const locZones = zones.filter(z => z.locationId === loc.id && (z.systemType === 'electricity' || !z.systemType));
    const locDevs = devices.filter(d => d.locationId === loc.id);
    const locCbls = cables.filter(c => c.locationId === loc.id);

    if (locZones.length > 0 || locDevs.length > 0 || locCbls.length > 0) {
      const details = [];
      if (locZones.length > 0) details.push(`${locZones.length} jaringan`);
      if (locDevs.length > 0) details.push(`${locDevs.length} komponen listrik`);
      if (locCbls.length > 0) details.push(`${locCbls.length} jalur kabel`);

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
      if (zoneDevs.length > 0) details.push(`${zoneDevs.length} komponen`);
      if (zoneCbls.length > 0) details.push(`${zoneCbls.length} jalur kabel`);

      await showWarning(
        'Jaringan Listrik Tidak Dapat Dihapus!',
        `Jaringan "${zone.name}" masih memiliki ${details.join(' dan ')}. Kosongkan komponen dan jalur kabel di dalamnya terlebih dahulu.`
      );
      return;
    }

    const confirmed = await showConfirm({
      title: 'Hapus Jaringan Listrik?',
      text: `Apakah Anda yakin ingin menghapus jaringan "${zone.name}"?`,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (confirmed && onDeleteZone) {
      onDeleteZone(zone.id);
      if (selectedZoneId === zone.id) {
        setSelectedZoneId(null);
      }
      showSuccess('Jaringan listrik berhasil dihapus!');
    }
  };

  const handleDeleteDevice = async (dev: ElectricityDevice) => {
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

  const handleDeleteCable = async (cable: ElectricityCableRun) => {
    const confirmed = await showConfirm({
      title: 'Hapus Jalur Kabel Listrik?',
      text: `Hapus rute jalur "${cable.cableCode}"?`,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (confirmed && onDeleteCable) {
      onDeleteCable(cable.id);
      showSuccess('Jalur kabel listrik berhasil dihapus!');
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
                <Building2 className="w-6 h-6 text-amber-600" />
                <span>Daftar Lokasi Jaringan Listrik</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Pilih lokasi fasilitas untuk melihat daftar jaringan distribusi listrik di dalamnya
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <span className="text-xs font-bold px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-center sm:text-left">
                {locations.length} Lokasi Terdata
              </span>
              <button
                onClick={onOpenAddLocationModal}
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                Mulai dengan menambahkan lokasi tempat instalasi listrik pertama Anda.
              </p>
              <button
                onClick={onOpenAddLocationModal}
                className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/25 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Lokasi Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {locations.map((loc) => {
                const locZones = zones.filter(z => z.locationId === loc.id && (z.systemType === 'electricity' || !z.systemType));
                const locDevices = devices.filter(d => d.locationId === loc.id);
                const locCables = cables.filter(c => c.locationId === loc.id);
                const totalCap = locDevices.reduce((sum, d) => sum + (d.capacityWatt || 0), 0);

                return (
                  <div
                    key={loc.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditLocationModal(loc);
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
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
                          <span className="block text-[10px] text-slate-400">Jaringan</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                            {locDevices.length}
                          </span>
                          <span className="block text-[10px] text-slate-400">Komponen</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                            {locCables.length}
                          </span>
                          <span className="block text-[10px] text-slate-400">Jalur Kabel</span>
                        </div>
                      </div>

                      {totalCap > 0 && (
                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                          <span>Total Kapasitas:</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">{(totalCap / 1000).toLocaleString('id-ID')} kW</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedLocationId(loc.id);
                        setSelectedZoneId(null);
                      }}
                      className="mt-4 w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white dark:bg-amber-950/30 dark:hover:bg-amber-600 dark:text-amber-300 dark:hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Buka Jaringan Listrik</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TINGKAT 2: DAFTAR JARINGAN LISTRIK DI LOKASI TERPILIH */}
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
                <Layers className="w-6 h-6 text-amber-600" />
                <span>Daftar Jaringan Listrik - {activeLocation.name}</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Pilih atau tambah jaringan listrik (misal: Jaringan Listrik Gedung Utama, Jaringan Workshop)
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
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jaringan</span>
              </button>
            </div>
          </div>

          {locationZones.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Layers className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-600 opacity-60" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">Belum ada Jaringan Listrik di {activeLocation.name}</h4>
              <p className="text-xs max-w-md mx-auto">
                Buat nama jaringan listrik pertama (misalnya: Jaringan Daya Utama, Jaringan Stop Kontak, Jaringan Penerangan).
              </p>
              <button
                onClick={() => onOpenAddZoneModal(activeLocation.id)}
                className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/25 transition-all cursor-pointer inline-flex items-center gap-1.5"
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
                        <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditZoneModal(zone);
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
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
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
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
                          <span className="block text-[10px] text-slate-400">Komponen Listrik</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                            {zoneCables.length}
                          </span>
                          <span className="block text-[10px] text-slate-400">Jalur Distribusi</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedZoneId(zone.id)}
                      className="mt-4 w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white dark:bg-amber-950/30 dark:hover:bg-amber-600 dark:text-amber-300 dark:hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Buka Komponen & Jalur</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TINGKAT 3: DETAIL JARINGAN (KOMPONEN & JALUR DISTRIBUSI) */}
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
                <Zap className="w-6 h-6 text-amber-600" />
                <span>{activeZone.name}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  {activeLocation.name}
                </span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Kelola komponen kelistrikan (MDP, SDP, Trafo, UPS) dan pencatatan rute kabel distribusi
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              {onOpenPrintDetail && activeLocation && activeZone && (
                <button
                  onClick={() => onOpenPrintDetail(activeLocation, activeZone)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
              {activeSubTab === 'components' ? (
                <button
                  onClick={() => onOpenAddDeviceModal(activeLocation.id, activeZone.id)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Perangkat Baru</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenAddCableModal(activeLocation.id, activeZone.id)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Catat Jalur Baru</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 KPI Ringkasan Kelistrikan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Komponen</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.total}</h3>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                <span className="font-bold text-emerald-600">{stats.normal} normal</span>
                <span>•</span>
                <span>{stats.warningOrCritical} waspada</span>
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kapasitas Terpasang</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                    {(stats.totalCapacityWatt / 1000).toLocaleString('id-ID')} kW
                  </h3>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <Gauge className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Daya nominal total suplai</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Beban Real-time</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                    {(stats.totalLoadWatt / 1000).toLocaleString('id-ID')} kW
                  </h3>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Utilisasi Beban: <span className="font-bold text-slate-700 dark:text-slate-300">{stats.overallLoadPct}%</span>
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jalur Distribusi</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.totalCables}</h3>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl">
                  <Cable className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Rute kabel transmisi terhubung</p>
            </div>
          </div>

          {/* Sub Tab Switching */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => {
                setActiveSubTab('components');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'components'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Komponen & Perangkat Listrik ({contextDevices.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab('cables');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'cables'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Cable className="w-4 h-4" />
              <span>Pencatatan Jalur Distribusi ({contextCables.length})</span>
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
                placeholder={activeSubTab === 'components' ? "Cari nama, brand, kode, lokasi..." : "Cari label kabel, titik asal, tujuan..."}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              {activeSubTab === 'components' && (
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">Semua Tipe Komponen</option>
                  <option value="panel_mdp">Panel MDP</option>
                  <option value="panel_sdp">Panel SDP</option>
                  <option value="trafo">Trafo PLN</option>
                  <option value="genset">Genset</option>
                  <option value="ups">UPS Backup</option>
                  <option value="mcb">MCB Breaker</option>
                  <option value="kwh_meter">KWH Meter</option>
                  <option value="stabilizer">Stabilizer</option>
                </select>
              )}

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Semua Status</option>
                <option value="normal">Normal / Terhubung</option>
                <option value="warning">Peringatan</option>
                <option value="critical">Kritis / Putus</option>
                <option value="maintenance">Perawatan</option>
                <option value="off">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* TAB 1: Komponen & Perangkat Listrik */}
          {activeSubTab === 'components' && (
            <div>
              {filteredDevices.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
                  <Zap className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 opacity-60" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Tidak ada komponen ditemukan</h4>
                  <p className="text-xs">
                    {searchQuery ? 'Coba ubah kata kunci pencarian Anda.' : 'Belum ada komponen di jaringan ini. Klik tombol di atas untuk menambah.'}
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
                            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                              <Zap className="w-5 h-5" />
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
                              <span>Kode Unit:</span>
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{dev.code}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>Kapasitas / Tegangan:</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                              {dev.capacityWatt ? `${(dev.capacityWatt / 1000).toLocaleString('id-ID')} kW` : '-'} • {dev.voltage ? `${dev.voltage}V` : '-'}
                            </span>
                          </div>
                          {dev.currentLoadWatt !== undefined && dev.capacityWatt ? (
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">Beban Berjalan:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {(dev.currentLoadWatt / 1000).toLocaleString('id-ID')} kW ({Math.round((dev.currentLoadWatt / dev.capacityWatt) * 100)}%)
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    (dev.currentLoadWatt / dev.capacityWatt) > 0.85
                                      ? 'bg-rose-500'
                                      : (dev.currentLoadWatt / dev.capacityWatt) > 0.65
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(100, Math.round((dev.currentLoadWatt / dev.capacityWatt) * 100))}%` }}
                                />
                              </div>
                            </div>
                          ) : null}
                          {dev.pic && (
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1">
                              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> PIC:</span>
                              <span className="text-slate-700 dark:text-slate-300">{dev.pic}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenEditDeviceModal(dev)}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-slate-600 dark:text-slate-300 hover:text-amber-600 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
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

          {/* TAB 2: Pencatatan Jalur Distribusi Listrik */}
          {activeSubTab === 'cables' && (
            <div>
              {filteredCables.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
                  <Cable className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 opacity-60" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada jalur kabel distribusi</h4>
                  <p className="text-xs">
                    Catat rute kabel dari panel utama ke sub panel atau mesin beban.
                  </p>
                  <button
                    onClick={() => onOpenAddCableModal(activeLocation.id, activeZone.id)}
                    className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/25 transition-all cursor-pointer inline-flex items-center gap-1.5"
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
                              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                                <Cable className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">
                                  {cable.cableCode}
                                </span>
                                <span className="block text-[10px] text-slate-400">{cable.cableType} {cable.coreSpec ? `(${cable.coreSpec})` : ''}</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              cable.status === 'connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              cable.status === 'fault' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {cable.status === 'connected' ? 'Aktif' : cable.status === 'fault' ? 'Putus' : cable.status}
                            </span>
                          </div>

                          <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Titik Asal (Suplai / Breaker):</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{src}</span>
                            </div>
                            <div className="flex items-center justify-center text-amber-500 py-0.5">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Titik Tujuan (Beban / Panel):</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{tgt}</span>
                            </div>
                          </div>

                          <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            {len > 0 && (
                              <div className="flex justify-between">
                                <span>Panjang:</span>
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
                            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-slate-600 dark:text-slate-300 hover:text-amber-600 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
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
