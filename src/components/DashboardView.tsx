import React from 'react';
import { 
  Network, 
  Zap, 
  Video, 
  Droplets, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  ArrowRight,
  Activity,
  Gauge,
  HardDrive
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceCategory } from '../types/ipam';
import { ElectricityDevice, CctvDevice, WaterDevice } from '../types/utilityNetworks';
import { parseCidr } from '../utils/ipCalculator';
import { getCategoryIconComponent } from './CategoriesView';

interface DashboardViewProps {
  groups: IPGroup[];
  allocations: IPAllocation[];
  categories?: DeviceCategory[];
  electricityDevices?: ElectricityDevice[];
  cctvDevices?: CctvDevice[];
  waterDevices?: WaterDevice[];
  onNavigateToTab?: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  groups,
  allocations,
  categories = [],
  electricityDevices = [],
  cctvDevices = [],
  waterDevices = [],
  onNavigateToTab
}) => {
  // 1. STATS LAN
  const totalGroups = groups.length;
  const usedAllocations = allocations.filter(a => a.status === 'used');
  const totalUsedIps = usedAllocations.length;
  let totalUsableHosts = 0;
  groups.forEach(g => {
    const sub = parseCidr(g.cidr);
    totalUsableHosts += sub ? sub.usableHosts : 254;
  });
  const overallUsedPct = totalUsableHosts > 0 
    ? ((totalUsedIps / totalUsableHosts) * 100).toFixed(1) 
    : '0';

  // 2. STATS LISTRIK
  const totalElec = electricityDevices.length;
  const elecNormal = electricityDevices.filter(d => d.status === 'normal').length;
  const totalCapWatt = electricityDevices.reduce((sum, d) => sum + (d.capacityWatt || 0), 0);
  const totalLoadWatt = electricityDevices.reduce((sum, d) => sum + (d.currentLoadWatt || 0), 0);
  const elecLoadPct = totalCapWatt > 0 ? Math.round((totalLoadWatt / totalCapWatt) * 100) : 0;

  // 3. STATS CCTV
  const totalCctv = cctvDevices.length;
  const cctvOnline = cctvDevices.filter(d => d.status === 'online' || d.status === 'recording').length;
  const cctvNvr = cctvDevices.filter(d => d.type === 'nvr' || d.type === 'dvr').length;

  // 4. STATS AIR
  const totalWater = waterDevices.length;
  const waterActive = waterDevices.filter(d => d.status === 'active').length;
  const totalTankCap = waterDevices.reduce((sum, d) => sum + (d.tankCapacityLiter || 0), 0);

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* 4 KARTU SEKTOR INFRASTRUKTUR UTAMA */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              4 Sektor Manajemen Jaringan Terpadu
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pantau status menyeluruh jaringan komputer LAN, distribusi listrik, kamera CCTV, dan sistem air irigasi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* SEKTOR 1: LAN */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800/60">
                  <Network className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {overallUsedPct}% IP Terpakai
                </span>
              </div>

              <div className="mt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Jaringan Komputer</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Jaringan LAN</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{totalGroups}</span>
                  <span className="text-xs font-semibold text-slate-500">Subnet ({totalUsedIps} Host IP)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">PC, Laptop, Server, Router & Switch</p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Buka Modul LAN</span>
              {onNavigateToTab && (
                <button 
                  onClick={() => onNavigateToTab('groups')}
                  className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* SEKTOR 2: LISTRIK */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-800/60">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {elecLoadPct}% Beban
                </span>
              </div>

              <div className="mt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Kelistrikan & Power</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Jaringan Listrik</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{totalElec}</span>
                  <span className="text-xs font-semibold text-slate-500">Unit ({elecNormal} Normal)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Panel MDP/SDP, Trafo, Genset & UPS</p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Buka Modul Listrik</span>
              {onNavigateToTab && (
                <button 
                  onClick={() => onNavigateToTab('electricity')}
                  className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* SEKTOR 3: CCTV */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-rose-400 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/60">
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                  {cctvOnline} Online
                </span>
              </div>

              <div className="mt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Keamanan Video</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Jaringan CCTV</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{totalCctv}</span>
                  <span className="text-xs font-semibold text-slate-500">Kamera ({cctvNvr} NVR)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">IP Dome, Bullet, PTZ & PoE Switch</p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Buka Modul CCTV</span>
              {onNavigateToTab && (
                <button 
                  onClick={() => onNavigateToTab('cctv')}
                  className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* SEKTOR 4: AIR & IRIGASI */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-cyan-400 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 rounded-2xl border border-cyan-100 dark:border-cyan-800/60">
                  <Droplets className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  {waterActive} Aktif
                </span>
              </div>

              <div className="mt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Irigasi & Distribusi</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Jaringan AIR</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{totalWater}</span>
                  <span className="text-xs font-semibold text-slate-500">Titik Jalur</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Pompa, Toren {totalTankCap.toLocaleString()}L & Valve</p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">Buka Modul AIR</span>
              {onNavigateToTab && (
                <button 
                  onClick={() => onNavigateToTab('water')}
                  className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-600 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Grid Kategori Hardware Komputer (LAN) */}
      {categories.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Kategori Perangkat Keras Jaringan LAN
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ringkasan kategori perangkat komputer & alokasi IP yang terhubung
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map(cat => {
              const IconComp = getCategoryIconComponent(cat.icon);
              const count = allocations.filter(
                a => a.deviceType.toLowerCase() === cat.id.toLowerCase()
              ).length;

              return (
                <div 
                  key={cat.id}
                  className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-900 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800/60">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      count > 0 
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {count} IP
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-snug truncate">
                      {cat.name}
                    </h4>
                    <span className="font-mono text-[10px] text-slate-400">
                      {cat.id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
