import { syncToServer } from './api';
import { IPGroup, IPAllocation, DeviceCategory, IPService, DnsRecord, SubDomainRecord } from '../types/ipam';

const STORAGE_KEYS = {
  GROUPS: 'netipam_groups_v1',
  ALLOCATIONS: 'netipam_allocations_v1',
  DEVICE_CATEGORIES: 'netipam_device_categories_v1',
  SERVICES: 'netipam_services_v1',
  DNS_RECORDS: 'netipam_dns_records_v1'
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
    deviceType: 'router',
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
  return [];
}

export function saveGroups(groups: IPGroup[]): void {
  syncToServer(STORAGE_KEYS.GROUPS, groups);
}

export function loadAllocations(): IPAllocation[] {
  return [];
}

export function saveAllocations(allocations: IPAllocation[]): void {
  syncToServer(STORAGE_KEYS.ALLOCATIONS, allocations);
}

export const DEFAULT_DEVICE_CATEGORIES: DeviceCategory[] = [
  { id: 'server', name: 'Server / Host VM', icon: 'Server', description: 'Server fisik, virtual machine, datacenter' },
  { id: 'router', name: 'Router & Gateway', icon: 'Router', description: 'Router core, edge router, mikrotik, cisco' },
  { id: 'switch', name: 'Switch Jaringan', icon: 'Network', description: 'Manageable switch L2/L3, distribusi' },
  { id: 'access_point', name: 'Access Point (Wi-Fi)', icon: 'Wifi', description: 'Wireless AP indoor / outdoor' },
  { id: 'pc_workstation', name: 'PC Workstation & Laptop', icon: 'Monitor', description: 'Komputer kerja karyawan & staf' },
  { id: 'cctv', name: 'Kamera CCTV & NVR', icon: 'Cctv', description: 'IP camera keamanan dan perekam NVR' },
  { id: 'printer', name: 'Printer & Scanner', icon: 'Printer', description: 'Printer jaringan & multifungsi' },
  { id: 'smartphone', name: 'Smartphone & Tablet', icon: 'Smartphone', description: 'Perangkat mobile pengguna' },
  { id: 'iot', name: 'Perangkat IoT & Sensor', icon: 'Cpu', description: 'Mesin absensi, smart display, sensor' },
  { id: 'other', name: 'Perangkat Lainnya', icon: 'HardDrive', description: 'Perangkat pendukung lainnya' }
];

export function loadDeviceCategories(): DeviceCategory[] {
  return [];
}

export function saveDeviceCategories(categories: DeviceCategory[]): void {
  syncToServer(STORAGE_KEYS.DEVICE_CATEGORIES, categories);
}

