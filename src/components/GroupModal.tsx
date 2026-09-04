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

  // Live subnet info
  const subnetInfo = useMemo(() => {
    if (isValidCidr(cidr)) {
      return parseCidr(cidr);
    }
    return null;
  }, [cidr]);

  // Auto-suggest gateway when CIDR changes (if default/new)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">
              {editGroup ? 'Edit Grup IP / Subnet' : 'Tambah Grup IP Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Nama Grup */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nama Grup / Segmen Jaringan *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: LAN Kantor Lt. 1, Server Farm, WiFi Tamu"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Subnet CIDR & Gateway */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Subnet CIDR *
              </label>
              <input
                type="text"
                required
                value={cidr}
                onChange={(e) => handleCidrChange(e.target.value)}
                placeholder="192.168.1.0/24"
                className="w-full font-mono bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-blue-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Default Gateway *
              </label>
              <input
                type="text"
                required
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
                placeholder="192.168.1.1"
                className="w-full font-mono bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Subnet Preview Box */}
          {subnetInfo && (
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-lg p-3 text-xs space-y-1.5 font-mono text-slate-300">
              <div className="text-[11px] text-blue-400 font-sans font-medium flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>Kalkulasi Subnet Otomatis:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Mask: <span className="text-white">{subnetInfo.netmask}</span></div>
                <div>Total Host: <span className="text-white">{subnetInfo.usableHosts} usable</span></div>
                <div>IP Pertama: <span className="text-emerald-400">{subnetInfo.firstUsableIp}</span></div>
                <div>IP Terakhir: <span className="text-emerald-400">{subnetInfo.lastUsableIp}</span></div>
              </div>
            </div>
          )}

          {/* VLAN & PIC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                VLAN ID (Opsional)
              </label>
              <input
                type="number"
                value={vlanId}
                onChange={(e) => setVlanId(e.target.value)}
                placeholder="Contoh: 10"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Penanggung Jawab (PIC)
              </label>
              <input
                type="text"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                placeholder="Contoh: Rian IT Support"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Lokasi */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Lokasi / Area Fisik
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Gedung Utama Lantai 2, Rack 3"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Warna Penanda Grup
            </label>
            <div className="flex items-center space-x-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform flex items-center justify-center relative shadow-sm hover:scale-110"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Keterangan / Catatan
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Penjelasan fungsi subnet atau alokasi perangkat..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md shadow-blue-600/30 transition-all"
            >
              {editGroup ? 'Simpan Perubahan' : 'Buat Grup IP'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
