import React from 'react';
import { 
  Server, 
  Router, 
  Monitor, 
  Video, 
  Printer, 
  Wifi, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Activity
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceType } from '../types/ipam';
import { parseCidr } from '../utils/ipCalculator';

interface DashboardStatsProps {
  groups: IPGroup[];
  allocations: IPAllocation[];
  activeGroup?: IPGroup | null;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  groups,
  allocations,
  activeGroup
}) => {
  // Filter allocations for calculation if activeGroup is chosen, or calculate globally
  const relevantAllocations = activeGroup
    ? allocations.filter(a => a.groupId === activeGroup.id)
    : allocations;

  // Calculate total usable hosts
  let totalUsable = 0;
  if (activeGroup) {
    const sub = parseCidr(activeGroup.cidr);
    totalUsable = sub ? sub.usableHosts : 254;
  } else {
    groups.forEach(g => {
      const sub = parseCidr(g.cidr);
      totalUsable += sub ? sub.usableHosts : 254;
    });
  }

  const usedCount = relevantAllocations.filter(a => a.status === 'used').length;
  const reservedCount = relevantAllocations.filter(a => a.status === 'reserved').length;
  const dhcpCount = relevantAllocations.filter(a => a.status === 'dhcp').length;
  const totalOccupied = usedCount + reservedCount + dhcpCount;
  const availableCount = Math.max(0, totalUsable - totalOccupied);
  const utilization = totalUsable > 0 ? Math.min(100, Math.round((totalOccupied / totalUsable) * 100)) : 0;

  // Count by device type
  const deviceCounts: Record<DeviceType, number> = {
    server: 0,
    router: 0,
    switch: 0,
    access_point: 0,
    pc_workstation: 0,
    cctv: 0,
    printer: 0,
    smartphone: 0,
    iot: 0,
    gateway: 0,
    other: 0
  };

  relevantAllocations.forEach(a => {
    if (deviceCounts[a.deviceType] !== undefined) {
      deviceCounts[a.deviceType]++;
    } else {
      deviceCounts.other++;
    }
  });

  return (
    <div className="space-y-4">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Total Kapasitas IP */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Host Usable</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {totalUsable.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">
              {activeGroup ? 'dalam grup' : `dari ${groups.length} grup`}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 truncate">
            {activeGroup ? `Subnet ${activeGroup.cidr}` : 'Seluruh infrastruktur jaringan'}
          </div>
        </div>

        {/* Card 2: IP Terpakai (In Use) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">IP Aktif Terpakai</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight">
              {usedCount}
            </span>
            <span className="text-xs font-medium text-emerald-500/90">
              {totalUsable > 0 ? ((usedCount / totalUsable) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Perangkat online & terkonfigurasi</span>
          </div>
        </div>

        {/* Card 3: Dicadangkan / DHCP */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Reservasi & DHCP</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-400 tracking-tight">
              {reservedCount + dhcpCount}
            </span>
            <span className="text-xs text-slate-400">
              ({reservedCount} Resv / {dhcpCount} DHCP)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 truncate">
            Dicadangkan untuk VIP & Pool otomatis
          </div>
        </div>

        {/* Card 4: IP Bebas (Available) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">IP Bebas / Tersedia</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-sky-400 tracking-tight">
              {availableCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">
              IP siap dipakai
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                utilization >= 90 ? 'bg-rose-500' : utilization >= 70 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${utilization}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Device Breakdown Tags */}
      <div className="flex flex-wrap items-center gap-2 text-xs bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50">
        <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
          Distribusi Perangkat:
        </span>
        
        {deviceCounts.server > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Server className="w-3 h-3" />
            <span>Server: <strong>{deviceCounts.server}</strong></span>
          </span>
        )}

        {(deviceCounts.router > 0 || deviceCounts.switch > 0) && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
            <Router className="w-3 h-3" />
            <span>Network SW/RT: <strong>{deviceCounts.router + deviceCounts.switch}</strong></span>
          </span>
        )}

        {deviceCounts.access_point > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <Wifi className="w-3 h-3" />
            <span>AP WiFi: <strong>{deviceCounts.access_point}</strong></span>
          </span>
        )}

        {deviceCounts.pc_workstation > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Monitor className="w-3 h-3" />
            <span>Workstation/PC: <strong>{deviceCounts.pc_workstation}</strong></span>
          </span>
        )}

        {deviceCounts.cctv > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <Video className="w-3 h-3" />
            <span>CCTV & IoT: <strong>{deviceCounts.cctv}</strong></span>
          </span>
        )}

        {deviceCounts.printer > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Printer className="w-3 h-3" />
            <span>Printer: <strong>{deviceCounts.printer}</strong></span>
          </span>
        )}

        {deviceCounts.other > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-700/40 text-slate-300 border border-slate-600/30">
            <span>Lainnya: <strong>{deviceCounts.other}</strong></span>
          </span>
        )}
      </div>
    </div>
  );
};