export const INITIAL_SERVICES: IPService[] = [
  // 192.168.10.1 (Mikrotik Router Gateway)
  {
    id: 'srv-1',
    allocationId: 'alloc-1',
    ip: '192.168.10.1',
    name: 'Mikrotik Winbox GUI',
    port: 8291,
    protocol: 'TCP',
    category: 'network',
    status: 'active',
    version: 'RouterOS v7.12',
    description: 'Manajemen graphical user interface router utama',
    checkStatus: 'open',
    checkLatency: 1.2,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'srv-2',
    allocationId: 'alloc-1',
    ip: '192.168.10.1',
    name: 'WebFig HTTP Admin',
    port: 80,
    protocol: 'TCP',
    category: 'web',
    status: 'active',
    url: 'http://192.168.10.1',
    description: 'Web console administrator Mikrotik',
    checkStatus: 'open',
    checkLatency: 1.4,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'srv-3',
    allocationId: 'alloc-1',
    ip: '192.168.10.1',
    name: 'SSH RouterOS',
    port: 22,
    protocol: 'TCP',
    category: 'remote',
    status: 'active',
    description: 'Remote CLI console Mikrotik via SSH',
    checkStatus: 'open',
    checkLatency: 1.1,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'srv-4',
    allocationId: 'alloc-1',
    ip: '192.168.10.1',
    name: 'Local DNS Cache',
    port: 53,
    protocol: 'UDP',
    category: 'network',
    status: 'active',
    description: 'DNS Resolver lokal kantor lantai 1',
    checkStatus: 'open',
    checkLatency: 0.9,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z'
  },

  // 192.168.10.2 (Cisco Switch)
  {
    id: 'srv-5',
    allocationId: 'alloc-2',
    ip: '192.168.10.2',
    name: 'SSH Switch Console',
    port: 22,
    protocol: 'TCP',
    category: 'remote',
    status: 'active',
    version: 'Cisco IOS-XE 16.9',
    description: 'Akses console CLI Cisco Catalyst 3850',
    checkStatus: 'open',
    checkLatency: 0.8,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'srv-6',
    allocationId: 'alloc-2',
    ip: '192.168.10.2',
    name: 'SNMP Agent',
    port: 161,
    protocol: 'UDP',
    category: 'monitoring',
    status: 'active',
    description: 'Monitoring MRTG / Zabbix bandwidth switch',
    checkStatus: 'open',
    checkLatency: 1.0,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z'
  },

  // 192.168.10.10 (HP LaserJet Printer)
  {
    id: 'srv-7',
    allocationId: 'alloc-5',
    ip: '192.168.10.10',
    name: 'HP Embedded Web Server',
    port: 80,
    protocol: 'TCP',
    category: 'web',
    status: 'active',
    url: 'http://192.168.10.10',
    description: 'Web dashboard status tinta & kertas printer',
    checkStatus: 'open',
    checkLatency: 4.2,
    createdAt: '2026-01-18T08:00:00Z',
    updatedAt: '2026-01-18T08:00:00Z'
  },
  {
    id: 'srv-8',
    allocationId: 'alloc-5',
    ip: '192.168.10.10',
    name: 'IPP Printing Service',
    port: 631,
    protocol: 'TCP',
    category: 'other',
    status: 'active',
    description: 'Internet Printing Protocol untuk cetak dari laptop',
    checkStatus: 'open',
    checkLatency: 3.8,
    createdAt: '2026-01-18T08:00:00Z',
    updatedAt: '2026-01-18T08:00:00Z'
  },

  // 10.10.20.1 (FortiGate Firewall)
  {
    id: 'srv-9',
    allocationId: 'alloc-srv-1',
    ip: '10.10.20.1',
    name: 'FortiOS HTTPS Admin',
    port: 443,
    protocol: 'TCP',
    category: 'security',
    status: 'active',
    version: 'FortiOS 7.2',
    url: 'https://10.10.20.1',
    description: 'Web GUI Dashboard FortiGate 100F',
    checkStatus: 'open',
    checkLatency: 0.5,
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z'
  },
  {
    id: 'srv-10',
    allocationId: 'alloc-srv-1',
    ip: '10.10.20.1',
    name: 'SSL-VPN Portal',
    port: 10443,
    protocol: 'TCP',
    category: 'security',
    status: 'active',
    url: 'https://10.10.20.1:10443',
    description: 'Akses remote secure VPN untuk karyawan remote / WFH',
    checkStatus: 'open',
    checkLatency: 0.6,
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z'
  },

  // 10.10.20.10 (PostgreSQL Master DB)
  {
    id: 'srv-11',
    allocationId: 'alloc-srv-2',
    ip: '10.10.20.10',
    name: 'PostgreSQL Database Engine',
    port: 5432,
    protocol: 'TCP',
    category: 'database',
    status: 'active',
    version: 'PostgreSQL 16.1',
    description: 'Basis data utama transaksi produksi',
    checkStatus: 'open',
    checkLatency: 0.3,
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z'
  },
  {
    id: 'srv-12',
    allocationId: 'alloc-srv-2',
    ip: '10.10.20.10',
    name: 'OpenSSH Server',
    port: 22,
    protocol: 'TCP',
    category: 'remote',
    status: 'active',
    version: 'OpenSSH 9.6p1',
    description: 'Akses remote server database untuk DBA',
    checkStatus: 'open',
    checkLatency: 0.4,
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z'
  },
  {
    id: 'srv-13',
    allocationId: 'alloc-srv-2',
    ip: '10.10.20.10',
    name: 'Prometheus Node Exporter',
    port: 9100,
    protocol: 'TCP',
    category: 'monitoring',
    status: 'active',
    url: 'http://10.10.20.10:9100/metrics',
    description: 'Metrik CPU, RAM, disk I/O server database',
    checkStatus: 'open',
    checkLatency: 0.4,
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z'
  },

  // 10.10.20.20 (srv-web-nginx-prod01)
  {
    id: 'srv-14',
    allocationId: 'alloc-srv-4',
    ip: '10.10.20.20',
    name: 'Nginx Web Server HTTP',
    port: 80,
    protocol: 'TCP',
    category: 'web',
    status: 'active',
    version: 'Nginx 1.24.0',
    url: 'http://10.10.20.20',
    description: 'Frontend Web Server & HTTP redirect to HTTPS',
    checkStatus: 'open',
    checkLatency: 0.5,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'srv-15',
    allocationId: 'alloc-srv-4',
    ip: '10.10.20.20',
    name: 'Nginx HTTPS SSL/TLS',
    port: 443,
    protocol: 'TCP',
    category: 'web',
    status: 'active',
    version: 'Nginx 1.24.0 (TLS 1.3)',
    url: 'https://10.10.20.20',
    description: 'Layanan web aplikasi utama dengan sertifikat SSL',
    checkStatus: 'open',
    checkLatency: 0.6,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'srv-16',
    allocationId: 'alloc-srv-4',
    ip: '10.10.20.20',
    name: 'OpenSSH Server',
    port: 22,
    protocol: 'TCP',
    category: 'remote',
    status: 'active',
    description: 'Akses remote deployment CI/CD dan DevOps',
    checkStatus: 'open',
    checkLatency: 0.4,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z'
  },

  // 172.16.50.10 (NVR Hikvision)
  {
    id: 'srv-17',
    allocationId: 'alloc-cctv-2',
    ip: '172.16.50.10',
    name: 'RTSP CCTV Video Stream',
    port: 554,
    protocol: 'TCP',
    category: 'streaming',
    status: 'active',
    description: 'Video streaming live feed 32 kanal kamera',
    checkStatus: 'open',
    checkLatency: 2.1,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'srv-18',
    allocationId: 'alloc-cctv-2',
    ip: '172.16.50.10',
    name: 'Hikvision Web Admin',
    port: 80,
    protocol: 'TCP',
    category: 'web',
    status: 'active',
    url: 'http://172.16.50.10',
    description: 'Web dashboard manajemen rekaman NVR Hikvision',
    checkStatus: 'open',
    checkLatency: 1.9,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z'
  }
];

