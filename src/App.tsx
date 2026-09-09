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
  Table as TableIcon,
  Printer,
  Link2,
  BookmarkCheck
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceCategory, IPService, DnsRecord, SubDomainRecord, UrlProtocolItem, DnsRecordTypeItem } from './types/ipam';
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
} from './utils/autentikasi';
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
  saveLanDeviceTypes,
  saveLanRoomTypes,
  saveLanCableTypes,
  saveElectricityDeviceTypes,
  saveElectricityCableTypes,
  saveCctvDeviceTypes,
  saveCctvCableTypes,
  saveWaterDeviceTypes,
  saveWaterPipeTypes,
  saveUrlProtocols,
  saveDnsRecordTypes,
  INITIAL_URL_PROTOCOLS,
  INITIAL_DNS_RECORD_TYPES,
  INITIAL_ELECTRICITY_DEVICES,
  INITIAL_ELECTRICITY_CABLES,
  INITIAL_CCTV_DEVICES,
  INITIAL_CCTV_CABLES,
  INITIAL_WATER_DEVICES,
  INITIAL_WATER_PIPES,
  INITIAL_LAN_DEVICES,
  INITIAL_LAN_CABLES,
  INITIAL_LAN_LOCATIONS,
  INITIAL_LAN_ZONES,
  INITIAL_LAN_DEVICE_TYPES,
  INITIAL_LAN_ROOM_TYPES,
  INITIAL_LAN_CABLE_TYPES,
  INITIAL_ELECTRICITY_DEVICE_TYPES,
  INITIAL_ELECTRICITY_CABLE_TYPES,
  INITIAL_CCTV_DEVICE_TYPES,
  INITIAL_CCTV_CABLE_TYPES,
  INITIAL_WATER_DEVICE_TYPES,
  INITIAL_WATER_PIPE_TYPES
} from './utils/penyimpanan';
import { exportToXlsx } from './utils/eksporImpor';
import { parseCidr } from './utils/kalkulatorIp';
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
  LanZone,
  LanDeviceTypeItem,
  LanRoomTypeItem,
  LanCableTypeItem,
  ElectricityDeviceTypeItem,
  ElectricityCableTypeItem,
  CctvDeviceTypeItem,
  CctvCableTypeItem,
  WaterDeviceTypeItem,
  WaterPipeTypeItem
} from './types/jaringanUtilitas';

import { HomeView } from './components/TampilanBeranda';
import { Login } from './components/Masuk';
import { Sidebar, NavTab } from './components/BilahSisi';
import { Header } from './components/KepalaHalaman';
import { DashboardView } from './components/TampilanDasbor';
import { CategoriesView } from './components/TampilanKategori';
import { UsersView } from './components/TampilanPengguna';
import { IPMatrixGrid } from './components/MatriksGridIP';
import { IPTable } from './components/TabelIP';
import { ServicesView } from './components/TampilanLayanan';
import { BackupView } from './components/TampilanCadangan';
import { DnsView } from './components/TampilanDns';
import { DnsModal } from './components/ModalDns';
import { PrintModal } from './components/ModalCetak';
import { GroupModal } from './components/ModalGrup';
import { IPAllocationModal } from './components/ModalAlokasiIP';
import { BatchReserveModal } from './components/ModalReservasiBatch';
import { PingSimulatorModal } from './components/ModalSimulatorPing';
import { ElectricityView } from './components/TampilanListrik';
import { ElectricityModal } from './components/ModalListrik';
import { ElectricityCableModal } from './components/ModalKabelListrik';
import { CctvView } from './components/TampilanCctv';
import { CctvModal } from './components/ModalCctv';
import { CctvCableModal } from './components/ModalKabelCctv';
import { WaterView } from './components/TampilanAir';
import { WaterModal } from './components/ModalAir';
import { WaterPipeModal } from './components/ModalPipaAir';
import { LanView } from './components/TampilanLan';
import { LanCableModal } from './components/ModalKabelLan';
import { LanDeviceModal } from './components/ModalPerangkatLan';
import { LanLocationModal } from './components/ModalLokasiLan';
import { LanZoneModal } from './components/ModalRuanganLan';
import { LanDeviceTypesView } from './components/TampilanTipePerangkatLan';
import { LanRoomTypesView } from './components/TampilanTipeRuanganLan';
import { MasterTypeView } from './components/TampilanMasterTipe';
import { Zap, Video, Droplets } from 'lucide-react';

