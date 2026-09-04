import React from 'react';
import { 
  Layers, 
  CheckCircle2,
  Cpu 
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceCategory } from '../types/ipam';
import { parseCidr } from '../utils/ipCalculator';
import { getCategoryIconComponent } from './CategoriesView';

interface DashboardViewProps {
  groups: IPGroup[];
  allocations: IPAllocation[];
  categories?: DeviceCategory[];
  onNavigateToGroups?: () => void;
  onNavigateToAllocations?: (groupId?: string) => void;
  onAddGroup?: () => void;
  onAddAllocation?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  groups,
  allocations,
  categories = []
}) => {
  // 1. Total Grup IP
  const totalGroups = groups.length;

  // 2. Total IP yang Sudah Digunakan (status === 'used')
  const usedAllocations = allocations.filter(a => a.status === 'used');
  const totalUsedIps = usedAllocations.length;

  // Total Host usable across all subnets
  let totalUsableHosts = 0;
  groups.forEach(g => {
    const sub = parseCidr(g.cidr);
    totalUsableHosts += sub ? sub.usableHosts : 254;
  });

  const overallUsedPct = totalUsableHosts > 0 
    ? ((totalUsedIps / totalUsableHosts) * 100).toFixed(1) 
    : '0';

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      {/* 3 MAIN KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* KPI 1: JUMLAH GRUP IP */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Grup Jaringan
                </span>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Jumlah Grup IP
                </h2>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Subnet Aktif
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {totalGroups}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Grup Subnet Terdaftar
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Mencakup segmen kantor, server DMZ, sistem CCTV, dan manajemen jaringan.
          </p>
        </div>

        {/* KPI 2: IP YANG SUDAH DIGUNAKAN */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Utilisasi Alamat IP
                </span>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  IP yang Sudah Digunakan
                </h2>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {overallUsedPct}% Terpakai
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-5xl font-black text-emerald-600 tracking-tight">
              {totalUsedIps}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              IP Aktif Digunakan
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Dari total <strong>{totalUsableHosts.toLocaleString()}</strong> host IP yang tersedia pada semua grup.
          </p>
        </div>

        {/* KPI 3: KATEGORI PERANGKAT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                <Cpu className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Hardware & Device
                </span>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Kategori Perangkat
                </h2>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {categories.length} Tipe
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {categories.length}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Kategori Terdaftar
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Klasifikasi tipe perangkat keras jaringan yang dikelola dalam sistem.
          </p>
        </div>

      </div>

      {/* Grid Kategori Perangkat */}
      {categories.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Kategori Perangkat
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ringkasan kategori perangkat keras dan jumlah IP yang terhubung
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
                  className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50/60 hover:bg-white dark:bg-slate-900 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      count > 0 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
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
