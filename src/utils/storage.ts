import { IPGroup, IPAllocation, DeviceCategory } from '../types/ipam';

const STORAGE_KEYS = {
  GROUPS: 'netipam_groups_v1',
  ALLOCATIONS: 'netipam_allocations_v1',
  DEVICE_CATEGORIES: 'netipam_device_categories_v1'
};

export const INITIAL_GROUPS: IPGroup[] = [
  {
    id: 'grp-lan-office',
    name: 'LAN Kantor Pusat Lt. 1',
    cidr: '192.168.10.0/24',
    gateway: '192.168.10.1',
    vlanId: 10,
    description: 'Jaringan workstation karyawan, printer jaringan, dan AP kantor lantai 1.',
    location: 'Gedung A, Lantai 1',
    pic: 'Rian IT Support',
    color: '#2563eb', // blue
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-03-01T10:30:00Z'
  },
  {
    id: 'grp-server-dmz',
    name: 'Server Farm & DMZ Data Center',
    cidr: '10.10.20.0/24',
    gateway: '10.10.20.1',
    vlanId: 20,
    description: 'Segmen server produksi database, web backend, load balancer, dan NAS backup.',
    location: 'Ruang Server DC Lt. 2',
    pic: 'Arya System Administrator',
    color: '#7c3aed', // purple
    createdAt: '2026-01-12T09:00:00Z',
    updatedAt: '2026-03-02T11:00:00Z'
  },
  {
    id: 'grp-cctv-iot',
    name: 'CCTV & IoT Security System',
    cidr: '172.16.50.0/24',
    gateway: '172.16.50.1',
    vlanId: 50,
    description: 'Segmen terisolasi untuk IP Camera Hikvision, NVR Recorder, dan Access Door Fingerprint.',
    location: 'Seluruh Area Gedung & Perimeter',
    pic: 'Bambang Security & Network',
    color: '#059669', // emerald
    createdAt: '2026-01-15T14:20:00Z',
    updatedAt: '2026-02-28T16:00:00Z'
  },
  {
    id: 'grp-mgmt-infra',
    name: 'Management Network Out-of-Band',
    cidr: '192.168.100.0/28',
    gateway: '192.168.100.1',
    vlanId: 99,
    description: 'Dedicated subnet untuk iLO, iDRAC server management, dan console switch.',
    location: 'Rack Server 1-3',
    pic: 'Arya System Administrator',
    color: '#d97706', // amber
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-15T12:00:00Z'
  }
];

