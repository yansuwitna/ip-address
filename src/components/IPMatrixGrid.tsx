import React, { useState, useMemo } from 'react';
import { 
  Server, 
  Router, 
  Monitor, 
  Video, 
  Printer, 
  Wifi, 
  HelpCircle,
  CheckCircle2,
  Shield,
  Search,
  Filter,
  Info
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceType } from '../types/ipam';
import { parseCidr, generateUsableIps, ipToInt } from '../utils/ipCalculator';

interface IPMatrixGridProps {
  group: IPGroup;
  allocations: IPAllocation[];
  onSelectIp: (ip: string, existingAllocation?: IPAllocation) => void;
  onPingIp: (allocation: IPAllocation) => void;
}

export const IPMatrixGrid: React.FC<IPMatrixGridProps> = ({
  group,
  allocations,
  onSelectIp,
  onPingIp
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hoveredIp, setHoveredIp] = useState<string | null>(null);

  const subnet = useMemo(() => parseCidr(group.cidr), [group.cidr]);
  
  // Generate array of IPs (capped at 256 for smooth rendering per page if large)
  const allIps = useMemo(() => {
    return generateUsableIps(group.cidr, 256);
  }, [group.cidr]);

  // Map for fast lookup by IP string
  const allocationMap = useMemo(() => {
    const map = new Map<string, IPAllocation>();
    allocations.forEach(a => {
      map.set(a.ip.trim(), a);
    });
    return map;
  }, [allocations]);

  const getIpStatus = (ip: string) => {
    if (ip === group.gateway) return 'gateway';
    const alloc = allocationMap.get(ip);
    if (!alloc) return 'available';
    return alloc.status;
  };

  const getDeviceIcon = (type?: DeviceType) => {
    switch (type) {
      case 'server': return <Server className="w-3 h-3 text-purple-400" />;
      case 'router':
      case 'switch':
      case 'gateway': return <Router className="w-3 h-3 text-blue-400" />;
      case 'access_point': return <Wifi className="w-3 h-3 text-cyan-400" />;
      case 'pc_workstation': return <Monitor className="w-3 h-3 text-indigo-400" />;
      case 'cctv': return <Video className="w-3 h-3 text-emerald-400" />;
      case 'printer': return <Printer className="w-3 h-3 text-amber-400" />;
      default: return null;
    }
  };

  const activeHoveredAlloc = hoveredIp ? allocationMap.get(hoveredIp) : null;
  const isHoveredGateway = hoveredIp === group.gateway;

  // Filter IPs
  const filteredIps = useMemo(() => {
    return allIps.filter(ip => {
      const status = getIpStatus(ip);
      const alloc = allocationMap.get(ip);

      if (filterStatus !== 'all') {
        if (filterStatus === 'available' && status !== 'available') return false;
        if (filterStatus === 'used' && status !== 'used') return false;
        if (filterStatus === 'reserved' && status !== 'reserved') return false;
        if (filterStatus === 'dhcp' && status !== 'dhcp') return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesIp = ip.toLowerCase().includes(query);
        const matchesHost = alloc?.hostname?.toLowerCase().includes(query);
        const matchesUser = alloc?.assignedTo?.toLowerCase().includes(query);
        const matchesMac = alloc?.macAddress?.toLowerCase().includes(query);
        if (!matchesIp && !matchesHost && !matchesUser && !matchesMac) {
          return false;
        }
      }

      return true;
    });
  }, [allIps, allocationMap, filterStatus, searchTerm, group.gateway]);

  return (
    <div className="space-y-4">
      
      {/* Subnet Toolbar & Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Filter Grid:</span>
          {[
            { id: 'all', label: 'Semua IP' },
            { id: 'available', label: 'Kosong (Bebas)' },
            { id: 'used', label: 'Terpakai' },
            { id: 'reserved', label: 'Dicadangkan' },
            { id: 'dhcp', label: 'DHCP Pool' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === f.id
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search inside grid */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sorot host / IP..."
            className="w-full bg-slate-900/90 border border-slate-700 text-xs rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Visual Legend Bar */}
      <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-700/50 text-slate-300">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          Status Warna:
        </span>
        
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/50"></span>
          <span>Bebas (Tersedia)</span>
        </span>

        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-600/30 border border-blue-500"></span>
          <span>Aktif Digunakan</span>
        </span>

        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500"></span>
          <span>Dicadangkan (Reserved)</span>
        </span>

        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500"></span>
          <span>DHCP Pool</span>
        </span>

        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-cyan-500/40 border border-cyan-400"></span>
          <span>Gateway Default</span>
        </span>
      </div>

      {/* Interactive Subnet Grid Box */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm relative">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span>Peta Alamat IP ({subnet?.firstUsableIp} s/d {subnet?.lastUsableIp})</span>
          <span>Menampilkan {filteredIps.length} host</span>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 gap-1.5">
          {filteredIps.map(ip => {
            const status = getIpStatus(ip);
            const alloc = allocationMap.get(ip);
            const isGateway = ip === group.gateway;
            const lastOctet = ip.split('.').pop();

            // Color classes based on status
            let tileClasses = "border cursor-pointer transition-all duration-150 flex flex-col items-center justify-center rounded-lg p-1.5 select-none relative group/cell ";
            
            if (isGateway) {
              tileClasses += "bg-cyan-950/70 border-cyan-500 text-cyan-200 hover:bg-cyan-900";
            } else if (status === 'used') {
              tileClasses += "bg-blue-950/70 border-blue-500 text-blue-200 hover:bg-blue-900";
            } else if (status === 'reserved') {
              tileClasses += "bg-amber-950/70 border-amber-500 text-amber-200 hover:bg-amber-900";
            } else if (status === 'dhcp') {
              tileClasses += "bg-purple-950/70 border-purple-500 text-purple-200 hover:bg-purple-900";
            } else {
              // Available
              tileClasses += "bg-slate-900/60 border-slate-700/70 text-slate-400 hover:border-emerald-500/80 hover:bg-emerald-950/30 hover:text-emerald-300";
            }

            return (
              <button
                key={ip}
                onClick={() => onSelectIp(ip, alloc)}
                onMouseEnter={() => setHoveredIp(ip)}
                onMouseLeave={() => setHoveredIp(null)}
                className={tileClasses}
                style={{ minHeight: '44px' }}
                title={`${ip} - ${alloc ? alloc.hostname : isGateway ? 'Gateway' : 'Tersedia'}`}
              >
                <span className="font-mono text-xs font-bold leading-none">
                  .{lastOctet}
                </span>

                <div className="mt-1 flex items-center justify-center h-3.5">
                  {isGateway ? (
                    <Shield className="w-3 h-3 text-cyan-400" />
                  ) : alloc ? (
                    getDeviceIcon(alloc.deviceType) || <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-slate-600 group-hover/cell:bg-emerald-400"></span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Hover Info Card */}
      {hoveredIp && (
        <div className="bg-slate-900/95 border border-slate-700 shadow-2xl rounded-xl p-3 max-w-sm fixed bottom-6 right-6 z-20 backdrop-blur pointer-events-none transition-all">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white">{hoveredIp}</span>
              {isHoveredGateway && (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                  Default Gateway
                </span>
              )}
            </div>
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
              activeHoveredAlloc?.status === 'used'
                ? 'bg-blue-500/20 text-blue-300'
                : activeHoveredAlloc?.status === 'reserved'
                ? 'bg-amber-500/20 text-amber-300'
                : activeHoveredAlloc?.status === 'dhcp'
                ? 'bg-purple-500/20 text-purple-300'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {activeHoveredAlloc ? activeHoveredAlloc.status : 'Tersedia'}
            </span>
          </div>

          {activeHoveredAlloc ? (
            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Hostname:</span>
                <span className="font-medium text-white">{activeHoveredAlloc.hostname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tipe:</span>
                <span className="capitalize">{activeHoveredAlloc.deviceType.replace('_', ' ')}</span>
              </div>
              {activeHoveredAlloc.macAddress && (
                <div className="flex justify-between">
                  <span className="text-slate-400">MAC:</span>
                  <span className="font-mono text-slate-300">{activeHoveredAlloc.macAddress}</span>
                </div>
              )}
              {activeHoveredAlloc.assignedTo && (
                <div className="flex justify-between">
                  <span className="text-slate-400">PIC / User:</span>
                  <span>{activeHoveredAlloc.assignedTo} ({activeHoveredAlloc.department || '-'})</span>
                </div>
              )}
              {activeHoveredAlloc.notes && (
                <p className="text-[11px] text-slate-400 mt-1 italic border-t border-slate-800 pt-1">
                  "{activeHoveredAlloc.notes}"
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-emerald-400">
              ✓ IP ini belum dialokasikan dan siap digunakan. Klik untuk menetapkan perangkat.
            </p>
          )}
        </div>
      )}

    </div>
  );
};
