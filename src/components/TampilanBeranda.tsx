import React from 'react';
import { 
  Network,
  Sun,
  Moon, 
  LogIn, 
  ArrowRight, 
  Layers, 
  Database, 
  Cpu, 
  Activity, 
  Sparkles, 
  HardDrive,
  Globe,
  Zap,
  Video,
  Droplets,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceCategory, DnsRecord, SubDomainRecord } from '../types/ipam';
import { ElectricityDevice, CctvDevice, WaterDevice, LanDevice, LanCableRun } from '../types/utilityNetworks';
import { User } from '../types/auth';

interface HomeViewProps {
  groups: IPGroup[];
  allocations: IPAllocation[];
  categories: DeviceCategory[];
  dnsRecords?: DnsRecord[];
  subDomains?: SubDomainRecord[];
  lanDevices?: LanDevice[];
  lanCables?: LanCableRun[];
  electricityDevices?: ElectricityDevice[];
  cctvDevices?: CctvDevice[];
  waterDevices?: WaterDevice[];
  currentUser: User | null;
  onNavigateToLogin: () => void;
  onNavigateToDashboard?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  appName?: string;
  appLogo?: string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  groups,
  allocations,
  categories,
  dnsRecords = [],
  subDomains = [],
  lanDevices = [],
  lanCables = [],
  electricityDevices = [],
  cctvDevices = [],
  waterDevices = [],
  currentUser,
  onNavigateToLogin,
  onNavigateToDashboard,
  theme = 'light',
  onToggleTheme,
  appName,
  appLogo
}) => {
  // Global statistics
  const totalCables = lanCables.length;
  const totalLanDevs = lanDevices.length;
  const totalUsedAll = allocations.filter(a => a.status === 'used').length;
  const totalElec = electricityDevices.length;
  const totalCctv = cctvDevices.length;
  const totalWater = waterDevices.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/30 to-slate-100/70 text-slate-800 dark:text-slate-200 font-poppins selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-r from-blue-300/20 via-sky-200/30 to-indigo-300/20 blur-[130px] pointer-events-none" />
      <div className="absolute top-[600px] -right-[200px] w-[500px] h-[500px] bg-cyan-200/15 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            {appLogo ? (
              <img src={appLogo} alt="App Logo" className="h-10 w-10 object-contain rounded-xl" />
            ) : (
              <div className="p-2.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 rounded-xl shadow-md shadow-blue-500/20 text-white flex items-center justify-center">
                <Network className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-100">{appName || 'INFRA NET'}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Manajemen 4 Sektor: LAN • Listrik • CCTV • AIR
              </p>
            </div>
          </div>

          {/* Right Action: Login or Dashboard Button */}
          <div className="flex items-center gap-3">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            )}
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
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Sistem Manajemen Infrastruktur Jaringan Terpadu (SQLite Backend)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
          Sentralisasi Data <span className="bg-gradient-to-r from-blue-600 via-amber-500 to-cyan-500 bg-clip-text text-transparent">LAN, Listrik, CCTV, & AIR</span> Dalam Satu Platform
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Monitor perangkat komputer, kapasitas panel kelistrikan, kamera CCTV & NVR, serta sistem irigasi air secara terintegrasi dan tersimpan aman di database SQLite server.
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 w-full sm:w-auto px-4 sm:px-0">
          {!currentUser ? (
            <button
              onClick={onNavigateToLogin}
              className="px-6 py-3 justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Akses Login Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onNavigateToDashboard}
              className="px-6 py-3 justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-xl shadow-blue-600/25 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Ke Dashboard Utama</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Highlight 4 Sektor Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-6">
          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Jaringan LAN</span>
              <Network className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{totalCables > 0 ? `${totalCables} Jalur` : `${groups.length} Subnet`}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{totalLanDevs > 0 ? `${totalLanDevs} Switch/Rack/Router` : `${totalUsedAll} Host IP Terhubung`}</div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Jaringan Listrik</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-500 mt-1">{totalElec} Unit</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">MDP, SDP, Genset, UPS</div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Jaringan CCTV</span>
              <Video className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-600 mt-1">{totalCctv} Unit</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">IP Cam & NVR Recording</div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Jaringan AIR</span>
              <Droplets className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-black text-cyan-600 mt-1">{totalWater} Titik</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pompa, Toren & Irigasi</div>
          </div>
        </div>

      </section>

      {/* 3. 4 SEKTOR OVERVIEW CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="text-center space-y-2 max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Cakupan Infrastruktur Terkelola
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Arsitektur pendataan lengkap yang mudah dipahami dan siap diimplementasikan di lapangan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Sektor 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl w-fit">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              LAN: Jalur Kabel & Perangkat Fisik
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Mendata tarikan kabel UTP/STP/Fiber Optik, arah asal & tujuan (Switch/Patch Panel ke Ruangan/User), panjang kabel, port, dan rack server.
            </p>
          </div>

          {/* Sektor 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl w-fit">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Listrik: Jaringan Kelistrikan
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Mendata Panel MDP & SDP, Trafo PLN, Genset cadangan, UPS data center, MCB breaker, daya kVA / Watt, dan fasa 1P/3P.
            </p>
          </div>

          {/* Sektor 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl w-fit">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              CCTV: Jaringan Keamanan
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Mendata IP Camera (Dome, Bullet, PTZ), NVR Server, Switch PoE kamera, resolusi, port feed RTSP, dan hari retensi rekaman.
            </p>
          </div>

          {/* Sektor 4 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="p-3 bg-cyan-50 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 rounded-2xl w-fit">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              AIR: Irigasi & Suplai Air
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Mendata Pompa Celup Sumur Bor, Booster, Toren penampungan air, Katup Solenoid, zona irigasi taman, dan debit aliran pipa.
            </p>
          </div>

        </div>

      </section>

      {/* 4. BOTTOM CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white p-8 sm:p-12 shadow-2xl shadow-blue-600/20 overflow-hidden text-center space-y-6">
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Mulai Kelola Seluruh Jaringan Utilitas Anda
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Masuk dengan akun pengguna untuk mengelola aset infrastruktur, alokasi IP, dan status kelistrikan & irigasi secara realtime.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              {!currentUser ? (
                <button
                  onClick={onNavigateToLogin}
                  className="px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-blue-50 text-blue-700 font-bold rounded-xl text-sm shadow-lg active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <LogIn className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span>Klik untuk Masuk (Login)</span>
                </button>
              ) : (
                <button
                  onClick={onNavigateToDashboard}
                  className="px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-blue-50 text-blue-700 font-bold rounded-xl text-sm shadow-lg active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                  <span>Buka Panel Kontrol</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