export const INITIAL_ALLOCATIONS: IPAllocation[] = [
  // LAN Kantor
  {
    id: 'alloc-1',
    groupId: 'grp-lan-office',
    ip: '192.168.10.1',
    hostname: 'rtr-gw-office-01',
    deviceType: 'router',
    macAddress: 'CC:2D:E0:1A:3B:4C',
    assignedTo: 'Infrastruktur Jaringan',
    department: 'IT Network',
    status: 'used',
    assignedDate: '2026-01-10',
    notes: 'Mikrotik CCR1009 Gateway Utama Lantai 1',
    lastPingStatus: 'online',
    lastPingLatency: 1.2
  },
  {
    id: 'alloc-2',
    groupId: 'grp-lan-office',
    ip: '192.168.10.2',
    hostname: 'sw-core-cisco-3850',
    deviceType: 'switch',
    macAddress: '00:1E:F7:8C:9D:12',
    assignedTo: 'Infrastruktur Jaringan',
    department: 'IT Network',
    status: 'used',
    assignedDate: '2026-01-10',
    notes: 'Cisco Catalyst 3850 PoE Core Switch',
    lastPingStatus: 'online',
    lastPingLatency: 0.8
  },
  {
    id: 'alloc-3',
    groupId: 'grp-lan-office',
    ip: '192.168.10.5',
    hostname: 'ap-ubiquiti-lobby',
    deviceType: 'access_point',
    macAddress: '74:83:C2:55:6A:7B',
    assignedTo: 'Fasilitas Kantor',
    department: 'General Affairs',
    status: 'used',
    assignedDate: '2026-01-15',
    notes: 'UniFi U6-Pro Access Point Area Resepsionis & Tamu',
    lastPingStatus: 'online',
    lastPingLatency: 3.4
  },
  {
    id: 'alloc-4',
    groupId: 'grp-lan-office',
    ip: '192.168.10.6',
    hostname: 'ap-ubiquiti-meeting-rm',
    deviceType: 'access_point',
    macAddress: '74:83:C2:55:6A:8C',
    assignedTo: 'Fasilitas Kantor',
    department: 'General Affairs',
    status: 'used',
    assignedDate: '2026-01-15',
    notes: 'UniFi U6-Pro Ruang Rapat Utama Lt. 1',
    lastPingStatus: 'online',
    lastPingLatency: 2.9
  },
  {
    id: 'alloc-5',
    groupId: 'grp-lan-office',
    ip: '192.168.10.10',
    hostname: 'prn-finance-hp-m404',
    deviceType: 'printer',
    macAddress: '3C:52:82:11:22:33',
    assignedTo: 'Siti Rahma',
    department: 'Finance & Accounting',
    status: 'used',
    assignedDate: '2026-01-18',
    notes: 'HP LaserJet Pro M404dn Departemen Keuangan',
    lastPingStatus: 'online',
    lastPingLatency: 4.1
  },
  {
    id: 'alloc-6',
    groupId: 'grp-lan-office',
    ip: '192.168.10.20',
    hostname: 'pc-budi-santoso',
    deviceType: 'pc_workstation',
    macAddress: 'B4:2E:99:A1:02:5F',
    assignedTo: 'Budi Santoso',
    department: 'Finance',
    status: 'used',
    assignedDate: '2026-01-20',
    notes: 'Dell OptiPlex 7090 Desktop Staff',
    lastPingStatus: 'online',
    lastPingLatency: 1.5
  },
  {
    id: 'alloc-7',
    groupId: 'grp-lan-office',
    ip: '192.168.10.21',
    hostname: 'pc-ratna-accounting',
    deviceType: 'pc_workstation',
    macAddress: 'B4:2E:99:B2:44:8C',
    assignedTo: 'Ratna Dewi',
    department: 'Accounting',
    status: 'used',
    assignedDate: '2026-01-20',
    notes: 'HP ProDesk 400 G7',
    lastPingStatus: 'online',
    lastPingLatency: 1.8
  },
  {
    id: 'alloc-8',
    groupId: 'grp-lan-office',
    ip: '192.168.10.25',
    hostname: 'pc-vip-direktur-keuangan',
    deviceType: 'pc_workstation',
    macAddress: 'F0:18:98:C3:D4:E5',
    assignedTo: 'Ir. Hendra',
    department: 'Direksi',
    status: 'reserved',
    assignedDate: '2026-02-01',
    notes: 'Dicadangkan untuk perangkat Direktur Keuangan',
    lastPingStatus: 'offline'
  },
  // DHCP range reservations
  {
    id: 'alloc-dhcp-1',
    groupId: 'grp-lan-office',
    ip: '192.168.10.100',
    hostname: 'dhcp-pool-start',
    deviceType: 'other',
    macAddress: '',
    assignedTo: 'DHCP Router Pool',
    department: 'System',
    status: 'dhcp',
    assignedDate: '2026-01-10',
    notes: 'Awal alokasi otomatis DHCP Client (100 - 150)'
  },
  {
    id: 'alloc-dhcp-2',
    groupId: 'grp-lan-office',
    ip: '192.168.10.150',
    hostname: 'dhcp-pool-end',
    deviceType: 'other',
    macAddress: '',
    assignedTo: 'DHCP Router Pool',
    department: 'System',
    status: 'dhcp',
    assignedDate: '2026-01-10',
    notes: 'Batas akhir alokasi otomatis DHCP Client'
  },

  // Server Farm DMZ
  {
    id: 'alloc-srv-1',
    groupId: 'grp-server-dmz',
    ip: '10.10.20.1',
    hostname: 'fw-fortigate-100f',
    deviceType: 'gateway',
    macAddress: '04:D5:90:3A:88:99',
    assignedTo: 'Network Security',
    department: 'IT Infrastructure',
    status: 'used',
    assignedDate: '2026-01-12',
    notes: 'FortiGate 100F Next-Gen Firewall Gateway',
    lastPingStatus: 'online',
    lastPingLatency: 0.5
  },
  {
    id: 'alloc-srv-2',
    groupId: 'grp-server-dmz',
    ip: '10.10.20.10',
    hostname: 'srv-db-prod-master',
    deviceType: 'server',
    macAddress: '48:DF:37:A1:BC:CD',
    assignedTo: 'Database Team',
    department: 'IT Engineering',
    status: 'used',
    assignedDate: '2026-01-12',
    notes: 'PostgreSQL 16 High-Availability Master DB',
    lastPingStatus: 'online',
    lastPingLatency: 0.3
  },
  {
    id: 'alloc-srv-3',
    groupId: 'grp-server-dmz',
    ip: '10.10.20.11',
    hostname: 'srv-db-prod-replica',
    deviceType: 'server',
    macAddress: '48:DF:37:A1:BC:CE',
    assignedTo: 'Database Team',
    department: 'IT Engineering',
    status: 'used',
    assignedDate: '2026-01-12',
    notes: 'PostgreSQL 16 Standby Read-Replica',
    lastPingStatus: 'online',
    lastPingLatency: 0.4
  },
  {
    id: 'alloc-srv-4',
    groupId: 'grp-server-dmz',
    ip: '10.10.20.20',
    hostname: 'srv-web-nginx-prod01',
    deviceType: 'server',
    macAddress: '52:54:00:12:34:56',
    assignedTo: 'DevOps Team',
    department: 'IT Engineering',
    status: 'used',
    assignedDate: '2026-01-15',
    notes: 'Load Balancer Nginx Node 01',
    lastPingStatus: 'online',
    lastPingLatency: 0.6
  },
  {
    id: 'alloc-srv-5',
    groupId: 'grp-server-dmz',
    ip: '10.10.20.50',
    hostname: 'nas-truenas-backup',
    deviceType: 'server',
    macAddress: '00:25:90:9A:8B:7C',
    assignedTo: 'Storage Admin',
    department: 'IT Infrastructure',
    status: 'used',
    assignedDate: '2026-01-20',
    notes: 'TrueNAS 40TB ZFS Storage Backup Nightly',
    lastPingStatus: 'online',
    lastPingLatency: 0.9
  },

  // CCTV Subnet
  {
    id: 'alloc-cctv-1',
    groupId: 'grp-cctv-iot',
    ip: '172.16.50.1',
    hostname: 'gw-cctv-mikrotik',
    deviceType: 'router',
    macAddress: '6C:3B:6B:44:55:66',
    assignedTo: 'Security Admin',
    department: 'Security',
    status: 'used',
    assignedDate: '2026-01-15',
    notes: 'Gateway Subnet CCTV',
    lastPingStatus: 'online',
    lastPingLatency: 1.1
  },
  {
    id: 'alloc-cctv-2',
    groupId: 'grp-cctv-iot',
    ip: '172.16.50.10',
    hostname: 'nvr-hikvision-32ch',
    deviceType: 'cctv',
    macAddress: 'A4:14:37:11:99:88',
    assignedTo: 'Security Admin',
    department: 'Security',
    status: 'used',
    assignedDate: '2026-01-15',
    notes: 'NVR Utama Penyimpan Rekaman 30 Hari',
    lastPingStatus: 'online',
    lastPingLatency: 2.0
  },
  {
    id: 'alloc-cctv-3',
    groupId: 'grp-cctv-iot',
    ip: '172.16.50.11',
    hostname: 'cam-gerbang-depan-ptz',
    deviceType: 'cctv',
    macAddress: 'A4:14:37:22:33:44',
    assignedTo: 'Pos Satpam',
    department: 'Security',
    status: 'used',
    assignedDate: '2026-01-16',
    notes: 'Kamera Speed Dome PTZ Gerbang Masuk',
    lastPingStatus: 'online',
    lastPingLatency: 2.4
  },
  {
    id: 'alloc-cctv-4',
    groupId: 'grp-cctv-iot',
    ip: '172.16.50.12',
    hostname: 'cam-lobby-indoor',
    deviceType: 'cctv',
    macAddress: 'A4:14:37:22:33:45',
    assignedTo: 'Pos Satpam',
    department: 'Security',
    status: 'used',
    assignedDate: '2026-01-16',
    notes: 'Kamera Dome 4MP Lobby Depan',
    lastPingStatus: 'online',
    lastPingLatency: 1.9
  }
];