export function loadServices(): IPService[] {
  return [];
}

export function saveServices(services: IPService[]): void {
  syncToServer(STORAGE_KEYS.SERVICES, services);
}

export const INITIAL_DNS_RECORDS: DnsRecord[] = [
  {
    id: 'dns-1',
    domain: 'gateway.office.lan',
    type: 'A',
    value: '192.168.10.1',
    ip: '192.168.10.1',
    groupId: 'grp-lan-office',
    ttl: 3600,
    status: 'active',
    description: 'Mikrotik Gateway LAN Lantai 1',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'dns-2',
    domain: 'printer.finance.lan',
    type: 'A',
    value: '192.168.10.10',
    ip: '192.168.10.10',
    groupId: 'grp-lan-office',
    ttl: 3600,
    status: 'active',
    description: 'HP LaserJet Printer Keuangan',
    createdAt: '2026-01-18T08:00:00Z',
    updatedAt: '2026-01-18T08:00:00Z'
  },
  {
    id: 'dns-3',
    domain: 'fw-dmz.corp.lan',
    type: 'A',
    value: '10.10.20.1',
    ip: '10.10.20.1',
    groupId: 'grp-server-dmz',
    ttl: 3600,
    status: 'active',
    description: 'FortiGate 100F Firewall Core',
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z'
  },
  {
    id: 'dns-4',
    domain: 'db-primary.corp.lan',
    type: 'A',
    value: '10.10.20.10',
    ip: '10.10.20.10',
    groupId: 'grp-server-dmz',
    ttl: 1800,
    status: 'active',
    description: 'PostgreSQL 16 Primary Database',
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z'
  },
  {
    id: 'dns-5',
    domain: 'db-replica.corp.lan',
    type: 'A',
    value: '10.10.20.11',
    ip: '10.10.20.11',
    groupId: 'grp-server-dmz',
    ttl: 1800,
    status: 'active',
    description: 'PostgreSQL Standby Read-Only Replica',
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z'
  },
  {
    id: 'dns-6',
    domain: 'portal.corp.lan',
    type: 'A',
    value: '10.10.20.20',
    ip: '10.10.20.20',
    groupId: 'grp-server-dmz',
    ttl: 300,
    status: 'active',
    description: 'Aplikasi Web Portal Utama Karyawan',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'dns-7',
    domain: 'www.corp.lan',
    type: 'CNAME',
    value: 'portal.corp.lan',
    ttl: 300,
    status: 'active',
    description: 'Alias canonical name untuk portal internal',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'dns-8',
    domain: 'cctv-nvr.security.lan',
    type: 'A',
    value: '172.16.50.10',
    ip: '172.16.50.10',
    groupId: 'grp-cctv-iot',
    ttl: 3600,
    status: 'active',
    description: 'Hikvision NVR Central Server',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'dns-9',
    domain: 'corp.lan',
    type: 'MX',
    value: 'portal.corp.lan',
    priority: 10,
    ttl: 3600,
    status: 'active',
    description: 'Primary Internal Mail Exchange Server',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'dns-10',
    domain: 'ns1.corp.lan',
    type: 'A',
    value: '192.168.10.1',
    ip: '192.168.10.1',
    groupId: 'grp-lan-office',
    ttl: 86400,
    status: 'active',
    description: 'Primary DNS Resolver / Nameserver',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z'
  }
];

