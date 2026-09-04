import React from 'react';
import { 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Server, 
  Router, 
  Monitor, 
  Video, 
  Printer, 
  Wifi, 
  ExternalLink,
  Activity,
  Cpu
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceType } from '../types/ipam';
import { parseCidr } from '../utils/ipCalculator';

interface DashboardViewProps {
  groups: IPGroup[];
  allocations: IPAllocation[];
  onNavigateToGroups: () => void;
  onNavigateToAllocations: (groupId?: string) => void;
  onAddGroup: () => void;
  onAddAllocation: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  groups,
  allocations,
  onNavigateToGroups,
  onNavigateToAllocations,
  onAddGroup,
  onAddAllocation
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

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'server': return <Server className="w-3.5 h-3.5 text-purple-600" />;
      case 'router':
      case 'switch':
      case 'gateway': return <Router className="w-3.5 h-3.5 text-blue-600" />;
      case 'access_point': return <Wifi className="w-3.5 h-3.5 text-cyan-600" />;
      case 'pc_workstation': return <Monitor className="w-3.5 h-3.5 text-indigo-600" />;
      case 'cctv': return <Video className="w-3.5 h-3.5 text-emerald-600" />;
      case 'printer': return <Printer className="w-3.5 h-3.5 text-amber-600" />;
      default: return <Cpu className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* Dashboard Top Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/15">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold text-blue-100 mb-1">
            <Activity className="w-3.5 h-3.5 text-cyan-300" />
            <span>NetIPAM Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dashboard Jaringan
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Menampilkan data jumlah grup IP terdaftar serta pelacakan seluruh IP address yang sudah digunakan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 pt-2 sm:pt-0">
          <button
            onClick={onAddGroup}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Grup IP</span>
          </button>
          <button
            onClick={onAddAllocation}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-700/80 hover:bg-blue-700 text-white border border-blue-400/40 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Alokasikan IP</span>
          </button>
        </div>
      </div>

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

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onNavigateToGroups}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 group-hover:translate-x-1 transition-all cursor-pointer"
            >
              <span>Kelola & Lihat Seluruh Grup IP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
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

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateToAllocations()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-800 group-hover:translate-x-1 transition-all cursor-pointer"
            >
              <span>Buka Peta & Rincian IP Terpakai</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Breakdown: Jumlah IP yang Sudah Digunakan per Setiap Grup IP */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Rincian Penggunaan IP per Grup
            </h3>
            <p className="text-xs text-slate-500">
              Berapa banyak IP yang telah digunakan di masing-masing grup subnet
            </p>
          </div>
          <button
            onClick={onNavigateToGroups}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Semua Subnet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {groups.map(group => {
            const groupUsedAllocations = allocations.filter(
              a => a.groupId === group.id && a.status === 'used'
            );
            const groupUsedCount = groupUsedAllocations.length;

            const subnet = parseCidr(group.cidr);
            const usable = subnet ? subnet.usableHosts : 254;
            const pct = usable > 0 ? ((groupUsedCount / usable) * 100).toFixed(1) : '0';

            return (
              <div
                key={group.id}
                className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all relative overflow-hidden"
              >
                <div 
                  className="absolute top-0 left-0 bottom-0 w-1.5"
                  style={{ backgroundColor: group.color || '#3b82f6' }}
                />

                <div className="pl-1">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h4 className="font-bold text-xs text-slate-900 leading-snug">
                      {group.name}
                    </h4>
                    {group.vlanId && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex-shrink-0">
                        VLAN {group.vlanId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mb-3">
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-700 font-medium">
                      {group.cidr}
                    </span>
                    <span>GW: {group.gateway}</span>
                  </div>

                  {/* Main Metric: IP yang Sudah Digunakan */}
                  <div className="flex items-baseline justify-between mb-1.5 text-xs">
                    <span className="text-slate-500">IP Digunakan:</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      <span className="text-blue-600 font-black">{groupUsedCount}</span> / {usable} IP
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(3, parseFloat(pct)))}%` }}
                    />
                  </div>

                  {/* Action Link */}
                  <button
                    onClick={() => onNavigateToAllocations(group.id)}
                    className="w-full text-center py-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Lihat Alokasi Host ({groupUsedCount})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daftar Host IP yang Baru / Sedang Digunakan */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Perangkat Aktif dengan IP Terpakai
            </h3>
            <p className="text-xs text-slate-500">
              Daftar host yang sedang menggunakan IP address dalam sistem
            </p>
          </div>
          <button
            onClick={() => onNavigateToAllocations()}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Semua Data IP</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3">Grup Subnet</th>
                <th className="py-2.5 px-3">Hostname</th>
                <th className="py-2.5 px-3">Tipe Perangkat</th>
                <th className="py-2.5 px-3">Pengguna / PIC</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {usedAllocations.slice(0, 7).map(item => {
                const grp = groups.find(g => g.id === item.groupId);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-sm">
                      {item.ip}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-600">
                      {grp ? grp.name : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {item.hostname}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 capitalize text-slate-600">
                        {getDeviceIcon(item.deviceType)}
                        <span>{item.deviceType.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {item.assignedTo || '-'} {item.department ? `(${item.department})` : ''}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span>Digunakan</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