export function loadGroups(): IPGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (!raw) {
      saveGroups(INITIAL_GROUPS);
      return INITIAL_GROUPS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading groups:', err);
    return INITIAL_GROUPS;
  }
}

export function saveGroups(groups: IPGroup[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  } catch (err) {
    console.error('Error saving groups:', err);
  }
}

export function loadAllocations(): IPAllocation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALLOCATIONS);
    if (!raw) {
      saveAllocations(INITIAL_ALLOCATIONS);
      return INITIAL_ALLOCATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading allocations:', err);
    return INITIAL_ALLOCATIONS;
  }
}

export function saveAllocations(allocations: IPAllocation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify(allocations));
  } catch (err) {
    console.error('Error saving allocations:', err);
  }
}

export const DEFAULT_DEVICE_CATEGORIES: DeviceCategory[] = [
  { id: 'server', name: 'Server / Host VM', icon: 'Server', description: 'Server fisik, virtual machine, datacenter' },
  { id: 'router', name: 'Router & Gateway', icon: 'Router', description: 'Router core, edge router, mikrotik, cisco' },
  { id: 'switch', name: 'Switch Jaringan', icon: 'Network', description: 'Manageable switch L2/L3, distribusi' },
  { id: 'access_point', name: 'Access Point (Wi-Fi)', icon: 'Wifi', description: 'Wireless AP indoor / outdoor' },
  { id: 'pc_workstation', name: 'PC Workstation & Laptop', icon: 'Monitor', description: 'Komputer kerja karyawan & staf' },
  { id: 'cctv', name: 'Kamera CCTV & NVR', icon: 'Video', description: 'IP camera keamanan dan perekam NVR' },
  { id: 'printer', name: 'Printer & Scanner', icon: 'Printer', description: 'Printer jaringan & multifungsi' },
  { id: 'smartphone', name: 'Smartphone & Tablet', icon: 'Smartphone', description: 'Perangkat mobile pengguna' },
  { id: 'iot', name: 'Perangkat IoT & Sensor', icon: 'Cpu', description: 'Mesin absensi, smart display, sensor' },
  { id: 'other', name: 'Perangkat Lainnya', icon: 'HardDrive', description: 'Perangkat pendukung lainnya' }
];

export function loadDeviceCategories(): DeviceCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEVICE_CATEGORIES);
    if (!raw) {
      saveDeviceCategories(DEFAULT_DEVICE_CATEGORIES);
      return DEFAULT_DEVICE_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading device categories:', err);
    return DEFAULT_DEVICE_CATEGORIES;
  }
}

export function saveDeviceCategories(categories: DeviceCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEVICE_CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Error saving device categories:', err);
  }
}

export function resetDemoData(): { groups: IPGroup[]; allocations: IPAllocation[]; categories: DeviceCategory[] } {
  saveGroups(INITIAL_GROUPS);
  saveAllocations(INITIAL_ALLOCATIONS);
  saveDeviceCategories(DEFAULT_DEVICE_CATEGORIES);
  return { groups: INITIAL_GROUPS, allocations: INITIAL_ALLOCATIONS, categories: DEFAULT_DEVICE_CATEGORIES };
}
