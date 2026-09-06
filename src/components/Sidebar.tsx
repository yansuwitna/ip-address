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
  Droplets
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
  totalElectricityDevices?: number;
  totalCctvDevices?: number;
  totalWaterDevices?: number;
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
  totalElectricityDevices = 0,
  totalCctvDevices = 0,
  totalWaterDevices = 0,
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

  // 4 Menu Utama Jaringan Infrastruktur Fisik & Distribusi
  const mainNetworkItems: NavItem[] = [
    {
      id: 'lan',
      label: 'Jaringan LAN',
      icon: Network,
      description: 'Jalur Kabel, Switch & Arah',
      badge: totalLanCables > 0 ? `${totalLanCables} Jalur` : (totalLanDevices > 0 ? `${totalLanDevices} Unit` : undefined),
      badgeColor: 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      activeColor: 'bg-blue-600'
    },
    {
      id: 'electricity',
      label: 'Jaringan Listrik',
      icon: Zap,
      description: 'Panel, Genset, Trafo & UPS',
      badge: totalElectricityDevices.toString(),
      badgeColor: 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      activeColor: 'bg-amber-500'
    },
    {
      id: 'cctv',
      label: 'Jaringan CCTV',
      icon: Video,
      description: 'Kamera IP, NVR & PoE',
      badge: totalCctvDevices.toString(),
      badgeColor: 'bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900',
      activeColor: 'bg-rose-600'
    },
    {
      id: 'water',
      label: 'Jaringan AIR',
      icon: Droplets,
      description: 'Irigasi, Pompa & Toren',
      badge: totalWaterDevices.toString(),
      badgeColor: 'bg-cyan-50 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      activeColor: 'bg-cyan-600'
    }
  ];

  // Menu Pendukung Sistem (Alamat IP / IPAM, DNS, Hardware & Users)
  const systemItems: NavItem[] = [
    {
      id: 'groups',
      label: 'Alamat IP (Subnet IPAM)',
      icon: Layers,
      description: 'Subnet CIDR & Alokasi Host IP',
      badge: totalGroups.toString(),
      badgeColor: 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    },
    {
      id: 'dns',
      label: 'Manajemen DNS',
      icon: Globe,
      description: 'Domain & Record Server',
      badge: totalDnsRecords !== undefined ? totalDnsRecords.toString() : undefined,
      badgeColor: 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    },
    {
      id: 'categories',
      label: 'Kategori Hardware',
      icon: Cpu,
      description: 'Kelola Tipe Hardware',
      badge: totalCategories !== undefined ? totalCategories.toString() : undefined
    },
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

          {/* SEKTOR JARINGAN UTAMA (LAN, LISTRIK, CCTV, AIR) */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Sektor Jaringan</span>
            </div>

            {mainNetworkItems.map(item => {
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

          {/* MENU SISTEM & PENDUKUNG */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Sistem & Utilitas</span>
            </div>

            {systemItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id || (item.id === 'groups' && currentTab === 'services');

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
