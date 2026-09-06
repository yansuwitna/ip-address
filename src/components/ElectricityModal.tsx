import React, { useState, useEffect } from 'react';
import { X, Zap, Save, AlertCircle } from 'lucide-react';
import { ElectricityDevice, ElectricityDeviceType, ElectricalPhase, ElectricalStatus, LanLocation, LanZone } from '../types/utilityNetworks';

interface ElectricityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: Partial<ElectricityDevice>) => void;
  editDevice?: ElectricityDevice | null;
  existingDevices: ElectricityDevice[];
  locations?: LanLocation[];
  zones?: LanZone[];
  presetLocationId?: string;
  presetZoneId?: string;
}

export const ElectricityModal: React.FC<ElectricityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editDevice,
  existingDevices,
  locations = [],
  zones = [],
  presetLocationId,
  presetZoneId
}) => {
  const [locationId, setLocationId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<ElectricityDeviceType>('panel_sdp');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [phase, setPhase] = useState<ElectricalPhase>('1_phase');
  const [voltage, setVoltage] = useState<number>(220);
  const [currentAmpere, setCurrentAmpere] = useState<string>('');
  const [capacityWatt, setCapacityWatt] = useState<string>('');
  const [currentLoadWatt, setCurrentLoadWatt] = useState<string>('');
  const [status, setStatus] = useState<ElectricalStatus>('normal');
  const [sourcePanelId, setSourcePanelId] = useState<string>('');
  const [installationDate, setInstallationDate] = useState('');
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
      setBrand(editDevice.brand || '');
      setModel(editDevice.model || '');
      setLocation(editDevice.location);
      setPhase(editDevice.phase);
      setVoltage(editDevice.voltage || 220);
      setCurrentAmpere(editDevice.currentAmpere ? editDevice.currentAmpere.toString() : '');
      setCapacityWatt(editDevice.capacityWatt ? editDevice.capacityWatt.toString() : '');
      setCurrentLoadWatt(editDevice.currentLoadWatt ? editDevice.currentLoadWatt.toString() : '');
      setStatus(editDevice.status);
      setSourcePanelId(editDevice.sourcePanelId || '');
      setInstallationDate(editDevice.installationDate || '');
      setPic(editDevice.pic || '');
      setNotes(editDevice.notes || '');
    } else {
      const initLoc = presetLocationId || (locations[0]?.id || '');
      setLocationId(initLoc);
      const availableZones = zones.filter(z => (z.systemType === 'electricity' || !z.systemType) && z.locationId === initLoc);
      setZoneId(presetZoneId || (availableZones[0]?.id || ''));
      setName('');
      setCode('');
      setType('panel_sdp');
      setBrand('');
      setModel('');
      setLocation('');
      setPhase('1_phase');
      setVoltage(220);
      setCurrentAmpere('20');
      setCapacityWatt('4400');
      setCurrentLoadWatt('0');
      setStatus('normal');
      setSourcePanelId('');
      setInstallationDate(new Date().toISOString().slice(0, 10));
      setPic('');
      setNotes('');
    }
    setError(null);
  }, [isOpen, editDevice]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama perangkat listrik wajib diisi!');
      return;
    }
    if (!location.trim()) {
      setError('Lokasi penempatan wajib diisi!');
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
      location: location.trim(),
      phase,
      voltage: Number(voltage) || 220,
      currentAmpere: currentAmpere ? Number(currentAmpere) : undefined,
      capacityWatt: capacityWatt ? Number(capacityWatt) : undefined,
      currentLoadWatt: currentLoadWatt ? Number(currentLoadWatt) : 0,
      status,
      sourcePanelId: sourcePanelId || undefined,
      installationDate: installationDate || undefined,
      pic: pic.trim() || undefined,
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto font-poppins animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-amber-500/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editDevice ? 'Edit Perangkat Listrik' : 'Tambah Perangkat Listrik Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data spesifikasi panel, daya, kapasitas, dan jalur distribusi listrik
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
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

          {/* Konteks Lokasi & Jaringan Tempat Perangkat */}
          {locations.length > 0 && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lokasi Gedung / Tempat *
                  </label>
                  <select
                    value={locationId}
                    onChange={e => {
                      const newLocId = e.target.value;
                      setLocationId(newLocId);
                      const matchingZones = zones.filter(z => (z.systemType === 'electricity' || !z.systemType) && z.locationId === newLocId);
                      setZoneId(matchingZones[0]?.id || '');
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} {loc.code ? `(${loc.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jaringan / Zona Area *
                  </label>
                  <select
                    value={zoneId}
                    onChange={e => setZoneId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
                  >
                    {zones.filter(z => (z.systemType === 'electricity' || !z.systemType) && z.locationId === locationId).map(zone => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} {zone.code ? `(${zone.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Perangkat */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Perangkat Listrik *
              </label>
              <input
                type="text"
                placeholder="Contoh: Panel SDP Lt. 1 / UPS Rack A"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            {/* Kode Perangkat */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kode / Tag Identifikasi
              </label>
              <input
                type="text"
                placeholder="Contoh: PNL-SDP-01"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tipe Perangkat */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipe Komponen / Perangkat
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as ElectricityDeviceType)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
              >
                <option value="panel_mdp">Panel MDP (Main Distribution Panel)</option>
                <option value="panel_sdp">Panel SDP (Sub Distribution Panel)</option>
                <option value="trafo">Trafo / Transformator PLN</option>
                <option value="genset">Genset Generator Cadangan</option>
                <option value="ups">UPS (Uninterruptible Power Supply)</option>
                <option value="mcb">MCB / MCCB / Breaker Box</option>
                <option value="kwh_meter">KWH Meter Listrik</option>
                <option value="pdu_stopkontak">PDU Rack / Stop Kontak</option>
                <option value="stabilizer">Automatic Voltage Regulator (AVR)</option>
                <option value="inverter">Solar Inverter / Power Inverter</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status Kondisi
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ElectricalStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
              >
                <option value="normal">Normal / Beroperasi</option>
                <option value="warning">Peringatan / Beban Tinggi</option>
                <option value="maintenance">Perawatan / Service</option>
                <option value="critical">Kritis / Overload</option>
                <option value="off">Mati / Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lokasi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lokasi / Ruangan *
              </label>
              <input
                type="text"
                placeholder="Contoh: Ruang Panel Basemen, Ruang Server"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            {/* Sumber Jalur Panel Induk */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jalur Suplai Induk (Opsional)
              </label>
              <select
                value={sourcePanelId}
                onChange={e => setSourcePanelId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
              >
                <option value="">-- Langsung dari Sumber / Induk Utama --</option>
                {existingDevices
                  .filter(d => !editDevice || d.id !== editDevice.id)
                  .map(d => (
                    <option key={d.id} value={d.id}>
                      {d.code ? `[${d.code}] ` : ''}{d.name} ({d.location})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Spesifikasi Kelistrikan
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Phasa */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Fasa Listrik
                </label>
                <select
                  value={phase}
                  onChange={e => {
                    const p = e.target.value as ElectricalPhase;
                    setPhase(p);
                    if (p === '3_phase' && voltage === 220) setVoltage(380);
                    if (p === '1_phase' && voltage === 380) setVoltage(220);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  <option value="1_phase">1 Phase (1P)</option>
                  <option value="3_phase">3 Phase (3P)</option>
                </select>
              </div>

              {/* Tegangan Volt */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Tegangan (Volt)
                </label>
                <input
                  type="number"
                  value={voltage}
                  onChange={e => setVoltage(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Kapasitas Ampere */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Arus / MCB (A)
                </label>
                <input
                  type="number"
                  placeholder="Ampere"
                  value={currentAmpere}
                  onChange={e => {
                    const a = e.target.value;
                    setCurrentAmpere(a);
                    if (a && voltage) {
                      const calcWatt = phase === '3_phase' ? Math.round(Number(a) * voltage * 1.732 * 0.8) : Math.round(Number(a) * voltage * 0.8);
                      if (!capacityWatt) setCapacityWatt(calcWatt.toString());
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Kapasitas Watt */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Daya Maksimal (Watt)
                </label>
                <input
                  type="number"
                  placeholder="Watt"
                  value={capacityWatt}
                  onChange={e => setCapacityWatt(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Beban Saat Ini */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Beban Saat Ini (Watt)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={currentLoadWatt}
                  onChange={e => setCurrentLoadWatt(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Merk & Tipe / Model
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Merk (Schneider, ABB)"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Tipe/Model"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PIC */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Penanggung Jawab (PIC / Teknisi)
              </label>
              <input
                type="text"
                placeholder="Contoh: Pak Hendro (ME Spv)"
                value={pic}
                onChange={e => setPic(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Tanggal Pemasangan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Pasang / Uji
              </label>
              <input
                type="date"
                value={installationDate}
                onChange={e => setInstallationDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

            {/* Catatan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Catatan & Keterangan Khusus
              </label>
              <textarea
                rows={2}
                placeholder="Catatan jalur distribusi, batasan beban, dll..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
              />
            </div>
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
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editDevice ? 'Simpan Perubahan' : 'Tambah Perangkat'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
