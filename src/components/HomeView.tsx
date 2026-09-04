import React from 'react';
import { 
  Network, 
  LogIn, 
  ArrowRight, 
  Layers, 
  Database, 
  Cpu, 
  Activity, 
  Sparkles, 
  HardDrive, 
  MapPin,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceCategory } from '../types/ipam';
import { User } from '../types/auth';
import { parseCidr } from '../utils/ipCalculator';

interface HomeViewProps {
  groups: IPGroup[];
  allocations: IPAllocation[];
  categories: DeviceCategory[];
  currentUser: User | null;
  onNavigateToLogin: () => void;
  onNavigateToDashboard?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  groups,
  allocations,
  categories,
  currentUser,
  onNavigateToLogin,
  onNavigateToDashboard
}) => {
  // Global statistics
  const totalUsedAll = allocations.filter(a => a.status === 'used').length;
  const totalReservedAll = allocations.filter(a => a.status === 'reserved' || a.status === 'dhcp').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/30 to-slate-100/70 text-slate-800 font-poppins selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-r from-blue-300/20 via-sky-200/30 to-indigo-300/20 blur-[130px] pointer-events-none" />
      <div className="absolute top-[600px] -right-[200px] w-[500px] h-[500px] bg-cyan-200/15 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 text-white flex items-center justify-center">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">NetIPAM</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">
                Sistem Manajemen Alamat & Grup IP Terintegrasi
              </p>
            </div>
          </div>

          {/* Center Badges (Desktop) */}
          <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem IPAM Aktif</span>
            </span>
            <span className="text-slate-400">•</span>
            <span>{groups.length} Subnet Terdaftar</span>
            <span className="text-slate-400">•</span>
            <span>{allocations.length} Alokasi Host</span>
          </div>

          {/* Right Action: Login or Dashboard Button */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <button
                onClick={onNavigateToDashboard}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Buka Dashboard ({currentUser.name.split(' ')[0]})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onNavigateToLogin}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer group"
              >
                <LogIn className="w-4 h-4 text-blue-100 group-hover:rotate-6 transition-transform" />
                <span>Masuk ke Sistem</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Enterprise IP Address Management</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
          Visualisasi & Manajemen Alamat IP Terpadu Secara <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Realtime</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Monitor alokasi host, pemanfaatan subnet CIDR, pemetaan VLAN, dan ketersediaan IP secara terpusat dan akurat.
        </p>

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {!currentUser ? (
            <button
              onClick={onNavigateToLogin}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Akses Login Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onNavigateToDashboard}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-xl shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Ke Dashboard Utama</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Highlight KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6">
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Total Subnet IP</span>
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{groups.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Segmen Jaringan Aktif</div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Host Digunakan</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{totalUsedAll}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">IP Terhubung Aktif</div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Reserved & DHCP</span>
              <Cpu className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-600 mt-1">{totalReservedAll}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Kolam DHCP / Cadangan</div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Kategori Device</span>
              <HardDrive className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{categories.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Hardware Tervalidasi</div>
          </div>
        </div>

      </section>

      {/* 3. SUBNET & NETWORK DATA OVERVIEW GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Data Segmen Subnet Jaringan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rincian grup IP, CIDR, gateway, alokasi penggunaan host, dan utilisasi kapasitas.
              </p>
            </div>

            <button
              onClick={onNavigateToLogin}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <span>Login untuk Kelola</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid Table of Subnets */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-3">Nama Subnet</th>
                  <th className="px-4 py-3">CIDR Subnet</th>
                  <th className="px-4 py-3">Default Gateway</th>
                  <th className="px-4 py-3">VLAN</th>
                  <th className="px-4 py-3">Host Terpakai</th>
                  <th className="px-4 py-3">Utilisasi Kapasitas</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {groups.map((grp) => {
                  const grpAllocs = allocations.filter(a => a.groupId === grp.id);
                  const used = grpAllocs.filter(a => a.status === 'used').length;
                  const resv = grpAllocs.filter(a => a.status === 'reserved' || a.status === 'dhcp').length;
                  const subnet = parseCidr(grp.cidr);
                  const usable = subnet ? subnet.usableHosts : 254;
                  const pct = usable > 0 ? Math.round(((used + resv) / usable) * 100) : 0;

                  return (
                    <tr key={grp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: grp.color || '#3b82f6' }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {grp.name}
                            </div>
                            {grp.location && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{grp.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-blue-700 font-bold">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          {grp.cidr}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-700">
                        {grp.gateway}
                      </td>

                      <td className="px-4 py-3.5">
                        {grp.vlanId ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            VLAN {grp.vlanId}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-900">{used}</span>
                        <span className="text-slate-400"> / {usable} Host</span>
                      </td>

                      <td className="px-4 py-3.5 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={onNavigateToLogin}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Rincian</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

      </section>

      {/* 4. PLATFORM FEATURES & ARCHITECTURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="text-center space-y-2 max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Fitur Utama NetIPAM Pro
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Didesain untuk efisiensi pengelolaan infrastruktur jaringan komputer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Kalkulator CIDR & Subnetting Otomatis
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Penghitungan kapasitas usable host, network IP, broadcast address, netmask, serta pemetaan VLAN ID secara presisi dan instan.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Manajemen Alokasi & Pelacakan Host
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pencatatan alokasi alamat IP host, hostname, tipe perangkat, MAC Address, departemen, dan pengguna untuk mencegah IP conflict.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Cadangan Lengkap & Ekspor XLSX
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dukungan ekspor inventaris jaringan ke Excel (.xlsx) per subnet dan backup lengkap format JSON yang aman dengan penguncian data.
            </p>
          </div>

        </div>

      </section>

      {/* 5. BOTTOM CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-8 sm:p-12 shadow-2xl shadow-blue-600/20 overflow-hidden text-center space-y-6">
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Siap Mengelola Infrastruktur Jaringan Anda?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Masuk sekarang dengan akun pengguna untuk mengalokasikan host baru, membuat grup subnet, atau mengunduh laporan.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              {!currentUser ? (
                <button
                  onClick={onNavigateToLogin}
                  className="px-6 py-3.5 bg-white hover:bg-blue-50 text-blue-700 font-bold rounded-xl text-sm shadow-lg active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <LogIn className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span>Klik untuk Masuk (Login)</span>
                </button>
              ) : (
                <button
                  onClick={onNavigateToDashboard}
                  className="px-6 py-3.5 bg-white hover:bg-blue-50 text-blue-700 font-bold rounded-xl text-sm shadow-lg active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Buka Dashboard NetIPAM</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-slate-200/80 bg-white/70 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">NetIPAM Pro</span>
            <span>•</span>
            <span>Sistem Manajemen Alamat & Grup IP Terintegrasi</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>Versi 2.0.0</span>
            <span>•</span>
            <span>Enterprise Network Suite</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
