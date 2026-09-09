import React from 'react';
import { 
  Network, 
  LayoutDashboard, 
  Layers, 
  Globe,
  Cpu,
  Users,
  Database, 
  LogOut, 
  ShieldCheck, 
  X, 
  ChevronRight,
  Sun,
  Moon,
  Zap,
  Video,
  Droplets,
  Server,
  DoorOpen
} from 'lucide-react';
import { User } from '../types/auth';
import { showConfirm } from '../utils/swal';

export type NavTab = 
  | 'dashboard' 
  | 'lan'
  | 'electricity' 
  | 'cctv' 
  | 'water' 
  | 'groups' 
  | 'dns' 
  | 'services' 
  | 'categories' 
  | 'lan_device_types'
  | 'lan_cable_types'
  | 'lan_room_types'
  | 'electricity_device_types'
  | 'electricity_cable_types'
  | 'cctv_device_types'
  | 'cctv_cable_types'
  | 'water_device_types'
  | 'water_pipe_types'
  | 'users' 
  | 'backup';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  currentUser: User;
  onLogout: () => void;
  totalGroups: number;
  totalUsedIps: number;
  totalLanCables?: number;
  totalLanDevices?: number;
  totalLanDeviceTypes?: number;
  totalLanCableTypes?: number;
  totalLanRoomTypes?: number;
  totalElectricityDevices?: number;
  totalElectricityDeviceTypes?: number;
  totalElectricityCableTypes?: number;
  totalCctvDevices?: number;
  totalCctvDeviceTypes?: number;
  totalCctvCableTypes?: number;
  totalWaterDevices?: number;
  totalWaterDeviceTypes?: number;
  totalWaterPipeTypes?: number;
  totalDnsRecords?: number;
  totalCategories?: number;
  totalUsers?: number;
  totalServices?: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
  currentUser,
  onLogout,
  totalGroups,
  totalUsedIps,
  totalLanCables = 0,
  totalLanDevices = 0,
  totalLanDeviceTypes = 0,
  totalLanCableTypes = 0,
  totalLanRoomTypes = 0,
  totalElectricityDevices = 0,
  totalElectricityDeviceTypes = 0,
  totalElectricityCableTypes = 0,
  totalCctvDevices = 0,
  totalCctvDeviceTypes = 0,
  totalCctvCableTypes = 0,
  totalWaterDevices = 0,
  totalWaterDeviceTypes = 0,
  totalWaterPipeTypes = 0,
  totalDnsRecords,
  totalCategories,
  totalUsers,
  totalServices,
  theme = 'light',
  onToggleTheme
}) => {
  interface NavItem {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    badge?: string;
    badgeColor?: string;
    activeColor?: string;
  }

  // 1. Sektor LAN (Jaringan LAN, Tipe Perangkat LAN, Jenis Kabel LAN)
  const lanGroupItems: NavItem[] = [
    {
      id: 'lan',
      label: 'Jaringan LAN',
      icon: Network,
      description: 'Jalur Kabel, Switch & Arah',
      activeColor: 'bg-blue-600'
    },
    {
      id: 'lan_device_types',
      label: 'Tipe Perangkat LAN',
      icon: Server,
      description: 'Master Jenis Alat LAN',
      activeColor: 'bg-blue-600'
    },
    {
      id: 'lan_cable_types',
      label: 'Jenis Kabel LAN',
      icon: Network,
      description: 'Master Tipe Kabel Jaringan',
      activeColor: 'bg-blue-600'
    }
  ];

  // 2. Sektor Listrik (Jaringan Listrik, Tipe Perangkat Listrik, Jenis Kabel Listrik)
  const electricityGroupItems: NavItem[] = [
    {
      id: 'electricity',
      label: 'Jaringan Listrik',
      icon: Zap,
      description: 'Panel, Genset, Trafo & UPS',
      activeColor: 'bg-amber-500'
    },
    {
      id: 'electricity_device_types',
      label: 'Tipe Perangkat Listrik',
      icon: Zap,
      description: 'Master Jenis Komponen Listrik',
      activeColor: 'bg-amber-500'
    },
    {
      id: 'electricity_cable_types',
      label: 'Jenis Kabel Listrik',
      icon: Zap,
      description: 'Master Jenis Kabel Kelistrikan',
      activeColor: 'bg-amber-500'
    }
  ];

  // 3. Sektor CCTV (Jaringan CCTV, Tipe Hardware CCTV, Jenis Kabel CCTV)
  const cctvGroupItems: NavItem[] = [
    {
      id: 'cctv',
      label: 'Jaringan CCTV',
      icon: Video,
      description: 'Kamera IP, NVR & PoE',
      activeColor: 'bg-rose-600'
    },
    {
      id: 'cctv_device_types',
      label: 'Tipe Hardware CCTV',
      icon: Video,
      description: 'Master Jenis Kamera & Recorder',
      activeColor: 'bg-rose-600'
    },
    {
      id: 'cctv_cable_types',
      label: 'Jenis Kabel CCTV',
      icon: Video,
      description: 'Master Tipe Kabel Kamera',
      activeColor: 'bg-rose-600'
    }
  ];

  // 4. Sektor AIR (Jaringan AIR, Tipe Alat & Sistem Air, Jenis Pipa Air)
  const waterGroupItems: NavItem[] = [
    {
      id: 'water',
      label: 'Jaringan AIR',
      icon: Droplets,
      description: 'Irigasi, Pompa & Toren',
      activeColor: 'bg-cyan-600'
    },
    {
      id: 'water_device_types',
      label: 'Tipe Alat & Sistem Air',
      icon: Droplets,
      description: 'Master Jenis Pompa & Sensor Air',
      activeColor: 'bg-cyan-600'
    },
    {
      id: 'water_pipe_types',
      label: 'Jenis Pipa Air',
      icon: Droplets,
      description: 'Master Jenis Pipa Distribusi',
      activeColor: 'bg-cyan-600'
    }
  ];

  // 5. Ruangan & Lokasi (Kelompok Terpisah)
  const roomItems: NavItem[] = [
    {
      id: 'lan_room_types',
      label: 'Tipe Ruang',
      icon: DoorOpen,
      description: 'Master Tipe Ruangan / Lab',
      activeColor: 'bg-emerald-600'
    }
  ];

  // 6. IP dan DNS (Alamat IP, Manajemen DNS, Kategori Hardware)
  const ipDnsItems: NavItem[] = [
    {
      id: 'groups',
      label: 'Alamat IP',
      icon: Layers,
      description: 'Subnet CIDR & Alokasi Host IP',
      activeColor: 'bg-indigo-600'
    },
    {
      id: 'dns',
      label: 'Manajemen DNS',
      icon: Globe,
      description: 'Domain & Record Server',
      activeColor: 'bg-indigo-600'
    },
    {
      id: 'categories',
      label: 'Kategori Hardware',
      icon: Cpu,
      description: 'Kelola Tipe Hardware',
      activeColor: 'bg-indigo-600'
    }
  ];

  // 7. Sistem & Pengaturan (Akun Pengguna, Cadangan & Data)
  const systemItems: NavItem[] = [
    {
      id: 'users',
      label: 'Akun Pengguna',
      icon: Users,
      description: 'Profil & Kredensial'
    },
    {
      id: 'backup',
      label: 'Cadangan & Data',
      icon: Database,
      description: 'Ekspor & Impor JSON'
    }
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const handleLogoutClick = async () => {
    const confirmed = await showConfirm({
      title: 'Konfirmasi Logout',
      text: 'Apakah Anda yakin ingin keluar dari sistem manajemen jaringan?',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      isDanger: false
    });

    if (confirmed) {
      onLogout();
    }
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Static Fixed Sidebar on Desktop */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 flex flex-col flex-shrink-0 h-screen transition-transform duration-200 ease-in-out lg:static lg:sticky lg:top-0 lg:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center space-x-3">
            {currentUser?.appLogo ? (
              <img src={currentUser.appLogo} alt="App Logo" className="w-9 h-9 object-contain rounded-xl" />
            ) : (
              <div className="p-2.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 rounded-xl shadow-md shadow-blue-500/20 text-white flex items-center justify-center">
                <Network className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-100">
                  {currentUser?.appName || 'INFRA NET'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                LAN • Listrik • CCTV • AIR
              </p>
            </div>
          </div>

          {/* Close Button on Mobile */}
          <button 
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          
          {/* Dashboard Tab */}
          <div>
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={`w-4 h-4 transition-colors ${
                  currentTab === 'dashboard' ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`} />
                <span>Dashboard Ringkasan</span>
              </div>
            </button>
          </div>

          {/* 1. SEKTOR LAN (Jaringan LAN, Tipe Perangkat LAN, Jenis Kabel LAN) */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Jaringan LAN</span>
            </div>

            {lanGroupItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const activeBg = item.activeColor || 'bg-blue-600';

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? `${activeBg} text-white shadow-sm font-bold`
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`} />
                    <div className="text-left">
                      <div>{item.label}</div>
                      <div className={`text-[10px] font-normal ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity ${
                    isActive ? 'opacity-100 text-white' : 'text-slate-400'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* 2. SEKTOR LISTRIK (Jaringan Listrik, Tipe Perangkat Listrik, Jenis Kabel Listrik) */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Jaringan Listrik</span>
            </div>

            {electricityGroupItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const activeBg = item.activeColor || 'bg-amber-500';

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? `${activeBg} text-white shadow-sm font-bold`
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-amber-500 dark:group-hover:text-amber-400'
                    }`} />
                    <div className="text-left">
                      <div>{item.label}</div>
                      <div className={`text-[10px] font-normal ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity ${
                    isActive ? 'opacity-100 text-white' : 'text-slate-400'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* 3. SEKTOR CCTV (Jaringan CCTV, Tipe Hardware CCTV, Jenis Kabel CCTV) */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Jaringan CCTV</span>
            </div>

            {cctvGroupItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const activeBg = item.activeColor || 'bg-rose-600';

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? `${activeBg} text-white shadow-sm font-bold`
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-rose-600 dark:group-hover:text-rose-400'
                    }`} />
                    <div className="text-left">
                      <div>{item.label}</div>
                      <div className={`text-[10px] font-normal ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity ${
                    isActive ? 'opacity-100 text-white' : 'text-slate-400'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* 4. SEKTOR AIR (Jaringan AIR, Tipe Alat & Sistem Air, Jenis Pipa Air) */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Jaringan AIR</span>
            </div>

            {waterGroupItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const activeBg = item.activeColor || 'bg-cyan-600';

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? `${activeBg} text-white shadow-sm font-bold`
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400'
                    }`} />
                    <div className="text-left">
                      <div>{item.label}</div>
                      <div className={`text-[10px] font-normal ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity ${
                    isActive ? 'opacity-100 text-white' : 'text-slate-400'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* 5. RUANGAN & LOKASI (Kelompok Berbeda untuk Tipe Ruang) */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Ruangan & Lokasi</span>
            </div>

            {roomItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const activeBg = item.activeColor || 'bg-emerald-600';

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? `${activeBg} text-white shadow-sm font-bold`
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                    }`} />
                    <div className="text-left">
                      <div>{item.label}</div>
                      <div className={`text-[10px] font-normal ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity ${
                    isActive ? 'opacity-100 text-white' : 'text-slate-400'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* 3. IP DAN DNS (ALAMAT IP, MANAJEMEN DNS, KATEGORI HARDWARE) */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>IP dan DNS</span>
            </div>

            {ipDnsItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id || (item.id === 'groups' && currentTab === 'services');
              const activeBg = item.activeColor || 'bg-indigo-600';

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? `${activeBg} text-white shadow-sm font-bold`
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                    }`} />
                    <div className="text-left">
                      <div>{item.label}</div>
                      <div className={`text-[10px] font-normal ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity ${
                    isActive ? 'opacity-100 text-white' : 'text-slate-400'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* 4. SISTEM & UTILITAS */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Sistem & Utilitas</span>
            </div>

            {systemItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`} />
                    <div className="text-left">
                      <div>{item.label}</div>
                      <div className={`text-[10px] font-normal ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity ${
                    isActive ? 'opacity-100 text-white' : 'text-slate-400'
                  }`} />
                </button>
              );
            })}
          </div>

        </div>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex-shrink-0">
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700">
            <div className="flex items-center gap-2.5 truncate">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-blue-300 ring-2 ring-blue-50 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs border border-blue-300 dark:border-blue-800 flex-shrink-0">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  @{currentUser.username}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  title={`Ganti ke mode ${theme === 'dark' ? 'Terang' : 'Gelap'}`}
                  className="p-1.5 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
              )}
              <button
                onClick={handleLogoutClick}
                title="Keluar (Logout)"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </aside>
    </>
  );
};
