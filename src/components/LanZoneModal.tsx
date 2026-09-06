import React, { useState, useEffect } from 'react';
import { X, Network, Save, AlertCircle, Building2, Lock } from 'lucide-react';
import { LanZone, LanLocation } from '../types/utilityNetworks';

interface LanZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (zone: Partial<LanZone>) => void;
  editZone?: LanZone | null;
  locations: LanLocation[];
  presetLocationId?: string;
  title?: string;
  nameLabel?: string;
  namePlaceholder?: string;
}

export const LanZoneModal: React.FC<LanZoneModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editZone,
  locations,
  presetLocationId,
  title = 'Jaringan / Sub-Sistem',
  nameLabel = 'Nama Jaringan / Sub-Sistem *',
  namePlaceholder = 'Contoh: Jaringan Listrik Gedung A, CCTV Area Barat, Distribusi Irigasi Blok 1'
}) => {
  const [locationId, setLocationId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [floor, setFloor] = useState('');
  const [roomType, setRoomType] = useState('lab');
  const [pic, setPic] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editZone) {
      setLocationId(editZone.locationId);
      setName(editZone.name);
      setCode(editZone.code || '');
      setFloor(editZone.floor || '');
      setRoomType(editZone.roomType || 'lab');
      setPic(editZone.pic || '');
      setNotes(editZone.notes || '');
    } else {
      setLocationId(presetLocationId || locations[0]?.id || '');
      setName('');
      setCode(`NET-${String(Date.now()).slice(-4)}`);
      setFloor('Lantai 1');
      setRoomType('lab');
      setPic('');
      setNotes('');
    }
    setError(null);
  }, [isOpen, editZone, locations, presetLocationId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId) {
      setError('Pilih lokasi tempat jaringan!');
      return;
    }
    if (!name.trim()) {
      setError('Nama Jaringan wajib diisi!');
      return;
    }

    onSave({
      id: editZone?.id,
      locationId,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      floor: floor.trim() || undefined,
      roomType: roomType || 'lab',
      pic: pic.trim() || undefined,
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto font-poppins animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800/60">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {editZone ? `Edit ${title}` : `Tambah ${title} Baru`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tingkat 2: Area / Zona sub-sistem di lokasi terpilih
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Lokasi Induk <span className="text-rose-500">*</span>
              </label>
              {editZone && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Lokasi induk terkunci saat mode edit</span>
                </span>
              )}
            </div>
            <div className="relative">
              <select
                value={locationId}
                onChange={e => setLocationId(e.target.value)}
                disabled={Boolean(editZone)}
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border transition-all ${
                  editZone 
                    ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 cursor-not-allowed select-none opacity-80' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer'
                }`}
                required
              >
                <option value="" disabled>-- Pilih Lokasi Induk --</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.code ? `(${loc.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {nameLabel}
              </label>
              <input
                type="text"
                placeholder={namePlaceholder}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Kode Lab / Area
              </label>
              <input
                type="text"
                placeholder="LAB-01"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tipe Ruangan
              </label>
              <select
                value={roomType}
                onChange={e => setRoomType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="lab">Laboratorium Komputer / CBT</option>
                <option value="server_room">Ruang Server / Data Center</option>
                <option value="office">Ruang Guru / Kantor TU</option>
                <option value="classroom">Ruang Kelas / Teori</option>
                <option value="library">Perpustakaan Digital</option>
                <option value="other">Area Lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Lantai / Posisi Gedung
              </label>
              <input
                type="text"
                placeholder="misal: Lantai 2 Gedung Teori"
                value={floor}
                onChange={e => setFloor(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Penanggung Jawab / Kepala Lab
            </label>
            <input
              type="text"
              placeholder="misal: Ahmad Fauzi (Teknisi Lab 1)"
              value={pic}
              onChange={e => setPic(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Keterangan / Catatan Lab
            </label>
            <textarea
              rows={2}
              placeholder="misal: Terdapat 36 unit PC Client, 1 server lokal, switch 24 port"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Ruang / Lab</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
