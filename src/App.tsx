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
import { wipeServer } from './utils/api';

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
  saveSubDomains,
  saveElectricityDevices,
  saveElectricityCables,
  saveCctvDevices,
  saveCctvCables,
  saveWaterDevices,
  saveWaterPipes,
  saveLanDevices,
  saveLanCables,
  saveLanLocations,
  saveLanZones,
  INITIAL_ELECTRICITY_DEVICES,
  INITIAL_ELECTRICITY_CABLES,
  INITIAL_CCTV_DEVICES,
  INITIAL_CCTV_CABLES,
  INITIAL_WATER_DEVICES,
  INITIAL_WATER_PIPES,
  INITIAL_LAN_DEVICES,
  INITIAL_LAN_CABLES,
  INITIAL_LAN_LOCATIONS,
  INITIAL_LAN_ZONES
} from './utils/storage';
import { exportToXlsx } from './utils/exportImport';
import { parseCidr } from './utils/ipCalculator';
import { showConfirm, showSuccess } from './utils/swal';
import { 
  ElectricityDevice, 
  ElectricityCableRun,
  CctvDevice, 
  CctvCableRun,
  WaterDevice, 
  WaterPipeRun,
  LanDevice, 
  LanCableRun, 
  LanLocation, 
  LanZone 
} from './types/utilityNetworks';

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
import { ElectricityView } from './components/ElectricityView';
import { ElectricityModal } from './components/ElectricityModal';
import { ElectricityCableModal } from './components/ElectricityCableModal';
import { CctvView } from './components/CctvView';
import { CctvModal } from './components/CctvModal';
import { CctvCableModal } from './components/CctvCableModal';
import { WaterView } from './components/WaterView';
import { WaterModal } from './components/WaterModal';
import { WaterPipeModal } from './components/WaterPipeModal';
import { LanView } from './components/LanView';
import { LanCableModal } from './components/LanCableModal';
import { LanDeviceModal } from './components/LanDeviceModal';
import { LanLocationModal } from './components/LanLocationModal';
import { LanZoneModal } from './components/LanZoneModal';

