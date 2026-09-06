import React, { useState, useEffect } from 'react';
import { X, Droplets, MapPin, Layers, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { WaterPipeRun, WaterDevice, LanLocation, LanZone } from '../types/utilityNetworks';

interface WaterPipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pipe: Partial<WaterPipeRun>) => void;
  editPipe?: WaterPipeRun | null;
  locations: LanLocation[];
  zones: LanZone[];
  waterDevices: WaterDevice[];
  presetLocationId?: string;
  presetZoneId?: string;
}

export const WaterPipeModal: React.FC<WaterPipeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editPipe,
  locations,
  zones,
  waterDevices,
  presetLocationId,
  presetZoneId,
}) => {
  const [formData, setFormData] = useState<Partial<WaterPipeRun>>({
    pipeCode: '',
    pipeType: 'PVC AW (Air Bersih)',
    pipeDiameter: '3/4 inch',
    sourcePoint: '',
    targetPoint: '',
    sourceLocation: '',
    targetLocation: '',
    lengthMeter: 12,
    pressureBar: 2.2,
    status: 'active',
    pathwayRoute: '',
    notes: '',
  });

  const [selectedLocationId, setSelectedLocationId] = useState<string>(presetLocationId || '');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(presetZoneId || '');

  useEffect(() => {
    if (editPipe) {
      setFormData({
        ...editPipe,
        sourcePoint: editPipe.sourcePoint || editPipe.sourceLocation,
        targetPoint: editPipe.targetPoint || editPipe.targetLocation,
      });
      setSelectedLocationId(editPipe.locationId || presetLocationId || '');
      setSelectedZoneId(editPipe.zoneId || presetZoneId || '');
    } else {
      setFormData({
        pipeCode: `PIP-AIR-${Math.floor(100 + Math.random() * 900)}`,
        pipeType: 'PVC AW (Air Bersih)',
        pipeDiameter: '3/4 inch',
        sourcePoint: '',
        targetPoint: '',
        sourceLocation: '',
        targetLocation: '',
        lengthMeter: 12,
        pressureBar: 2.2,
        status: 'active',
        pathwayRoute: '',
        notes: '',
        locationId: presetLocationId || '',
        zoneId: presetZoneId || '',
      });
      setSelectedLocationId(presetLocationId || (locations[0]?.id || ''));
      setSelectedZoneId(presetZoneId || '');
    }
  }, [editPipe, isOpen, presetLocationId, presetZoneId, locations]);

  if (!isOpen) return null;

  const availableZones = zones.filter(z => !selectedLocationId || z.locationId === selectedLocationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const src = formData.sourcePoint || formData.sourceLocation || '';
    const tgt = formData.targetPoint || formData.targetLocation || '';
    if (!formData.pipeCode || !src || !tgt) return;

    const pipeToSave: WaterPipeRun = {
      id: editPipe?.id || `water-pipe-${Date.now()}`,
      pipeCode: formData.pipeCode,
      pipeType: formData.pipeType || 'PVC AW (Air Bersih)',
      pipeDiameter: formData.pipeDiameter || '3/4 inch',
      sourcePoint: src,
      targetPoint: tgt,
      sourceLocation: src,
      targetLocation: tgt,
      lengthMeter: Number(formData.lengthMeter) || 0,
      pressureBar: formData.pressureBar !== undefined ? Number(formData.pressureBar) : undefined,
      status: formData.status || 'active',
      pathwayRoute: formData.pathwayRoute,
      notes: formData.notes,
      locationId: selectedLocationId,
      zoneId: selectedZoneId,
      createdAt: editPipe?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(pipeToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {editPipe ? 'Edit Jalur Pipa Air' : 'Catat Jalur Pipa Air'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencatatan rute perpipaan distribusi air bersih, irigasi, dan tandon
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
          <form id="water-pipe-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Lokasi & Jaringan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                  Lokasi
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => {
                    setSelectedLocationId(e.target.value);
                    const matching = zones.filter(z => z.locationId === e.target.value);
                    setSelectedZoneId(matching[0]?.id || '');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-hidden"
                >
                  <option value="">Pilih Lokasi</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-500" />
                  Nama Jaringan
                </label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-hidden"
                >
                  <option value="">Pilih Jaringan</option>
                  {availableZones.map(zone => (
                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Kode Label & Jenis Pipa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-500" />
                  Kode Label Pipa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pipeCode || ''}
                  onChange={(e) => setFormData({ ...formData, pipeCode: e.target.value })}
                  placeholder="Contoh: PIP-TORN-01"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                  Jenis Pipa
                </label>
                <select
                  value={formData.pipeType || 'PVC AW (Air Bersih)'}
                  onChange={(e) => setFormData({ ...formData, pipeType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-hidden"
                >
                  <option value="PVC AW (Air Bersih)">PVC AW (Air Bersih)</option>
                  <option value="PVC D (Pembuangan)">PVC D (Pembuangan)</option>
                  <option value="PPR (Air Panas / Dingin Tekanan)">PPR (Air Panas / Dingin Tekanan)</option>
                  <option value="HDPE (Outdoor / Underground)">HDPE (Outdoor / Underground)</option>
                  <option value="Pipa Besi Galvanis (GIP)">Pipa Besi Galvanis (GIP)</option>
                  <option value="Selang Fleksibel / PE Drip">Selang Fleksibel / PE Drip</option>
                </select>
              </div>
            </div>

            {/* Diameter & Tekanan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Diameter Pipa
                </label>
                <input
                  type="text"
                  value={formData.pipeDiameter || ''}
                  onChange={(e) => setFormData({ ...formData, pipeDiameter: e.target.value })}
                  placeholder="Contoh: 1/2 inch, 3/4 inch, 1 inch, 2 inch"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tekanan Normal (Bar)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.pressureBar ?? ''}
                  onChange={(e) => setFormData({ ...formData, pressureBar: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Contoh: 2.0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-hidden"
                />
              </div>
            </div>

            {/* Titik Asal & Titik Tujuan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Titik Asal (Pompa / Toren / Sumber) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sourcePoint || formData.sourceLocation || ''}
                  onChange={(e) => setFormData({ ...formData, sourcePoint: e.target.value, sourceLocation: e.target.value })}
                  placeholder="Contoh: Toren Utama Lantai 3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
                  Titik Tujuan (Kran / Solenoid / Ruang) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.targetPoint || formData.targetLocation || ''}
                  onChange={(e) => setFormData({ ...formData, targetPoint: e.target.value, targetLocation: e.target.value })}
                  placeholder="Contoh: Kran Wastafel Toilet Lt 1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-hidden"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                  Status Jalur
                </label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-hidden"
                >
                  <option value="active">Normal (Mengalir Baik)</option>
                  <option value="standby">Siaga (Standby)</option>
                  <option value="leaking">Bocor / Masalah</option>
                  <option value="maintenance">Dalam Perbaikan</option>
                </select>
              </div>
            </div>

            {/* Rute Jalur */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rute Jalur Pipa (Shaft / Bawah Tanah / Dinding)
              </label>
              <input
                type="text"
                value={formData.pathwayRoute || ''}
                onChange={(e) => setFormData({ ...formData, pathwayRoute: e.target.value })}
                placeholder="Contoh: Shaft plumbing barat lt 3 -> tanam dinding bata ke toilet"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-hidden"
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
                placeholder="Posisi stop valve, check valve, water meter, dll..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-hidden resize-none"
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
            form="water-pipe-form"
            className="px-6 py-2.5 rounded-xl font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition-all shadow-md shadow-cyan-600/20"
          >
            {editPipe ? 'Simpan Perubahan' : 'Catat Jalur Baru'}
          </button>
        </div>
      </div>
    </div>
  );
};
