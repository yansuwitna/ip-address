import React, { useState, useEffect, useMemo } from 'react';
import { X, Server, Sparkles, AlertTriangle } from 'lucide-react';
import { IPGroup, IPAllocation, DeviceType, IPStatus } from '../types/ipam';
import { isValidIpv4, isIpInCidr, isValidMac, findNextAvailableIp } from '../utils/ipCalculator';

interface IPAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (allocation: Partial<IPAllocation>) => void;
  group: IPGroup;
  allocations: IPAllocation[];
  editAllocation?: IPAllocation | null;
  presetIp?: string;
}

const DEVICE_TYPES: { id: DeviceType; label: string }[] = [
  { id: 'server', label: 'Server' },
  { id: 'router', label: 'Router / Gateway' },
  { id: 'switch', label: 'Network Switch' },
  { id: 'access_point', label: 'Access Point (WiFi)' },
  { id: 'pc_workstation', label: 'PC / Laptop Workstation' },
  { id: 'cctv', label: 'IP Camera / CCTV' },
  { id: 'printer', label: 'Printer Jaringan' },
  { id: 'smartphone', label: 'Smartphone / Tablet' },
  { id: 'iot', label: 'IoT / Smart Device' },
  { id: 'other', label: 'Perangkat Lainnya' }
];

export const IPAllocationModal: React.FC<IPAllocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  group,
  allocations,
  editAllocation,
  presetIp
}) => {
  const [ip, setIp] = useState('');
  const [hostname, setHostname] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceType>('server');
  const [macAddress, setMacAddress] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<IPStatus>('used');
  const [assignedDate, setAssignedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const groupAllocatedIps = useMemo(() => {
    return allocations
      .filter(a => a.groupId === group.id && (!editAllocation || a.id !== editAllocation.id))
      .map(a => a.ip.trim());
  }, [allocations, group.id, editAllocation]);

  useEffect(() => {
    if (editAllocation) {
      setIp(editAllocation.ip);
      setHostname(editAllocation.hostname);
      setDeviceType(editAllocation.deviceType);
      setMacAddress(editAllocation.macAddress || '');
      setAssignedTo(editAllocation.assignedTo || '');
      setDepartment(editAllocation.department || '');
      setStatus(editAllocation.status);
      setAssignedDate(editAllocation.assignedDate || new Date().toISOString().slice(0, 10));
      setNotes(editAllocation.notes || '');
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setIp(presetIp || '');
      setHostname('');
      setDeviceType('pc_workstation');
      setMacAddress('');
      setAssignedTo('');
      setDepartment('');
      setStatus('used');
      setAssignedDate(today);
      setNotes('');

      if (!presetIp) {
        // Auto-find next free IP
        const nextFree = findNextAvailableIp(group.cidr, groupAllocatedIps, group.gateway);
        if (nextFree) setIp(nextFree);
      }
    }
    setError(null);
  }, [editAllocation, presetIp, isOpen, group.cidr, groupAllocatedIps, group.gateway]);

  // Conflict warning
  const isDuplicate = useMemo(() => {
    if (!ip.trim()) return false;
    return groupAllocatedIps.includes(ip.trim());
  }, [ip, groupAllocatedIps]);

  const isWithinSubnet = useMemo(() => {
    if (!isValidIpv4(ip)) return false;
    return isIpInCidr(ip, group.cidr);
  }, [ip, group.cidr]);

  const handlePickNextFree = () => {
    const nextFree = findNextAvailableIp(group.cidr, groupAllocatedIps, group.gateway);
    if (nextFree) {
      setIp(nextFree);
    } else {
      alert('Tidak ada IP kosong tersisa di subnet ini!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidIpv4(ip)) {
      setError('Format IP Address tidak valid! (Contoh: 192.168.1.15)');
      return;
    }

    if (!isWithinSubnet) {
      setError(`IP ${ip} berada di luar rentang subnet ${group.cidr}!`);
      return;
    }

    if (isDuplicate) {
      setError(`IP ${ip} sudah digunakan oleh perangkat lain di grup ini!`);
      return;
    }

    if (!hostname.trim()) {
      setError('Hostname / Nama Perangkat wajib diisi!');
      return;
    }

    if (macAddress && !isValidMac(macAddress)) {
      setError('Format MAC Address tidak valid! Gunakan format AA:BB:CC:DD:EE:FF atau kosongkan.');
      return;
    }

    onSave({
      ...(editAllocation ? { id: editAllocation.id } : {}),
      groupId: group.id,
      ip: ip.trim(),
      hostname: hostname.trim(),
      deviceType,
      macAddress: macAddress.trim().toUpperCase(),
      assignedTo: assignedTo.trim(),
      department: department.trim(),
      status,
      assignedDate,
      notes: notes.trim()
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
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                {editAllocation ? 'Edit Alokasi IP' : 'Alokasikan IP Baru'}
              </h3>
              <p className="text-xs text-slate-400">
                Grup: <span className="text-blue-300 font-medium">{group.name}</span> ({group.cidr})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* IP Address & Auto Free IP Helper */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Alamat IP *
              </label>
              <button
                type="button"
                onClick={handlePickNextFree}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                Cari IP Kosong Otomatis
              </button>
            </div>
            <input
              type="text"
              required
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="Contoh: 192.168.10.15"
              className={`w-full font-mono bg-slate-900 border rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
                isDuplicate 
                  ? 'border-rose-500 focus:ring-rose-500' 
                  : !isWithinSubnet && ip.trim()
                  ? 'border-amber-500 focus:ring-amber-500'
                  : 'border-slate-700 focus:ring-blue-500'
              }`}
            />
            {isDuplicate && (
              <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Peringatan: IP ini sudah tercatat dalam alokasi lain!
              </p>
            )}
            {!isWithinSubnet && ip.trim() && !isDuplicate && (
              <p className="mt-1 text-[11px] text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Perhatian: IP berada di luar rentang subnet {group.cidr}.
              </p>
            )}
          </div>

          {/* Hostname & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Hostname / Nama Perangkat *
              </label>
              <input
                type="text"
                required
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                placeholder="Contoh: srv-db-01, pc-finance"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Status Alokasi *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IPStatus)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="used">Used (Aktif Digunakan)</option>
                <option value="reserved">Reserved (Dicadangkan)</option>
                <option value="dhcp">DHCP Pool</option>
              </select>
            </div>
          </div>

          {/* Tipe Perangkat & MAC Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kategori Perangkat
              </label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DEVICE_TYPES.map(dt => (
                  <option key={dt.id} value={dt.id}>{dt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                MAC Address (Opsional)
              </label>
              <input
                type="text"
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
                placeholder="AA:BB:CC:DD:EE:FF"
                className="w-full font-mono bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>
          </div>

          {/* Pengguna / PIC & Departemen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Pengguna / PIC
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Departemen / Unit
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Contoh: Keuangan, IT, Umum"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tanggal Alokasi */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tanggal Penetapan
            </label>
            <input
              type="date"
              value={assignedDate}
              onChange={(e) => setAssignedDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Catatan / Deskripsi Tambahan
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nomor port switch, spesifikasi perangkat, dll..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Modal Actions */}
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
              {editAllocation ? 'Simpan Perubahan' : 'Alokasikan IP'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
