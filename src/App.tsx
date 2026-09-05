import { fetchFromServer } from "./utils/api";
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  Network, 
  Grid, 
  List, 
  Download, 
  Edit3, 
  MapPin,
  UserCheck,
  Plus,
  Layers,
  ArrowRight,
  ArrowLeft,
  Trash2,
  ServerCog,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceCategory, IPService, DnsRecord, SubDomainRecord } from './types/ipam';
import { User, UserAccount } from './types/auth';
import { 
  getCurrentUser, 
  setCurrentUserSession,
  logoutUser, 
  loadUsers, 
  saveUsers,
  createUser, 
  updateUser, 
  deleteUser, 
  wipeAllUsers 
} from './utils/auth';

import { 
  loadGroups, 
  saveGroups, 
  loadAllocations, 
  saveAllocations, 
  loadDeviceCategories,
  saveDeviceCategories,
  loadServices,
  saveServices,
  loadDnsRecords,
  saveDnsRecords,
  saveSubDomains
} from './utils/storage';
import { exportToXlsx } from './utils/exportImport';
import { parseCidr } from './utils/ipCalculator';
import { showConfirm, showSuccess } from './utils/swal';

import { HomeView } from './components/HomeView';
import { Login } from './components/Login';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CategoriesView } from './components/CategoriesView';
import { UsersView } from './components/UsersView';
import { IPMatrixGrid } from './components/IPMatrixGrid';
import { IPTable } from './components/IPTable';
import { ServicesView } from './components/ServicesView';
import { BackupView } from './components/BackupView';
import { DnsView } from './components/DnsView';
import { DnsModal } from './components/DnsModal';
import { PrintModal } from './components/PrintModal';
import { GroupModal } from './components/GroupModal';
import { IPAllocationModal } from './components/IPAllocationModal';
import { BatchReserveModal } from './components/BatchReserveModal';
import { PingSimulatorModal } from './components/PingSimulatorModal';