export function loadDnsRecords(): DnsRecord[] {
  return [];
}

export function saveDnsRecords(records: DnsRecord[]): void {
  syncToServer(STORAGE_KEYS.DNS_RECORDS, records);
}

export function resetDemoData(): { 
  groups: IPGroup[]; 
  allocations: IPAllocation[]; 
  categories: DeviceCategory[];
  services: IPService[];
  dnsRecords: DnsRecord[];
} {
  saveGroups(INITIAL_GROUPS);
  saveAllocations(INITIAL_ALLOCATIONS);
  saveDeviceCategories(DEFAULT_DEVICE_CATEGORIES);
  saveServices(INITIAL_SERVICES);
  saveDnsRecords(INITIAL_DNS_RECORDS);
  return { 
    groups: INITIAL_GROUPS, 
    allocations: INITIAL_ALLOCATIONS, 
    categories: DEFAULT_DEVICE_CATEGORIES,
    services: INITIAL_SERVICES,
    dnsRecords: INITIAL_DNS_RECORDS
  };
}

export const STORAGE_KEY_SUBDOMAINS = 'netipam_sub_domains_v1';

export function loadSubDomains(): SubDomainRecord[] {
  return [];
}

export function saveSubDomains(records: SubDomainRecord[]): void {
  syncToServer(STORAGE_KEY_SUBDOMAINS, records);
}


import { ElectricityDevice, CctvDevice, WaterDevice } from '../types/utilityNetworks';

export const STORAGE_KEY_ELECTRICITY = 'netipam_electricity_devices_v1';
export const STORAGE_KEY_CCTV = 'netipam_cctv_devices_v1';
export const STORAGE_KEY_WATER = 'netipam_water_devices_v1';

export function saveElectricityDevices(devices: ElectricityDevice[]): void {
  syncToServer(STORAGE_KEY_ELECTRICITY, devices);
}

export function saveCctvDevices(devices: CctvDevice[]): void {
  syncToServer(STORAGE_KEY_CCTV, devices);
}

export function saveWaterDevices(devices: WaterDevice[]): void {
  syncToServer(STORAGE_KEY_WATER, devices);
}

