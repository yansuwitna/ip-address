import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Activity, 
  Copy, 
  Check, 
  Server, 
  Router, 
  Monitor, 
  Video, 
  Printer, 
  Wifi, 
  Sparkles,
  Layers,
  ArrowUpDown,
  Smartphone,
  Cpu
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceType, IPStatus } from '../types/ipam';
import { ipToInt, findNextAvailableIp } from '../utils/ipCalculator';

interface IPTableProps {
  group: IPGroup;
  allocations: IPAllocation[];
  onAddAllocation: (initialIp?: string) => void;
  onEditAllocation: (allocation: IPAllocation) => void;
  onDeleteAllocation: (id: string) => void;
  onBatchReserve: () => void;
  onPingAllocation: (allocation: IPAllocation) => void;
}

export const IPTable: React.FC<IPTableProps> = ({
  group,
  allocations,
  onAddAllocation,
  onEditAllocation,
  onDeleteAllocation,
  onBatchReserve,
  onPingAllocation
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [copiedMac, setCopiedMac] = useState<string | null>(null);

  const groupAllocations = useMemo(() => {
    return allocations.filter(a => a.groupId === group.id);
  }, [allocations, group.id]);

  const allocatedIpStrings = useMemo(() => {
    return groupAllocations.map(a => a.ip);
  }, [groupAllocations]);

  const nextFreeIp = useMemo(() => {
    return findNextAvailableIp(group.cidr, allocatedIpStrings, group.gateway);
  }, [group.cidr, allocatedIpStrings, group.gateway]);

  const handleCopyMac = (mac: string) => {
    navigator.clipboard.writeText(mac);
    setCopiedMac(mac);
    setTimeout(() => setCopiedMac(null), 2000);
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'server': return <Server className="w-4 h-4 text-purple-400" />;
      case 'router':
      case 'switch':
      case 'gateway': return <Router className="w-4 h-4 text-blue-400" />;
      case 'access_point': return <Wifi className="w-4 h-4 text-cyan-400" />;
      case 'pc_workstation': return <Monitor className="w-4 h-4 text-indigo-400" />;
      case 'cctv': return <Video className="w-4 h-4 text-emerald-400" />;
      case 'printer': return <Printer className="w-4 h-4 text-amber-400" />;
      case 'smartphone': return <Smartphone className="w-4 h-4 text-pink-400" />;
      case 'iot': return <Cpu className="w-4 h-4 text-teal-400" />;
      default: return <Server className="w-4 h-4 text-slate-400" />;
    }
  };

  // Filter and sort allocations
  const filteredAllocations = useMemo(() => {
    return groupAllocations
      .filter(item => {
        if (statusFilter !== 'all' && item.status !== statusFilter) return false;
        if (deviceFilter !== 'all' && item.deviceType !== deviceFilter) return false;

        if (search.trim()) {
          const q = search.toLowerCase();
          const matchIp = item.ip.toLowerCase().includes(q);
          const matchHost = item.hostname.toLowerCase().includes(q);
          const matchMac = item.macAddress?.toLowerCase().includes(q);
          const matchPic = item.assignedTo?.toLowerCase().includes(q);
          const matchDept = item.department?.toLowerCase().includes(q);
          const matchNotes = item.notes?.toLowerCase().includes(q);
          if (!matchIp && !matchHost && !matchMac && !matchPic && !matchDept && !matchNotes) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const diff = ipToInt(a.ip) - ipToInt(b.ip);
        return sortAsc ? diff : -diff;
      });
  }, [groupAllocations, statusFilter, deviceFilter, search, sortAsc]);

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-sm flex flex-col">
      
      {/* Table Action Bar */}
      <div className="p-4 border-b border-slate-700/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari IP, Hostname, MAC, PIC..."
              className="w-full bg-slate-900/90 border border-slate-700 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900/90 border border-slate-700 text-xs rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="used">Aktif Terpakai (Used)</option>
            <option value="reserved">Dicadangkan (Reserved)</option>
            <option value="dhcp">DHCP Pool</option>
          </select>

          {/* Device Type Dropdown */}
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="bg-slate-900/90 border border-slate-700 text-xs rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Semua Perangkat</option>
            <option value="server">Server</option>
            <option value="router">Router / Gateway</option>
            <option value="switch">Switch</option>
            <option value="access_point">Access Point (WiFi)</option>
            <option value="pc_workstation">PC / Laptop</option>
            <option value="cctv">CCTV Camera</option>
            <option value="printer">Printer Jaringan</option>
            <option value="iot">IoT Device</option>
            <option value="other">Lainnya</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Next Free IP Button */}
          {nextFreeIp && (
            <button
              onClick={() => onAddAllocation(nextFreeIp)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white rounded-lg text-xs font-medium transition-all"
              title={`Otomatis pilih IP kosong terdekat: ${nextFreeIp}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>IP Kosong: <strong>{nextFreeIp}</strong></span>
            </button>
          )}

          {/* Batch Reserve Button */}
          <button
            onClick={onBatchReserve}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Reservasi Rentang</span>
          </button>

          {/* Add Allocation Button */}
          <button
            onClick={() => onAddAllocation()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Alokasikan IP</span>
          </button>
        </div>

      </div>

      {/* The Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-700/80 bg-slate-900/40 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => setSortAsc(!sortAsc)}>
                <div className="flex items-center gap-1.5">
                  <span>Alamat IP</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Hostname & Perangkat</th>
              <th className="py-3 px-4">MAC Address</th>
              <th className="py-3 px-4">PIC / Departemen</th>
              <th className="py-3 px-4">Koneksi / Ping</th>
              <th className="py-3 px-4">Catatan</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40 text-slate-300">
            {filteredAllocations.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500">
                  Tidak ada data alokasi IP yang cocok dengan filter pencarian.
                </td>
              </tr>
            ) : (
              filteredAllocations.map(item => {
                const isGateway = item.ip === group.gateway;

                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-700/30 transition-colors group"
                  >
                    {/* IP Column */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-100 text-sm">
                          {item.ip}
                        </span>
                        {isGateway && (
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded font-sans">
                            GW
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        item.status === 'used'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : item.status === 'reserved'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : item.status === 'dhcp'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'used' ? 'bg-blue-400' : item.status === 'reserved' ? 'bg-amber-400' : 'bg-purple-400'
                        }`}></span>
                        <span className="capitalize">{item.status}</span>
                      </span>
                    </td>

                    {/* Hostname & Device Type Column */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-700/60 flex-shrink-0">
                          {getDeviceIcon(item.deviceType)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-100 leading-tight">
                            {item.hostname}
                          </div>
                          <div className="text-[11px] text-slate-400 capitalize">
                            {item.deviceType.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* MAC Address Column */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400">
                      {item.macAddress ? (
                        <div className="flex items-center gap-1.5">
                          <span>{item.macAddress}</span>
                          <button
                            onClick={() => handleCopyMac(item.macAddress)}
                            title="Salin MAC Address"
                            className="text-slate-500 hover:text-slate-300 p-0.5"
                          >
                            {copiedMac === item.macAddress ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* PIC & Dept Column */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">
                        {item.assignedTo || '-'}
                      </div>
                      {item.department && (
                        <div className="text-[11px] text-slate-400">
                          {item.department}
                        </div>
                      )}
                    </td>

                    {/* Ping Test Column */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.lastPingStatus === 'online' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Online ({item.lastPingLatency ? `${item.lastPingLatency}ms` : 'ok'})
                          </span>
                        ) : item.lastPingStatus === 'offline' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[11px] border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            Offline / Unreachable
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            Belum diuji
                          </span>
                        )}

                        <button
                          onClick={() => onPingAllocation(item)}
                          title="Simulasikan Uji Ping ICMP"
                          className="p-1 hover:bg-slate-700 text-slate-400 hover:text-blue-400 rounded transition-colors"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Notes Column */}
                    <td className="py-3 px-4 max-w-xs truncate text-slate-400" title={item.notes}>
                      {item.notes || '-'}
                    </td>

                    {/* Action Column */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onEditAllocation(item)}
                          title="Edit Alokasi IP"
                          className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Lepaskan / hapus IP ${item.ip} (${item.hostname}) dari sistem?`)) {
                              onDeleteAllocation(item.id);
                            }
                          }}
                          title="Lepaskan IP Ini"
                          className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
