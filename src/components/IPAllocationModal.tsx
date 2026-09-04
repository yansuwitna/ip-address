import React, { useState, useEffect, useMemo } from 'react';
import { X, Server, Sparkles, AlertTriangle } from 'lucide-react';
import { IPGroup, IPAllocation, DeviceType, IPStatus, DeviceCategory } from '../types/ipam';
import { isValidIpv4, isIpInCidr, isValidMac, findNextAvailableIp } from '../utils/ipCalculator';
import { DEFAULT_DEVICE_CATEGORIES } from '../utils/storage';
import { showWarning } from '../utils/swal';

interface IPAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (allocation: Partial<IPAllocation>) => void;
  group: IPGroup;
  allocations: IPAllocation[];
  editAllocation?: IPAllocation | null;
  presetIp?: string;
  categories?: DeviceCategory[];
}

export const IPAllocationModal: React.FC<IPAllocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  group,
  allocations,
  editAllocation,
  presetIp,
  categories = DEFAULT_DEVICE_CATEGORIES
}) => {
  const [ip, setIp] = useState('');
  const [hostname, setHostname] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceType>(() => categories[0]?.id || 'router');
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
    if (!isOpen) return;

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
      const isGw = presetIp && presetIp === group.gateway;
      const defaultCategory = isGw 
        ? (categories.find(c => c.id === 'router')?.id || categories[0]?.id || 'router')
        : (categories[0]?.id || 'router');

      setIp(presetIp || '');
      setHostname('');
      setDeviceType(defaultCategory);
      setMacAddress('');
      setAssignedTo('');
      setDepartment('');
      setStatus('used');
      setAssignedDate(today);
      setNotes('');

      if (!presetIp) {
        const nextFree = findNextAvailableIp(group.cidr, groupAllocatedIps, group.gateway);
        if (nextFree) setIp(nextFree);
      }
    }
    setError(null);
  }, [isOpen, editAllocation, presetIp]);

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
      showWarning('Subnet Penuh', 'Tidak ada alamat IP kosong tersisa di subnet ini!');
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
      deviceType: deviceType || categories[0]?.id || 'router',
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:items-center sm:pt-4 p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto font-poppins">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800/60">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {editAllocation ? 'Edit Alokasi IP' : 'Alokasikan IP Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grup: <span className="text-blue-600 font-semibold">{group.name}</span> ({group.cidr})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* IP Address & Auto Free IP Helper */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Alamat IP *
              </label>
              <button
                type="button"
                onClick={handlePickNextFree}
                className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Cari IP Kosong Otomatis
              </button>
            </div>
            <input
              type="text"
              required
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="Contoh: 192.168.10.15"
              className={`w-full font-mono font-medium bg-slate-50 dark:bg-slate-800/40 border rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 ${
                isDuplicate 
                  ? 'border-rose-400 focus:ring-rose-500/20' 
                  : !isWithinSubnet && ip.trim()
                  ? 'border-amber-400 focus:ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            />
            {isDuplicate && (
              <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Peringatan: IP ini sudah tercatat dalam alokasi lain!
              </p>
            )}
            {!isWithinSubnet && ip.trim() && !isDuplicate && (
              <p className="mt-1 text-[11px] text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Perhatian: IP berada di luar rentang subnet {group.cidr}.
              </p>
            )}
          </div>

          {/* Hostname & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Hostname / Nama Perangkat *
              </label>
              <input
                type="text"
                required
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                placeholder="Contoh: srv-db-01, pc-finance"
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Status Alokasi *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IPStatus)}
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kategori Perangkat
              </label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                MAC Address (Opsional)
              </label>
              <input
                type="text"
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
                placeholder="AA:BB:CC:DD:EE:FF"
                className="w-full font-mono font-medium bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase"
              />
            </div>
          </div>

          {/* Pengguna / PIC & Departemen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Pengguna / PIC
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Departemen / Unit
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Contoh: Keuangan, IT, Umum"
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Tanggal Alokasi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tanggal Penetapan
            </label>
            <input
              type="date"
              value={assignedDate}
              onChange={(e) => setAssignedDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Catatan / Deskripsi Tambahan
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nomor port switch, spesifikasi perangkat, dll..."
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Modal Actions */}
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
              {editAllocation ? 'Simpan Perubahan' : 'Alokasikan IP'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
