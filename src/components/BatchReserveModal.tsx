import React, { useState, useMemo } from 'react';
import { X, Layers, AlertCircle } from 'lucide-react';
import { IPGroup, IPAllocation, IPStatus } from '../types/ipam';
import { ipToInt, intToIp, isValidIpv4, isIpInCidr } from '../utils/ipCalculator';

interface BatchReserveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchSave: (allocations: Partial<IPAllocation>[]) => void;
  group: IPGroup;
  existingAllocations: IPAllocation[];
}

export const BatchReserveModal: React.FC<BatchReserveModalProps> = ({
  isOpen,
  onClose,
  onBatchSave,
  group,
  existingAllocations
}) => {
  const [startIp, setStartIp] = useState('');
  const [endIp, setEndIp] = useState('');
  const [status, setStatus] = useState<IPStatus>('dhcp');
  const [hostnamePrefix, setHostnamePrefix] = useState('dhcp-client');
  const [notes, setNotes] = useState('Rentang alokasi otomatis DHCP');
  const [error, setError] = useState<string | null>(null);

  const existingIps = useMemo(() => {
    return new Set(existingAllocations.filter(a => a.groupId === group.id).map(a => a.ip.trim()));
  }, [existingAllocations, group.id]);

  const ipListPreview = useMemo(() => {
    if (!isValidIpv4(startIp) || !isValidIpv4(endIp)) return [];
    const startNum = ipToInt(startIp);
    const endNum = ipToInt(endIp);
    if (startNum > endNum) return [];
    if (endNum - startNum > 100) return [];

    const list: string[] = [];
    for (let i = startNum; i <= endNum; i++) {
      list.push(intToIp(i));
    }
    return list;
  }, [startIp, endIp]);

  const conflictCount = useMemo(() => {
    return ipListPreview.filter(ip => existingIps.has(ip)).length;
  }, [ipListPreview, existingIps]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidIpv4(startIp) || !isValidIpv4(endIp)) {
      setError('Format IP Awal atau IP Akhir tidak valid!');
      return;
    }

    if (!isIpInCidr(startIp, group.cidr) || !isIpInCidr(endIp, group.cidr)) {
      setError(`Rentang IP harus berada di dalam subnet ${group.cidr}!`);
      return;
    }

    const startNum = ipToInt(startIp);
    const endNum = ipToInt(endIp);
    if (startNum > endNum) {
      setError('IP Awal tidak boleh lebih besar dari IP Akhir!');
      return;
    }

    if (endNum - startNum + 1 > 100) {
      setError('Maksimal 100 IP sekaligus dalam satu kali reservasi massal!');
      return;
    }

    const newAllocations: Partial<IPAllocation>[] = [];
    const today = new Date().toISOString().slice(0, 10);

    let counter = 1;
    for (let i = startNum; i <= endNum; i++) {
      const currentIp = intToIp(i);
      if (existingIps.has(currentIp)) {
        continue;
      }
      newAllocations.push({
        groupId: group.id,
        ip: currentIp,
        hostname: `${hostnamePrefix}-${counter.toString().padStart(2, '0')}`,
        deviceType: status === 'dhcp' ? 'other' : 'pc_workstation',
        macAddress: '',
        assignedTo: status === 'dhcp' ? 'DHCP Router Pool' : 'VIP Reservation',
        department: 'Sistem',
        status,
        assignedDate: today,
        notes
      });
      counter++;
    }

    if (newAllocations.length === 0) {
      setError('Semua IP dalam rentang ini sudah dialokasikan sebelumnya!');
      return;
    }

    onBatchSave(newAllocations);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto font-poppins">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-100 dark:border-purple-800/60">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Reservasi Rentang IP Sekaligus
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grup: <span className="text-blue-600 font-semibold">{group.name}</span>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Start & End IP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                IP Awal Rentang *
              </label>
              <input
                type="text"
                required
                value={startIp}
                onChange={(e) => setStartIp(e.target.value)}
                placeholder="Contoh: 192.168.10.100"
                className="w-full font-mono font-medium bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                IP Akhir Rentang *
              </label>
              <input
                type="text"
                required
                value={endIp}
                onChange={(e) => setEndIp(e.target.value)}
                placeholder="Contoh: 192.168.10.150"
                className="w-full font-mono font-medium bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Status & Hostname Prefix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Status Reservasi
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IPStatus)}
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
              >
                <option value="dhcp">DHCP Pool Range</option>
                <option value="reserved">Reserved (Dicadangkan Khusus)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Awalan Hostname (Prefix)
              </label>
              <input
                type="text"
                value={hostnamePrefix}
                onChange={(e) => setHostnamePrefix(e.target.value)}
                placeholder="dhcp-pool / resv-host"
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Catatan Reservasi
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Rentang alokasi otomatis DHCP router"
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          {/* Summary Preview */}
          {ipListPreview.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/40/60 border border-purple-200 dark:border-purple-800 rounded-xl p-3.5 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Total IP baru yang akan dibuat:</span>
                <strong className="text-purple-700 font-mono text-sm">{ipListPreview.length - conflictCount} IP baru</strong>
              </div>
              {conflictCount > 0 && (
                <div className="text-amber-700 flex items-center gap-1.5 text-[11px] pt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{conflictCount} IP yang sudah digunakan akan dilewati (tidak ditimpa).</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
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
              disabled={ipListPreview.length === 0}
              className="px-5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl shadow-sm shadow-purple-600/30 transition-all cursor-pointer"
            >
              Simpan Rentang IP
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
