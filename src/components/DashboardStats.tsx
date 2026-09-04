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
  Activity,
  Layers
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
  const relevantAllocations = activeGroup
    ? allocations.filter(a => a.groupId === activeGroup.id)
    : allocations;

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
      {/* 4 Stat Cards in Bright Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Total Kapasitas IP */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Host Usable</span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/60">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {totalUsable.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">
              {activeGroup ? 'dalam grup' : `total (${groups.length} grup)`}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">
            {activeGroup ? `Subnet ${activeGroup.cidr}` : 'Infrastruktur aktif'}
          </div>
        </div>

        {/* Card 2: IP Terpakai (In Use) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">IP Terpakai</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
              {usedCount}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {totalUsable > 0 ? ((usedCount / totalUsable) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">
            Host aktif teralokasi
          </div>
        </div>

        {/* Card 3: Reservasi & DHCP */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reservasi & DHCP</span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
              {reservedCount + dhcpCount}
            </span>
            <span className="text-xs text-slate-400">
              ({reservedCount} Rsv / {dhcpCount} DHCP)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">
            Dicadangkan untuk VIP & Pool
          </div>
        </div>

        {/* Card 4: IP Bebas (Available) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">IP Bebas / Siap</span>
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/60">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
              {availableCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">
              tersisa
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200/60">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                utilization >= 90 ? 'bg-rose-500' : utilization >= 70 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${utilization}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Device Breakdown Tags */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium mr-1 flex items-center gap-1">
          Distribusi Perangkat:
        </span>
        
        {deviceCounts.server > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-medium">
            <Server className="w-3.5 h-3.5" />
            <span>Server: <strong>{deviceCounts.server}</strong></span>
          </span>
        )}

        {(deviceCounts.router > 0 || deviceCounts.switch > 0) && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
            <Router className="w-3.5 h-3.5" />
            <span>Network SW/RT: <strong>{deviceCounts.router + deviceCounts.switch}</strong></span>
          </span>
        )}

        {deviceCounts.access_point > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-medium">
            <Wifi className="w-3.5 h-3.5" />
            <span>AP WiFi: <strong>{deviceCounts.access_point}</strong></span>
          </span>
        )}

        {deviceCounts.pc_workstation > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium">
            <Monitor className="w-3.5 h-3.5" />
            <span>Workstation: <strong>{deviceCounts.pc_workstation}</strong></span>
          </span>
        )}

        {deviceCounts.cctv > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
            <Video className="w-3.5 h-3.5" />
            <span>CCTV: <strong>{deviceCounts.cctv}</strong></span>
          </span>
        )}

        {deviceCounts.printer > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium">
            <Printer className="w-3.5 h-3.5" />
            <span>Printer: <strong>{deviceCounts.printer}</strong></span>
          </span>
        )}

        {deviceCounts.other > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
            <span>Lainnya: <strong>{deviceCounts.other}</strong></span>
          </span>
        )}
      </div>
    </div>
  );
};
