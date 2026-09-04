import React, { useState, useMemo } from 'react';
import { X, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
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
    if (endNum - startNum > 100) return []; // Limit batch to 100 at a time for safety

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
      // Don't overwrite if existing, unless confirmed
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-600/20 text-purple-400 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Reservasi Rentang IP Sekaligus
              </h3>
              <p className="text-xs text-slate-400">
                Grup: <span className="text-blue-300 font-medium">{group.name}</span>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Start & End IP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                IP Awal Rentang *
              </label>
              <input
                type="text"
                required
                value={startIp}
                onChange={(e) => setStartIp(e.target.value)}
                placeholder="Contoh: 192.168.10.100"
                className="w-full font-mono bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                IP Akhir Rentang *
              </label>
              <input
                type="text"
                required
                value={endIp}
                onChange={(e) => setEndIp(e.target.value)}
                placeholder="Contoh: 192.168.10.150"
                className="w-full font-mono bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status & Hostname Prefix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Status Reservasi
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IPStatus)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dhcp">DHCP Pool Range</option>
                <option value="reserved">Reserved (Dicadangkan Khusus)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Awalan Hostname (Prefix)
              </label>
              <input
                type="text"
                value={hostnamePrefix}
                onChange={(e) => setHostnamePrefix(e.target.value)}
                placeholder="dhcp-pool / resv-host"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Catatan Reservasi
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Rentang alokasi otomatis DHCP router mikrotik"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Summary Preview */}
          {ipListPreview.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-lg p-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total IP yang akan dibuat:</span>
                <strong className="text-purple-400 font-mono text-sm">{ipListPreview.length - conflictCount} IP baru</strong>
              </div>
              {conflictCount > 0 && (
                <div className="text-amber-400 flex items-center gap-1 text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{conflictCount} IP yang sudah terdaftar akan dilewati (tidak ditimpa).</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
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
              disabled={ipListPreview.length === 0}
              className="px-5 py-2 text-xs font-medium bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg shadow-md shadow-purple-600/30 transition-all"
            >
              Simpan Rentang IP
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
