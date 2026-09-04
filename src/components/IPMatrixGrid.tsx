import React, { useState, useMemo } from 'react';
import { 
  Server, 
  Router, 
  Monitor, 
  Video, 
  Printer, 
  Wifi, 
  Shield,
  Search,
  Info,
  ServerCog,
  Cctv
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceType, IPService, DeviceCategory } from '../types/ipam';
import { parseCidr, generateUsableIps } from '../utils/ipCalculator';
import { getCategoryIconComponent } from './CategoriesView';

interface IPMatrixGridProps {
  group: IPGroup;
  allocations: IPAllocation[];
  services?: IPService[];
  categories?: DeviceCategory[];
  onSelectIp: (ip: string, existingAllocation?: IPAllocation) => void;
  onPingIp: (allocation: IPAllocation) => void;
}

export const IPMatrixGrid: React.FC<IPMatrixGridProps> = ({
  group,
  allocations,
  services = [],
  categories = [],
  onSelectIp
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hoveredIp, setHoveredIp] = useState<string | null>(null);

  const subnet = useMemo(() => parseCidr(group.cidr), [group.cidr]);
  
  const allIps = useMemo(() => {
    return generateUsableIps(group.cidr, 256);
  }, [group.cidr]);

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
      case 'server': return <Server className="w-3 h-3 text-purple-600" />;
      case 'router':
      case 'switch':
      case 'gateway': return <Router className="w-3 h-3 text-blue-600" />;
      case 'access_point': return <Wifi className="w-3 h-3 text-cyan-600" />;
      case 'pc_workstation': return <Monitor className="w-3 h-3 text-indigo-600" />;
      case 'cctv': return <Cctv className="w-3 h-3 text-emerald-600" />;
      case 'printer': return <Printer className="w-3 h-3 text-amber-600" />;
      default: return null;
    }
  };

  const activeHoveredAlloc = hoveredIp ? allocationMap.get(hoveredIp) : null;
  const isHoveredGateway = hoveredIp === group.gateway;

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
    <div className="space-y-4 font-poppins">
      
      {/* Subnet Toolbar & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-semibold mr-1">Filter Host:</span>
          {[
            { id: 'all', label: 'Semua IP' },
            { id: 'available', label: '🟢 Bebas / Siap' },
            { id: 'used', label: '🔵 Terpakai' },
            { id: 'reserved', label: '🟡 Dicadangkan' },
            { id: 'dhcp', label: '🟣 DHCP Pool' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs ${
                filterStatus === f.id
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search inside grid */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sorot nomor host / IP..."
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Visual Legend Bar */}
      <div className="flex flex-wrap items-center gap-4 text-xs bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 text-slate-700 shadow-xs">
        <span className="text-slate-500 font-semibold flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          Indikator:
        </span>
        
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-3.5 h-3.5 rounded-md bg-emerald-50 border border-emerald-400 shadow-2xs"></span>
          <span>Bebas (Tersedia)</span>
        </span>

        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-3.5 h-3.5 rounded-md bg-blue-100 border border-blue-400 shadow-2xs"></span>
          <span>Aktif Digunakan</span>
        </span>

        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-400 shadow-2xs"></span>
          <span>Dicadangkan (Reserved)</span>
        </span>

        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-3.5 h-3.5 rounded-md bg-purple-100 border border-purple-400 shadow-2xs"></span>
          <span>DHCP Pool</span>
        </span>

        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-3.5 h-3.5 rounded-md bg-sky-200 border border-sky-500 shadow-2xs"></span>
          <span>Gateway Default</span>
        </span>
      </div>

      {/* Interactive Subnet Grid Box */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs relative">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            Peta Subnet: <span className="font-mono text-blue-600">{subnet?.firstUsableIp}</span> s/d <span className="font-mono text-blue-600">{subnet?.lastUsableIp}</span>
          </span>
          <span className="text-slate-500">Menampilkan {filteredIps.length} host</span>
        </div>

        {/* The Grid of Host Tiles */}
        <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 gap-1.5">
          {filteredIps.map(ip => {
            const status = getIpStatus(ip);
            const alloc = allocationMap.get(ip);
            const isGateway = ip === group.gateway;
            const lastOctet = ip.split('.').pop();

            let tileClasses = "border cursor-pointer transition-all duration-150 flex flex-col items-center justify-center rounded-xl p-1 select-none relative shadow-2xs ";
            
            if (isGateway) {
              tileClasses += "bg-sky-100 border-sky-400 text-sky-900 hover:bg-sky-200 hover:scale-105 font-bold";
            } else if (status === 'used') {
              tileClasses += "bg-blue-100/90 border-blue-300 text-blue-900 hover:bg-blue-200 hover:scale-105";
            } else if (status === 'reserved') {
              tileClasses += "bg-amber-100/90 border-amber-300 text-amber-900 hover:bg-amber-200 hover:scale-105";
            } else if (status === 'dhcp') {
              tileClasses += "bg-purple-100/90 border-purple-300 text-purple-900 hover:bg-purple-200 hover:scale-105";
            } else {
              // Available
              tileClasses += "bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 hover:scale-105";
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
                    <Shield className="w-3 h-3 text-sky-700" />
                  ) : alloc ? (
                    (() => {
                      const cat = categories.find(c => c.id.toLowerCase() === (alloc.deviceType || '').toLowerCase());
                      if (cat) {
                        const CatIcon = getCategoryIconComponent(cat.icon);
                        return <CatIcon className="w-3 h-3 text-slate-700" />;
                      }
                      return getDeviceIcon(alloc.deviceType) || <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>;
                    })()
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Hover Info Card */}
      {hoveredIp && (
        <div className="bg-white/95 border border-slate-200 shadow-2xl rounded-2xl p-4 max-w-sm fixed bottom-6 right-6 z-20 backdrop-blur-md pointer-events-none transition-all">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-900">{hoveredIp}</span>
              {isHoveredGateway && (
                <span className="text-[10px] bg-sky-100 text-sky-800 border border-sky-300 font-bold px-1.5 py-0.5 rounded">
                  Gateway
                </span>
              )}
            </div>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              activeHoveredAlloc?.status === 'used'
                ? 'bg-blue-100 text-blue-800'
                : activeHoveredAlloc?.status === 'reserved'
                ? 'bg-amber-100 text-amber-800'
                : activeHoveredAlloc?.status === 'dhcp'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {activeHoveredAlloc ? activeHoveredAlloc.status : 'Tersedia'}
            </span>
          </div>

          {activeHoveredAlloc ? (
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Hostname:</span>
                <span className="font-semibold text-slate-900">{activeHoveredAlloc.hostname}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Kategori:</span>
                <span className="font-medium text-slate-800">
                  {categories.find(c => c.id.toLowerCase() === (activeHoveredAlloc.deviceType || '').toLowerCase())?.name || activeHoveredAlloc.deviceType.replace('_', ' ')}
                </span>
              </div>
              {activeHoveredAlloc.macAddress && (
                <div className="flex justify-between">
                  <span className="text-slate-400">MAC:</span>
                  <span className="font-mono text-slate-700">{activeHoveredAlloc.macAddress}</span>
                </div>
              )}
              {activeHoveredAlloc.assignedTo && (
                <div className="flex justify-between">
                  <span className="text-slate-400">PIC / User:</span>
                  <span className="text-slate-800 font-medium">{activeHoveredAlloc.assignedTo} ({activeHoveredAlloc.department || '-'})</span>
                </div>
              )}

              {/* Registered Services / Ports */}
              {(() => {
                const hoveredServices = services.filter(s => s.allocationId === activeHoveredAlloc.id || s.ip === activeHoveredAlloc.ip);
                if (hoveredServices.length === 0) return null;
                return (
                  <div className="pt-1.5 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-1">
                      <ServerCog className="w-3 h-3 text-blue-600" />
                      <span>Layanan & Port ({hoveredServices.length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {hoveredServices.map(s => (
                        <span 
                          key={s.id}
                          className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-mono font-bold"
                          title={s.name}
                        >
                          :{s.port} ({s.name.split(' ')[0]})
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {activeHoveredAlloc.notes && (
                <p className="text-[11px] text-slate-500 mt-1 italic border-t border-slate-100 pt-1">
                  "{activeHoveredAlloc.notes}"
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-emerald-700 font-medium">
              ✓ IP ini kosong dan siap digunakan. Klik kotak ini untuk mengalokasikannya ke perangkat baru.
            </p>
          )}
        </div>
      )}

    </div>
  );
};
