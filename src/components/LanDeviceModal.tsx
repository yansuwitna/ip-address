import React, { useState, useEffect } from 'react';
import { X, Server, Save, AlertCircle } from 'lucide-react';
import { LanDevice, LanDeviceType, LanLocation, LanZone } from '../types/utilityNetworks';

interface LanDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: Partial<LanDevice>) => void;
  editDevice?: LanDevice | null;
  locations?: LanLocation[];
  zones?: LanZone[];
  presetLocationId?: string;
  presetZoneId?: string;
}

export const LanDeviceModal: React.FC<LanDeviceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editDevice,
  locations = [],
  zones = [],
  presetLocationId,
  presetZoneId
}) => {
  const [locationId, setLocationId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<LanDeviceType>('switch_distribution');
  const [brand, setBrand] = useState('Ruijie Reyee');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [rackNumber, setRackNumber] = useState('');
  const [totalPorts, setTotalPorts] = useState<string>('24');
  const [ipAddress, setIpAddress] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [status, setStatus] = useState<'active' | 'standby' | 'fault' | 'maintenance'>('active');
  const [pic, setPic] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editDevice) {
      setLocationId(editDevice.locationId || '');
      setZoneId(editDevice.zoneId || '');
      setName(editDevice.name);
      setCode(editDevice.code || '');
      setType(editDevice.type);
      setBrand(editDevice.brand || 'Ruijie Reyee');
      setModel(editDevice.model || '');
      setLocation(editDevice.location);
      setRackNumber(editDevice.rackNumber || '');
      setTotalPorts(editDevice.totalPorts ? editDevice.totalPorts.toString() : '24');
      setIpAddress(editDevice.ipAddress || '');
      setMacAddress(editDevice.macAddress || '');
      setStatus(editDevice.status);
      setPic(editDevice.pic || '');
      setNotes(editDevice.notes || '');
    } else {
      const initLoc = presetLocationId || (locations[0]?.id || '');
      setLocationId(initLoc);
      const availableZones = zones.filter(z => z.locationId === initLoc);
      setZoneId(presetZoneId || (availableZones[0]?.id || ''));
      setName('');
      setCode(`SW-LAB-${String(Date.now()).slice(-4)}`);
      setType('switch_distribution');
      setBrand('Ruijie Reyee');
      setModel('');
      setLocation('');
      setRackNumber('Rack Lab 1 U04');
      setTotalPorts('24');
      setIpAddress('');
      setMacAddress('');
      setStatus('active');
      setPic('');
      setNotes('');
    }
    setError(null);
  }, [isOpen, editDevice, locations, zones, presetLocationId, presetZoneId]);

  if (!isOpen) return null;

  // Filter available zones for selected location
  const filteredZones = locationId ? zones.filter(z => z.locationId === locationId) : zones;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama perangkat LAN wajib diisi!');
      return;
    }

    onSave({
      id: editDevice?.id,
      locationId: locationId || undefined,
      zoneId: zoneId || undefined,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type,
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      location: location.trim() || 'Lab Komputer',
      rackNumber: rackNumber.trim() || undefined,
      totalPorts: totalPorts ? Number(totalPorts) : undefined,
      ipAddress: ipAddress.trim() || undefined,
      macAddress: macAddress.trim() || undefined,
      status,
      pic: pic.trim() || undefined,
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto font-poppins animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-blue-600/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editDevice ? 'Edit Perangkat Fisik LAN' : 'Tambah Perangkat Fisik LAN Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tingkat 3: Data switch, router, patch panel, dan PC di dalam Lab / Ruangan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* HIRARKI LOKASI & RUANG LAB */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Lokasi / Sekolah
              </label>
              <select
                value={locationId}
                onChange={e => {
                  const newLoc = e.target.value;
                  setLocationId(newLoc);
                  const matchingZones = zones.filter(z => z.locationId === newLoc);
                  setZoneId(matchingZones[0]?.id || '');
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Tanpa Lokasi Tertentu --</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Jaringan Ruang / Lab
              </label>
              <select
                value={zoneId}
                onChange={e => setZoneId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Tanpa Ruang Tertentu --</option>
                {filteredZones.map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} ({zone.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nama Perangkat <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="misal: Switch Distribusi Lab 1 (Ruijie 24P)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Kode Aset / Label
              </label>
              <input
                type="text"
                placeholder="SW-LAB1-01"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 uppercase font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Jenis / Tipe Perangkat
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as LanDeviceType)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="switch_distribution">Switch Distribusi Lab</option>
                <option value="switch_access">Switch Access (Meja Siswa)</option>
                <option value="switch_core">Switch Core Utama L3</option>
                <option value="patch_panel">Patch Panel RJ45</option>
                <option value="router_gateway">Router Gateway / Mikrotik</option>
                <option value="server_host">Server Komputer / CBT</option>
                <option value="access_point">Access Point Wi-Fi</option>
                <option value="otb_fiber">OTB / Roset Fiber Optic</option>
                <option value="wallplate_jack">Wallplate / Outlet Lantai</option>
                <option value="media_converter">Media Converter FO</option>
                <option value="other">Perangkat Lainnya</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Merek / Brand
              </label>
              <input
                type="text"
                placeholder="Ruijie / Cisco / Mikrotik"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Model / Seri
              </label>
              <input
                type="text"
                placeholder="RG-NBS3100-24GT4SFP"
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Letak Fisik di Lab / Ruang
              </label>
              <input
                type="text"
                placeholder="misal: Depan Meja Guru / Rak U04"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nomor Rak / Posisi Unit
              </label>
              <input
                type="text"
                placeholder="Rack Lab 1 U04"
                value={rackNumber}
                onChange={e => setRackNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Total Port Terpasang
              </label>
              <input
                type="number"
                placeholder="24"
                value={totalPorts}
                onChange={e => setTotalPorts(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                IP Address Manajemen
              </label>
              <input
                type="text"
                placeholder="192.168.10.10"
                value={ipAddress}
                onChange={e => setIpAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                MAC Address
              </label>
              <input
                type="text"
                placeholder="84:D8:1B:45:67:89"
                value={macAddress}
                onChange={e => setMacAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono uppercase focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Status Perangkat
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">🟢 Beroperasi Normal (Active)</option>
                <option value="standby">🟡 Standby / Cadangan</option>
                <option value="fault">🔴 Gangguan / Error (Fault)</option>
                <option value="maintenance">🟠 Pemeliharaan (Maintenance)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Catatan / Fungsi Khusus di Lab
            </label>
            <textarea
              rows={2}
              placeholder="misal: Melayani jalur kabel PC Siswa Baris 1-3 dan Server CBT"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perangkat</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
