import React, { useState, useEffect, useMemo } from 'react';
import { X, Network, Info, Check } from 'lucide-react';
import { IPGroup } from '../types/ipam';
import { isValidCidr, parseCidr, isValidIpv4 } from '../utils/ipCalculator';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: Partial<IPGroup>) => void;
  editGroup?: IPGroup | null;
}

const PRESET_COLORS = [
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#059669', // Emerald
  '#d97706', // Amber
  '#dc2626', // Red
  '#0891b2', // Cyan
  '#db2777', // Pink
  '#4f46e5'  // Indigo
];

export const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editGroup
}) => {
  const [name, setName] = useState('');
  const [cidr, setCidr] = useState('192.168.1.0/24');
  const [gateway, setGateway] = useState('192.168.1.1');
  const [vlanId, setVlanId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [pic, setPic] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editGroup) {
      setName(editGroup.name);
      setCidr(editGroup.cidr);
      setGateway(editGroup.gateway);
      setVlanId(editGroup.vlanId ? editGroup.vlanId.toString() : '');
      setDescription(editGroup.description || '');
      setLocation(editGroup.location || '');
      setPic(editGroup.pic || '');
      setColor(editGroup.color || PRESET_COLORS[0]);
    } else {
      setName('');
      setCidr('192.168.1.0/24');
      setGateway('192.168.1.1');
      setVlanId('');
      setDescription('');
      setLocation('');
      setPic('');
      setColor(PRESET_COLORS[0]);
    }
    setError(null);
  }, [editGroup, isOpen]);

  const subnetInfo = useMemo(() => {
    if (isValidCidr(cidr)) {
      return parseCidr(cidr);
    }
    return null;
  }, [cidr]);

  const handleCidrChange = (val: string) => {
    setCidr(val);
    if (!editGroup && isValidCidr(val)) {
      const sub = parseCidr(val);
      if (sub) {
        setGateway(sub.firstUsableIp);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama grup jaringan wajib diisi!');
      return;
    }
    if (!isValidCidr(cidr)) {
      setError('Format CIDR tidak valid! Gunakan format seperti 192.168.1.0/24');
      return;
    }
    if (!isValidIpv4(gateway)) {
      setError('Format IP Gateway tidak valid!');
      return;
    }

    onSave({
      ...(editGroup ? { id: editGroup.id } : {}),
      name: name.trim(),
      cidr: cidr.trim(),
      gateway: gateway.trim(),
      vlanId: vlanId ? parseInt(vlanId, 10) : undefined,
      description: description.trim(),
      location: location.trim(),
      pic: pic.trim(),
      color
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto font-poppins">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800/60">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {editGroup ? 'Edit Grup IP / Subnet' : 'Tambah Grup IP Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Konfigurasi subnet CIDR dan gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Nama Grup */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Grup / Segmen Jaringan *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: LAN Kantor Lt. 1, Server Farm, WiFi Tamu"
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Subnet CIDR & Gateway */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Subnet CIDR *
              </label>
              <input
                type="text"
                required
                value={cidr}
                onChange={(e) => handleCidrChange(e.target.value)}
                placeholder="192.168.1.0/24"
                className="w-full font-mono font-medium bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-blue-700 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Default Gateway *
              </label>
              <input
                type="text"
                required
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
                placeholder="192.168.1.1"
                className="w-full font-mono font-medium bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Subnet Preview Box */}
          {subnetInfo && (
            <div className="bg-blue-50 dark:bg-blue-900/60 border border-blue-200 dark:border-blue-800/80 rounded-xl p-3 text-xs space-y-1 font-mono text-slate-700 dark:text-slate-300">
              <div className="text-[11px] text-blue-800 font-sans font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>Kalkulasi Otomatis:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Mask: <span className="font-bold text-slate-900 dark:text-slate-100">{subnetInfo.netmask}</span></div>
                <div>Host Usable: <span className="font-bold text-blue-700">{subnetInfo.usableHosts}</span></div>
                <div>IP Awal: <span className="font-bold text-emerald-700">{subnetInfo.firstUsableIp}</span></div>
                <div>IP Akhir: <span className="font-bold text-emerald-700">{subnetInfo.lastUsableIp}</span></div>
              </div>
            </div>
          )}

          {/* VLAN & PIC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                VLAN ID (Opsional)
              </label>
              <input
                type="number"
                value={vlanId}
                onChange={(e) => setVlanId(e.target.value)}
                placeholder="Contoh: 10"
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Penanggung Jawab (PIC)
              </label>
              <input
                type="text"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                placeholder="Contoh: Rian IT Support"
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Lokasi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Lokasi / Area Fisik
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Gedung Utama Lantai 2, Rack 3"
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Warna Penanda Grup
            </label>
            <div className="flex items-center space-x-2.5">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform flex items-center justify-center relative shadow-xs hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Keterangan / Catatan
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Penjelasan fungsi subnet atau alokasi perangkat..."
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
            >
              {editGroup ? 'Simpan Perubahan' : 'Buat Grup IP'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