export const App: React.FC = () => {
  // Map pathname to internal tab (Bahasa Indonesia dengan dukungan URL sebelumnya)
  const getTabFromPath = (path: string): NavTab => {
    const clean = path.replace(/\/+$/, '').toLowerCase();
    if (clean === '/admin/jaringan-lan' || clean === '/admin/lan') return 'lan';
    if (clean === '/admin/alokasi-ip' || clean === '/admin/ip' || clean === '/admin/groups') return 'groups';
    if (clean === '/admin/jaringan-listrik' || clean === '/admin/listrik' || clean === '/admin/electricity') return 'electricity';
    if (clean === '/admin/jaringan-cctv' || clean === '/admin/cctv') return 'cctv';
    if (clean === '/admin/jaringan-air' || clean === '/admin/air' || clean === '/admin/water') return 'water';
    if (clean === '/admin/rekaman-dns' || clean === '/admin/dns') return 'dns';
    if (clean === '/admin/protokol-url' || clean === '/admin/url-protocols') return 'url_protocols';
    if (clean === '/admin/tipe-record-dns' || clean === '/admin/dns-record-types') return 'dns_record_types';
    if (clean === '/admin/layanan-ip' || clean === '/admin/services') return 'services';
    if (clean === '/admin/kategori-perangkat' || clean === '/admin/kategori' || clean === '/admin/categories') return 'categories';
    if (clean === '/admin/tipe-perangkat-lan' || clean === '/admin/lan-device-types') return 'lan_device_types';
    if (clean === '/admin/jenis-kabel-lan' || clean === '/admin/lan-cable-types') return 'lan_cable_types';
    if (clean === '/admin/tipe-ruangan-lan' || clean === '/admin/tipe-ruangan' || clean === '/admin/lan-room-types') return 'lan_room_types';
    if (clean === '/admin/tipe-perangkat-listrik' || clean === '/admin/electricity-device-types') return 'electricity_device_types';
    if (clean === '/admin/jenis-kabel-listrik' || clean === '/admin/electricity-cable-types') return 'electricity_cable_types';
    if (clean === '/admin/tipe-hardware-cctv' || clean === '/admin/cctv-device-types') return 'cctv_device_types';
    if (clean === '/admin/jenis-kabel-cctv' || clean === '/admin/cctv-cable-types') return 'cctv_cable_types';
    if (clean === '/admin/tipe-alat-air' || clean === '/admin/water-device-types') return 'water_device_types';
    if (clean === '/admin/jenis-pipa-air' || clean === '/admin/water-pipe-types') return 'water_pipe_types';
    if (clean === '/admin/manajemen-pengguna' || clean === '/admin/pengguna' || clean === '/admin/users') return 'users';
    if (clean === '/admin/cadangan-pemulihan' || clean === '/admin/cadangan' || clean === '/admin/backup') return 'backup';
    return 'dashboard';
  };

  // Map internal tab to pathname (URL Bahasa Indonesia)
  const getPathFromTab = (tab: NavTab): string => {
    switch (tab) {
      case 'dashboard': return '/admin/dasbor';
      case 'lan': return '/admin/jaringan-lan';
      case 'groups': return '/admin/alokasi-ip';
      case 'electricity': return '/admin/jaringan-listrik';
      case 'cctv': return '/admin/jaringan-cctv';
      case 'water': return '/admin/jaringan-air';
      case 'dns': return '/admin/rekaman-dns';
      case 'url_protocols': return '/admin/protokol-url';
      case 'dns_record_types': return '/admin/tipe-record-dns';
      case 'services': return '/admin/layanan-ip';
      case 'categories': return '/admin/kategori-perangkat';
      case 'lan_device_types': return '/admin/tipe-perangkat-lan';
      case 'lan_cable_types': return '/admin/jenis-kabel-lan';
      case 'lan_room_types': return '/admin/tipe-ruangan-lan';
      case 'electricity_device_types': return '/admin/tipe-perangkat-listrik';
      case 'electricity_cable_types': return '/admin/jenis-kabel-listrik';
      case 'cctv_device_types': return '/admin/tipe-hardware-cctv';
      case 'cctv_cable_types': return '/admin/jenis-kabel-cctv';
      case 'water_device_types': return '/admin/tipe-alat-air';
      case 'water_pipe_types': return '/admin/jenis-pipa-air';
      case 'users': return '/admin/manajemen-pengguna';
      case 'backup': return '/admin/cadangan-pemulihan';
      default: return '/admin/dasbor';
    }
  };

  // Navigation & UI State initialized from URL
  const initialPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser);
  const [authView, setAuthView] = useState<'home' | 'login'>(initialPath === '/masuk' || initialPath === '/login' ? 'login' : 'home');
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
  // 1. If at /masuk or /login and already logged in, redirect directly to /admin/dasbor
  useEffect(() => {
    if (currentUser) {
      const path = window.location.pathname.replace(/\/+$/, '') || '/';
      if (path === '/masuk' || path === '/login') {
        setIsViewingPublicHome(false);
        setAuthView('home');
        syncBrowserUrl('/admin/dasbor');
      }
    }
  }, [currentUser]);

  // Keep URL updated when view/tab/auth changes
  useEffect(() => {
    if (!currentUser) {
      if (authView === 'login') {
        syncBrowserUrl('/masuk');
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
      if (path === '/masuk' || path === '/login') {
        if (currentUser) {
          setIsViewingPublicHome(false);
          setAuthView('home');
          syncBrowserUrl('/admin/dasbor');
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
  const [urlProtocols, setUrlProtocols] = useState<UrlProtocolItem[]>([]);
  const [dnsRecordTypes, setDnsRecordTypes] = useState<DnsRecordTypeItem[]>([]);
  const [lanLocations, setLanLocations] = useState<LanLocation[]>([]);
  const [lanZones, setLanZones] = useState<LanZone[]>([]);
  const [lanDevices, setLanDevices] = useState<LanDevice[]>([]);
  const [lanCables, setLanCables] = useState<LanCableRun[]>([]);
  const [lanDeviceTypes, setLanDeviceTypes] = useState<LanDeviceTypeItem[]>([]);
  const [lanRoomTypes, setLanRoomTypes] = useState<LanRoomTypeItem[]>([]);
  const [lanCableTypes, setLanCableTypes] = useState<LanCableTypeItem[]>([]);
  const [electricityDeviceTypes, setElectricityDeviceTypes] = useState<ElectricityDeviceTypeItem[]>([]);
  const [electricityCableTypes, setElectricityCableTypes] = useState<ElectricityCableTypeItem[]>([]);
  const [cctvDeviceTypes, setCctvDeviceTypes] = useState<CctvDeviceTypeItem[]>([]);
  const [cctvCableTypes, setCctvCableTypes] = useState<CctvCableTypeItem[]>([]);
  const [waterDeviceTypes, setWaterDeviceTypes] = useState<WaterDeviceTypeItem[]>([]);
  const [waterPipeTypes, setWaterPipeTypes] = useState<WaterPipeTypeItem[]>([]);
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

        const serverUrlProtocols = data['netipam_url_protocols_v1'];
        setUrlProtocols(serverUrlProtocols && serverUrlProtocols.length > 0 ? serverUrlProtocols : (INITIAL_URL_PROTOCOLS || []));

        const serverDnsRecordTypes = data['netipam_dns_record_types_v1'];
        setDnsRecordTypes(serverDnsRecordTypes && serverDnsRecordTypes.length > 0 ? serverDnsRecordTypes : (INITIAL_DNS_RECORD_TYPES || []));

        // Sektor LAN (Lokasi/Sekolah, Ruangan/Lab, Fisik & Jalur Kabel)
        setLanLocations(data['netipam_lan_locations_v1'] || []);
        setLanZones(data['netipam_lan_zones_v1'] || []);
        setLanDevices(data['netipam_lan_devices_v1'] || []);
        setLanCables(data['netipam_lan_cables_v1'] || []);
        
        const serverDeviceTypes = data['netipam_lan_device_types_v1'];
        setLanDeviceTypes(serverDeviceTypes && serverDeviceTypes.length > 0 ? serverDeviceTypes : (INITIAL_LAN_DEVICE_TYPES || []));

        const serverCableTypes = data['netipam_lan_cable_types_v1'];
        setLanCableTypes(serverCableTypes && serverCableTypes.length > 0 ? serverCableTypes : (INITIAL_LAN_CABLE_TYPES || []));

        const serverRoomTypes = data['netipam_lan_room_types_v1'];
        setLanRoomTypes(serverRoomTypes && serverRoomTypes.length > 0 ? serverRoomTypes : (INITIAL_LAN_ROOM_TYPES || []));
        
        // Sektor Listrik, CCTV, AIR
        setElectricityDevices(data['netipam_electricity_devices_v1'] || []);
        setElectricityCables(data['netipam_electricity_cables_v1'] || []);
        setElectricityDeviceTypes(data['netipam_electricity_device_types_v1'] || INITIAL_ELECTRICITY_DEVICE_TYPES || []);
        setElectricityCableTypes(data['netipam_electricity_cable_types_v1'] || INITIAL_ELECTRICITY_CABLE_TYPES || []);

        setCctvDevices(data['netipam_cctv_devices_v1'] || []);
        setCctvCables(data['netipam_cctv_cables_v1'] || []);
        setCctvDeviceTypes(data['netipam_cctv_device_types_v1'] || INITIAL_CCTV_DEVICE_TYPES || []);
        setCctvCableTypes(data['netipam_cctv_cable_types_v1'] || INITIAL_CCTV_CABLE_TYPES || []);

        setWaterDevices(data['netipam_water_devices_v1'] || []);
        setWaterPipes(data['netipam_water_pipes_v1'] || []);
        setWaterDeviceTypes(data['netipam_water_device_types_v1'] || INITIAL_WATER_DEVICE_TYPES || []);
        setWaterPipeTypes(data['netipam_water_pipe_types_v1'] || INITIAL_WATER_PIPE_TYPES || []);
        
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
  const [lanLocationSystemType, setLanLocationSystemType] = useState<string>('lan');

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
  const [printType, setPrintType] = useState<'allocations' | 'dns' | 'sub_domains' | 'services' | 'lan_detail' | 'electricity_detail' | 'cctv_detail' | 'water_detail'>('allocations');
  const [printLocation, setPrintLocation] = useState<LanLocation | undefined>(undefined);
  const [printZone, setPrintZone] = useState<LanZone | undefined>(undefined);
  const [printParentDomain, setPrintParentDomain] = useState<DnsRecord | undefined>(undefined);


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

  useEffect(() => {
    if (!isSyncing) {
      saveLanDeviceTypes(lanDeviceTypes);
    }
  }, [lanDeviceTypes, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveLanRoomTypes(lanRoomTypes);
    }
  }, [lanRoomTypes, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveLanCableTypes(lanCableTypes);
    }
  }, [lanCableTypes, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveElectricityDeviceTypes(electricityDeviceTypes);
    }
  }, [electricityDeviceTypes, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveElectricityCableTypes(electricityCableTypes);
    }
  }, [electricityCableTypes, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveCctvDeviceTypes(cctvDeviceTypes);
    }
  }, [cctvDeviceTypes, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveCctvCableTypes(cctvCableTypes);
    }
  }, [cctvCableTypes, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveWaterDeviceTypes(waterDeviceTypes);
    }
  }, [waterDeviceTypes, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveWaterPipeTypes(waterPipeTypes);
    }
  }, [waterPipeTypes, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveUrlProtocols(urlProtocols);
    }
  }, [urlProtocols, isSyncing]);

  useEffect(() => {
    if (!isSyncing) {
      saveDnsRecordTypes(dnsRecordTypes);
    }
  }, [dnsRecordTypes, isSyncing]);




  const handleSaveCategory = (cat: DeviceCategory) => {
    const isEdit = categories.some(c => c.id === cat.id);
    setCategories(prev => {
      const exists = prev.some(c => c.id === cat.id);
      if (exists) {
        return prev.map(c => c.id === cat.id ? cat : c);
      }
      return [...prev, cat];
    });
    showSuccess(
      isEdit ? 'Kategori Diperbarui' : 'Kategori Disimpan',
      `Kategori "${cat.name}" berhasil ${isEdit ? 'diubah' : 'ditambahkan'}.`
    );
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
        showSuccess('Profil Diperbarui', 'Informasi akun pengguna berhasil diubah.');
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
        showSuccess('Pengguna Disimpan', `Pengguna "${userData.name}" berhasil dibuat.`);
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
    setIsSyncing(true);
    setGroups([]);
    setAllocations([]);
    setServices([]);
    setCategories([]);
    setDnsRecords([]);
    setSubDomains([]);
    setSelectedGroupId('');
    setSelectedServiceIp(null);
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
    setLanDeviceTypes([]);
    setLanCableTypes([]);
    setLanRoomTypes([]);
    setElectricityDeviceTypes([]);
    setElectricityCableTypes([]);
    setCctvDeviceTypes([]);
    setCctvCableTypes([]);
    setWaterDeviceTypes([]);
    setWaterPipeTypes([]);
    setUsers([]);
    setCurrentUser(null);
    
    // Hapus seluruh sesi & storage browser
    logoutUser();
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}

    // Hapus bersih seluruh data di backend SQLite
    await wipeServer();

    setAuthView('login');
    setIsViewingPublicHome(false);
    setIsSyncing(false);
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
    lanDeviceTypes?: any[];
    lanCableTypes?: any[];
    lanRoomTypes?: any[];
    electricityDeviceTypes?: any[];
    electricityCableTypes?: any[];
    cctvDeviceTypes?: any[];
    cctvCableTypes?: any[];
    waterDeviceTypes?: any[];
    waterPipeTypes?: any[];
    urlProtocols?: any[];
    dnsRecordTypes?: any[];
  }, isDemo: boolean = false) => {
    if (data.lanLocations) {
      setLanLocations(data.lanLocations);
      saveLanLocations(data.lanLocations);
    }
    if (data.lanZones) {
      setLanZones(data.lanZones);
      saveLanZones(data.lanZones);
    }
    if (data.lanDeviceTypes) {
      setLanDeviceTypes(data.lanDeviceTypes);
      saveLanDeviceTypes(data.lanDeviceTypes);
    }
    if (data.lanCableTypes) {
      setLanCableTypes(data.lanCableTypes);
      saveLanCableTypes(data.lanCableTypes);
    }
    if (data.lanRoomTypes) {
      setLanRoomTypes(data.lanRoomTypes);
      saveLanRoomTypes(data.lanRoomTypes);
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
    if (data.electricityDeviceTypes) {
      setElectricityDeviceTypes(data.electricityDeviceTypes);
      saveElectricityDeviceTypes(data.electricityDeviceTypes);
    }
    if (data.electricityCables) {
      setElectricityCables(data.electricityCables);
      saveElectricityCables(data.electricityCables);
    }
    if (data.electricityCableTypes) {
      setElectricityCableTypes(data.electricityCableTypes);
      saveElectricityCableTypes(data.electricityCableTypes);
    }
    if (data.cctvDevices) {
      setCctvDevices(data.cctvDevices);
      saveCctvDevices(data.cctvDevices);
    }
    if (data.cctvDeviceTypes) {
      setCctvDeviceTypes(data.cctvDeviceTypes);
      saveCctvDeviceTypes(data.cctvDeviceTypes);
    }
    if (data.cctvCables) {
      setCctvCables(data.cctvCables);
      saveCctvCables(data.cctvCables);
    }
    if (data.cctvCableTypes) {
      setCctvCableTypes(data.cctvCableTypes);
      saveCctvCableTypes(data.cctvCableTypes);
    }
    if (data.waterDevices) {
      setWaterDevices(data.waterDevices);
      saveWaterDevices(data.waterDevices);
    }
    if (data.waterDeviceTypes) {
      setWaterDeviceTypes(data.waterDeviceTypes);
      saveWaterDeviceTypes(data.waterDeviceTypes);
    }
    if (data.waterPipes) {
      setWaterPipes(data.waterPipes);
      saveWaterPipes(data.waterPipes);
    }
    if (data.waterPipeTypes) {
      setWaterPipeTypes(data.waterPipeTypes);
      saveWaterPipeTypes(data.waterPipeTypes);
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
    if (data.urlProtocols) {
      setUrlProtocols(data.urlProtocols);
      saveUrlProtocols(data.urlProtocols);
    }
    if (data.dnsRecordTypes) {
      setDnsRecordTypes(data.dnsRecordTypes);
      saveDnsRecordTypes(data.dnsRecordTypes);
    }
    
    if (data.groups && data.groups.length > 0) {
      setSelectedGroupId(data.groups[0].id);
    }
    
    // If users list was imported, check if current user is still valid; if users were modified or not present, re-authenticate
    if (!isDemo && data.users && data.users.length > 0) {
      const stillExists = currentUser ? data.users.some(u => u.username.toLowerCase() === currentUser.username.toLowerCase()) : false;
      if (!stillExists) {
        logoutUser();
        setCurrentUser(null);
        setAuthView('login');
        setIsViewingPublicHome(false);
        syncBrowserUrl('/masuk');
      }
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
              password: userData.password,
              appName: userData.appName,
              appLogo: userData.appLogo,
              avatar: userData.avatar
            });
            if (res.success && res.updatedUsers) {
              setUsers(res.updatedUsers);
            }
            return res;
          }}
          onImportData={handleImportData}
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
        appName={currentUser?.appName || users[0]?.appName}
        appLogo={currentUser?.appLogo || users[0]?.appLogo}
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
      showSuccess('Subnet Diperbarui', `Subnet "${groupData.name || 'Subnet'}" berhasil diubah.`);
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
      showSuccess('Subnet Disimpan', `Subnet "${newGroup.name}" (${newGroup.cidr}) berhasil ditambahkan.`);
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
      showSuccess('Alokasi IP Diperbarui', `Data IP ${allocData.ip || ''} (${allocData.hostname || ''}) berhasil diubah.`);
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
      showSuccess('Alokasi IP Disimpan', `IP ${newAlloc.ip} (${newAlloc.hostname}) berhasil ditambahkan.`);
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
      showSuccess('Layanan Diperbarui', `Layanan "${serviceData.name || 'Layanan'}" port ${serviceData.port || ''} berhasil diubah.`);
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
      showSuccess('Layanan Disimpan', `Layanan "${newService.name}" (${newService.ip}:${newService.port}) berhasil ditambahkan.`);
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
    showSuccess('Reservasi Batch Berhasil', `${newItems.length} alamat IP berhasil disimpan ke subnet.`);
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
      showSuccess('Perangkat Listrik Diperbarui', `Perangkat "${devData.name || 'Listrik'}" berhasil diubah.`);
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
      showSuccess('Perangkat Listrik Disimpan', `Perangkat "${newDev.name}" berhasil ditambahkan.`);
    }
  };

  const handleDeleteElectricityDevice = (id: string) => {
    setElectricityDevices(prev => prev.filter(d => d.id !== id));
  };

  const handleSaveCctvDevice = (devData: Partial<CctvDevice>) => {
    const now = new Date().toISOString();
    if (devData.id) {
      setCctvDevices(prev => prev.map(d => d.id === devData.id ? { ...d, ...devData, updatedAt: now } as CctvDevice : d));
      showSuccess('Perangkat CCTV Diperbarui', `Perangkat "${devData.name || 'CCTV'}" berhasil diubah.`);
    } else {
      const newDev: CctvDevice = {
        id: `cctv-${Date.now()}`,
        name: devData.name || 'Kamera CCTV',
        code: devData.code || '',
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
      showSuccess('Perangkat CCTV Disimpan', `Perangkat "${newDev.name}" berhasil ditambahkan.`);
    }
  };

  const handleDeleteCctvDevice = (id: string) => {
    setCctvDevices(prev => prev.filter(d => d.id !== id));
  };

  const handleSaveWaterDevice = (devData: Partial<WaterDevice>) => {
    const now = new Date().toISOString();
    if (devData.id) {
      setWaterDevices(prev => prev.map(d => d.id === devData.id ? { ...d, ...devData, updatedAt: now } as WaterDevice : d));
      showSuccess('Perangkat Air Diperbarui', `Perangkat "${devData.name || 'Air'}" berhasil diubah.`);
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
      showSuccess('Perangkat Air Disimpan', `Perangkat "${newDev.name}" berhasil ditambahkan.`);
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
      showSuccess('Kabel Listrik Diperbarui', `Jalur kabel ${cableData.cableCode || ''} berhasil diubah.`);
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
      showSuccess('Kabel Listrik Disimpan', `Jalur kabel ${newCable.cableCode} berhasil ditambahkan.`);
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
      showSuccess('Kabel CCTV Diperbarui', `Jalur kabel ${cableData.cableCode || ''} berhasil diubah.`);
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
      showSuccess('Kabel CCTV Disimpan', `Jalur kabel ${newCable.cableCode} berhasil ditambahkan.`);
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
      showSuccess('Pipa Air Diperbarui', `Jalur pipa ${pipeData.pipeCode || ''} berhasil diubah.`);
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
      showSuccess('Pipa Air Disimpan', `Jalur pipa ${newPipe.pipeCode} berhasil ditambahkan.`);
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
      showSuccess('Lokasi Diperbarui', `Lokasi "${locData.name || 'Lokasi'}" berhasil diubah.`);
    } else {
      const newLoc: LanLocation = {
        id: `loc-${Date.now()}`,
        name: locData.name || 'Lokasi Baru',
        code: locData.code || '',
        address: locData.address,
        pic: locData.pic,
        phone: locData.phone,
        notes: locData.notes,
        systemType: locData.systemType || lanLocationSystemType,
        createdAt: now,
        updatedAt: now
      };
      setLanLocations(prev => [...prev, newLoc]);
      showSuccess('Lokasi Disimpan', `Lokasi "${newLoc.name}" berhasil ditambahkan.`);
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
      showSuccess('Jaringan Lab/Ruang Diperbarui', `Jaringan "${zoneData.name || 'Lab'}" berhasil diubah.`);
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
      showSuccess('Jaringan Lab/Ruang Disimpan', `Jaringan "${newZone.name}" berhasil ditambahkan.`);
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
      showSuccess('Perangkat LAN Diperbarui', `Perangkat "${devData.name || 'LAN'}" berhasil diubah.`);
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
      showSuccess('Perangkat LAN Disimpan', `Perangkat "${newDev.name}" berhasil ditambahkan.`);
    }
  };

  const handleDeleteLanDevice = (id: string) => {
    setLanDevices(prev => prev.filter(d => d.id !== id));
  };

  const handleSaveLanCable = (cableData: Partial<LanCableRun>) => {
    const now = new Date().toISOString();
    if (cableData.id) {
      setLanCables(prev => prev.map(c => c.id === cableData.id ? { ...c, ...cableData, updatedAt: now } as LanCableRun : c));
      showSuccess('Kabel LAN Diperbarui', `Jalur kabel ${cableData.cableCode || ''} berhasil diubah.`);
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
      showSuccess('Kabel LAN Disimpan', `Jalur kabel ${newCable.cableCode} berhasil ditambahkan.`);
    }
  };

  const handleDeleteLanCable = (id: string) => {
    setLanCables(prev => prev.filter(c => c.id !== id));
  };

  const handleSaveLanDeviceType = (typeItem: LanDeviceTypeItem) => {
    const isEdit = lanDeviceTypes.some(t => t.id === typeItem.id);
    setLanDeviceTypes(prev => {
      const exists = prev.some(t => t.id === typeItem.id);
      if (exists) {
        return prev.map(t => t.id === typeItem.id ? typeItem : t);
      }
      return [...prev, typeItem];
    });
    showSuccess(
      isEdit ? 'Tipe Perangkat Diperbarui' : 'Tipe Perangkat Ditambahkan',
      `Tipe "${typeItem.name}" (${typeItem.code}) berhasil disimpan.`
    );
  };

  const handleDeleteLanDeviceType = (id: string) => {
    const target = lanDeviceTypes.find(t => t.id === id);
    setLanDeviceTypes(prev => prev.filter(t => t.id !== id));
    showSuccess('Tipe Perangkat Dihapus', `Tipe "${target?.name || id}" berhasil dihapus.`);
  };

  const handleSaveLanRoomType = (typeItem: LanRoomTypeItem) => {
    const isEdit = lanRoomTypes.some(t => t.id === typeItem.id);
    setLanRoomTypes(prev => {
      const exists = prev.some(t => t.id === typeItem.id);
      if (exists) {
        return prev.map(t => t.id === typeItem.id ? typeItem : t);
      }
      return [...prev, typeItem];
    });
    showSuccess(
      isEdit ? 'Tipe Ruangan Diperbarui' : 'Tipe Ruangan Ditambahkan',
      `Tipe Ruangan "${typeItem.name}" (${typeItem.code}) berhasil disimpan.`
    );
  };

  const handleDeleteLanRoomType = (id: string) => {
    const target = lanRoomTypes.find(t => t.id === id);
    setLanRoomTypes(prev => prev.filter(t => t.id !== id));
    showSuccess('Tipe Ruangan Dihapus', `Tipe Ruangan "${target?.name || id}" berhasil dihapus.`);
  };

  // 1. Master Jenis Kabel LAN
  const handleSaveLanCableType = (typeItem: any) => {
    const isEdit = lanCableTypes.some(t => t.id === typeItem.id);
    setLanCableTypes(prev => {
      const exists = prev.some(t => t.id === typeItem.id);
      return exists ? prev.map(t => t.id === typeItem.id ? typeItem : t) : [...prev, typeItem];
    });
    showSuccess(isEdit ? 'Jenis Kabel LAN Diperbarui' : 'Jenis Kabel LAN Ditambahkan', `Jenis Kabel "${typeItem.name}" berhasil disimpan.`);
  };
  const handleDeleteLanCableType = (id: string) => {
    const target = lanCableTypes.find(t => t.id === id);
    setLanCableTypes(prev => prev.filter(t => t.id !== id));
    showSuccess('Jenis Kabel LAN Dihapus', `Jenis Kabel "${target?.name || id}" berhasil dihapus.`);
  };

  // 2. Master Tipe Perangkat Listrik
  const handleSaveElectricityDeviceType = (typeItem: any) => {
    const isEdit = electricityDeviceTypes.some(t => t.id === typeItem.id);
    setElectricityDeviceTypes(prev => {
      const exists = prev.some(t => t.id === typeItem.id);
      return exists ? prev.map(t => t.id === typeItem.id ? typeItem : t) : [...prev, typeItem];
    });
    showSuccess(isEdit ? 'Tipe Komponen Listrik Diperbarui' : 'Tipe Komponen Listrik Ditambahkan', `Tipe "${typeItem.name}" berhasil disimpan.`);
  };
  const handleDeleteElectricityDeviceType = (id: string) => {
    const target = electricityDeviceTypes.find(t => t.id === id);
    setElectricityDeviceTypes(prev => prev.filter(t => t.id !== id));
    showSuccess('Tipe Komponen Listrik Dihapus', `Tipe "${target?.name || id}" berhasil dihapus.`);
  };

  // 3. Master Jenis Kabel Listrik
  const handleSaveElectricityCableType = (typeItem: any) => {
    const isEdit = electricityCableTypes.some(t => t.id === typeItem.id);
    setElectricityCableTypes(prev => {
      const exists = prev.some(t => t.id === typeItem.id);
      return exists ? prev.map(t => t.id === typeItem.id ? typeItem : t) : [...prev, typeItem];
    });
    showSuccess(isEdit ? 'Jenis Kabel Listrik Diperbarui' : 'Jenis Kabel Listrik Ditambahkan', `Jenis Kabel "${typeItem.name}" berhasil disimpan.`);
  };
  const handleDeleteElectricityCableType = (id: string) => {
    const target = electricityCableTypes.find(t => t.id === id);
    setElectricityCableTypes(prev => prev.filter(t => t.id !== id));
    showSuccess('Jenis Kabel Listrik Dihapus', `Jenis Kabel "${target?.name || id}" berhasil dihapus.`);
  };

  // 4. Master Tipe Hardware CCTV
  const handleSaveCctvDeviceType = (typeItem: any) => {
    const isEdit = cctvDeviceTypes.some(t => t.id === typeItem.id);
    setCctvDeviceTypes(prev => {
      const exists = prev.some(t => t.id === typeItem.id);
      return exists ? prev.map(t => t.id === typeItem.id ? typeItem : t) : [...prev, typeItem];
    });
    showSuccess(isEdit ? 'Tipe Hardware CCTV Diperbarui' : 'Tipe Hardware CCTV Ditambahkan', `Tipe "${typeItem.name}" berhasil disimpan.`);
  };
  const handleDeleteCctvDeviceType = (id: string) => {
    const target = cctvDeviceTypes.find(t => t.id === id);
    setCctvDeviceTypes(prev => prev.filter(t => t.id !== id));
    showSuccess('Tipe Hardware CCTV Dihapus', `Tipe "${target?.name || id}" berhasil dihapus.`);
  };

  // 5. Master Jenis Kabel CCTV
  const handleSaveCctvCableType = (typeItem: any) => {
    const isEdit = cctvCableTypes.some(t => t.id === typeItem.id);
    setCctvCableTypes(prev => {
      const exists = prev.some(t => t.id === typeItem.id);
      return exists ? prev.map(t => t.id === typeItem.id ? typeItem : t) : [...prev, typeItem];
    });
    showSuccess(isEdit ? 'Jenis Kabel CCTV Diperbarui' : 'Jenis Kabel CCTV Ditambahkan', `Jenis Kabel "${typeItem.name}" berhasil disimpan.`);
  };
  const handleDeleteCctvCableType = (id: string) => {
    const target = cctvCableTypes.find(t => t.id === id);
    setCctvCableTypes(prev => prev.filter(t => t.id !== id));
    showSuccess('Jenis Kabel CCTV Dihapus', `Jenis Kabel "${target?.name || id}" berhasil dihapus.`);
  };

  // 6. Master Tipe Alat & Sistem Air
  const handleSaveWaterDeviceType = (typeItem: any) => {
    const isEdit = waterDeviceTypes.some(t => t.id === typeItem.id);
    setWaterDeviceTypes(prev => {
      const exists = prev.some(t => t.id === typeItem.id);
      return exists ? prev.map(t => t.id === typeItem.id ? typeItem : t) : [...prev, typeItem];
    });
    showSuccess(isEdit ? 'Tipe Alat Air Diperbarui' : 'Tipe Alat Air Ditambahkan', `Tipe "${typeItem.name}" berhasil disimpan.`);
  };
  const handleDeleteWaterDeviceType = (id: string) => {
    const target = waterDeviceTypes.find(t => t.id === id);
    setWaterDeviceTypes(prev => prev.filter(t => t.id !== id));
    showSuccess('Tipe Alat Air Dihapus', `Tipe "${target?.name || id}" berhasil dihapus.`);
  };

  // 7. Master Jenis Pipa Air
  const handleSaveWaterPipeType = (typeItem: any) => {
    const isEdit = waterPipeTypes.some(t => t.id === typeItem.id);
    setWaterPipeTypes(prev => {
      const exists = prev.some(t => t.id === typeItem.id);
      return exists ? prev.map(t => t.id === typeItem.id ? typeItem : t) : [...prev, typeItem];
    });
    showSuccess(isEdit ? 'Jenis Pipa Air Diperbarui' : 'Jenis Pipa Air Ditambahkan', `Jenis Pipa "${typeItem.name}" berhasil disimpan.`);
  };
  const handleDeleteWaterPipeType = (id: string) => {
    const target = waterPipeTypes.find(t => t.id === id);
    setWaterPipeTypes(prev => prev.filter(t => t.id !== id));
    showSuccess('Jenis Pipa Air Dihapus', `Jenis Pipa "${target?.name || id}" berhasil dihapus.`);
  };

  // 8. Master Protokol URL
  const handleSaveUrlProtocol = (typeItem: any) => {
    const isEdit = urlProtocols.some(t => t.id === typeItem.id);
    setUrlProtocols(prev => {
      const exists = prev.some(t => t.id === typeItem.id);
      return exists ? prev.map(t => t.id === typeItem.id ? typeItem : t) : [...prev, typeItem];
    });
    showSuccess(isEdit ? 'Protokol URL Diperbarui' : 'Protokol URL Ditambahkan', `Protokol "${typeItem.name}" (${typeItem.code}) berhasil disimpan.`);
  };
  const handleDeleteUrlProtocol = (id: string) => {
    const target = urlProtocols.find(t => t.id === id);
    setUrlProtocols(prev => prev.filter(t => t.id !== id));
    showSuccess('Protokol URL Dihapus', `Protokol "${target?.name || id}" berhasil dihapus.`);
  };

  // 9. Master Tipe Record DNS
  const handleSaveDnsRecordType = (typeItem: any) => {
    const isEdit = dnsRecordTypes.some(t => t.id === typeItem.id);
    setDnsRecordTypes(prev => {
      const exists = prev.some(t => t.id === typeItem.id);
      return exists ? prev.map(t => t.id === typeItem.id ? typeItem : t) : [...prev, typeItem];
    });
    showSuccess(isEdit ? 'Tipe Record DNS Diperbarui' : 'Tipe Record DNS Ditambahkan', `Tipe Record "${typeItem.name}" (${typeItem.code}) berhasil disimpan.`);
  };
  const handleDeleteDnsRecordType = (id: string) => {
    const target = dnsRecordTypes.find(t => t.id === id);
    setDnsRecordTypes(prev => prev.filter(t => t.id !== id));
    showSuccess('Tipe Record DNS Dihapus', `Tipe Record "${target?.name || id}" berhasil dihapus.`);
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
      case 'url_protocols': return 'Master Skema Protokol URL';
      case 'dns_record_types': return 'Master Tipe Record DNS';
      case 'services': return 'Layanan & Port IP';
      case 'categories': return 'Kategori Perangkat';
      case 'lan_device_types': return 'Master Tipe Perangkat LAN';
      case 'lan_cable_types': return 'Master Jenis Kabel LAN';
      case 'lan_room_types': return 'Master Tipe Ruangan LAN';
      case 'electricity_device_types': return 'Master Tipe Komponen Listrik';
      case 'electricity_cable_types': return 'Master Jenis Kabel Listrik';
      case 'cctv_device_types': return 'Master Tipe Hardware CCTV';
      case 'cctv_cable_types': return 'Master Jenis Kabel CCTV';
      case 'water_device_types': return 'Master Tipe Alat & Sistem Air';
      case 'water_pipe_types': return 'Master Jenis Pipa Air';
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
    <div className={`h-dvh w-screen overflow-hidden flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-poppins antialiased selection:bg-blue-600 selection:text-white ${theme === 'dark' ? 'dark' : 'light'}`}>
      
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
        totalLanDeviceTypes={lanDeviceTypes.length}
        totalLanCableTypes={lanCableTypes.length}
        totalLanRoomTypes={lanRoomTypes.length}
        totalElectricityDevices={electricityDevices.length}
        totalElectricityDeviceTypes={electricityDeviceTypes.length}
        totalElectricityCableTypes={electricityCableTypes.length}
        totalCctvDevices={cctvDevices.length}
        totalCctvDeviceTypes={cctvDeviceTypes.length}
        totalCctvCableTypes={cctvCableTypes.length}
        totalWaterDevices={waterDevices.length}
        totalWaterDeviceTypes={waterDeviceTypes.length}
        totalWaterPipeTypes={waterPipeTypes.length}
        totalDnsRecords={dnsRecords.length}
        totalUrlProtocols={urlProtocols.length}
        totalDnsRecordTypes={dnsRecordTypes.length}
        totalCategories={categories.length}
        totalUsers={users.length}
        totalServices={services.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Main Work Area with Independent Smooth Scroll */}
      <div className={`flex-1 flex flex-col h-dvh overflow-y-auto min-w-0 bg-slate-50 dark:bg-slate-950 print:hidden`}>
        
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
              locations={lanLocations.filter(loc => loc.systemType === 'lan' || !loc.systemType)}
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
                setLanLocationSystemType('lan');
                setIsLanLocationModalOpen(true);
              }}
              onOpenEditLocationModal={(loc) => {
                setEditingLanLocation(loc);
                setLanLocationSystemType(loc.systemType || 'lan');
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
                  {/* Top Bar: Tombol Kembali & Cetak Detail */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsViewingGroupAllocations(false)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/25 transition-all cursor-pointer group"
                      >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span>Kembali</span>
                      </button>

                      <button
                        onClick={() => {
                          setPrintType('allocations');
                          setIsPrintModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Cetak Detail</span>
                      </button>
                    </div>

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
                          setPrintType('allocations');
                          setIsPrintModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                        title="Cetak Laporan Seluruh Alokasi IP"
                      >
                        <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Cetak Laporan IP</span>
                      </button>

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
                  showSuccess('Catatan DNS Diperbarui', `Record "${recordData.domain || ''}" berhasil diubah.`);
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
                  showSuccess('Catatan DNS Disimpan', `Record "${newRecord.domain}" (${newRecord.type}) berhasil ditambahkan.`);
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
                setPrintParentDomain(undefined);
                setIsPrintModalOpen(true);
              }}
              onOpenPrintSubDomain={(parent) => {
                setPrintType('sub_domains');
                setPrintParentDomain(parent);
                setIsPrintModalOpen(true);
              }}
              onNavigateTab={handleSelectTab}
            />
          )}

          {/* TAB: PROTOKOL URL */}
          {currentTab === 'url_protocols' && (
            <MasterTypeView
              title="Protokol URL & Skema Layanan"
              subtitle="Kelola master protokol dan skema URL web (HTTP, HTTPS, SSH, FTP, MySQL, Redis, dll)"
              badgeLabel="Skema Protokol"
              addLabel="Tambah Protokol URL"
              icon={Link2}
              themeColor="indigo"
              items={urlProtocols}
              onSaveItem={handleSaveUrlProtocol}
              onDeleteItem={handleDeleteUrlProtocol}
            />
          )}

          {/* TAB: TIPE RECORD DNS */}
          {currentTab === 'dns_record_types' && (
            <MasterTypeView
              title="Tipe Record DNS"
              subtitle="Kelola master tipe rekaman DNS jaringan (A, AAAA, CNAME, PTR, MX, TXT, NS, SRV, SOA, dll)"
              badgeLabel="Tipe Record DNS"
              addLabel="Tambah Tipe Record"
              icon={BookmarkCheck}
              themeColor="indigo"
              items={dnsRecordTypes}
              onSaveItem={handleSaveDnsRecordType}
              onDeleteItem={handleDeleteDnsRecordType}
            />
          )}

          {/* TAB: JARINGAN LISTRIK */}
          {currentTab === 'electricity' && (
            <ElectricityView
              locations={lanLocations.filter(loc => loc.systemType === 'electricity')}
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
                setLanLocationSystemType('electricity');
                setIsLanLocationModalOpen(true);
              }}
              onOpenEditLocationModal={(loc) => {
                setEditingLanLocation(loc);
                setLanLocationSystemType(loc.systemType || 'electricity');
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
              locations={lanLocations.filter(loc => loc.systemType === 'cctv')}
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
                setLanLocationSystemType('cctv');
                setIsLanLocationModalOpen(true);
              }}
              onOpenEditLocationModal={(loc) => {
                setEditingLanLocation(loc);
                setLanLocationSystemType(loc.systemType || 'cctv');
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
              locations={lanLocations.filter(loc => loc.systemType === 'water')}
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
                setLanLocationSystemType('water');
                setIsLanLocationModalOpen(true);
              }}
              onOpenEditLocationModal={(loc) => {
                setEditingLanLocation(loc);
                setLanLocationSystemType(loc.systemType || 'water');
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

          {/* TAB: TIPE PERANGKAT LAN */}
          {currentTab === 'lan_device_types' && (
            <LanDeviceTypesView
              deviceTypes={lanDeviceTypes}
              onSaveDeviceType={handleSaveLanDeviceType}
              onDeleteDeviceType={handleDeleteLanDeviceType}
            />
          )}

          {/* TAB: JENIS KABEL LAN */}
          {currentTab === 'lan_cable_types' && (
            <MasterTypeView
              title="Jenis Kabel LAN"
              subtitle="Kelola master jenis kabel jaringan lokal (UTP Cat5e, Cat6, Fiber Optic, dll)"
              badgeLabel="Kabel Jaringan"
              addLabel="Tambah Jenis Kabel LAN"
              icon={Network}
              themeColor="blue"
              items={lanCableTypes}
              onSaveItem={handleSaveLanCableType}
              onDeleteItem={handleDeleteLanCableType}
            />
          )}

          {/* TAB: TIPE RUANGAN */}
          {currentTab === 'lan_room_types' && (
            <LanRoomTypesView
              roomTypes={lanRoomTypes}
              onSaveRoomType={handleSaveLanRoomType}
              onDeleteRoomType={handleDeleteLanRoomType}
            />
          )}

          {/* TAB: TIPE PERANGKAT LISTRIK */}
          {currentTab === 'electricity_device_types' && (
            <MasterTypeView
              title="Tipe Komponen / Perangkat Listrik"
              subtitle="Kelola master jenis perangkat kelistrikan (MDP, SDP, Trafo, Genset, UPS, MCB, dll)"
              badgeLabel="Komponen Listrik"
              addLabel="Tambah Tipe Komponen"
              icon={Zap}
              themeColor="amber"
              items={electricityDeviceTypes}
              onSaveItem={handleSaveElectricityDeviceType}
              onDeleteItem={handleDeleteElectricityDeviceType}
            />
          )}

          {/* TAB: JENIS KABEL LISTRIK */}
          {currentTab === 'electricity_cable_types' && (
            <MasterTypeView
              title="Jenis Kabel Listrik"
              subtitle="Kelola master tipe kabel kelistrikan & transmisi daya (NYY, NYM, NYAF, Power Cord, dll)"
              badgeLabel="Kabel Kelistrikan"
              addLabel="Tambah Jenis Kabel Listrik"
              icon={Zap}
              themeColor="amber"
              items={electricityCableTypes}
              onSaveItem={handleSaveElectricityCableType}
              onDeleteItem={handleDeleteElectricityCableType}
            />
          )}

          {/* TAB: TIPE HARDWARE CCTV */}
          {currentTab === 'cctv_device_types' && (
            <MasterTypeView
              title="Tipe Hardware CCTV"
              subtitle="Kelola master tipe perangkat kamera & perekam (IP Camera Dome, Bullet, PTZ, NVR, PoE Switch, dll)"
              badgeLabel="Hardware CCTV"
              addLabel="Tambah Tipe Hardware"
              icon={Video}
              themeColor="rose"
              items={cctvDeviceTypes}
              onSaveItem={handleSaveCctvDeviceType}
              onDeleteItem={handleDeleteCctvDeviceType}
            />
          )}

          {/* TAB: JENIS KABEL CCTV */}
          {currentTab === 'cctv_cable_types' && (
            <MasterTypeView
              title="Jenis Kabel CCTV"
              subtitle="Kelola master jenis kabel transmisi video kamera (Cat6 UTP, RG59 Coaxial, Fiber Optic, dll)"
              badgeLabel="Kabel Kamera"
              addLabel="Tambah Jenis Kabel CCTV"
              icon={Video}
              themeColor="rose"
              items={cctvCableTypes}
              onSaveItem={handleSaveCctvCableType}
              onDeleteItem={handleDeleteCctvCableType}
            />
          )}

          {/* TAB: TIPE ALAT & SISTEM AIR */}
          {currentTab === 'water_device_types' && (
            <MasterTypeView
              title="Tipe Alat & Sistem Air"
              subtitle="Kelola master perangkat sistem distribusi air (Pompa Submersible, Booster, Toren, Flow Meter, dll)"
              badgeLabel="Alat Distribusi Air"
              addLabel="Tambah Tipe Alat Air"
              icon={Droplets}
              themeColor="cyan"
              items={waterDeviceTypes}
              onSaveItem={handleSaveWaterDeviceType}
              onDeleteItem={handleDeleteWaterDeviceType}
            />
          )}

          {/* TAB: JENIS PIPA AIR */}
          {currentTab === 'water_pipe_types' && (
            <MasterTypeView
              title="Jenis Pipa Air & Irigasi"
              subtitle="Kelola master spesifikasi pipa distribusi air (PVC AW, HDPE, Galvanis, Selang Drip, dll)"
              badgeLabel="Pipa Distribusi"
              addLabel="Tambah Jenis Pipa Air"
              icon={Droplets}
              themeColor="cyan"
              items={waterPipeTypes}
              onSaveItem={handleSaveWaterPipeType}
              onDeleteItem={handleDeleteWaterPipeType}
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
              lanDeviceTypes={lanDeviceTypes}
              lanCableTypes={lanCableTypes}
              lanRoomTypes={lanRoomTypes}
              electricityDeviceTypes={electricityDeviceTypes}
              electricityCableTypes={electricityCableTypes}
              cctvDeviceTypes={cctvDeviceTypes}
              cctvCableTypes={cctvCableTypes}
              waterDeviceTypes={waterDeviceTypes}
              waterPipeTypes={waterPipeTypes}
              urlProtocols={urlProtocols}
              dnsRecordTypes={dnsRecordTypes}
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
              showSuccess('Catatan DNS Diperbarui', `Record "${recordData.domain || ''}" berhasil diubah.`);
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
              showSuccess('Catatan DNS Disimpan', `Record "${newRecord.domain}" (${newRecord.type}) berhasil ditambahkan.`);
            }
            setIsDnsModalOpen(false);
            setEditingDnsRecord(null);
          }}
          editRecord={editingDnsRecord}
          groups={groups}
          allocations={allocations}
          urlProtocols={urlProtocols}
          dnsRecordTypes={dnsRecordTypes}
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
          locations={lanLocations.filter(loc => loc.systemType === 'electricity')}
          zones={lanZones}
          deviceTypes={electricityDeviceTypes}
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
          locations={lanLocations.filter(loc => loc.systemType === 'electricity')}
          zones={lanZones}
          electricityDevices={electricityDevices}
          cableTypes={electricityCableTypes}
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
          locations={lanLocations.filter(loc => loc.systemType === 'cctv')}
          zones={lanZones}
          deviceTypes={cctvDeviceTypes}
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
          locations={lanLocations.filter(loc => loc.systemType === 'cctv')}
          zones={lanZones}
          cctvDevices={cctvDevices}
          cableTypes={cctvCableTypes}
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
          locations={lanLocations.filter(loc => loc.systemType === 'water')}
          zones={lanZones}
          deviceTypes={waterDeviceTypes}
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
          locations={lanLocations.filter(loc => loc.systemType === 'water')}
          zones={lanZones}
          waterDevices={waterDevices}
          pipeTypes={waterPipeTypes}
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
          systemType={lanLocationSystemType}
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
          locations={lanLocations.filter(loc => loc.systemType === 'lan' || !loc.systemType)}
          roomTypes={lanRoomTypes}
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
          locations={lanLocations.filter(loc => loc.systemType === 'lan' || !loc.systemType)}
          zones={lanZones}
          deviceTypes={lanDeviceTypes}
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
          locations={lanLocations.filter(loc => loc.systemType === 'lan' || !loc.systemType)}
          zones={lanZones}
          cableTypes={lanCableTypes}
          presetLocationId={lanCableDefaultLocationId}
          presetZoneId={lanCableDefaultZoneId}
        />
      )}

      {isPrintModalOpen && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          type={printType}
          group={isViewingGroupAllocations ? activeGroup : undefined}
          groups={groups}
          allocations={isViewingGroupAllocations && activeGroup ? allocations.filter(a => a.groupId === activeGroup.id) : allocations}
          dnsRecords={dnsRecords}
          subDomains={printParentDomain ? subDomains.filter(s => s.parentDomainId === printParentDomain.id) : subDomains}
          parentDomain={printParentDomain}
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
