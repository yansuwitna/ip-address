import React, { useState, useEffect } from 'react';
import { X, Droplets, Save, AlertCircle } from 'lucide-react';
import { WaterDevice, WaterDeviceType, WaterStatus, LanLocation, LanZone } from '../types/utilityNetworks';

interface WaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: Partial<WaterDevice>) => void;
  editDevice?: WaterDevice | null;
  locations?: LanLocation[];
  zones?: LanZone[];
  presetLocationId?: string;
  presetZoneId?: string;
}

export const WaterModal: React.FC<WaterModalProps> = ({
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
  const [type, setType] = useState<WaterDeviceType>('pump_submersible');
  const [location, setLocation] = useState('');
  const [pipeDiameter, setPipeDiameter] = useState('1 inch');
  const [flowRateLpm, setFlowRateLpm] = useState<string>('');
  const [pressureBar, setPressureBar] = useState<string>('');
  const [tankCapacityLiter, setTankCapacityLiter] = useState<string>('');
  const [currentWaterLevelPct, setCurrentWaterLevelPct] = useState<string>('80');
  const [powerWatt, setPowerWatt] = useState<string>('');
  const [zoneArea, setZoneArea] = useState('');
  const [status, setStatus] = useState<WaterStatus>('active');
  const [sourceSupply, setSourceSupply] = useState('Sumur Bor / Deep Well');
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
      setLocation(editDevice.location);
      setPipeDiameter(editDevice.pipeDiameter || '1 inch');
      setFlowRateLpm(editDevice.flowRateLpm ? editDevice.flowRateLpm.toString() : '');
      setPressureBar(editDevice.pressureBar ? editDevice.pressureBar.toString() : '');
      setTankCapacityLiter(editDevice.tankCapacityLiter ? editDevice.tankCapacityLiter.toString() : '');
      setCurrentWaterLevelPct(editDevice.currentWaterLevelPct !== undefined ? editDevice.currentWaterLevelPct.toString() : '80');
      setPowerWatt(editDevice.powerWatt ? editDevice.powerWatt.toString() : '');
      setZoneArea(editDevice.zoneArea || '');
      setStatus(editDevice.status);
      setSourceSupply(editDevice.sourceSupply || 'Sumur Bor / Deep Well');
      setInstallationDate(editDevice.installationDate || '');
      setPic(editDevice.pic || '');
      setNotes(editDevice.notes || '');
    } else {
      const initLoc = presetLocationId || (locations[0]?.id || '');
      setLocationId(initLoc);
      const availableZones = zones.filter(z => z.systemType === 'water' && z.locationId === initLoc);
      setZoneId(presetZoneId || (availableZones[0]?.id || ''));
      setName('');
      setCode('');
      setType('pump_submersible');
      setLocation('');
      setPipeDiameter('1 inch');
      setFlowRateLpm('60');
      setPressureBar('3.0');
      setTankCapacityLiter('');
      setCurrentWaterLevelPct('80');
      setPowerWatt('750');
      setZoneArea('');
      setStatus('active');
      setSourceSupply('Sumur Bor / Deep Well');
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
      setError('Nama atau jenis perangkat air/irigasi wajib diisi!');
      return;
    }
    if (!location.trim()) {
      setError('Lokasi penempatan pipa/pompa/sensor wajib diisi!');
      return;
    }

    onSave({
      id: editDevice?.id,
      locationId: locationId || undefined,
      zoneId: zoneId || undefined,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type,
      location: location.trim(),
      pipeDiameter: pipeDiameter.trim() || undefined,
      flowRateLpm: flowRateLpm ? Number(flowRateLpm) : undefined,
      pressureBar: pressureBar ? Number(pressureBar) : undefined,
      tankCapacityLiter: tankCapacityLiter ? Number(tankCapacityLiter) : undefined,
      currentWaterLevelPct: currentWaterLevelPct ? Number(currentWaterLevelPct) : undefined,
      powerWatt: powerWatt ? Number(powerWatt) : undefined,
      zoneArea: zoneArea.trim() || undefined,
      status,
      sourceSupply: sourceSupply.trim() || undefined,
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
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-cyan-500/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500 text-white rounded-2xl shadow-md shadow-cyan-500/20">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editDevice ? 'Edit Perangkat Air & Irigasi' : 'Tambah Perangkat Air & Irigasi Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data pompa, katup solenoid, pipa distribusi, toren air, dan zona irigasi
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

            {/* Pilihan Lokasi & Jaringan Air */}
            {locations.length > 0 && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Lokasi Tempat *
                    </label>
                    <select
                      value={locationId}
                      onChange={e => {
                        const newLocId = e.target.value;
                        setLocationId(newLocId);
                        const matchingZones = zones.filter(z => z.systemType === 'water' && z.locationId === newLocId);
                        setZoneId(matchingZones[0]?.id || '');
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-100"
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
                      Jaringan / Area Distribusi Air *
                    </label>
                    <select
                      value={zoneId}
                      onChange={e => setZoneId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-100"
                    >
                      {zones.filter(z => z.systemType === 'water' && z.locationId === locationId).map(zone => (
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
                Nama Komponen Air / Irigasi *
              </label>
              <input
                type="text"
                placeholder="Contoh: Pompa Submersible Sumur / Solenoid Zona A"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            {/* Kode Tag */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kode Identifikasi / Tag
              </label>
              <input
                type="text"
                placeholder="PMP-SUMUR-01"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tipe Hardware */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipe Alat & Sistem
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as WaterDeviceType)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-100"
              >
                <option value="pump_submersible">Pompa Celup / Submersible (Sumur)</option>
                <option value="pump_booster">Pompa Pendorong (Booster Pump)</option>
                <option value="water_tank">Tandon / Toren Penampungan Air</option>
                <option value="valve_solenoid">Katup Solenoid Otomatis (Electric Valve)</option>
                <option value="valve_manual">Katup / Stop Kran Manual (Ball Valve)</option>
                <option value="flow_meter">Flow Meter / Pengukur Debit Aliran</option>
                <option value="water_level_sensor">Sensor Ketinggian Air (Radar / Ultrasonic)</option>
                <option value="pressure_sensor">Sensor / Manometer Tekanan Pipa</option>
                <option value="sprinkler_zone">Sistem Sprinkler / Nozzle Irigasi</option>
                <option value="filter_water">Tabung Filter / Penyaring Air</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status Operasional
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as WaterStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-100"
              >
                <option value="active">Aktif / Mengalir Normal</option>
                <option value="standby">Siaga (Standby)</option>
                <option value="leaking">Kebocoran / Perlu Cek Pipa</option>
                <option value="maintenance">Dalam Pemeliharaan</option>
                <option value="off">Mati / Ditutup (Off)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lokasi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lokasi Fisik / Rumah Pompa *
              </label>
              <input
                type="text"
                placeholder="Contoh: Rumah Pompa Timur, Roof Top Gedung A"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            {/* Zona Irigasi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Zona / Blok Irigasi
              </label>
              <input
                type="text"
                placeholder="Contoh: Zona 1 (Taman Barat), Lapangan Depan"
                value={zoneArea}
                onChange={e => setZoneArea(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Spesifikasi Hidrolik & Teknis Pipa
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Diameter Pipa */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Ukuran Pipa
                </label>
                <select
                  value={pipeDiameter}
                  onChange={e => setPipeDiameter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  <option value="1/2 inch">1/2 inch</option>
                  <option value="3/4 inch">3/4 inch</option>
                  <option value="1 inch">1 inch</option>
                  <option value="1.5 inch">1.5 inch</option>
                  <option value="2 inch">2 inch</option>
                  <option value="3 inch">3 inch</option>
                  <option value="4 inch">4 inch</option>
                </select>
              </div>

              {/* Debit Aliran LPM */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Debit (Ltr/Menit)
                </label>
                <input
                  type="number"
                  placeholder="LPM"
                  value={flowRateLpm}
                  onChange={e => setFlowRateLpm(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Tekanan Bar */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Tekanan (Bar)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Bar"
                  value={pressureBar}
                  onChange={e => setPressureBar(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Daya Pompa (Watt) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Daya Listrik (W)
                </label>
                <input
                  type="number"
                  placeholder="Watt"
                  value={powerWatt}
                  onChange={e => setPowerWatt(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Kapasitas Toren */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Kapasitas Tangki (Liter)
                </label>
                <input
                  type="number"
                  placeholder="Jika toren (contoh: 5000)"
                  value={tankCapacityLiter}
                  onChange={e => setTankCapacityLiter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Level Air Saat Ini */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Level Air Saat Ini (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0 - 100%"
                  value={currentWaterLevelPct}
                  onChange={e => setCurrentWaterLevelPct(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Sumber Air */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Sumber Pasokan Air
                </label>
                <input
                  type="text"
                  placeholder="PDAM, Sumur Bor, Toren A"
                  value={sourceSupply}
                  onChange={e => setSourceSupply(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PIC */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Penanggung Jawab (PIC Irigasi / ME)
              </label>
              <input
                type="text"
                placeholder="Pak Sujono (Pengelola Air & Irigasi)"
                value={pic}
                onChange={e => setPic(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Tanggal Pasang */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Pemasangan
              </label>
              <input
                type="date"
                value={installationDate}
                onChange={e => setInstallationDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Jadwal Penyiraman & Catatan Teknis
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Jadwal siram otomatis pukul 06:30 & 16:30 WIB..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-100"
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
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{editDevice ? 'Simpan Perubahan' : 'Tambah Perangkat Air'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
