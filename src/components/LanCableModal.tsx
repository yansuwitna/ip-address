import React, { useState, useEffect } from 'react';
import { X, Cable, Save, AlertCircle, ArrowRight } from 'lucide-react';
import { LanCableRun, LanCableType, CableRunStatus, LanDevice } from '../types/utilityNetworks';

interface LanCableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cable: Partial<LanCableRun>) => void;
  editCable?: LanCableRun | null;
  devices: LanDevice[];
}

export const LanCableModal: React.FC<LanCableModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editCable,
  devices
}) => {
  const [cableCode, setCableCode] = useState('');
  const [cableType, setCableType] = useState<LanCableType>('cat6_utp');
  
  // Titik Asal
  const [sourceDeviceId, setSourceDeviceId] = useState('');
  const [sourceDeviceName, setSourceDeviceName] = useState('');
  const [sourcePort, setSourcePort] = useState('');
  const [sourceLocation, setSourceLocation] = useState('');

  // Titik Tujuan
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
      setCableCode(`CBL-LAN-${String(Date.now()).slice(-4)}`);
      setCableType('cat6_utp');
      setSourceDeviceId(devices[0]?.id || '');
      setSourceDeviceName(devices[0]?.name || '');
      setSourcePort('Port 1');
      setSourceLocation(devices[0]?.location || '');
      setTargetDeviceId('');
      setTargetDeviceName('');
      setTargetPort('');
      setTargetLocation('');
      setPathwayRoute('');
      setLengthMeter('15');
      setColor('Biru (Blue)');
      setSpeedMbps(1000);
      setStatus('connected');
      setPic('');
      setNotes('');
    }
    setError(null);
  }, [isOpen, editCable, devices]);

  if (!isOpen) return null;

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
      setError('Kode / Label kabel wajib diisi!');
      return;
    }
    if (!sourceLocation.trim() || !targetLocation.trim()) {
      setError('Lokasi asal dan lokasi tujuan kabel wajib diisi!');
      return;
    }

    onSave({
      id: editCable?.id,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 font-poppins">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-blue-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
              <Cable className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editCable ? 'Edit Data Jalur Kabel LAN' : 'Tambah Jalur Penarikan Kabel LAN Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencatatan rute kabel, titik asal port, tujuan arah tarikan, dan media fisik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Kode Kabel */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kode / Label Labeling Kabel *
              </label>
              <input
                type="text"
                placeholder="CBL-LAN-001"
                value={cableCode}
                onChange={e => setCableCode(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            {/* Tipe Kabel */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipe / Standar Kabel
              </label>
              <select
                value={cableType}
                onChange={e => setCableType(e.target.value as LanCableType)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
              >
                <option value="cat6_utp">UTP Cat6 (1 Gbps - 100m)</option>
                <option value="cat6a_stp">STP/FTP Cat6A (Shielded 10G)</option>
                <option value="cat5e_utp">UTP Cat5e (1 Gbps)</option>
                <option value="fiber_sm">Fiber Optic Single Mode (9/125)</option>
                <option value="fiber_mm">Fiber Optic Multi Mode (OM3/OM4)</option>
                <option value="dac_sfp">Direct Attach Copper (DAC 10G)</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            {/* Status Koneksi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status Konektivitas
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as CableRunStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
              >
                <option value="connected">Terhubung & Aktif (Connected)</option>
                <option value="idle">Siaga / Kosong (Standby / Idle)</option>
                <option value="fault">Kabel Putus / Rusak (Fault)</option>
                <option value="maintenance">Dalam Perbaikan</option>
              </select>
            </div>
          </div>

          {/* BOX 1: TITIK ASAL (SOURCE) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Titik Awal (Dari Mana / Source Node)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Pilih Perangkat Asal
                </label>
                <select
                  value={sourceDeviceId}
                  onChange={e => handleSourceSelect(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Input Manual / Bebas --</option>
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.code ? `[${d.code}] ` : ''}{d.name} ({d.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nama Perangkat Asal
                </label>
                <input
                  type="text"
                  placeholder="Switch Core 01"
                  value={sourceDeviceName}
                  onChange={e => setSourceDeviceName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nomor Port Asal
                </label>
                <input
                  type="text"
                  placeholder="Port 1 / G0/1 / SFP 1"
                  value={sourcePort}
                  onChange={e => setSourcePort(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Lokasi Fisik Asal *
              </label>
              <input
                type="text"
                placeholder="Contoh: Ruang Server Lt 2, Rack 01 U24"
                value={sourceLocation}
                onChange={e => setSourceLocation(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          {/* BOX 2: TITIK TUJUAN (TARGET) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Titik Tujuan (Arah Ke Mana / Target Node)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Pilih Perangkat Tujuan
                </label>
                <select
                  value={targetDeviceId}
                  onChange={e => handleTargetSelect(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Input Manual / Wallplate --</option>
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.code ? `[${d.code}] ` : ''}{d.name} ({d.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nama Perangkat / Jack Tujuan
                </label>
                <input
                  type="text"
                  placeholder="Wallplate Meja 12 / AP-Lobby"
                  value={targetDeviceName}
                  onChange={e => setTargetDeviceName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nomor Port Tujuan
                </label>
                <input
                  type="text"
                  placeholder="Port 24 / Uplink / Jack RJ45"
                  value={targetPort}
                  onChange={e => setTargetPort(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Lokasi Fisik Tujuan *
              </label>
              <input
                type="text"
                placeholder="Contoh: Ruang Kerja Lantai 1, Meja Staff Staf HRD"
                value={targetLocation}
                onChange={e => setTargetLocation(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          {/* Rute & Jalur Fisik Kabel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Panjang Kabel (Meter)
              </label>
              <input
                type="number"
                placeholder="Meter"
                value={lengthMeter}
                onChange={e => setLengthMeter(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kecepatan Tautan (Link Speed)
              </label>
              <select
                value={speedMbps}
                onChange={e => setSpeedMbps(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              >
                <option value={100}>100 Mbps (Fast Ethernet)</option>
                <option value={1000}>1 Gbps (Gigabit Ethernet)</option>
                <option value={2500}>2.5 Gbps (Multi-Gig)</option>
                <option value={10000}>10 Gbps (10G Optical / SFP+)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Warna Kabel / Jacket
              </label>
              <input
                type="text"
                placeholder="Biru, Abu-abu, Kuning FO"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Rute Penarikan Kabel (Tray / Conduit / Shaft)
            </label>
            <input
              type="text"
              placeholder="Contoh: Cable Tray Plafon Lt 2 -> Shaft Riser Kabel -> Conduit PVC Meja"
              value={pathwayRoute}
              onChange={e => setPathwayRoute(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Teknisi / PIC Penarikan Kabel
              </label>
              <input
                type="text"
                placeholder="Contoh: Rian IT Network / Vendor Cabling"
                value={pic}
                onChange={e => setPic(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Teknis / Keterangan
              </label>
              <input
                type="text"
                placeholder="Catatan tambahan..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{editCable ? 'Simpan Perubahan' : 'Tambah Jalur Kabel'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
