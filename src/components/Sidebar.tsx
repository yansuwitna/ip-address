import React from 'react';
import { 
  Network, 
  LayoutDashboard, 
  Layers, 
  Server, 
  Activity, 
  Database, 
  LogOut, 
  ShieldCheck, 
  X,
  ChevronRight
} from 'lucide-react';
import { User } from '../types/auth';

export type NavTab = 'dashboard' | 'groups' | 'allocations' | 'ping' | 'backup';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  currentUser: User;
  onLogout: () => void;
  totalGroups: number;
  totalUsedIps: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
  currentUser,
  onLogout,
  totalGroups,
  totalUsedIps
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Ringkasan Utama'
    },
    {
      id: 'groups' as NavTab,
      label: 'Grup IP (Subnet)',
      icon: Layers,
      description: 'Kelola Subnet & VLAN',
      badge: totalGroups.toString()
    },
    {
      id: 'allocations' as NavTab,
      label: 'Alokasi IP Host',
      icon: Server,
      description: 'Peta & Daftar IP Terpakai',
      badge: `${totalUsedIps} Aktif`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'ping' as NavTab,
      label: 'Diagnostik Ping',
      icon: Activity,
      description: 'Uji Konektivitas ICMP'
    },
    {
      id: 'backup' as NavTab,
      label: 'Cadangan & Data',
      icon: Database,
      description: 'Ekspor & Impor JSON'
    }
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Static Fixed Sidebar on Desktop (h-screen sticky top-0) */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col flex-shrink-0 h-screen transition-transform duration-200 ease-in-out lg:static lg:sticky lg:top-0 lg:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        
        {/* Brand Header (Static Top) */}
        <div className="h-14 px-5 border-b border-slate-200/80 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 text-white flex items-center justify-center">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">NetIPAM</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                IP Address Management
              </p>
            </div>
          </div>

          {/* Close Button on Mobile */}
          <button 
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu (Scrolls internally if viewport is small) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigasi Menu
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                  }`} />
                  <div className="text-left">
                    <div>{item.label}</div>
                  </div>
                </div>

                {item.badge ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isActive 
                      ? 'bg-blue-700/80 text-white border-blue-500' 
                      : item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity ${
                    isActive ? 'opacity-100' : ''
                  }`} />
                )}
              </button>
            );
          })}
        </div>


        {/* User Profile & Logout (Static Bottom) */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/70 flex-shrink-0">
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-white transition-all border border-transparent hover:border-slate-200/60">
            <div className="flex items-center gap-2.5 truncate">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-blue-300 ring-2 ring-blue-50 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-300 flex-shrink-0">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-blue-600 font-semibold capitalize flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{currentUser.role === 'admin' ? 'Administrator' : 'Operator'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Keluar dari akun NetIPAM?')) {
                  onLogout();
                }
              }}
              title="Keluar (Logout)"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
};
