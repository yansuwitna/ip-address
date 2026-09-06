import React, { useState, useEffect } from 'react';
import { X, Route, MapPin, Layers, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { CctvCableRun, CctvDevice, LanLocation, LanZone } from '../types/utilityNetworks';

interface CctvCableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cable: Partial<CctvCableRun>) => void;
  editCable?: CctvCableRun | null;
  locations: LanLocation[];
  zones: LanZone[];
  cctvDevices: CctvDevice[];
  presetLocationId?: string;
  presetZoneId?: string;
}

export const CctvCableModal: React.FC<CctvCableModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editCable,
  locations,
  zones,
  cctvDevices,
  presetLocationId,
  presetZoneId,
}) => {
  const [formData, setFormData] = useState<Partial<CctvCableRun>>({
    cableCode: '',
    cableType: 'Cat6 UTP (PoE)',
    sourcePoint: '',
    targetPoint: '',
    sourceLocation: '',
    targetLocation: '',
    lengthMeter: 20,
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
        cableCode: `CBL-CCTV-${Math.floor(100 + Math.random() * 900)}`,
        cableType: 'Cat6 UTP (PoE)',
        sourcePoint: '',
        targetPoint: '',
        sourceLocation: '',
        targetLocation: '',
        lengthMeter: 25,
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

    const cableToSave: CctvCableRun = {
      id: editCable?.id || `cctv-cable-${Date.now()}`,
      cableCode: formData.cableCode,
      cableType: formData.cableType || 'Cat6 UTP (PoE)',
      sourcePoint: src,
      targetPoint: tgt,
      sourceLocation: src,
      targetLocation: tgt,
      lengthMeter: Number(formData.lengthMeter) || 0,
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
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <Route className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {editCable ? 'Edit Jalur Kabel CCTV' : 'Catat Jalur Kabel CCTV'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencatatan rute sinyal dan daya CCTV (PoE Cat6 / Coaxial)
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
          <form id="cctv-cable-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Lokasi & Jaringan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  Lokasi
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => {
                    setSelectedLocationId(e.target.value);
                    const matching = zones.filter(z => z.locationId === e.target.value);
                    setSelectedZoneId(matching[0]?.id || '');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
                >
                  <option value="">Pilih Lokasi</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  Nama Jaringan
                </label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
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
                  <Tag className="w-3.5 h-3.5 text-indigo-500" />
                  Kode Label Kabel *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cableCode || ''}
                  onChange={(e) => setFormData({ ...formData, cableCode: e.target.value })}
                  placeholder="Contoh: CBL-CCTV-01"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Kabel
                </label>
                <select
                  value={formData.cableType || 'Cat6 UTP (PoE)'}
                  onChange={(e) => setFormData({ ...formData, cableType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
                >
                  <option value="Cat6 UTP (PoE)">Cat6 UTP (PoE)</option>
                  <option value="Cat5e PoE">Cat5e PoE</option>
                  <option value="STP Shielded Outdoor">STP Shielded Outdoor</option>
                  <option value="RG59 Coaxial + Power">RG59 Coaxial + Power</option>
                  <option value="RG6 Coaxial">RG6 Coaxial</option>
                  <option value="Fiber Optic Dropcore">Fiber Optic Dropcore</option>
                </select>
              </div>
            </div>

            {/* Titik Asal & Titik Tujuan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Titik Asal (Switch PoE / NVR) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sourcePoint || formData.sourceLocation || ''}
                  onChange={(e) => setFormData({ ...formData, sourcePoint: e.target.value, sourceLocation: e.target.value })}
                  placeholder="Contoh: Switch PoE Rack Server Port 4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                  Titik Tujuan (Kamera CCTV) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.targetPoint || formData.targetLocation || ''}
                  onChange={(e) => setFormData({ ...formData, targetPoint: e.target.value, targetLocation: e.target.value })}
                  placeholder="Contoh: CCTV Dome Lobby Depan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            </div>

            {/* Panjang & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimasi Panjang (Meter)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.lengthMeter || 0}
                  onChange={(e) => setFormData({ ...formData, lengthMeter: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Status Jalur
                </label>
                <select
                  value={formData.status || 'connected'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
                >
                  <option value="connected">Normal (Terhubung)</option>
                  <option value="idle">Cadangan (Standby)</option>
                  <option value="fault">Kritis / Putus</option>
                  <option value="maintenance">Dalam Perbaikan</option>
                </select>
              </div>
            </div>

            {/* Rute Conduit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rute / Tray / Pipa Conduit
              </label>
              <input
                type="text"
                value={formData.pathwayRoute || ''}
                onChange={(e) => setFormData({ ...formData, pathwayRoute: e.target.value })}
                placeholder="Contoh: Plafon koridor utama -> Conduit pipa PVC 20mm ke pos satpam"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden"
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
                placeholder="Keterangan termination, warna jack RJ45, dll..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-hidden resize-none"
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
            form="cctv-cable-form"
            className="px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
          >
            {editCable ? 'Simpan Perubahan' : 'Catat Jalur Baru'}
          </button>
        </div>
      </div>
    </div>
  );
};