export const App: React.FC = () => {
  // Map pathname to internal tab
  const getTabFromPath = (path: string): NavTab => {
    const clean = path.replace(/\/+$/, '').toLowerCase();
    if (clean === '/admin/ip' || clean === '/admin/groups') return 'groups';
    if (clean === '/admin/dns') return 'dns';
    if (clean === '/admin/services') return 'services';
    if (clean === '/admin/categories') return 'categories';
    if (clean === '/admin/users') return 'users';
    if (clean === '/admin/backup') return 'backup';
    return 'dashboard';
  };

  // Map internal tab to pathname
  const getPathFromTab = (tab: NavTab): string => {
    switch (tab) {
      case 'dashboard': return '/admin';
      case 'groups': return '/admin/ip';
      case 'dns': return '/admin/dns';
      case 'services': return '/admin/services';
      case 'categories': return '/admin/categories';
      case 'users': return '/admin/users';
      case 'backup': return '/admin/backup';
      default: return '/admin';
    }
  };

  // Navigation & UI State initialized from URL
  const initialPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser);
  const [authView, setAuthView] = useState<'home' | 'login'>(initialPath === '/login' ? 'login' : 'home');
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isViewingPublicHome, setIsViewingPublicHome] = useState(initialPath === '/' || initialPath === '');
  const [currentTab, setCurrentTab] = useState<NavTab>(getTabFromPath(initialPath));
  const [isViewingGroupAllocations, setIsViewingGroupAllocations] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync URL address bar based on app state
  const syncBrowserUrl = (newPath: string) => {
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
  };

  // Handle auto-routing rules:
  // 1. If at /login and already logged in, redirect directly to /admin
  useEffect(() => {
    if (currentUser) {
      const path = window.location.pathname.replace(/\/+$/, '') || '/';
      if (path === '/login') {
        setIsViewingPublicHome(false);
        setAuthView('home');
        syncBrowserUrl('/admin');
      }
    }
  }, [currentUser]);

  // Keep URL updated when view/tab/auth changes
  useEffect(() => {
    if (!currentUser) {
      if (authView === 'login') {
        syncBrowserUrl('/login');
      } else {
        syncBrowserUrl('/');
      }
    } else {
      if (isViewingPublicHome) {
        syncBrowserUrl('/');
      } else {
        syncBrowserUrl(getPathFromTab(currentTab));
      }
    }
  }, [currentUser, authView, isViewingPublicHome, currentTab]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/\/+$/, '') || '/';
      if (path === '/login') {
        if (currentUser) {
          setIsViewingPublicHome(false);
          setAuthView('home');
          syncBrowserUrl('/admin');
        } else {
          setAuthView('login');
          setIsViewingPublicHome(false);
        }
      } else if (path === '/' || path === '') {
        if (!currentUser) {
          setAuthView('home');
        } else {
          setIsViewingPublicHome(true);
        }
      } else if (path.startsWith('/admin')) {
        if (!currentUser) {
          setAuthView('login');
          setIsViewingPublicHome(false);
        } else {
          setIsViewingPublicHome(false);
          setAuthView('home');
          setCurrentTab(getTabFromPath(path));
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  // Data State
  const [groups, setGroups] = useState<IPGroup[]>([]);
  const [allocations, setAllocations] = useState<IPAllocation[]>([]);
  const [services, setServices] = useState<IPService[]>([]);
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [subDomains, setSubDomains] = useState<SubDomainRecord[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedServiceIp, setSelectedServiceIp] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('matrix');
  const [subnetListViewMode, setSubnetListViewMode] = useState<'cards' | 'table'>('cards');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(true);

  // Sync from backend server
  useEffect(() => {
    fetchFromServer().then((data: any) => {
      if (data) {
        if (data['netipam_groups_v1']) {
          setGroups(data['netipam_groups_v1']);
          if (data['netipam_groups_v1'].length > 0) {
            setSelectedGroupId(data['netipam_groups_v1'][0].id);
          }
        }
        if (data['netipam_allocations_v1']) setAllocations(data['netipam_allocations_v1']);
        if (data['netipam_services_v1']) setServices(data['netipam_services_v1']);
        if (data['netipam_device_categories_v1']) setCategories(data['netipam_device_categories_v1']);
        if (data['netipam_dns_records_v1']) setDnsRecords(data['netipam_dns_records_v1']);
        if (data['netipam_sub_domains_v1']) setSubDomains(data['netipam_sub_domains_v1']);
        
        const serverUsers: UserAccount[] = data['netipam_users_list_v1'] || [];
        setUsers(serverUsers);
        
        // If no users exist in database, wipe any active session
        if (serverUsers.length === 0) {
          setCurrentUser(null);
          logoutUser();
        } else if (currentUser) {
          // If logged in, verify user still exists in DB
          const currentExists = serverUsers.find(u => u.id === currentUser.id || u.username.toLowerCase() === currentUser.username.toLowerCase());
          if (!currentExists) {
            setCurrentUser(null);
            logoutUser();
          }
        }
      }
      setIsSyncing(false);
    });
  }, []);

  // Magic Link Auto Login
  useEffect(() => {
    if (isSyncing) return; // Wait for backend sync to finish first
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      const cleanToken = token.trim();
      let matchedUser = users.find((u: UserAccount) => u.magicToken && u.magicToken.trim() === cleanToken);

      if (matchedUser) {
        const safeUser: User = {
          id: matchedUser.id,
          username: matchedUser.username,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
          avatar: matchedUser.avatar,
          magicToken: matchedUser.magicToken
        };
        setCurrentUserSession(safeUser);
        setCurrentUser(safeUser);
        setAuthView('home');
        setIsViewingPublicHome(false);
        setCurrentTab('dashboard');
        
        // Ensure URL is updated to /admin and query params are removed
        window.history.replaceState({}, document.title, '/admin');
        
        setTimeout(() => {
          Swal.fire({
            title: 'Berhasil Masuk!',
            text: `Selamat datang, ${matchedUser?.name}. Anda masuk via Token.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }, 100);
      } else {
        Swal.fire({
          title: 'Akses Ditolak',
          text: 'Token login tidak ditemukan di database.',
          icon: 'error',
          confirmButtonText: 'Kembali'
        }).then(() => {
          window.history.replaceState({}, '', window.location.pathname);
          setAuthView('home');
        });
      }
    }
  }, [isSyncing, users]);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('netipam_theme');
    return (saved === 'dark') ? 'dark' : 'light';
  });

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('netipam_theme', theme);
  }, [theme]);


  // Update manifest dynamically: ONLY present manifest tag on /admin/users
  useEffect(() => {
    let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    
    if (currentTab === 'users') {
      if (!link) {
        link = document.createElement('link');
        link.rel = 'manifest';
        document.head.appendChild(link);
      }
      const tokenParam = currentUser?.magicToken ? `?token=${encodeURIComponent(currentUser.magicToken)}` : '';
      link.href = `/manifest.json${tokenParam}`;
    } else {
      // Remove manifest link on other tabs so browser omnibox hides the install button
      if (link) {
        link.remove();
      }
    }
  }, [currentUser?.magicToken, currentTab]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };


  // Modals state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<IPGroup | null>(null);

  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [editingAlloc, setEditingAlloc] = useState<IPAllocation | null>(null);
  const [presetIp, setPresetIp] = useState<string | undefined>(undefined);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);
  const [pingAlloc, setPingAlloc] = useState<IPAllocation | null>(null);

  // DNS Modal state
  const [isDnsModalOpen, setIsDnsModalOpen] = useState(false);
  const [editingDnsRecord, setEditingDnsRecord] = useState<DnsRecord | null>(null);

  // Print Modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState<'allocations' | 'dns' | 'services'>('allocations');


  // Sync with Database via Server API
  useEffect(() => {
    if (!isSyncing) {
      saveGroups(groups);
    }
  }, [groups, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveAllocations(allocations);
    }
  }, [allocations, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveServices(services);
    }
  }, [services, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveDeviceCategories(categories);
    }
  }, [categories, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveDnsRecords(dnsRecords);
    }
  }, [dnsRecords, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveSubDomains(subDomains);
    }
  }, [subDomains, isSyncing]);




  const handleSaveCategory = (cat: DeviceCategory) => {
    setCategories(prev => {
      const exists = prev.some(c => c.id === cat.id);
      if (exists) {
        return prev.map(c => c.id === cat.id ? cat : c);
      }
      return [...prev, cat];
    });
  };

  const handleDeleteCategory = (catId: string) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  // Keep selectedGroupId valid
  useEffect(() => {
    if (groups.length > 0 && (!selectedGroupId || !groups.some(g => g.id === selectedGroupId))) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  const handleSaveUser = async (userData: {
    id?: string;
    username: string;
    name: string;
    email: string;
    password?: string;
    role?: string;
    avatar?: string;
    magicToken?: string;
  }) => {
    if (userData.id) {
      const res = await updateUser(users, userData.id, userData);
      if (res.success && res.updatedUsers) {
        setUsers(res.updatedUsers);
        if (currentUser && currentUser.id === userData.id && res.user) {
          const safeUser: User = {
            id: res.user.id,
            username: res.user.username,
            name: res.user.name,
            email: res.user.email,
            role: res.user.role,
            avatar: res.user.avatar,
            magicToken: res.user.magicToken
          };
          setCurrentUserSession(safeUser);
          setCurrentUser(safeUser);
        }
      }
      return res;
    } else {
      const res = await createUser(users, {
        username: userData.username,
        name: userData.name,
        email: userData.email,
        password: userData.password || '123456',
        avatar: userData.avatar
      });
      if (res.success && res.updatedUsers) {
        setUsers(res.updatedUsers);
      }
      return res;
    }
  };


  const handleDeleteUser = async (userId: string) => {
    const res = await deleteUser(users, userId);
    if (res.success && res.updatedUsers) {
      setUsers(res.updatedUsers);
      if (currentUser && currentUser.id === userId) {
        logoutUser();
        setCurrentUser(null);
        setAuthView('home');
      }
    }
    return res;
  };

  const handleWipeAllData = async () => {
    setGroups([]);
    setAllocations([]);
    setServices([]);
    setCategories([]);
    setDnsRecords([]);
    setSubDomains([]);
    setSelectedGroupId('');
    setSelectedServiceIp(null);
    saveGroups([]);
    saveAllocations([]);
    saveServices([]);
    saveDeviceCategories([]);
    saveDnsRecords([]);
    saveSubDomains([]);
    await wipeAllUsers();
    setUsers([]);
    setCurrentUser(null);
    setAuthView('home');
    setIsViewingPublicHome(false);
  };

  const handleImportData = (data: {
    groups?: IPGroup[];
    allocations?: IPAllocation[];
    categories?: DeviceCategory[];
    users?: UserAccount[];
    services?: IPService[];
    dnsRecords?: DnsRecord[];
    subDomains?: SubDomainRecord[];
  }) => {
    if (data.groups) {
      setGroups(data.groups);
      saveGroups(data.groups);
    }
    if (data.allocations) {
      setAllocations(data.allocations);
      saveAllocations(data.allocations);
    }
    if (data.categories) {
      setCategories(data.categories);
      saveDeviceCategories(data.categories);
    }
    if (data.users && data.users.length > 0) {
      setUsers(data.users);
      saveUsers(data.users);
    }
    if (data.services) {
      setServices(data.services);
      saveServices(data.services);
    }
    if (data.dnsRecords) {
      setDnsRecords(data.dnsRecords);
      saveDnsRecords(data.dnsRecords);
    }
    if (data.subDomains) {
      setSubDomains(data.subDomains);
      saveSubDomains(data.subDomains);
    }
    
    if (data.groups && data.groups.length > 0) {
      setSelectedGroupId(data.groups[0].id);
    }
    
    setAuthView('home');
    setIsViewingPublicHome(false);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setAuthView('home');
    setIsViewingPublicHome(false);
  };


  // If not logged in, render HomeView or Login portal
  if (!currentUser) {
    if (authView === 'login') {
      return (
        <Login 
          users={users}
          hasNoUsers={users.length === 0}
          onLoginSuccess={(user) => {
            setCurrentUserSession(user);
            setCurrentUser(user);
          }}
          onRegisterUser={async (userData) => {
            const res = await createUser(users, {
              username: userData.username,
              name: userData.name,
              email: userData.email,
              password: userData.password
            });
            if (res.success && res.updatedUsers) {
              setUsers(res.updatedUsers);
            }
            return res;
          }}
          onBackToHome={() => setAuthView('home')}
        />
      );
    }
    return (
      <HomeView
        groups={groups}
        allocations={allocations}
        categories={categories}
        dnsRecords={dnsRecords}
        subDomains={subDomains}
        currentUser={null}
        onNavigateToLogin={() => setAuthView('login')}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  // If logged in but clicked "Lihat Halaman Depan"
  if (isViewingPublicHome) {
    return (
      <HomeView
        groups={groups}
        allocations={allocations}
        categories={categories}
        dnsRecords={dnsRecords}
        subDomains={subDomains}
        currentUser={currentUser}
        onNavigateToLogin={() => setIsViewingPublicHome(false)}
        onNavigateToDashboard={() => setIsViewingPublicHome(false)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }


  // Active selected group object for allocations view
  const activeGroup = groups.find(g => g.id === selectedGroupId) || groups[0] || null;

  // Filtered allocations if global search is typed
  const displayedAllocations = globalSearch.trim()
    ? allocations.filter(a => {
        const q = globalSearch.toLowerCase();
        return (
          a.ip.toLowerCase().includes(q) ||
          a.hostname.toLowerCase().includes(q) ||
          a.macAddress?.toLowerCase().includes(q) ||
          a.assignedTo?.toLowerCase().includes(q) ||
          a.department?.toLowerCase().includes(q)
        );
      })
    : allocations;

  // Group Management Handlers
  const handleSaveGroup = (groupData: Partial<IPGroup>) => {
    const now = new Date().toISOString();
    if (groupData.id) {
      setGroups(prev => prev.map(g => g.id === groupData.id ? { ...g, ...groupData, updatedAt: now } as IPGroup : g));
    } else {
      const newGroup: IPGroup = {
        id: `grp-${Date.now()}`,
        name: groupData.name || 'Subnet Baru',
        cidr: groupData.cidr || '192.168.1.0/24',
        gateway: groupData.gateway || '192.168.1.1',
        vlanId: groupData.vlanId,
        description: groupData.description || '',
        location: groupData.location || '',
        pic: groupData.pic || '',
        color: groupData.color || '#2563eb',
        createdAt: now,
        updatedAt: now
      };
      setGroups(prev => [...prev, newGroup]);
      setSelectedGroupId(newGroup.id);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    const groupAllocIps = allocations.filter(a => a.groupId === groupId).map(a => a.ip);
    setGroups(prev => prev.filter(g => g.id !== groupId));
    setAllocations(prev => prev.filter(a => a.groupId !== groupId));
    setServices(prev => prev.filter(s => !groupAllocIps.includes(s.ip)));
  };

  // Allocation Handlers
  const handleSaveAllocation = (allocData: Partial<IPAllocation>) => {
    const fallbackCategory = categories[0]?.id || 'router';
    if (allocData.id) {
      setAllocations(prev => prev.map(a => a.id === allocData.id ? { ...a, ...allocData } as IPAllocation : a));
    } else {
      const newAlloc: IPAllocation = {
        id: `alloc-${Date.now()}`,
        groupId: allocData.groupId || selectedGroupId || groups[0]?.id || '',
        ip: allocData.ip || '',
        hostname: allocData.hostname || 'new-host',
        deviceType: allocData.deviceType || fallbackCategory,
        macAddress: allocData.macAddress || '',
        assignedTo: allocData.assignedTo || '',
        department: allocData.department || '',
        status: allocData.status || 'used',
        assignedDate: allocData.assignedDate || new Date().toISOString().slice(0, 10),
        notes: allocData.notes || ''
      };
      setAllocations(prev => [...prev, newAlloc]);
    }
  };

  const handleDeleteAllocation = (id: string) => {
    const alloc = allocations.find(a => a.id === id);
    setAllocations(prev => prev.filter(a => a.id !== id));
    if (alloc) {
      setServices(prev => prev.filter(s => s.allocationId !== id && s.ip !== alloc.ip));
    }
  };

  // Service Handlers
  const handleSaveService = (serviceData: Partial<IPService>) => {
    const now = new Date().toISOString();
    if (serviceData.id) {
      setServices(prev => prev.map(s => s.id === serviceData.id ? { ...s, ...serviceData, updatedAt: now } as IPService : s));
    } else {
      const newService: IPService = {
        id: `srv-${Date.now()}`,
        allocationId: serviceData.allocationId || '',
        ip: serviceData.ip || '',
        name: serviceData.name || 'Layanan Baru',
        port: serviceData.port || 80,
        protocol: serviceData.protocol || 'TCP',
        category: serviceData.category || 'other',
        status: serviceData.status || 'active',
        version: serviceData.version,
        url: serviceData.url,
        description: serviceData.description,
        createdAt: now,
        updatedAt: now
      };
      setServices(prev => [...prev, newService]);
    }
  };

  const handleDeleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const handleBatchSaveAllocations = (batch: Partial<IPAllocation>[]) => {
    const newItems: IPAllocation[] = batch.map((item, idx) => ({
      id: `alloc-${Date.now()}-${idx}`,
      groupId: item.groupId || selectedGroupId || '',
      ip: item.ip || '',
      hostname: item.hostname || 'dhcp-client',
      deviceType: item.deviceType || 'other',
      macAddress: item.macAddress || '',
      assignedTo: item.assignedTo || 'DHCP Pool',
      department: item.department || 'System',
      status: item.status || 'dhcp',
      assignedDate: item.assignedDate || new Date().toISOString().slice(0, 10),
      notes: item.notes || ''
    }));
    setAllocations(prev => [...prev, ...newItems]);
  };

  const handleUpdatePingStatus = (id: string, status: 'online' | 'offline', latency: number) => {
    setAllocations(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          lastPingStatus: status,
          lastPingLatency: latency
        };
      }
      return a;
    }));
  };

  const totalUsedIps = allocations.filter(a => a.status === 'used').length;

  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'groups': return 'Grup IP (Subnet)';
      case 'dns': return 'Manajemen DNS';
      case 'services': return 'Layanan & Port';
      case 'categories': return 'Kategori Perangkat';
      case 'users': return 'Akun Pengguna';
      case 'backup': return 'Cadangan & Data';
    }
  };


  const handleSelectTab = (tab: NavTab) => {
    if (tab === 'groups') {
      setIsViewingGroupAllocations(false);
    }
    setCurrentTab(tab);
  };

  return (
    <div className={`h-screen w-screen overflow-hidden flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-poppins antialiased selection:bg-blue-600 selection:text-white ${theme === 'dark' ? 'dark' : 'light'}`}>
      
      {/* 1. Left STATIC Dedicated Sidebar (Permanently anchored & pinned) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        totalGroups={groups.length}
        totalUsedIps={totalUsedIps}
        totalDnsRecords={dnsRecords.length}
        totalCategories={categories.length}
        totalUsers={users.length}
        totalServices={services.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Main Work Area with Independent Smooth Scroll */}
      <div className={`flex-1 flex flex-col h-screen overflow-y-auto min-w-0 bg-slate-50 dark:bg-slate-950 print:hidden`}>
        
        {/* Top Header (Sticky) */}
        <Header 
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
          title={getTabTitle(currentTab)}
          onViewHome={() => setIsViewingPublicHome(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          showInstallPwa={currentTab === 'users'}
        />


        {/* Dynamic Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Global Search Results Alert */}
          {globalSearch.trim() && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between text-xs text-blue-900 shadow-xs">
              <div>
                Ditemukan <strong>{displayedAllocations.length}</strong> IP yang cocok dengan kata kunci "<strong>{globalSearch}</strong>".
              </div>
              <button
                onClick={() => setGlobalSearch('')}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Reset Pencarian
              </button>
            </div>
          )}

          {/* TAB 1: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <DashboardView
              groups={groups}
              allocations={allocations}
              categories={categories}
              onNavigateToGroups={() => {
                setIsViewingGroupAllocations(false);
                setCurrentTab('groups');
              }}
              onNavigateToAllocations={(groupId) => {
                if (groupId) setSelectedGroupId(groupId);
                setIsViewingGroupAllocations(true);
                setCurrentTab('groups');
              }}
              onAddGroup={() => {
                setEditingGroup(null);
                setIsGroupModalOpen(true);
              }}
              onAddAllocation={() => {
                setEditingAlloc(null);
                setPresetIp(undefined);
                setIsAllocModalOpen(true);
              }}
            />
          )}

          {/* TAB 2: GRUP IP (SUBNET & VLAN MANAGEMENT DENGAN KELOLA ALOKASI HOST) */}
          {currentTab === 'groups' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {isViewingGroupAllocations && activeGroup ? (
                /* Sub-tampilan: Kelola Alokasi IP Host untuk Subnet Terpilih */
                <div className="space-y-4">
                  {/* Top Bar: Tombol Kembali & Tambah Alokasi */}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => setIsViewingGroupAllocations(false)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-xs transition-all cursor-pointer group"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:hover:text-slate-100" />
                      <span>Kembali</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingAlloc(null);
                        setPresetIp(undefined);
                        setIsAllocModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Alokasikan IP Host</span>
                    </button>
                  </div>

                  {/* Active Group Header Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span 
                            className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs"
                            style={{ backgroundColor: activeGroup.color || '#3b82f6' }}
                          />
                          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                            {activeGroup.name}
                          </h2>
                          {activeGroup.vlanId && (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                              VLAN {activeGroup.vlanId}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-blue-700 font-bold border border-slate-200 dark:border-slate-700">
                            {activeGroup.cidr}
                          </span>
                          <span>•</span>
                          <span>Gateway: <strong className="text-slate-800 dark:text-slate-200 font-mono">{activeGroup.gateway}</strong></span>
                          {activeGroup.location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {activeGroup.location}
                              </span>
                            </>
                          )}
                          {activeGroup.pic && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                {activeGroup.pic}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* View Mode Toggle & XLSX Export */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => setViewMode('matrix')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              viewMode === 'matrix'
                                ? 'bg-white dark:bg-slate-900 text-blue-700 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                            title="Peta Grid Visual Seluruh Host"
                          >
                            <Grid className="w-3.5 h-3.5" />
                            <span>Visual Grid</span>
                          </button>
                          <button
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              viewMode === 'table'
                                ? 'bg-white dark:bg-slate-900 text-blue-700 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                            title="Daftar Tabel Rinci"
                          >
                            <List className="w-3.5 h-3.5" />
                            <span>Tabel Rinci</span>
                          </button>
                        </div>

                        <button
                          onClick={() => exportToXlsx(activeGroup, allocations.filter(a => a.groupId === activeGroup.id), services, categories)}
                          title="Ekspor Laporan Excel (.xlsx)"
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Ekspor (.xlsx)</span>
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* View Content (Matrix vs Table) */}
                  {viewMode === 'matrix' ? (
                    <IPMatrixGrid
                      group={activeGroup}
                      allocations={allocations.filter(a => a.groupId === activeGroup.id)}
                      services={services}
                      categories={categories}
                      onSelectIp={(ip, existingAlloc) => {
                        if (existingAlloc) {
                          setEditingAlloc(existingAlloc);
                          setPresetIp(undefined);
                        } else {
                          setEditingAlloc(null);
                          setPresetIp(ip);
                        }
                        setIsAllocModalOpen(true);
                      }}
                      onPingIp={(alloc) => {
                        setPingAlloc(alloc);
                        setIsPingModalOpen(true);
                      }}
                    />
                  ) : (
                    <IPTable
                      group={activeGroup}
                      allocations={allocations}
                      services={services}
                      categories={categories}
                      onAddAllocation={(initialIp) => {
                        setEditingAlloc(null);
                        setPresetIp(initialIp);
                        setIsAllocModalOpen(true);
                      }}
                      onEditAllocation={(alloc) => {
                        setEditingAlloc(alloc);
                        setPresetIp(undefined);
                        setIsAllocModalOpen(true);
                      }}
                      onDeleteAllocation={handleDeleteAllocation}
                      onBatchReserve={() => setIsBatchModalOpen(true)}
                      onPingAllocation={(alloc) => {
                        setPingAlloc(alloc);
                        setIsPingModalOpen(true);
                      }}
                      onManageServices={(alloc) => {
                        setSelectedGroupId(alloc.groupId);
                        setSelectedServiceIp(alloc.ip);
                        setCurrentTab('services');
                      }}
                      onOpenPrint={() => {
                        setPrintType('allocations');
                        setIsPrintModalOpen(true);
                      }}
                    />
                  )}
                </div>
              ) : (
                /* Sub-tampilan: Daftar Kartu Grup IP */
                <div className="space-y-6">
                  {/* Top Banner */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                        Manajemen Grup IP & Subnet
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Kelola segmen subnet CIDR, VLAN ID, Gateway, dan lokasi infrastruktur jaringan.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => setSubnetListViewMode('cards')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            subnetListViewMode === 'cards'
                              ? 'bg-white dark:bg-slate-900 text-blue-700 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                          title="Tampilan Kartu Subnet"
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                          <span>Kartu</span>
                        </button>
                        <button
                          onClick={() => setSubnetListViewMode('table')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            subnetListViewMode === 'table'
                              ? 'bg-white dark:bg-slate-900 text-blue-700 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                          title="Tampilan Tabel Subnet"
                        >
                          <TableIcon className="w-3.5 h-3.5" />
                          <span>Tabel</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setEditingGroup(null);
                          setIsGroupModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Grup IP Baru</span>
                      </button>
                    </div>
                  </div>

                  {/* Subnet Views: Cards vs Table */}
                  {subnetListViewMode === 'cards' ? (
                    /* Grid of Groups */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {groups.map(grp => {
                        const grpAllocs = allocations.filter(a => a.groupId === grp.id);
                        const used = grpAllocs.filter(a => a.status === 'used').length;
                        const resv = grpAllocs.filter(a => a.status === 'reserved' || a.status === 'dhcp').length;
                        const subnet = parseCidr(grp.cidr);
                        const usable = subnet ? subnet.usableHosts : 254;
                        const pct = usable > 0 ? Math.round(((used + resv) / usable) * 100) : 0;
                        const hasUsedIps = used > 0 || grpAllocs.length > 0;
                        const grpAllocIps = grpAllocs.map(a => a.ip);
                        const grpServicesCount = services.filter(s => grpAllocIps.includes(s.ip)).length;

                        return (
                          <div
                            key={grp.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
                          >
                            <div 
                              className="absolute top-0 left-0 right-0 h-1.5"
                              style={{ backgroundColor: grp.color || '#3b82f6' }}
                            />

                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                                  {grp.name}
                                </h3>
                                {grp.vlanId && (
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex-shrink-0">
                                    VLAN {grp.vlanId}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-mono mb-3">
                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-blue-700 font-bold border border-slate-200 dark:border-slate-700">
                                  {grp.cidr}
                                </span>
                                <span>GW: {grp.gateway}</span>
                              </div>

                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                                {grp.description || 'Tidak ada catatan deskripsi.'}
                              </p>

                              {(grp.location || grp.pic) && (
                                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4 pt-2 border-t border-slate-100">
                                  {grp.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{grp.location}</span>
                                    </span>
                                  )}
                                  {grp.pic && (
                                    <span className="flex items-center gap-1">
                                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{grp.pic}</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-3 border-t border-slate-100 space-y-2.5">
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-slate-500 dark:text-slate-400">Host Terpakai:</span>
                                <span className="text-slate-900 dark:text-slate-100">
                                  <strong className="text-blue-600 font-black">{used}</strong> / {usable} IP ({pct}%)
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedGroupId(grp.id);
                                    setIsViewingGroupAllocations(true);
                                  }}
                                  className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <span>Kelola IP Host</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>

                                {/* Tombol Layanan & Port Subnet */}
                                <button
                                  onClick={() => {
                                    setSelectedGroupId(grp.id);
                                    const firstAlloc = grpAllocs[0];
                                    setSelectedServiceIp(firstAlloc ? firstAlloc.ip : 'all');
                                    setCurrentTab('services');
                                  }}
                                  title={`Kelola Layanan & Port Subnet (${grpServicesCount} layanan terdaftar)`}
                                  className={`p-2 rounded-xl transition-all cursor-pointer relative ${
                                    grpServicesCount > 0
                                      ? 'bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white shadow-2xs'
                                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                                  }`}
                                >
                                  <ServerCog className="w-4 h-4" />
                                  {grpServicesCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center ring-1 ring-white">
                                      {grpServicesCount}
                                    </span>
                                  )}
                                </button>

                                <button
                                  onClick={() => {
                                    setEditingGroup(grp);
                                    setIsGroupModalOpen(true);
                                  }}
                                  title="Edit Grup"
                                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>

                                <button
                                  disabled={hasUsedIps}
                                  onClick={async () => {
                                    if (hasUsedIps) return;
                                    const confirmed = await showConfirm({
                                      title: 'Hapus Grup IP?',
                                      text: `Grup "${grp.name}" (${grp.cidr}) akan dihapus beserta semua alokasi dan layanan terkait.`,
                                      confirmButtonText: 'Ya, Hapus',
                                      cancelButtonText: 'Batal'
                                    });
                                    if (confirmed) {
                                      handleDeleteGroup(grp.id);
                                      showSuccess('Grup berhasil dihapus!');
                                    }
                                  }}
                                  title={
                                    hasUsedIps
                                      ? `Tidak dapat dihapus: masih ada ${used > 0 ? `${used} IP terpakai` : `${grpAllocs.length} data IP`} pada grup ini`
                                      : "Hapus Grup IP"
                                  }
                                  className={`p-2 rounded-xl transition-all ${
                                    hasUsedIps
                                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed border border-slate-200/70'
                                      : 'bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white cursor-pointer'
                                  }`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Table View of Subnets */
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                              <th className="py-3.5 px-4">Nama Subnet / Grup</th>
                              <th className="py-3.5 px-4">Subnet CIDR & Netmask</th>
                              <th className="py-3.5 px-4">Gateway</th>
                              <th className="py-3.5 px-4">VLAN</th>
                              <th className="py-3.5 px-4">Lokasi & PIC</th>
                              <th className="py-3.5 px-4">Host Terpakai</th>
                              <th className="py-3.5 px-4">Layanan Terdaftar</th>
                              <th className="py-3.5 px-4 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 dark:text-slate-300">
                            {groups.map(grp => {
                              const grpAllocs = allocations.filter(a => a.groupId === grp.id);
                              const used = grpAllocs.filter(a => a.status === 'used').length;
                              const resv = grpAllocs.filter(a => a.status === 'reserved' || a.status === 'dhcp').length;
                              const subnet = parseCidr(grp.cidr);
                              const usable = subnet ? subnet.usableHosts : 254;
                              const pct = usable > 0 ? Math.round(((used + resv) / usable) * 100) : 0;
                              const hasUsedIps = used > 0 || grpAllocs.length > 0;
                              const grpAllocIps = grpAllocs.map(a => a.ip);
                              const grpServicesCount = services.filter(s => grpAllocIps.includes(s.ip)).length;

                              return (
                                <tr key={grp.id} className="hover:bg-blue-50/30 transition-colors">
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <span 
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: grp.color || '#3b82f6' }}
                                      />
                                      <div>
                                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{grp.name}</div>
                                        {grp.description && (
                                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{grp.description}</div>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-blue-700 font-bold border border-slate-200 dark:border-slate-700">
                                      {grp.cidr}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-700 dark:text-slate-300">
                                    {grp.gateway}
                                  </td>

                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    {grp.vlanId ? (
                                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                        VLAN {grp.vlanId}
                                      </span>
                                    ) : (
                                      <span className="text-slate-300">-</span>
                                    )}
                                  </td>

                                  <td className="py-3.5 px-4">
                                    <div className="text-slate-800 dark:text-slate-200 font-medium">{grp.location || '-'}</div>
                                    {grp.pic && <div className="text-[11px] text-slate-400">PIC: {grp.pic}</div>}
                                  </td>

                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${pct >= 85 ? 'bg-rose-500' : pct >= 60 ? 'bg-amber-500' : 'bg-blue-600'}`}
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                      <span className="font-semibold text-slate-800 dark:text-slate-200">{used}/{usable} ({pct}%)</span>
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                      grpServicesCount > 0
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                    }`}>
                                      <ServerCog className="w-3 h-3" />
                                      <span>{grpServicesCount} Layanan</span>
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end space-x-1.5">
                                      <button
                                        onClick={() => {
                                          setSelectedGroupId(grp.id);
                                          setIsViewingGroupAllocations(true);
                                        }}
                                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                      >
                                        <span>Kelola Host</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </button>

                                      {/* Tombol Icon Layanan pada Kolom Aksi */}
                                      <button
                                        onClick={() => {
                                          setSelectedGroupId(grp.id);
                                          const firstAlloc = grpAllocs[0];
                                          setSelectedServiceIp(firstAlloc ? firstAlloc.ip : 'all');
                                          setCurrentTab('services');
                                        }}
                                        title={`Kelola Layanan & Port Subnet (${grpServicesCount} layanan terdaftar)`}
                                        className="p-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg transition-all cursor-pointer"
                                      >
                                        <ServerCog className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        onClick={() => {
                                          setEditingGroup(grp);
                                          setIsGroupModalOpen(true);
                                        }}
                                        title="Edit Grup"
                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        disabled={hasUsedIps}
                                        onClick={async () => {
                                          if (hasUsedIps) return;
                                          const confirmed = await showConfirm({
                                            title: 'Hapus Grup IP?',
                                            text: `Grup "${grp.name}" (${grp.cidr}) akan dihapus beserta semua alokasi dan layanan terkait.`,
                                            confirmButtonText: 'Ya, Hapus',
                                            cancelButtonText: 'Batal'
                                          });
                                          if (confirmed) {
                                            handleDeleteGroup(grp.id);
                                            showSuccess('Grup berhasil dihapus!');
                                          }
                                        }}
                                        title={hasUsedIps ? "Tidak dapat dihapus: masih ada IP terpakai" : "Hapus Grup"}
                                        className={`p-1.5 rounded-lg transition-colors ${
                                          hasUsedIps
                                            ? 'text-slate-300 cursor-not-allowed'
                                            : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer'
                                        }`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* TAB: LAYANAN & PORT IP */}
          {currentTab === 'services' && (
            <ServicesView
              services={services}
              allocations={allocations}
              groups={groups}
              categories={categories}
              focusedIp={selectedServiceIp}
              onSelectIp={(ip) => setSelectedServiceIp(ip)}
              onBackToGroups={(targetIp) => {
                const ipToResolve = (targetIp && targetIp !== 'all') 
                  ? targetIp 
                  : (selectedServiceIp && selectedServiceIp !== 'all') 
                  ? selectedServiceIp 
                  : null;

                if (ipToResolve) {
                  const alloc = allocations.find(a => a.ip === ipToResolve);
                  if (alloc) {
                    setSelectedGroupId(alloc.groupId);
                  }
                }
                setIsViewingGroupAllocations(true);
                setCurrentTab('groups');
              }}
              onSaveService={handleSaveService}
              onDeleteService={handleDeleteService}
            />
          )}

          {/* TAB: MANAJEMEN DNS */}
          {currentTab === 'dns' && (
            <DnsView
              dnsRecords={dnsRecords}
              subDomains={subDomains}
              groups={groups}
              allocations={allocations}
              onSaveSubDomains={(records) => setSubDomains(records)}
              onSaveRecord={(recordData) => {
                const now = new Date().toISOString();
                if (recordData.id) {
                  setDnsRecords(prev => prev.map(r => r.id === recordData.id ? { ...r, ...recordData, updatedAt: now } as DnsRecord : r));
                } else {
                  const newRecord: DnsRecord = {
                    id: `dns-${Date.now()}`,
                    domain: recordData.domain || '',
                    type: recordData.type || 'A',
                    value: recordData.value || '',
                    ttl: recordData.ttl || 3600,
                    priority: recordData.priority,
                    groupId: recordData.groupId,
                    status: recordData.status || 'active',
                    description: recordData.description || '',
                    createdAt: now,
                    updatedAt: now
                  };
                  setDnsRecords(prev => [...prev, newRecord]);
                }
              }}
              onDeleteRecord={(id) => {
                setDnsRecords(prev => prev.filter(r => r.id !== id));
              }}
              onOpenAddModal={() => {
                setEditingDnsRecord(null);
                setIsDnsModalOpen(true);
              }}
              onOpenEditModal={(record) => {
                setEditingDnsRecord(record);
                setIsDnsModalOpen(true);
              }}
              onOpenPrintModal={() => {
                setPrintType('dns');
                setIsPrintModalOpen(true);
              }}
            />
          )}

          {/* TAB 3: KATEGORI PERANGKAT */}
          {currentTab === 'categories' && (
            <CategoriesView
              categories={categories}
              allocations={allocations}
              onSaveCategory={handleSaveCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {/* TAB 4: PENGGUNA SISTEM */}
          {currentTab === 'users' && (
            <UsersView
              users={users}
              currentUser={currentUser}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {/* TAB 5: CADANGAN & DATA */}
          {currentTab === 'backup' && (
            <BackupView
              groups={groups}
              allocations={allocations}
              categories={categories}
              users={users}
              services={services}
              dnsRecords={dnsRecords}
              subDomains={subDomains}
              onImportData={handleImportData}
              onWipeAllData={handleWipeAllData}
            />
          )}


        </main>
      </div>

      {/* Modals */}
      {isGroupModalOpen && (
        <GroupModal
          isOpen={isGroupModalOpen}
          onClose={() => {
            setIsGroupModalOpen(false);
            setEditingGroup(null);
          }}
          onSave={handleSaveGroup}
          editGroup={editingGroup}
        />
      )}

      {isAllocModalOpen && activeGroup && (
        <IPAllocationModal
          isOpen={isAllocModalOpen}
          onClose={() => {
            setIsAllocModalOpen(false);
            setEditingAlloc(null);
            setPresetIp(undefined);
          }}
          onSave={handleSaveAllocation}
          group={activeGroup}
          allocations={allocations}
          categories={categories}
          editAllocation={editingAlloc}
          presetIp={presetIp}
        />
      )}

      {isBatchModalOpen && activeGroup && (
        <BatchReserveModal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          onBatchSave={handleBatchSaveAllocations}
          group={activeGroup}
          existingAllocations={allocations}
        />
      )}

      {isPingModalOpen && (
        <PingSimulatorModal
          isOpen={isPingModalOpen}
          onClose={() => {
            setIsPingModalOpen(false);
            setPingAlloc(null);
          }}
          allocation={pingAlloc}
          onUpdateStatus={handleUpdatePingStatus}
        />
      )}

      {isDnsModalOpen && (
        <DnsModal
          isOpen={isDnsModalOpen}
          onClose={() => {
            setIsDnsModalOpen(false);
            setEditingDnsRecord(null);
          }}
          onSave={(recordData) => {
            const now = new Date().toISOString();
            if (recordData.id) {
              setDnsRecords(prev => prev.map(r => r.id === recordData.id ? { ...r, ...recordData, updatedAt: now } as DnsRecord : r));
            } else {
              const newRecord: DnsRecord = {
                id: `dns-${Date.now()}`,
                domain: recordData.domain || '',
                type: recordData.type || 'A',
                value: recordData.value || '',
                ttl: recordData.ttl || 3600,
                priority: recordData.priority,
                groupId: recordData.groupId,
                status: recordData.status || 'active',
                description: recordData.description || '',
                createdAt: now,
                updatedAt: now
              };
              setDnsRecords(prev => [...prev, newRecord]);
            }
            setIsDnsModalOpen(false);
            setEditingDnsRecord(null);
          }}
          editRecord={editingDnsRecord}
          groups={groups}
          allocations={allocations}
        />
      )}



      {isPrintModalOpen && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          type={printType}
          group={activeGroup}
          allocations={activeGroup ? allocations.filter(a => a.groupId === activeGroup.id) : allocations}
          dnsRecords={dnsRecords}
          services={services}
          categories={categories}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
export default App;
