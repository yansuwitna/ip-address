import React, { useState, useMemo } from 'react';
import { 
  Network, 
  LogIn, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Database, 
  Cpu, 
  Server, 
  Router, 
  Wifi, 
  CheckCircle2, 
  ChevronRight, 
  Eye, 
  Sparkles, 
  Search, 
  Globe, 
  HardDrive, 
  BarChart3, 
  MapPin,
  UserCheck,
  Zap,
  Info
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceCategory } from '../types/ipam';
import { User } from '../types/auth';
import { parseCidr, generateUsableIps } from '../utils/ipCalculator';

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
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hoveredIp, setHoveredIp] = useState<string | null>(null);
  const [selectedCellIp, setSelectedCellIp] = useState<string | null>(null);

  // Active group
  const activeGroup = useMemo(() => {
    return groups.find(g => g.id === selectedGroupId) || groups[0] || null;
  }, [groups, selectedGroupId]);

  // Subnet calculations
  const activeSubnet = useMemo(() => {
    return activeGroup ? parseCidr(activeGroup.cidr) : null;
  }, [activeGroup]);

  // Usable IPs for active group
  const usableIps = useMemo(() => {
    if (!activeGroup) return [];
    return generateUsableIps(activeGroup.cidr, 256);
  }, [activeGroup]);

  // Allocation Map
  const allocationMap = useMemo(() => {
    const map = new Map<string, IPAllocation>();
    allocations.forEach(a => {
      map.set(a.ip.trim(), a);
    });
    return map;
  }, [allocations]);

  const getIpStatus = (ip: string) => {
    if (activeGroup && ip === activeGroup.gateway) return 'gateway';
    const alloc = allocationMap.get(ip);
    if (!alloc) return 'available';
    return alloc.status;
  };

  // Group allocations
  const activeGroupAllocs = useMemo(() => {
    if (!activeGroup) return [];
    return allocations.filter(a => a.groupId === activeGroup.id);
  }, [allocations, activeGroup]);

  const usedCount = activeGroupAllocs.filter(a => a.status === 'used').length;
  const resvCount = activeGroupAllocs.filter(a => a.status === 'reserved' || a.status === 'dhcp').length;
  const totalUsable = activeSubnet?.usableHosts || 254;
  const freeCount = Math.max(0, totalUsable - usedCount - resvCount);
  const percentUsed = totalUsable > 0 ? Math.round(((usedCount + resvCount) / totalUsable) * 100) : 0;

  // Global statistics
  const totalUsedAll = allocations.filter(a => a.status === 'used').length;
  const totalReservedAll = allocations.filter(a => a.status === 'reserved' || a.status === 'dhcp').length;

  // Filtered IPs in grid
  const filteredIps = useMemo(() => {
    return usableIps.filter(ip => {
      const status = getIpStatus(ip);
      const alloc = allocationMap.get(ip);

      if (statusFilter !== 'all') {
        if (statusFilter === 'available' && status !== 'available') return false;
        if (statusFilter === 'used' && status !== 'used') return false;
        if (statusFilter === 'reserved' && status !== 'reserved') return false;
        if (statusFilter === 'dhcp' && status !== 'dhcp') return false;
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
  }, [usableIps, allocationMap, statusFilter, searchTerm, activeGroup]);

  const activeHoveredAlloc = hoveredIp ? allocationMap.get(hoveredIp) : null;
  const selectedAlloc = selectedCellIp ? allocationMap.get(selectedCellIp) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/30 to-slate-100/70 text-slate-800 font-poppins selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-r from-blue-300/20 via-sky-200/30 to-indigo-300/20 blur-[130px] pointer-events-none" />
      <div className="absolute top-[800px] -right-[200px] w-[500px] h-[500px] bg-cyan-200/15 rounded-full blur-[120px] pointer-events-none" />

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
                  Pro Edition
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
              <span>Realtime Matrix Grid</span>
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
          <span>Enterprise IP Address Management & Visual Matrix Grid</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
          Visualisasi & Manajemen Alamat IP Terpadu Secara <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Realtime</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Monitor alokasi host, pemanfaatan subnet CIDR, pemetaan VLAN, dan ketersediaan IP secara instan dengan visual data grid interaktif.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {!currentUser ? (
            <button
              onClick={onNavigateToLogin}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-xl shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Akses Login Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onNavigateToDashboard}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-xl shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Ke Dashboard Admin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <a
            href="#live-data-grid"
            className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm border border-slate-200 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Jelajahi Visual Grid di Bawah</span>
          </a>
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

      {/* 3. INTERACTIVE LIVE DATA GRID SECTION */}
      <section id="live-data-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Section Header */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Peta Visual Data Grid Jaringan (Live Interactive)
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Pilih subnet di bawah untuk meninjau status alokasi tiap alamat IP secara langsung. Arahkan kursor atau klik kotak IP untuk detail host.
              </p>
            </div>

            {/* Subnet Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {groups.map(grp => {
                const isSelected = grp.id === activeGroup?.id;
                return (
                  <button
                    key={grp.id}
                    onClick={() => {
                      setSelectedGroupId(grp.id);
                      setSelectedCellIp(null);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/30'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: isSelected ? '#ffffff' : grp.color || '#3b82f6' }}
                    />
                    <span>{grp.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {grp.cidr}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Subnet Details Ribbon */}
          {activeGroup && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Nama Subnet / VLAN</div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{activeGroup.name}</span>
                  {activeGroup.vlanId && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      VLAN {activeGroup.vlanId}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">CIDR & Default Gateway</div>
                <div className="text-xs font-mono font-bold text-blue-700">
                  {activeGroup.cidr} • GW: {activeGroup.gateway}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Status Penggunaan Host</div>
                <div className="text-xs font-bold text-slate-800">
                  <strong className="text-blue-600 font-black">{usedCount}</strong> Digunakan, {resvCount} Reserved, {freeCount} Bebas
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Tingkat Utilisasi:</span>
                  <span className="font-bold text-slate-800">{percentUsed}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Toolbar: Search & Filter inside Grid */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari IP, hostname, PIC..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Filter pills & Legend */}
            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Semua ({usableIps.length})
              </button>

              <button
                onClick={() => setStatusFilter('used')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'used'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Digunakan ({usedCount})</span>
              </button>

              <button
                onClick={() => setStatusFilter('reserved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'reserved'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Reserved</span>
              </button>

              <button
                onClick={() => setStatusFilter('dhcp')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'dhcp'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>DHCP</span>
              </button>

              <button
                onClick={() => setStatusFilter('available')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'available'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span>Bebas ({freeCount})</span>
              </button>
            </div>

          </div>

          {/* DATA GRID DISPLAY */}
          <div className="mt-5 p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
            
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400 text-xs">
              <span className="font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Host Matrix Display • {filteredIps.length} Alamat IP Ditampilkan</span>
              </span>

              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Klik kotak IP untuk melihat rincian alokasi
              </span>
            </div>

            {filteredIps.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Tidak ada alamat IP yang cocok dengan filter atau pencarian "{searchTerm}".
              </div>
            ) : (
              <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 gap-1.5 max-h-[380px] overflow-y-auto p-1 custom-scrollbar">
                {filteredIps.map((ip) => {
                  const status = getIpStatus(ip);
                  const alloc = allocationMap.get(ip);
                  const isGateway = activeGroup?.gateway === ip;
                  const lastOctet = ip.split('.').pop() || '';
                  const isSelected = selectedCellIp === ip;

                  let cellColor = 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 border border-slate-700/60';
                  if (isGateway) {
                    cellColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30';
                  } else if (status === 'used') {
                    cellColor = 'bg-blue-600 text-white font-bold border border-blue-400 hover:bg-blue-500 shadow-xs shadow-blue-500/20';
                  } else if (status === 'reserved') {
                    cellColor = 'bg-amber-600/90 text-white font-bold border border-amber-400 hover:bg-amber-500';
                  } else if (status === 'dhcp') {
                    cellColor = 'bg-purple-600/90 text-white font-bold border border-purple-400 hover:bg-purple-500';
                  }

                  return (
                    <button
                      key={ip}
                      onMouseEnter={() => setHoveredIp(ip)}
                      onMouseLeave={() => setHoveredIp(null)}
                      onClick={() => setSelectedCellIp(ip)}
                      title={`${ip}${alloc ? ` (${alloc.hostname} - ${alloc.deviceType})` : isGateway ? ' (Default Gateway)' : ' (Tersedia)'}`}
                      className={`h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono transition-all transform hover:scale-105 cursor-pointer select-none ${cellColor} ${
                        isSelected ? 'ring-2 ring-white scale-105 z-10' : ''
                      }`}
                    >
                      <span className="leading-none">.{lastOctet}</span>
                      {status === 'used' && <span className="w-1 h-1 rounded-full bg-white mt-0.5" />}
                      {status === 'dhcp' && <span className="w-1 h-1 rounded-full bg-purple-300 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Hovered / Clicked IP Inspector Panel */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              {(selectedCellIp || hoveredIp) ? (
                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-1 bg-slate-800 text-cyan-400 rounded-lg font-mono font-bold border border-slate-700">
                    {selectedCellIp || hoveredIp}
                  </div>

                  {(selectedAlloc || activeHoveredAlloc) ? (
                    <div className="text-slate-300 flex items-center gap-2">
                      <span className="font-bold text-white">
                        {(selectedAlloc || activeHoveredAlloc)?.hostname}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="capitalize text-slate-400">
                        {(selectedAlloc || activeHoveredAlloc)?.deviceType.replace('_', ' ')}
                      </span>
                      {(selectedAlloc || activeHoveredAlloc)?.assignedTo && (
                        <>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">
                            PIC: {(selectedAlloc || activeHoveredAlloc)?.assignedTo}
                          </span>
                        </>
                      )}
                    </div>
                  ) : (selectedCellIp || hoveredIp) === activeGroup?.gateway ? (
                    <span className="text-amber-400 font-semibold">
                      Default Gateway Subnet
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium">
                      Alamat IP Tersedia (Bebas / Belum Dialokasikan)
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>Arahkan atau klik salah satu kotak nomor IP untuk melihat inspeksi detail host.</span>
                </div>
              )}

              {/* Login CTA from Grid */}
              <button
                onClick={onNavigateToLogin}
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition-colors"
              >
                <span>Kelola atau alokasikan IP ini</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

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
            Didesain khusus untuk efisiensi tim network engineer, system administrator, dan devops.
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
              Peta Visual IP Grid Interaktif
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Melihat status pemakaian seluruh IP dalam satu tampilan visual tanpa perlu repot membuka spreadsheet manual yang rentan konflik IP.
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
              Masuk sekarang dengan akun administrator atau operator untuk mengalokasikan host baru, membuat grup subnet, atau mengunduh laporan.
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