export const INITIAL_ELECTRICITY_DEVICES: ElectricityDevice[] = [
  {
    id: 'elec-1',
    name: 'Panel Distribusi Utama (MDP)',
    code: 'MDP-PLN-01',
    type: 'panel_mdp',
    brand: 'Schneider Electric',
    model: 'PrismaSeT G 630A',
    location: 'Ruang Trafo & MDP Lt. Basement',
    phase: '3_phase',
    voltage: 380,
    currentAmpere: 400,
    capacityWatt: 197000,
    currentLoadWatt: 85400,
    status: 'normal',
    installationDate: '2025-08-10',
    lastMaintenance: '2026-02-15',
    pic: 'Pak Hendro (ME Spv)',
    notes: 'Suplai utama dari Trafo PLN 200 kVA dengan ATS otomatis ke Genset.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'elec-2',
    name: 'UPS Server & Data Center',
    code: 'UPS-DC-01',
    type: 'ups',
    brand: 'APC by Schneider',
    model: 'Smart-UPS On-Line SRT 10kVA',
    location: 'Ruang Server DC Lt. 2',
    phase: '1_phase',
    voltage: 220,
    currentAmpere: 45,
    capacityWatt: 10000,
    currentLoadWatt: 4200,
    status: 'normal',
    sourcePanelId: 'elec-1',
    installationDate: '2025-10-05',
    lastMaintenance: '2026-01-20',
    pic: 'Arya SysAdmin',
    notes: 'Membackup 3 Rack Server utama dan Core Switch dengan backup time 45 menit.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'elec-3',
    name: 'Genset Cadangan 150 kVA',
    code: 'GEN-CUMMINS-01',
    type: 'genset',
    brand: 'Cummins',
    model: '6BTA5.9-G2',
    location: 'Area Power House Luar Gedung',
    phase: '3_phase',
    voltage: 380,
    currentAmpere: 228,
    capacityWatt: 120000,
    currentLoadWatt: 0,
    status: 'normal',
    installationDate: '2025-06-12',
    lastMaintenance: '2026-02-28',
    pic: 'Pak Hendro (ME Spv)',
    notes: 'Kapasitas tangki solar 800 Liter. Auto warm-up setiap hari Sabtu jam 09:00.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'elec-4',
    name: 'Sub Distribution Panel (SDP) Kantor Lt. 1',
    code: 'SDP-LT1-01',
    type: 'panel_sdp',
    brand: 'ABB',
    model: 'System Pro E Comfort 100A',
    location: 'Ruang Panel Koridor Lt. 1',
    phase: '3_phase',
    voltage: 380,
    currentAmpere: 100,
    capacityWatt: 45000,
    currentLoadWatt: 18600,
    status: 'normal',
    sourcePanelId: 'elec-1',
    installationDate: '2025-08-15',
    lastMaintenance: '2026-02-10',
    pic: 'Joko Teknisi',
    notes: 'Menyuplai stop kontak workstation, pencahayaan, dan AC Cassette Lt 1.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  }
];

export const INITIAL_CCTV_DEVICES: CctvDevice[] = [
  {
    id: 'cctv-1',
    name: 'NVR Central 32 Channel Data Center',
    type: 'nvr',
    ipAddress: '172.16.50.10',
    macAddress: '48:EA:63:12:34:56',
    location: 'Ruang Server Rack 3',
    brand: 'Hikvision',
    model: 'DS-7732NI-I4',
    resolution: '4K H.265+',
    channelNumber: 32,
    storageDays: 60,
    status: 'recording',
    installationDate: '2025-09-01',
    pic: 'Bambang Security',
    notes: 'Dilengkapi 4x 8TB Seagate SkyHawk AI HDD (Total 32TB).',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'cctv-2',
    name: 'CAM-01 Lobby Utama & Resepsionis',
    type: 'camera_ip_dome',
    ipAddress: '172.16.50.21',
    macAddress: '48:EA:63:78:90:AB',
    location: 'Lobby Gedung Utama Lantai 1',
    brand: 'Hikvision',
    model: 'DS-2CD2143G2-I (Dome 4MP)',
    resolution: '4MP (2560x1440)',
    channelNumber: 1,
    nvrId: 'cctv-1',
    poePort: 'Port 1 - SW-POE-LOBBY',
    rtspUrl: 'rtsp://admin:pass@172.16.50.21:554/Streaming/Channels/101',
    status: 'online',
    installationDate: '2025-09-02',
    pic: 'Bambang Security',
    notes: 'Kamera Wide Angle mengarah ke pintu masuk dan meja tamu.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'cctv-3',
    name: 'CAM-02 Gerbang Masuk Kendaraan (PTZ)',
    type: 'camera_ip_ptz',
    ipAddress: '172.16.50.22',
    macAddress: '48:EA:63:CD:EF:12',
    location: 'Pos Satpam Gerbang Barat',
    brand: 'Dahua',
    model: 'SD49225XA-HNR (25x Optical Zoom)',
    resolution: '2MP Starlight 60fps',
    channelNumber: 2,
    nvrId: 'cctv-1',
    poePort: 'Port 2 - SW-POE-OUTDOOR',
    rtspUrl: 'rtsp://admin:pass@172.16.50.22:554/cam/realmonitor?channel=1&subtype=0',
    status: 'online',
    installationDate: '2025-09-05',
    pic: 'Bambang Security',
    notes: 'Dilengkapi fitur ANPR (Automatic Number Plate Recognition) untuk pelat nomor.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'cctv-4',
    name: 'CAM-03 Koridor & Ruang Data Center',
    type: 'camera_ip_bullet',
    ipAddress: '172.16.50.23',
    macAddress: '48:EA:63:99:88:77',
    location: 'Ruang Server DC Lt. 2',
    brand: 'Hikvision',
    model: 'DS-2CD2043G2-I (ColorVu)',
    resolution: '4MP ColorVu Night Vision',
    channelNumber: 3,
    nvrId: 'cctv-1',
    poePort: 'Port 8 - SW-CORE-POE',
    rtspUrl: 'rtsp://admin:pass@172.16.50.23:554/Streaming/Channels/101',
    status: 'online',
    installationDate: '2025-09-02',
    pic: 'Arya SysAdmin',
    notes: '24/7 Full Color monitoring menghadap barisan rack server 1-4.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  }
];

export const INITIAL_WATER_DEVICES: WaterDevice[] = [
  {
    id: 'water-1',
    name: 'Pompa Submersible Sumur Dalam',
    code: 'PMP-DEEP-01',
    type: 'pump_submersible',
    location: 'Rumah Pompa Sumur Timur (Kedalaman 60m)',
    pipeDiameter: '2 inch',
    flowRateLpm: 180,
    pressureBar: 4.5,
    powerWatt: 2200,
    zoneArea: 'Sumber Suplai Utama',
    status: 'active',
    sourceSupply: 'Sumur Dalam (Deep Well)',
    installationDate: '2025-07-20',
    pic: 'Sujono (Pengelola Air & Irigasi)',
    notes: 'Pompa otomatis menyala jika level Toren Utama di bawah 40%.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'water-2',
    name: 'Toren Penampungan Air Utama (5.000L)',
    code: 'TRN-ROOF-01',
    type: 'water_tank',
    location: 'Roof Top Tower Gedung A',
    pipeDiameter: '3 inch',
    tankCapacityLiter: 5000,
    currentWaterLevelPct: 82,
    zoneArea: 'Distribusi Gedung & Irigasi',
    status: 'active',
    sourceSupply: 'Pompa Submersible PMP-DEEP-01',
    installationDate: '2025-07-25',
    pic: 'Sujono (Pengelola Air & Irigasi)',
    notes: 'Dilengkapi pelampung radar otomatis dan sensor ultrasonik level air.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'water-3',
    name: 'Solenoid Valve Zona Irigasi Taman Depan',
    code: 'VALV-SOL-01',
    type: 'valve_solenoid',
    location: 'Taman Depan Gedung & Resepsionis',
    pipeDiameter: '1 inch',
    flowRateLpm: 60,
    pressureBar: 2.8,
    powerWatt: 18,
    zoneArea: 'Zona Irigasi 1 (Taman Barat)',
    status: 'active',
    sourceSupply: 'Toren Roof Top TRN-ROOF-01',
    installationDate: '2025-08-01',
    pic: 'Sujono (Pengelola Air & Irigasi)',
    notes: 'Katup solenoid 24V DC tersambung ke Smart Timer Irigasi (ON: 06:30 & 16:30).',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'water-4',
    name: 'Sprinkler System Zona Lapangan & Kebun',
    code: 'SPRNK-ZONA-B',
    type: 'sprinkler_zone',
    location: 'Area Kebun Belakang & Lapangan Terbuka',
    pipeDiameter: '1.5 inch',
    flowRateLpm: 120,
    pressureBar: 3.2,
    zoneArea: 'Zona Irigasi 2 (Kebun Belakang)',
    status: 'standby',
    sourceSupply: 'Pompa Booster PMP-BOOST-02',
    installationDate: '2025-08-05',
    pic: 'Sujono (Pengelola Air & Irigasi)',
    notes: '12 titik impact sprinkler pop-up radius 8 meter per nozzle.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  }
];