export const App: React.FC = () => {
  // Map pathname to internal tab
  const getTabFromPath = (path: string): NavTab => {
    const clean = path.replace(/\/+$/, '').toLowerCase();
    if (clean === '/admin/lan') return 'lan';
    if (clean === '/admin/ip' || clean === '/admin/groups') return 'groups';
    if (clean === '/admin/listrik' || clean === '/admin/electricity') return 'electricity';
    if (clean === '/admin/cctv') return 'cctv';
    if (clean === '/admin/air' || clean === '/admin/water') return 'water';
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
      case 'lan': return '/admin/lan';
      case 'groups': return '/admin/ip';
      case 'electricity': return '/admin/listrik';
      case 'cctv': return '/admin/cctv';
      case 'water': return '/admin/air';
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
  const [electricityDevices, setElectricityDevices] = useState<ElectricityDevice[]>([]);
  const [electricityCables, setElectricityCables] = useState<ElectricityCableRun[]>([]);
  const [cctvDevices, setCctvDevices] = useState<CctvDevice[]>([]);
  const [cctvCables, setCctvCables] = useState<CctvCableRun[]>([]);
  const [waterDevices, setWaterDevices] = useState<WaterDevice[]>([]);
  const [waterPipes, setWaterPipes] = useState<WaterPipeRun[]>([]);
  const [lanLocations, setLanLocations] = useState<LanLocation[]>([]);
  const [lanZones, setLanZones] = useState<LanZone[]>([]);
  const [lanDevices, setLanDevices] = useState<LanDevice[]>([]);
  const [lanCables, setLanCables] = useState<LanCableRun[]>([]);
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

        // Sektor LAN (Lokasi/Sekolah, Ruangan/Lab, Fisik & Jalur Kabel)
        if (data['netipam_lan_locations_v1'] && data['netipam_lan_locations_v1'].length > 0) {
          setLanLocations(data['netipam_lan_locations_v1']);
        } else {
          setLanLocations(INITIAL_LAN_LOCATIONS);
          saveLanLocations(INITIAL_LAN_LOCATIONS);
        }

        if (data['netipam_lan_zones_v1'] && data['netipam_lan_zones_v1'].length > 0) {
          setLanZones(data['netipam_lan_zones_v1']);
        } else {
          setLanZones(INITIAL_LAN_ZONES);
          saveLanZones(INITIAL_LAN_ZONES);
        }

        if (data['netipam_lan_devices_v1'] && data['netipam_lan_devices_v1'].length > 0) {
          setLanDevices(data['netipam_lan_devices_v1']);
        } else {
          setLanDevices(INITIAL_LAN_DEVICES);
          saveLanDevices(INITIAL_LAN_DEVICES);
        }

        if (data['netipam_lan_cables_v1'] && data['netipam_lan_cables_v1'].length > 0) {
          setLanCables(data['netipam_lan_cables_v1']);
        } else {
          setLanCables(INITIAL_LAN_CABLES);
          saveLanCables(INITIAL_LAN_CABLES);
        }
        
        // Sektor Listrik, CCTV, AIR
        if (data['netipam_electricity_devices_v1'] && data['netipam_electricity_devices_v1'].length > 0) {
          setElectricityDevices(data['netipam_electricity_devices_v1']);
        } else {
          setElectricityDevices(INITIAL_ELECTRICITY_DEVICES);
          saveElectricityDevices(INITIAL_ELECTRICITY_DEVICES);
        }

        if (data['netipam_electricity_cables_v1'] && data['netipam_electricity_cables_v1'].length > 0) {
          setElectricityCables(data['netipam_electricity_cables_v1']);
        } else {
          setElectricityCables(INITIAL_ELECTRICITY_CABLES);
          saveElectricityCables(INITIAL_ELECTRICITY_CABLES);
        }

        if (data['netipam_cctv_devices_v1'] && data['netipam_cctv_devices_v1'].length > 0) {
          setCctvDevices(data['netipam_cctv_devices_v1']);
        } else {
          setCctvDevices(INITIAL_CCTV_DEVICES);
          saveCctvDevices(INITIAL_CCTV_DEVICES);
        }

        if (data['netipam_cctv_cables_v1'] && data['netipam_cctv_cables_v1'].length > 0) {
          setCctvCables(data['netipam_cctv_cables_v1']);
        } else {
          setCctvCables(INITIAL_CCTV_CABLES);
          saveCctvCables(INITIAL_CCTV_CABLES);
        }

        if (data['netipam_water_devices_v1'] && data['netipam_water_devices_v1'].length > 0) {
          setWaterDevices(data['netipam_water_devices_v1']);
        } else {
          setWaterDevices(INITIAL_WATER_DEVICES);
          saveWaterDevices(INITIAL_WATER_DEVICES);
        }

        if (data['netipam_water_pipes_v1'] && data['netipam_water_pipes_v1'].length > 0) {
          setWaterPipes(data['netipam_water_pipes_v1']);
        } else {
          setWaterPipes(INITIAL_WATER_PIPES);
          saveWaterPipes(INITIAL_WATER_PIPES);
        }
        
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

  // Listrik, CCTV, AIR Modals
  const [isElectricityModalOpen, setIsElectricityModalOpen] = useState(false);
  const [editingElectricityDevice, setEditingElectricityDevice] = useState<ElectricityDevice | null>(null);
  const [electricityDeviceDefaultLocationId, setElectricityDeviceDefaultLocationId] = useState<string | undefined>(undefined);
  const [electricityDeviceDefaultZoneId, setElectricityDeviceDefaultZoneId] = useState<string | undefined>(undefined);

  const [isElectricityCableModalOpen, setIsElectricityCableModalOpen] = useState(false);
  const [editingElectricityCable, setEditingElectricityCable] = useState<ElectricityCableRun | null>(null);
  const [electricityCableDefaultLocationId, setElectricityCableDefaultLocationId] = useState<string | undefined>(undefined);
  const [electricityCableDefaultZoneId, setElectricityCableDefaultZoneId] = useState<string | undefined>(undefined);

  const [isCctvModalOpen, setIsCctvModalOpen] = useState(false);
  const [editingCctvDevice, setEditingCctvDevice] = useState<CctvDevice | null>(null);
  const [cctvDeviceDefaultLocationId, setCctvDeviceDefaultLocationId] = useState<string | undefined>(undefined);
  const [cctvDeviceDefaultZoneId, setCctvDeviceDefaultZoneId] = useState<string | undefined>(undefined);

  const [isCctvCableModalOpen, setIsCctvCableModalOpen] = useState(false);
  const [editingCctvCable, setEditingCctvCable] = useState<CctvCableRun | null>(null);
  const [cctvCableDefaultLocationId, setCctvCableDefaultLocationId] = useState<string | undefined>(undefined);
  const [cctvCableDefaultZoneId, setCctvCableDefaultZoneId] = useState<string | undefined>(undefined);

  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [editingWaterDevice, setEditingWaterDevice] = useState<WaterDevice | null>(null);
  const [waterDeviceDefaultLocationId, setWaterDeviceDefaultLocationId] = useState<string | undefined>(undefined);
  const [waterDeviceDefaultZoneId, setWaterDeviceDefaultZoneId] = useState<string | undefined>(undefined);

  const [isWaterPipeModalOpen, setIsWaterPipeModalOpen] = useState(false);
  const [editingWaterPipe, setEditingWaterPipe] = useState<WaterPipeRun | null>(null);
  const [waterPipeDefaultLocationId, setWaterPipeDefaultLocationId] = useState<string | undefined>(undefined);
  const [waterPipeDefaultZoneId, setWaterPipeDefaultZoneId] = useState<string | undefined>(undefined);

  // LAN Modals (Lokasi Sekolah, Ruangan Lab, Perangkat, Jalur Kabel)
  const [isLanLocationModalOpen, setIsLanLocationModalOpen] = useState(false);
  const [editingLanLocation, setEditingLanLocation] = useState<LanLocation | null>(null);

  const [isLanZoneModalOpen, setIsLanZoneModalOpen] = useState(false);
  const [editingLanZone, setEditingLanZone] = useState<LanZone | null>(null);
  const [lanZoneDefaultLocationId, setLanZoneDefaultLocationId] = useState<string | undefined>(undefined);
  const [lanZoneSystemType, setLanZoneSystemType] = useState<string>('lan');

  const [isLanDeviceModalOpen, setIsLanDeviceModalOpen] = useState(false);
  const [editingLanDevice, setEditingLanDevice] = useState<LanDevice | null>(null);
  const [lanDeviceDefaultLocationId, setLanDeviceDefaultLocationId] = useState<string | undefined>(undefined);
  const [lanDeviceDefaultZoneId, setLanDeviceDefaultZoneId] = useState<string | undefined>(undefined);

  const [isLanCableModalOpen, setIsLanCableModalOpen] = useState(false);
  const [editingLanCable, setEditingLanCable] = useState<LanCableRun | null>(null);
  const [lanCableDefaultLocationId, setLanCableDefaultLocationId] = useState<string | undefined>(undefined);
  const [lanCableDefaultZoneId, setLanCableDefaultZoneId] = useState<string | undefined>(undefined);

  // Print Modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState<'allocations' | 'dns' | 'services' | 'lan_detail' | 'electricity_detail' | 'cctv_detail' | 'water_detail'>('allocations');
  const [printLocation, setPrintLocation] = useState<LanLocation | undefined>(undefined);
  const [printZone, setPrintZone] = useState<LanZone | undefined>(undefined);


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

  useEffect(() => {
    if (!isSyncing) {
      saveElectricityDevices(electricityDevices);
    }
  }, [electricityDevices, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveElectricityCables(electricityCables);
    }
  }, [electricityCables, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveCctvDevices(cctvDevices);
    }
  }, [cctvDevices, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveCctvCables(cctvCables);
    }
  }, [cctvCables, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveWaterDevices(waterDevices);
    }
  }, [waterDevices, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveWaterPipes(waterPipes);
    }
  }, [waterPipes, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveLanLocations(lanLocations);
    }
  }, [lanLocations, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveLanZones(lanZones);
    }
  }, [lanZones, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveLanDevices(lanDevices);
    }
  }, [lanDevices, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveLanCables(lanCables);
    }
  }, [lanCables, isSyncing]);




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
    appName?: string;
    appLogo?: string;
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
            appName: res.user.appName,
            appLogo: res.user.appLogo,
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
    setElectricityDevices([]);
    setElectricityCables([]);
    setCctvDevices([]);
    setCctvCables([]);
    setWaterDevices([]);
    setWaterPipes([]);
    setLanLocations([]);
    setLanZones([]);
    setLanDevices([]);
    setLanCables([]);
    saveElectricityDevices([]);
    saveElectricityCables([]);
    saveCctvDevices([]);
    saveCctvCables([]);
    saveWaterDevices([]);
    saveWaterPipes([]);
    saveLanLocations([]);
    saveLanZones([]);
    saveLanDevices([]);
    saveLanCables([]);
    saveSubDomains([]);
    await wipeServer();
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
    electricityDevices?: ElectricityDevice[];
    electricityCables?: ElectricityCableRun[];
    cctvDevices?: CctvDevice[];
    cctvCables?: CctvCableRun[];
    waterDevices?: WaterDevice[];
    waterPipes?: WaterPipeRun[];
    lanLocations?: LanLocation[];
    lanZones?: LanZone[];
    lanDevices?: LanDevice[];
    lanCables?: LanCableRun[];
  }, isDemo: boolean = false) => {
    if (data.lanLocations) {
      setLanLocations(data.lanLocations);
      saveLanLocations(data.lanLocations);
    }
    if (data.lanZones) {
      setLanZones(data.lanZones);
      saveLanZones(data.lanZones);
    }
    if (data.groups) {
      setGroups(data.groups);
      saveGroups(data.groups);
    }
    if (data.allocations) {
      setAllocations(data.allocations);
      saveAllocations(data.allocations);
    }
    if (data.lanDevices) {
      setLanDevices(data.lanDevices);
      saveLanDevices(data.lanDevices);
    }
    if (data.lanCables) {
      setLanCables(data.lanCables);
      saveLanCables(data.lanCables);
    }
    if (data.electricityDevices) {
      setElectricityDevices(data.electricityDevices);
      saveElectricityDevices(data.electricityDevices);
    }
    if (data.electricityCables) {
      setElectricityCables(data.electricityCables);
      saveElectricityCables(data.electricityCables);
    }
    if (data.cctvDevices) {
      setCctvDevices(data.cctvDevices);
      saveCctvDevices(data.cctvDevices);
    }
    if (data.cctvCables) {
      setCctvCables(data.cctvCables);
      saveCctvCables(data.cctvCables);
    }
    if (data.waterDevices) {
      setWaterDevices(data.waterDevices);
      saveWaterDevices(data.waterDevices);
    }
    if (data.waterPipes) {
      setWaterPipes(data.waterPipes);
      saveWaterPipes(data.waterPipes);
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
    
    // Automatically log out upon data import/restore if not demo
    if (!isDemo) {
      logoutUser();
      setCurrentUser(null);
      setAuthView('login');
      setIsViewingPublicHome(false);
      syncBrowserUrl('/login');
    }
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
        lanDevices={lanDevices}
        lanCables={lanCables}
        electricityDevices={electricityDevices}
        cctvDevices={cctvDevices}
        waterDevices={waterDevices}
        currentUser={null}
        onNavigateToLogin={() => setAuthView('login')}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        appName={users[0]?.appName}
        appLogo={users[0]?.appLogo}
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
        lanDevices={lanDevices}
        lanCables={lanCables}
        electricityDevices={electricityDevices}
        cctvDevices={cctvDevices}
        waterDevices={waterDevices}
        currentUser={currentUser}
        onNavigateToLogin={() => setIsViewingPublicHome(false)}
        onNavigateToDashboard={() => setIsViewingPublicHome(false)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        appName={users[0]?.appName}
        appLogo={users[0]?.appLogo}
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

  const handleSaveElectricityDevice = (devData: Partial<ElectricityDevice>) => {
    const now = new Date().toISOString();
    if (devData.id) {
      setElectricityDevices(prev => prev.map(d => d.id === devData.id ? { ...d, ...devData, updatedAt: now } as ElectricityDevice : d));
    } else {
      const newDev: ElectricityDevice = {
        id: `elec-${Date.now()}`,
        name: devData.name || 'Perangkat Listrik',
        code: devData.code || '',
        type: devData.type || 'panel_sdp',
        brand: devData.brand,
        model: devData.model,
        location: devData.location || '',
        phase: devData.phase || '1_phase',
        voltage: devData.voltage || 220,
        currentAmpere: devData.currentAmpere,
        capacityWatt: devData.capacityWatt,
        currentLoadWatt: devData.currentLoadWatt || 0,
        status: devData.status || 'normal',
        sourcePanelId: devData.sourcePanelId,
        installationDate: devData.installationDate,
        lastMaintenance: devData.lastMaintenance,
        pic: devData.pic,
        notes: devData.notes,
        createdAt: now,
        updatedAt: now
      };
      setElectricityDevices(prev => [...prev, newDev]);
    }
  };

  const handleDeleteElectricityDevice = (id: string) => {
    setElectricityDevices(prev => prev.filter(d => d.id !== id));
  };

  const handleSaveCctvDevice = (devData: Partial<CctvDevice>) => {
    const now = new Date().toISOString();
    if (devData.id) {
      setCctvDevices(prev => prev.map(d => d.id === devData.id ? { ...d, ...devData, updatedAt: now } as CctvDevice : d));
    } else {
      const newDev: CctvDevice = {
        id: `cctv-${Date.now()}`,
        name: devData.name || 'Kamera CCTV',
        type: devData.type || 'camera_ip_bullet',
        ipAddress: devData.ipAddress,
        macAddress: devData.macAddress,
        location: devData.location || '',
        brand: devData.brand,
        model: devData.model,
        resolution: devData.resolution,
        channelNumber: devData.channelNumber,
        nvrId: devData.nvrId,
        poePort: devData.poePort,
        rtspUrl: devData.rtspUrl,
        storageDays: devData.storageDays,
        status: devData.status || 'online',
        installationDate: devData.installationDate,
        pic: devData.pic,
        notes: devData.notes,
        createdAt: now,
        updatedAt: now
      };
      setCctvDevices(prev => [...prev, newDev]);
    }
  };

  const handleDeleteCctvDevice = (id: string) => {
    setCctvDevices(prev => prev.filter(d => d.id !== id));
  };

  const handleSaveWaterDevice = (devData: Partial<WaterDevice>) => {
    const now = new Date().toISOString();
    if (devData.id) {
      setWaterDevices(prev => prev.map(d => d.id === devData.id ? { ...d, ...devData, updatedAt: now } as WaterDevice : d));
    } else {
      const newDev: WaterDevice = {
        id: `water-${Date.now()}`,
        name: devData.name || 'Perangkat Air / Irigasi',
        code: devData.code || '',
        type: devData.type || 'pump_submersible',
        location: devData.location || '',
        pipeDiameter: devData.pipeDiameter,
        flowRateLpm: devData.flowRateLpm,
        pressureBar: devData.pressureBar,
        tankCapacityLiter: devData.tankCapacityLiter,
        currentWaterLevelPct: devData.currentWaterLevelPct,
        powerWatt: devData.powerWatt,
        zoneArea: devData.zoneArea,
        status: devData.status || 'active',
        sourceSupply: devData.sourceSupply,
        installationDate: devData.installationDate,
        pic: devData.pic,
        notes: devData.notes,
        createdAt: now,
        updatedAt: now
      };
      setWaterDevices(prev => [...prev, newDev]);
    }
  };

  const handleDeleteWaterDevice = (id: string) => {
    setWaterDevices(prev => prev.filter(d => d.id !== id));
  };

  // Jalur Kabel Listrik Handlers
  const handleSaveElectricityCable = (cableData: Partial<ElectricityCableRun>) => {
    const now = new Date().toISOString();
    const src = cableData.sourcePoint || cableData.sourceLocation || '';
    const tgt = cableData.targetPoint || cableData.targetLocation || '';
    if (cableData.id) {
      setElectricityCables(prev => prev.map(c => c.id === cableData.id ? { 
        ...c, 
        ...cableData,
        sourcePoint: src,
        targetPoint: tgt,
        sourceLocation: src,
        targetLocation: tgt,
        updatedAt: now 
      } as ElectricityCableRun : c));
    } else {
      const newCable: ElectricityCableRun = {
        id: `elec-cable-${Date.now()}`,
        cableCode: cableData.cableCode || `CBL-${Math.floor(100 + Math.random() * 900)}`,
        cableType: cableData.cableType || 'NYY 4x50mm²',
        coreSpec: cableData.coreSpec,
        sourcePoint: src,
        targetPoint: tgt,
        sourceLocation: src,
        targetLocation: tgt,
        lengthMeter: cableData.lengthMeter || 10,
        voltageVolt: cableData.voltageVolt,
        currentAmpere: cableData.currentAmpere,
        status: cableData.status || 'connected',
        pathwayRoute: cableData.pathwayRoute,
        notes: cableData.notes,
        locationId: cableData.locationId,
        zoneId: cableData.zoneId,
        createdAt: now,
        updatedAt: now
      };
      setElectricityCables(prev => [...prev, newCable]);
    }
  };

  const handleDeleteElectricityCable = (id: string) => {
    setElectricityCables(prev => prev.filter(c => c.id !== id));
  };

  // Jalur Kabel CCTV Handlers
  const handleSaveCctvCable = (cableData: Partial<CctvCableRun>) => {
    const now = new Date().toISOString();
    const src = cableData.sourcePoint || cableData.sourceLocation || '';
    const tgt = cableData.targetPoint || cableData.targetLocation || '';
    if (cableData.id) {
      setCctvCables(prev => prev.map(c => c.id === cableData.id ? { 
        ...c, 
        ...cableData,
        sourcePoint: src,
        targetPoint: tgt,
        sourceLocation: src,
        targetLocation: tgt,
        updatedAt: now 
      } as CctvCableRun : c));
    } else {
      const newCable: CctvCableRun = {
        id: `cctv-cable-${Date.now()}`,
        cableCode: cableData.cableCode || `CBL-CCTV-${Math.floor(100 + Math.random() * 900)}`,
        cableType: cableData.cableType || 'Cat6 UTP (PoE)',
        sourcePoint: src,
        targetPoint: tgt,
        sourceLocation: src,
        targetLocation: tgt,
        lengthMeter: cableData.lengthMeter || 15,
        status: cableData.status || 'connected',
        pathwayRoute: cableData.pathwayRoute,
        notes: cableData.notes,
        locationId: cableData.locationId,
        zoneId: cableData.zoneId,
        createdAt: now,
        updatedAt: now
      };
      setCctvCables(prev => [...prev, newCable]);
    }
  };

  const handleDeleteCctvCable = (id: string) => {
    setCctvCables(prev => prev.filter(c => c.id !== id));
  };

  // Jalur Pipa Air Handlers
  const handleSaveWaterPipe = (pipeData: Partial<WaterPipeRun>) => {
    const now = new Date().toISOString();
    const src = pipeData.sourcePoint || pipeData.sourceLocation || '';
    const tgt = pipeData.targetPoint || pipeData.targetLocation || '';
    if (pipeData.id) {
      setWaterPipes(prev => prev.map(p => p.id === pipeData.id ? { 
        ...p, 
        ...pipeData,
        sourcePoint: src,
        targetPoint: tgt,
        sourceLocation: src,
        targetLocation: tgt,
        updatedAt: now 
      } as WaterPipeRun : p));
    } else {
      const newPipe: WaterPipeRun = {
        id: `water-pipe-${Date.now()}`,
        pipeCode: pipeData.pipeCode || `PIP-AIR-${Math.floor(100 + Math.random() * 900)}`,
        pipeType: pipeData.pipeType || 'PVC AW (Air Bersih)',
        pipeDiameter: pipeData.pipeDiameter || '3/4 inch',
        sourcePoint: src,
        targetPoint: tgt,
        sourceLocation: src,
        targetLocation: tgt,
        lengthMeter: pipeData.lengthMeter || 10,
        pressureBar: pipeData.pressureBar,
        status: pipeData.status || 'active',
        pathwayRoute: pipeData.pathwayRoute,
        notes: pipeData.notes,
        locationId: pipeData.locationId,
        zoneId: pipeData.zoneId,
        createdAt: now,
        updatedAt: now
      };
      setWaterPipes(prev => [...prev, newPipe]);
    }
  };

  const handleDeleteWaterPipe = (id: string) => {
    setWaterPipes(prev => prev.filter(p => p.id !== id));
  };

  // LAN: Lokasi & Sekolah Handlers
  const handleSaveLanLocation = (locData: Partial<LanLocation>) => {
    const now = new Date().toISOString();
    if (locData.id) {
      setLanLocations(prev => prev.map(l => l.id === locData.id ? { ...l, ...locData, updatedAt: now } as LanLocation : l));
    } else {
      const newLoc: LanLocation = {
        id: `loc-${Date.now()}`,
        name: locData.name || 'Lokasi Baru',
        code: locData.code || '',
        address: locData.address,
        pic: locData.pic,
        phone: locData.phone,
        notes: locData.notes,
        createdAt: now,
        updatedAt: now
      };
      setLanLocations(prev => [...prev, newLoc]);
    }
  };

  const handleDeleteLanLocation = (id: string) => {
    setLanLocations(prev => prev.filter(l => l.id !== id));
    // cascade delete zones, devices, cables associated with this location
    setLanZones(prev => prev.filter(z => z.locationId !== id));
    setLanDevices(prev => prev.filter(d => d.locationId !== id));
    setLanCables(prev => prev.filter(c => c.locationId !== id));
  };

  // LAN: Jaringan Ruang / Lab Handlers
  const handleSaveLanZone = (zoneData: Partial<LanZone>) => {
    const now = new Date().toISOString();
    if (zoneData.id) {
      setLanZones(prev => prev.map(z => z.id === zoneData.id ? { ...z, ...zoneData, updatedAt: now } as LanZone : z));
    } else {
      const newZone: LanZone = {
        id: `zone-${Date.now()}`,
        locationId: zoneData.locationId || '',
        name: zoneData.name || 'Jaringan Lab Baru',
        code: zoneData.code || '',
        floor: zoneData.floor,
        roomType: zoneData.roomType,
        pic: zoneData.pic,
        notes: zoneData.notes,
        systemType: zoneData.systemType || lanZoneSystemType,
        createdAt: now,
        updatedAt: now
      };
      setLanZones(prev => [...prev, newZone]);
    }
  };

  const handleDeleteLanZone = (id: string) => {
    setLanZones(prev => prev.filter(z => z.id !== id));
    setLanDevices(prev => prev.filter(d => d.zoneId !== id));
    setLanCables(prev => prev.filter(c => c.zoneId !== id));
  };

  const handleSaveLanDevice = (devData: Partial<LanDevice>) => {
    const now = new Date().toISOString();
    if (devData.id) {
      setLanDevices(prev => prev.map(d => d.id === devData.id ? { ...d, ...devData, updatedAt: now } as LanDevice : d));
    } else {
      const newDev: LanDevice = {
        id: `landev-${Date.now()}`,
        name: devData.name || 'Perangkat LAN',
        code: devData.code || '',
        type: devData.type || 'switch_distribution',
        brand: devData.brand,
        model: devData.model,
        ipAddress: devData.ipAddress,
        macAddress: devData.macAddress,
        locationId: devData.locationId,
        zoneId: devData.zoneId,
        location: devData.location || '',
        rackNumber: devData.rackNumber,
        totalPorts: devData.totalPorts || 24,
        status: devData.status || 'active',
        pic: devData.pic,
        notes: devData.notes,
        createdAt: now,
        updatedAt: now
      };
      setLanDevices(prev => [...prev, newDev]);
    }
  };

  const handleDeleteLanDevice = (id: string) => {
    setLanDevices(prev => prev.filter(d => d.id !== id));
  };

  const handleSaveLanCable = (cableData: Partial<LanCableRun>) => {
    const now = new Date().toISOString();
    if (cableData.id) {
      setLanCables(prev => prev.map(c => c.id === cableData.id ? { ...c, ...cableData, updatedAt: now } as LanCableRun : c));
    } else {
      const newCable: LanCableRun = {
        id: `cable-${Date.now()}`,
        locationId: cableData.locationId,
        zoneId: cableData.zoneId,
        cableCode: cableData.cableCode || `CBL-${Date.now().toString().slice(-4)}`,
        cableType: cableData.cableType || 'cat6_utp',
        sourceDeviceId: cableData.sourceDeviceId,
        sourceDeviceName: cableData.sourceDeviceName || '',
        sourcePort: cableData.sourcePort,
        sourceLocation: cableData.sourceLocation || '',
        targetDeviceId: cableData.targetDeviceId,
        targetDeviceName: cableData.targetDeviceName || '',
        targetPort: cableData.targetPort,
        targetLocation: cableData.targetLocation || '',
        pathwayRoute: cableData.pathwayRoute,
        lengthMeter: cableData.lengthMeter,
        speedMbps: cableData.speedMbps || 1000,
        status: cableData.status || 'connected',
        color: cableData.color || '#3b82f6',
        pic: cableData.pic,
        notes: cableData.notes,
        createdAt: now,
        updatedAt: now
      };
      setLanCables(prev => [...prev, newCable]);
    }
  };

  const handleDeleteLanCable = (id: string) => {
    setLanCables(prev => prev.filter(c => c.id !== id));
  };

  const totalUsedIps = allocations.filter(a => a.status === 'used').length;

  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Infrastruktur';
      case 'lan': return 'Jaringan LAN (Jalur Kabel & Perangkat Fisik)';
      case 'electricity': return 'Jaringan Listrik (Panel & Daya)';
      case 'cctv': return 'Jaringan CCTV (Kamera & Video)';
      case 'water': return 'Jaringan AIR (Irigasi & Pompa)';
      case 'groups': return 'Manajemen Alamat IP (Subnet & CIDR)';
      case 'dns': return 'Manajemen DNS Server';
      case 'services': return 'Layanan & Port IP';
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
        totalLanCables={lanCables.length}
        totalLanDevices={lanDevices.length}
        totalElectricityDevices={electricityDevices.length}
        totalCctvDevices={cctvDevices.length}
        totalWaterDevices={waterDevices.length}
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
              lanDevices={lanDevices}
              lanCables={lanCables}
              electricityDevices={electricityDevices}
              cctvDevices={cctvDevices}
              waterDevices={waterDevices}
              dnsRecords={dnsRecords}
              subDomains={subDomains}
              onNavigateToTab={(tab) => {
                if (tab === 'groups') setIsViewingGroupAllocations(false);
                setCurrentTab(tab);
              }}
            />
          )}

          {/* TAB: JARINGAN LAN (JALUR KABEL & PERANGKAT FISIK) */}
          {currentTab === 'lan' && (
            <LanView
              locations={lanLocations}
              zones={lanZones}
              devices={lanDevices}
              cables={lanCables}
              onSaveLocation={handleSaveLanLocation}
              onDeleteLocation={handleDeleteLanLocation}
              onSaveZone={handleSaveLanZone}
              onDeleteZone={handleDeleteLanZone}
              onSaveDevice={handleSaveLanDevice}
              onDeleteDevice={handleDeleteLanDevice}
              onSaveCable={handleSaveLanCable}
              onDeleteCable={handleDeleteLanCable}
              onOpenAddLocationModal={() => {
                setEditingLanLocation(null);
                setIsLanLocationModalOpen(true);
              }}
              onOpenEditLocationModal={(loc) => {
                setEditingLanLocation(loc);
                setIsLanLocationModalOpen(true);
              }}
              onOpenAddZoneModal={(locId) => {
                setEditingLanZone(null);
                setLanZoneDefaultLocationId(locId);
                setLanZoneSystemType('lan');
                setIsLanZoneModalOpen(true);
              }}
              onOpenEditZoneModal={(zone) => {
                setEditingLanZone(zone);
                setLanZoneDefaultLocationId(zone.locationId);
                setIsLanZoneModalOpen(true);
              }}
              onOpenAddDeviceModal={(locId, zId) => {
                setEditingLanDevice(null);
                setLanDeviceDefaultLocationId(locId);
                setLanDeviceDefaultZoneId(zId);
                setIsLanDeviceModalOpen(true);
              }}
              onOpenEditDeviceModal={(dev) => {
                setEditingLanDevice(dev);
                setLanDeviceDefaultLocationId(dev.locationId);
                setLanDeviceDefaultZoneId(dev.zoneId);
                setIsLanDeviceModalOpen(true);
              }}
              onOpenAddCableModal={(locId, zId) => {
                setEditingLanCable(null);
                setLanCableDefaultLocationId(locId);
                setLanCableDefaultZoneId(zId);
                setIsLanCableModalOpen(true);
              }}
              onOpenEditCableModal={(cable) => {
                setEditingLanCable(cable);
                setLanCableDefaultLocationId(cable.locationId);
                setLanCableDefaultZoneId(cable.zoneId);
                setIsLanCableModalOpen(true);
              }}
              onOpenPrintDetail={(location, zone) => {
                setPrintType('lan_detail');
                setPrintLocation(location);
                setPrintZone(zone);
                setIsPrintModalOpen(true);
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
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/25 transition-all cursor-pointer group"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
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
                    protocol: recordData.protocol || 'http',
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

          {/* TAB: JARINGAN LISTRIK */}
          {currentTab === 'electricity' && (
            <ElectricityView
              locations={lanLocations}
              zones={lanZones}
              devices={electricityDevices}
              cables={electricityCables}
              onSaveLocation={handleSaveLanLocation}
              onDeleteLocation={handleDeleteLanLocation}
              onSaveZone={handleSaveLanZone}
              onDeleteZone={handleDeleteLanZone}
              onSaveDevice={handleSaveElectricityDevice}
              onDeleteDevice={handleDeleteElectricityDevice}
              onSaveCable={handleSaveElectricityCable}
              onDeleteCable={handleDeleteElectricityCable}
              onOpenAddLocationModal={() => {
                setEditingLanLocation(null);
                setIsLanLocationModalOpen(true);
              }}
              onOpenEditLocationModal={(loc) => {
                setEditingLanLocation(loc);
                setIsLanLocationModalOpen(true);
              }}
              onOpenAddZoneModal={(locId) => {
                setEditingLanZone(null);
                setLanZoneDefaultLocationId(locId);
                setLanZoneSystemType('electricity');
                setIsLanZoneModalOpen(true);
              }}
              onOpenEditZoneModal={(zone) => {
                setEditingLanZone(zone);
                setIsLanZoneModalOpen(true);
              }}
              onOpenAddDeviceModal={(locId, zId) => {
                setEditingElectricityDevice(null);
                setElectricityDeviceDefaultLocationId(locId);
                setElectricityDeviceDefaultZoneId(zId);
                setIsElectricityModalOpen(true);
              }}
              onOpenEditDeviceModal={(device) => {
                setEditingElectricityDevice(device);
                setIsElectricityModalOpen(true);
              }}
              onOpenAddCableModal={(locId, zId) => {
                setEditingElectricityCable(null);
                setElectricityCableDefaultLocationId(locId);
                setElectricityCableDefaultZoneId(zId);
                setIsElectricityCableModalOpen(true);
              }}
              onOpenEditCableModal={(cable) => {
                setEditingElectricityCable(cable);
                setIsElectricityCableModalOpen(true);
              }}
              onOpenPrintDetail={(location, zone) => {
                setPrintType('electricity_detail');
                setPrintLocation(location);
                setPrintZone(zone);
                setIsPrintModalOpen(true);
              }}
            />
          )}

          {/* TAB: JARINGAN CCTV */}
          {currentTab === 'cctv' && (
            <CctvView
              locations={lanLocations}
              zones={lanZones}
              devices={cctvDevices}
              cables={cctvCables}
              onSaveLocation={handleSaveLanLocation}
              onDeleteLocation={handleDeleteLanLocation}
              onSaveZone={handleSaveLanZone}
              onDeleteZone={handleDeleteLanZone}
              onSaveDevice={handleSaveCctvDevice}
              onDeleteDevice={handleDeleteCctvDevice}
              onSaveCable={handleSaveCctvCable}
              onDeleteCable={handleDeleteCctvCable}
              onOpenAddLocationModal={() => {
                setEditingLanLocation(null);
                setIsLanLocationModalOpen(true);
              }}
              onOpenEditLocationModal={(loc) => {
                setEditingLanLocation(loc);
                setIsLanLocationModalOpen(true);
              }}
              onOpenAddZoneModal={(locId) => {
                setEditingLanZone(null);
                setLanZoneDefaultLocationId(locId);
                setLanZoneSystemType('cctv');
                setIsLanZoneModalOpen(true);
              }}
              onOpenEditZoneModal={(zone) => {
                setEditingLanZone(zone);
                setIsLanZoneModalOpen(true);
              }}
              onOpenAddDeviceModal={(locId, zId) => {
                setEditingCctvDevice(null);
                setCctvDeviceDefaultLocationId(locId);
                setCctvDeviceDefaultZoneId(zId);
                setIsCctvModalOpen(true);
              }}
              onOpenEditDeviceModal={(device) => {
                setEditingCctvDevice(device);
                setIsCctvModalOpen(true);
              }}
              onOpenAddCableModal={(locId, zId) => {
                setEditingCctvCable(null);
                setCctvCableDefaultLocationId(locId);
                setCctvCableDefaultZoneId(zId);
                setIsCctvCableModalOpen(true);
              }}
              onOpenEditCableModal={(cable) => {
                setEditingCctvCable(cable);
                setIsCctvCableModalOpen(true);
              }}
              onOpenPrintDetail={(location, zone) => {
                setPrintType('cctv_detail');
                setPrintLocation(location);
                setPrintZone(zone);
                setIsPrintModalOpen(true);
              }}
            />
          )}

          {/* TAB: JARINGAN AIR (IRIGASI) */}
          {currentTab === 'water' && (
            <WaterView
              locations={lanLocations}
              zones={lanZones}
              devices={waterDevices}
              pipes={waterPipes}
              onSaveLocation={handleSaveLanLocation}
              onDeleteLocation={handleDeleteLanLocation}
              onSaveZone={handleSaveLanZone}
              onDeleteZone={handleDeleteLanZone}
              onSaveDevice={handleSaveWaterDevice}
              onDeleteDevice={handleDeleteWaterDevice}
              onSavePipe={handleSaveWaterPipe}
              onDeletePipe={handleDeleteWaterPipe}
              onOpenAddLocationModal={() => {
                setEditingLanLocation(null);
                setIsLanLocationModalOpen(true);
              }}
              onOpenEditLocationModal={(loc) => {
                setEditingLanLocation(loc);
                setIsLanLocationModalOpen(true);
              }}
              onOpenAddZoneModal={(locId) => {
                setEditingLanZone(null);
                setLanZoneDefaultLocationId(locId);
                setLanZoneSystemType('water');
                setIsLanZoneModalOpen(true);
              }}
              onOpenEditZoneModal={(zone) => {
                setEditingLanZone(zone);
                setIsLanZoneModalOpen(true);
              }}
              onOpenAddDeviceModal={(locId, zId) => {
                setEditingWaterDevice(null);
                setWaterDeviceDefaultLocationId(locId);
                setWaterDeviceDefaultZoneId(zId);
                setIsWaterModalOpen(true);
              }}
              onOpenEditDeviceModal={(device) => {
                setEditingWaterDevice(device);
                setIsWaterModalOpen(true);
              }}
              onOpenAddPipeModal={(locId, zId) => {
                setEditingWaterPipe(null);
                setWaterPipeDefaultLocationId(locId);
                setWaterPipeDefaultZoneId(zId);
                setIsWaterPipeModalOpen(true);
              }}
              onOpenEditPipeModal={(pipe) => {
                setEditingWaterPipe(pipe);
                setIsWaterPipeModalOpen(true);
              }}
              onOpenPrintDetail={(location, zone) => {
                setPrintType('water_detail');
                setPrintLocation(location);
                setPrintZone(zone);
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
              lanLocations={lanLocations}
              lanZones={lanZones}
              lanDevices={lanDevices}
              lanCables={lanCables}
              electricityDevices={electricityDevices}
              electricityCables={electricityCables}
              cctvDevices={cctvDevices}
              cctvCables={cctvCables}
              waterDevices={waterDevices}
              waterPipes={waterPipes}
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
                protocol: recordData.protocol || 'http',
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



      {isElectricityModalOpen && (
        <ElectricityModal
          isOpen={isElectricityModalOpen}
          onClose={() => {
            setIsElectricityModalOpen(false);
            setEditingElectricityDevice(null);
            setElectricityDeviceDefaultLocationId(undefined);
            setElectricityDeviceDefaultZoneId(undefined);
          }}
          onSave={handleSaveElectricityDevice}
          editDevice={editingElectricityDevice}
          existingDevices={electricityDevices}
          locations={lanLocations}
          zones={lanZones}
          presetLocationId={electricityDeviceDefaultLocationId}
          presetZoneId={electricityDeviceDefaultZoneId}
        />
      )}

      {isElectricityCableModalOpen && (
        <ElectricityCableModal
          isOpen={isElectricityCableModalOpen}
          onClose={() => {
            setIsElectricityCableModalOpen(false);
            setEditingElectricityCable(null);
            setElectricityCableDefaultLocationId(undefined);
            setElectricityCableDefaultZoneId(undefined);
          }}
          onSave={handleSaveElectricityCable}
          editCable={editingElectricityCable}
          locations={lanLocations}
          zones={lanZones}
          electricityDevices={electricityDevices}
          presetLocationId={electricityCableDefaultLocationId}
          presetZoneId={electricityCableDefaultZoneId}
        />
      )}

      {isCctvModalOpen && (
        <CctvModal
          isOpen={isCctvModalOpen}
          onClose={() => {
            setIsCctvModalOpen(false);
            setEditingCctvDevice(null);
            setCctvDeviceDefaultLocationId(undefined);
            setCctvDeviceDefaultZoneId(undefined);
          }}
          onSave={handleSaveCctvDevice}
          editDevice={editingCctvDevice}
          existingNvrList={cctvDevices.filter(d => d.type === 'nvr' || d.type === 'dvr')}
          locations={lanLocations}
          zones={lanZones}
          presetLocationId={cctvDeviceDefaultLocationId}
          presetZoneId={cctvDeviceDefaultZoneId}
        />
      )}

      {isCctvCableModalOpen && (
        <CctvCableModal
          isOpen={isCctvCableModalOpen}
          onClose={() => {
            setIsCctvCableModalOpen(false);
            setEditingCctvCable(null);
            setCctvCableDefaultLocationId(undefined);
            setCctvCableDefaultZoneId(undefined);
          }}
          onSave={handleSaveCctvCable}
          editCable={editingCctvCable}
          locations={lanLocations}
          zones={lanZones}
          cctvDevices={cctvDevices}
          presetLocationId={cctvCableDefaultLocationId}
          presetZoneId={cctvCableDefaultZoneId}
        />
      )}

      {isWaterModalOpen && (
        <WaterModal
          isOpen={isWaterModalOpen}
          onClose={() => {
            setIsWaterModalOpen(false);
            setEditingWaterDevice(null);
            setWaterDeviceDefaultLocationId(undefined);
            setWaterDeviceDefaultZoneId(undefined);
          }}
          onSave={handleSaveWaterDevice}
          editDevice={editingWaterDevice}
          locations={lanLocations}
          zones={lanZones}
          presetLocationId={waterDeviceDefaultLocationId}
          presetZoneId={waterDeviceDefaultZoneId}
        />
      )}

      {isWaterPipeModalOpen && (
        <WaterPipeModal
          isOpen={isWaterPipeModalOpen}
          onClose={() => {
            setIsWaterPipeModalOpen(false);
            setEditingWaterPipe(null);
            setWaterPipeDefaultLocationId(undefined);
            setWaterPipeDefaultZoneId(undefined);
          }}
          onSave={handleSaveWaterPipe}
          editPipe={editingWaterPipe}
          locations={lanLocations}
          zones={lanZones}
          waterDevices={waterDevices}
          presetLocationId={waterPipeDefaultLocationId}
          presetZoneId={waterPipeDefaultZoneId}
        />
      )}

      {isLanLocationModalOpen && (
        <LanLocationModal
          isOpen={isLanLocationModalOpen}
          onClose={() => {
            setIsLanLocationModalOpen(false);
            setEditingLanLocation(null);
          }}
          onSave={handleSaveLanLocation}
          editLocation={editingLanLocation}
        />
      )}

      {isLanZoneModalOpen && (
        <LanZoneModal
          isOpen={isLanZoneModalOpen}
          onClose={() => {
            setIsLanZoneModalOpen(false);
            setEditingLanZone(null);
            setLanZoneDefaultLocationId(undefined);
          }}
          onSave={handleSaveLanZone}
          editZone={editingLanZone}
          locations={lanLocations}
          presetLocationId={lanZoneDefaultLocationId}
        />
      )}

      {isLanDeviceModalOpen && (
        <LanDeviceModal
          isOpen={isLanDeviceModalOpen}
          onClose={() => {
            setIsLanDeviceModalOpen(false);
            setEditingLanDevice(null);
            setLanDeviceDefaultLocationId(undefined);
            setLanDeviceDefaultZoneId(undefined);
          }}
          onSave={handleSaveLanDevice}
          editDevice={editingLanDevice}
          locations={lanLocations}
          zones={lanZones}
          presetLocationId={lanDeviceDefaultLocationId}
          presetZoneId={lanDeviceDefaultZoneId}
        />
      )}

      {isLanCableModalOpen && (
        <LanCableModal
          isOpen={isLanCableModalOpen}
          onClose={() => {
            setIsLanCableModalOpen(false);
            setEditingLanCable(null);
            setLanCableDefaultLocationId(undefined);
            setLanCableDefaultZoneId(undefined);
          }}
          onSave={handleSaveLanCable}
          editCable={editingLanCable}
          devices={lanDevices}
          locations={lanLocations}
          zones={lanZones}
          presetLocationId={lanCableDefaultLocationId}
          presetZoneId={lanCableDefaultZoneId}
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
          currentUser={currentUser || users[0] || null}
          location={printLocation}
          zone={printZone}
          lanDevices={lanDevices}
          lanCables={lanCables}
          electricityDevices={electricityDevices}
          electricityCables={electricityCables}
          cctvDevices={cctvDevices}
          cctvCables={cctvCables}
          waterDevices={waterDevices}
          waterPipes={waterPipes}
        />
      )}
    </div>
  );
};
export default App;
