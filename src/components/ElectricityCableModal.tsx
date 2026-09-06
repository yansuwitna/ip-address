import React, { useState, useEffect } from 'react';
import { X, Cable, MapPin, Layers, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { ElectricityCableRun, ElectricityDevice, LanLocation, LanZone } from '../types/utilityNetworks';

interface ElectricityCableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cable: Partial<ElectricityCableRun>) => void;
  editCable?: ElectricityCableRun | null;
  locations: LanLocation[];
  zones: LanZone[];
  electricityDevices: ElectricityDevice[];
  presetLocationId?: string;
  presetZoneId?: string;
}

export const ElectricityCableModal: React.FC<ElectricityCableModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editCable,
  locations,
  zones,
  electricityDevices,
  presetLocationId,
  presetZoneId,
}) => {
  const [formData, setFormData] = useState<Partial<ElectricityCableRun>>({
    cableCode: '',
    cableType: 'NYY',
    coreSpec: '4 x 16 mm²',
    sourcePoint: '',
    targetPoint: '',
    sourceLocation: '',
    targetLocation: '',
    lengthMeter: 15,
    voltageVolt: 380,
    currentAmpere: 63,
    status: 'connected',
    pathwayRoute: '',
    notes: '',
  });

  const [selectedLocationId, setSelectedLocationId] = useState<string>(presetLocationId || '');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(presetZoneId || '');

  useEffect(() => {
    if (editCable) {
      setFormData({
        ...editCable,
        sourcePoint: editCable.sourcePoint || editCable.sourceLocation,
        targetPoint: editCable.targetPoint || editCable.targetLocation,
      });
      setSelectedLocationId(editCable.locationId || presetLocationId || '');
      setSelectedZoneId(editCable.zoneId || presetZoneId || '');
    } else {
      setFormData({
        cableCode: `CBL-EL-${Math.floor(100 + Math.random() * 900)}`,
        cableType: 'NYY',
        coreSpec: '4 x 16 mm²',
        sourcePoint: '',
        targetPoint: '',
        sourceLocation: '',
        targetLocation: '',
        lengthMeter: 20,
        voltageVolt: 380,
        currentAmpere: 63,
        status: 'connected',
        pathwayRoute: '',
        notes: '',
        locationId: presetLocationId || '',
        zoneId: presetZoneId || '',
      });
      setSelectedLocationId(presetLocationId || (locations[0]?.id || ''));
      setSelectedZoneId(presetZoneId || '');
    }
  }, [editCable, isOpen, presetLocationId, presetZoneId, locations]);

  if (!isOpen) return null;

  const availableZones = zones.filter(z => !selectedLocationId || z.locationId === selectedLocationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const src = formData.sourcePoint || formData.sourceLocation || '';
    const tgt = formData.targetPoint || formData.targetLocation || '';
    if (!formData.cableCode || !src || !tgt) return;

    const cableToSave: ElectricityCableRun = {
      id: editCable?.id || `elec-cable-${Date.now()}`,
      cableCode: formData.cableCode,
      cableType: formData.cableType || 'NYY',
      coreSpec: formData.coreSpec,
      sourcePoint: src,
      targetPoint: tgt,
      sourceLocation: src,
      targetLocation: tgt,
      lengthMeter: Number(formData.lengthMeter) || 0,
      voltageVolt: formData.voltageVolt ? Number(formData.voltageVolt) : undefined,
      currentAmpere: formData.currentAmpere ? Number(formData.currentAmpere) : undefined,
      status: formData.status || 'connected',
      pathwayRoute: formData.pathwayRoute,
      notes: formData.notes,
      locationId: selectedLocationId,
      zoneId: selectedZoneId,
      createdAt: editCable?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(cableToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Cable className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {editCable ? 'Edit Jalur Kabel Listrik' : 'Catat Jalur Kabel Listrik'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencatatan rute jalur kabel distribusi panel, MDP, SDP, dan beban
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-6 overflow-y-auto space-y-4">
          <form id="electricity-cable-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Lokasi & Jaringan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  Lokasi
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => {
                    setSelectedLocationId(e.target.value);
                    const matching = zones.filter(z => z.locationId === e.target.value);
                    setSelectedZoneId(matching[0]?.id || '');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                >
                  <option value="">Pilih Lokasi</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  Nama Jaringan
                </label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                >
                  <option value="">Pilih Jaringan</option>
                  {availableZones.map(zone => (
                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Kode Label & Tipe Kabel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  Kode Label Kabel *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cableCode || ''}
                  onChange={(e) => setFormData({ ...formData, cableCode: e.target.value })}
                  placeholder="Contoh: NYY-MDP-SDP1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Kabel
                </label>
                <select
                  value={formData.cableType || 'NYY'}
                  onChange={(e) => setFormData({ ...formData, cableType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                >
                  <option value="NYY">NYY (Kabel Luar / Tanam)</option>
                  <option value="NYM">NYM (Kabel Dinding / Plafon)</option>
                  <option value="NYA">NYA (Kabel Conduit)</option>
                  <option value="XLPE">XLPE (Tegangan Tinggi)</option>
                  <option value="NYFGBY">NYFGBY (Armoured Bawah Tanah)</option>
                  <option value="Twisted Core">Twisted Kabel Udara</option>
                </select>
              </div>
            </div>

            {/* Spesifikasi Core & Tegangan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ukuran Core (mm²)
                </label>
                <input
                  type="text"
                  value={formData.coreSpec || ''}
                  onChange={(e) => setFormData({ ...formData, coreSpec: e.target.value })}
                  placeholder="Contoh: 4 x 16 mm², 3 x 2.5 mm²"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tegangan Kerja (Volt)
                </label>
                <select
                  value={formData.voltageVolt || 380}
                  onChange={(e) => setFormData({ ...formData, voltageVolt: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                >
                  <option value={220}>220 V (1 Phase)</option>
                  <option value={380}>380 V (3 Phase)</option>
                </select>
              </div>
            </div>

            {/* Titik Asal & Titik Tujuan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Titik Asal (Suplai / Breaker) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sourcePoint || formData.sourceLocation || ''}
                  onChange={(e) => setFormData({ ...formData, sourcePoint: e.target.value, sourceLocation: e.target.value })}
                  placeholder="Contoh: Panel MDP Basement Breaker 01"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  Titik Tujuan (Beban / Sub Panel) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.targetPoint || formData.targetLocation || ''}
                  onChange={(e) => setFormData({ ...formData, targetPoint: e.target.value, targetLocation: e.target.value })}
                  placeholder="Contoh: Sub Panel SDP Lantai 1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>
            </div>

            {/* Panjang & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Panjang Jalur (Meter)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.lengthMeter || 0}
                  onChange={(e) => setFormData({ ...formData, lengthMeter: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  Status Jalur
                </label>
                <select
                  value={formData.status || 'connected'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                >
                  <option value="connected">Normal (Terhubung)</option>
                  <option value="idle">Cadangan (Standby)</option>
                  <option value="fault">Kritis / Putus</option>
                  <option value="maintenance">Dalam Perawatan</option>
                </select>
              </div>
            </div>

            {/* Rute Jalur */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rute Jalur (Tray / Shaft / Conduit)
              </label>
              <input
                type="text"
                value={formData.pathwayRoute || ''}
                onChange={(e) => setFormData({ ...formData, pathwayRoute: e.target.value })}
                placeholder="Contoh: Shaft ME Gedung Utama -> Cable Tray Plafon Lt. 1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Tambahan
              </label>
              <textarea
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Keterangan spesifikasi isolasi, warna fasa (R-S-T-N), dll..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden resize-none"
              />
            </div>
          </form>
        </div>

        {/* Sticky Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3 shrink-0 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="electricity-cable-form"
            className="px-6 py-2.5 rounded-xl font-medium text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-md shadow-amber-600/20"
          >
            {editCable ? 'Simpan Perubahan' : 'Catat Jalur Baru'}
          </button>
        </div>
      </div>
    </div>
  );
};
