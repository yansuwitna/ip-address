import React, { useState, useEffect } from 'react';
import { X, Cable, Save, AlertCircle } from 'lucide-react';
import { LanCableRun, LanCableType, CableRunStatus, LanDevice, LanLocation, LanZone } from '../types/utilityNetworks';

interface LanCableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cable: Partial<LanCableRun>) => void;
  editCable?: LanCableRun | null;
  devices: LanDevice[];
  locations?: LanLocation[];
  zones?: LanZone[];
  presetLocationId?: string;
  presetZoneId?: string;
}

export const LanCableModal: React.FC<LanCableModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editCable,
  devices,
  locations = [],
  zones = [],
  presetLocationId,
  presetZoneId
}) => {
  const [locationId, setLocationId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [cableCode, setCableCode] = useState('');
  const [cableType, setCableType] = useState<LanCableType>('cat6_utp');
  
  // Titik Asal (Arah Dari)
  const [sourceDeviceId, setSourceDeviceId] = useState('');
  const [sourceDeviceName, setSourceDeviceName] = useState('');
  const [sourcePort, setSourcePort] = useState('');
  const [sourceLocation, setSourceLocation] = useState('');

  // Titik Tujuan (Arah Ke)
  const [targetDeviceId, setTargetDeviceId] = useState('');
  const [targetDeviceName, setTargetDeviceName] = useState('');
  const [targetPort, setTargetPort] = useState('');
  const [targetLocation, setTargetLocation] = useState('');

  // Rute & Teknis
  const [pathwayRoute, setPathwayRoute] = useState('');
  const [lengthMeter, setLengthMeter] = useState<string>('');
  const [color, setColor] = useState('Biru (Blue)');
  const [speedMbps, setSpeedMbps] = useState<number>(1000);
  const [status, setStatus] = useState<CableRunStatus>('connected');
  const [pic, setPic] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editCable) {
      setLocationId(editCable.locationId || '');
      setZoneId(editCable.zoneId || '');
      setCableCode(editCable.cableCode || '');
      setCableType(editCable.cableType);
      setSourceDeviceId(editCable.sourceDeviceId || '');
      setSourceDeviceName(editCable.sourceDeviceName || '');
      setSourcePort(editCable.sourcePort || '');
      setSourceLocation(editCable.sourceLocation);
      setTargetDeviceId(editCable.targetDeviceId || '');
      setTargetDeviceName(editCable.targetDeviceName || '');
      setTargetPort(editCable.targetPort || '');
      setTargetLocation(editCable.targetLocation);
      setPathwayRoute(editCable.pathwayRoute || '');
      setLengthMeter(editCable.lengthMeter ? editCable.lengthMeter.toString() : '');
      setColor(editCable.color || 'Biru (Blue)');
      setSpeedMbps(editCable.speedMbps || 1000);
      setStatus(editCable.status);
      setPic(editCable.pic || '');
      setNotes(editCable.notes || '');
    } else {
      const initLoc = presetLocationId || (locations[0]?.id || '');
      setLocationId(initLoc);
      const availableZones = zones.filter(z => z.locationId === initLoc);
      const initZone = presetZoneId || (availableZones[0]?.id || '');
      setZoneId(initZone);

      const zoneDevices = devices.filter(d => (!initZone || d.zoneId === initZone));
      const firstDev = zoneDevices[0] || devices[0];

      setCableCode("CBL-LAB-" + String(Date.now()).slice(-4));
      setCableType('cat6_utp');
      setSourceDeviceId(firstDev?.id || '');
      setSourceDeviceName(firstDev?.name || 'Switch Lab');
      setSourcePort('Port 01');
      setSourceLocation(firstDev?.location || 'Rack Depan Lab');
      setTargetDeviceId('');
      setTargetDeviceName('Komputer Siswa PC-01');
      setTargetPort('LAN Port PC');
      setTargetLocation('Meja Siswa Baris 1 No 01');
      setPathwayRoute('Tray Plafon Lab -> Conduit Turun ke Lantai');
      setLengthMeter('15');
      setColor('Biru (Blue)');
      setSpeedMbps(1000);
      setStatus('connected');
      setPic('');
      setNotes('');
    }
    setError(null);
  }, [isOpen, editCable, devices, locations, zones, presetLocationId, presetZoneId]);

  if (!isOpen) return null;

  const filteredZones = locationId ? zones.filter(z => z.locationId === locationId) : zones;
  const filteredDevices = zoneId ? devices.filter(d => d.zoneId === zoneId) : devices;

  const handleSourceSelect = (devId: string) => {
    setSourceDeviceId(devId);
    const found = devices.find(d => d.id === devId);
    if (found) {
      setSourceDeviceName(found.name);
      if (!sourceLocation) setSourceLocation(found.location);
    }
  };

  const handleTargetSelect = (devId: string) => {
    setTargetDeviceId(devId);
    const found = devices.find(d => d.id === devId);
    if (found) {
      setTargetDeviceName(found.name);
      if (!targetLocation) setTargetLocation(found.location);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cableCode.trim()) {
      setError('Kode / Label tarikan kabel wajib diisi!');
      return;
    }
    if (!sourceLocation.trim() || !targetLocation.trim()) {
      setError('Lokasi asal dan lokasi tujuan jalur kabel wajib diisi!');
      return;
    }

    onSave({
      id: editCable?.id,
      locationId: locationId || undefined,
      zoneId: zoneId || undefined,
      cableCode: cableCode.trim().toUpperCase(),
      cableType,
      sourceDeviceId: sourceDeviceId || undefined,
      sourceDeviceName: sourceDeviceName.trim() || undefined,
      sourcePort: sourcePort.trim() || undefined,
      sourceLocation: sourceLocation.trim(),
      targetDeviceId: targetDeviceId || undefined,
      targetDeviceName: targetDeviceName.trim() || undefined,
      targetPort: targetPort.trim() || undefined,
      targetLocation: targetLocation.trim(),
      pathwayRoute: pathwayRoute.trim() || undefined,
      lengthMeter: lengthMeter ? Number(lengthMeter) : undefined,
      color: color.trim() || undefined,
      speedMbps: Number(speedMbps) || 1000,
      status,
      pic: pic.trim() || undefined,
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto font-poppins animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-blue-600/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
              <Cable className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editCable ? 'Edit Jalur Kabel & Arah Tarikan' : 'Catat Jalur Kabel & Arah Tarikan Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencatatan rute dari Titik Asal (Switch/Port) menuju Titik Tujuan (PC Siswa/Meja/Server)
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
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
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
                Kode / Label Kabel <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="misal: CBL-LAB1-MEJA-01"
                value={cableCode}
                onChange={e => setCableCode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 uppercase font-mono focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Jenis Kabel
              </label>
              <select
                value={cableType}
                onChange={e => setCableType(e.target.value as LanCableType)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="cat6_utp">UTP Cat6 (Standar Lab)</option>
                <option value="cat6a_stp">STP Cat6A (Shielded Riser)</option>
                <option value="cat5e_utp">UTP Cat5e</option>
                <option value="cat7_stp">STP Cat7</option>
                <option value="fiber_sm">Fiber Optic Single Mode</option>
                <option value="fiber_mm">Fiber Optic Multi Mode</option>
                <option value="dac_sfp">Direct Attach Copper SFP+</option>
                <option value="other">Kabel Lainnya</option>
              </select>
            </div>
          </div>

          {/* ARAH TARIKAN: TITIK ASAL & TITIK TUJUAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* BOX KIRI: TITIK ASAL (SOURCE) */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-blue-200 dark:border-blue-900/60">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                  Titik Asal (Arah Dari)
                </h4>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Pilih Perangkat Asal di Lab
                </label>
                <select
                  value={sourceDeviceId}
                  onChange={e => handleSourceSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Ketik manual atau pilih perangkat --</option>
                  {filteredDevices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code}) - {d.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Nama Perangkat Asal
                  </label>
                  <input
                    type="text"
                    placeholder="misal: Switch Lab 1"
                    value={sourceDeviceName}
                    onChange={e => setSourceDeviceName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Port Asal
                  </label>
                  <input
                    type="text"
                    placeholder="misal: Port 01"
                    value={sourcePort}
                    onChange={e => setSourcePort(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Lokasi / Posisi Asal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="misal: Rak Wallmount Depan Meja Guru"
                  value={sourceLocation}
                  onChange={e => setSourceLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* BOX KANAN: TITIK TUJUAN (TARGET) */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-emerald-200 dark:border-emerald-900/60">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                  Titik Tujuan (Arah Ke)
                </h4>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Pilih Perangkat Tujuan (Opsional)
                </label>
                <select
                  value={targetDeviceId}
                  onChange={e => handleTargetSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Ketik manual atau pilih perangkat --</option>
                  {filteredDevices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code}) - {d.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Nama Tujuan / User / PC
                  </label>
                  <input
                    type="text"
                    placeholder="misal: Komputer Siswa PC-01"
                    value={targetDeviceName}
                    onChange={e => setTargetDeviceName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Port / Jack Tujuan
                  </label>
                  <input
                    type="text"
                    placeholder="misal: LAN Port PC / Jack #01"
                    value={targetPort}
                    onChange={e => setTargetPort(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Lokasi / Meja Tujuan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="misal: Meja Siswa Baris 1 No 01 Lab 1"
                  value={targetLocation}
                  onChange={e => setTargetLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

          </div>

          {/* SPESIFIKASI RUTE & KABEL */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Rute Jalur Kabel (Pathway / Conduit / Tray)
            </label>
            <input
              type="text"
              placeholder="misal: Tray Plafon Lab 1 -> Pipa Conduit Turun ke Floor Duct Baris A"
              value={pathwayRoute}
              onChange={e => setPathwayRoute(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Panjang (Meter)
              </label>
              <input
                type="number"
                placeholder="15"
                value={lengthMeter}
                onChange={e => setLengthMeter(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Warna Kabel
              </label>
              <input
                type="text"
                placeholder="Biru (Blue)"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Kapasitas Speed
              </label>
              <select
                value={speedMbps}
                onChange={e => setSpeedMbps(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value={100}>100 Mbps (Fast Ethernet)</option>
                <option value={1000}>1 Gbps (Gigabit Ethernet)</option>
                <option value={2500}>2.5 Gbps (Multi-Gig)</option>
                <option value={10000}>10 Gbps (10G SFP+/Fiber)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Status Sambungan
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as CableRunStatus)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="connected">🟢 Terhubung Aktif (Connected)</option>
                <option value="idle">🟡 Cadangan / Menganggur (Idle)</option>
                <option value="fault">🔴 Putus / Gangguan (Fault)</option>
                <option value="maintenance">🟠 Pemeliharaan (Maintenance)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Catatan Jalur Kabel
            </label>
            <textarea
              rows={2}
              placeholder="misal: Kabel nomor 01 Baris A, terminasi ke Patch Panel Port 1"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 resize-none"
            />
            </div>

            {/* Action Buttons */}
            <div className="p-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-center"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Jalur Kabel</span>
              </button>
            </div>
          </form>

      </div>
    </div>
  );
};
