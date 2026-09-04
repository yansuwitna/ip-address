import React, { useState, useMemo } from 'react';
import { 
  Search, 
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
import { IPGroup, IPAllocation, DeviceType } from '../types/ipam';
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
      case 'server': return <Server className="w-4 h-4 text-purple-600" />;
      case 'router':
      case 'switch':
      case 'gateway': return <Router className="w-4 h-4 text-blue-600" />;
      case 'access_point': return <Wifi className="w-4 h-4 text-cyan-600" />;
      case 'pc_workstation': return <Monitor className="w-4 h-4 text-indigo-600" />;
      case 'cctv': return <Video className="w-4 h-4 text-emerald-600" />;
      case 'printer': return <Printer className="w-4 h-4 text-amber-600" />;
      case 'smartphone': return <Smartphone className="w-4 h-4 text-pink-600" />;
      case 'iot': return <Cpu className="w-4 h-4 text-teal-600" />;
      default: return <Server className="w-4 h-4 text-slate-500" />;
    }
  };

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
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs flex flex-col font-poppins">
      
      {/* Table Action Bar */}
      <div className="p-4 border-b border-slate-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
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
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">Semua Kategori Perangkat</option>
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title={`Otomatis pilih IP kosong terdekat: ${nextFreeIp}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>IP Bebas: <strong className="font-mono text-emerald-900">{nextFreeIp}</strong></span>
            </button>
          )}

          {/* Batch Reserve Button */}
          <button
            onClick={onBatchReserve}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Reservasi Rentang</span>
          </button>

          {/* Add Allocation Button */}
          <button
            onClick={() => onAddAllocation()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-600/30 transition-all cursor-pointer"
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
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
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
              <th className="py-3 px-4">Status Ping</th>
              <th className="py-3 px-4">Catatan</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredAllocations.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                  Tidak ada data alokasi IP yang cocok dengan filter pencarian.
                </td>
              </tr>
            ) : (
              filteredAllocations.map(item => {
                const isGateway = item.ip === group.gateway;

                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    {/* IP Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {item.ip}
                        </span>
                        {isGateway && (
                          <span className="text-[10px] bg-sky-100 text-sky-800 border border-sky-300 font-bold px-1.5 py-0.2 rounded">
                            GW
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        item.status === 'used'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : item.status === 'reserved'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : item.status === 'dhcp'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'used' ? 'bg-blue-600' : item.status === 'reserved' ? 'bg-amber-600' : 'bg-purple-600'
                        }`}></span>
                        <span className="capitalize">{item.status}</span>
                      </span>
                    </td>

                    {/* Hostname & Device Type Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200/80 flex-shrink-0">
                          {getDeviceIcon(item.deviceType)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 leading-tight">
                            {item.hostname}
                          </div>
                          <div className="text-[11px] text-slate-500 capitalize">
                            {item.deviceType.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* MAC Address Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600">
                      {item.macAddress ? (
                        <div className="flex items-center gap-1.5">
                          <span>{item.macAddress}</span>
                          <button
                            onClick={() => handleCopyMac(item.macAddress)}
                            title="Salin MAC Address"
                            className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                          >
                            {copiedMac === item.macAddress ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* PIC & Dept Column */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        {item.assignedTo || '-'}
                      </div>
                      {item.department && (
                        <div className="text-[11px] text-slate-400">
                          {item.department}
                        </div>
                      )}
                    </td>

                    {/* Ping Test Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.lastPingStatus === 'online' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Online ({item.lastPingLatency ? `${item.lastPingLatency}ms` : 'ok'})
                          </span>
                        ) : item.lastPingStatus === 'offline' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Offline
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Belum diuji
                          </span>
                        )}

                        <button
                          onClick={() => onPingAllocation(item)}
                          title="Simulasikan Uji Ping ICMP"
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Notes Column */}
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500" title={item.notes}>
                      {item.notes || '-'}
                    </td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onEditAllocation(item)}
                          title="Edit Alokasi IP"
                          className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
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
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
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
