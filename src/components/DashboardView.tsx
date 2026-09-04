import React from 'react';
import { 
  Layers, 
  CheckCircle2 
} from 'lucide-react';
import { IPGroup, IPAllocation } from '../types/ipam';
import { parseCidr } from '../utils/ipCalculator';

interface DashboardViewProps {
  groups: IPGroup[];
  allocations: IPAllocation[];
  onNavigateToGroups?: () => void;
  onNavigateToAllocations?: (groupId?: string) => void;
  onAddGroup?: () => void;
  onAddAllocation?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  groups,
  allocations
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
      {/* 2 MAIN KPI CARDS (Hanya Fokus pada Jumlah Grup IP & IP yang Sudah Digunakan) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* KPI 1: JUMLAH GRUP IP */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Grup Jaringan
                </span>
                <h2 className="text-base font-bold text-slate-800">
                  Jumlah Grup IP
                </h2>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Subnet Aktif
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-5xl font-black text-slate-900 tracking-tight">
              {totalGroups}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              Grup Subnet Terdaftar
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Mencakup segmen kantor, server DMZ, sistem CCTV, dan manajemen jaringan.
          </p>
        </div>

        {/* KPI 2: IP YANG SUDAH DIGUNAKAN */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Utilisasi Alamat IP
                </span>
                <h2 className="text-base font-bold text-slate-800">
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
            <span className="text-sm font-semibold text-slate-500">
              IP Aktif Digunakan
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Dari total <strong>{totalUsableHosts.toLocaleString()}</strong> host IP yang tersedia pada semua grup.
          </p>
        </div>

      </div>
    </div>
  );
};
