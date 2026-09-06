import { 
  IPGroup, IPAllocation, DeviceCategory, IPService, DnsRecord, SubDomainRecord
} from '../types/ipam';
import { 
  LanLocation, LanZone, LanDevice, LanCableRun, 
  ElectricityDevice, ElectricityCableRun, 
  CctvDevice, CctvCableRun, 
  WaterDevice, WaterPipeRun 
} from '../types/utilityNetworks';

export const generateDemoData = () => {
  const now = new Date().toISOString();

  // Categories
  const categories: DeviceCategory[] = [
    { id: 'cat-1', name: 'Server', icon: 'server', description: 'Server Fisik / VM', isDefault: true },
    { id: 'cat-2', name: 'Network', icon: 'network', description: 'Switch / Router', isDefault: true },
    { id: 'cat-3', name: 'Desktop', icon: 'desktop', description: 'PC / Workstation', isDefault: true }
  ];

  // IPAM
  const groups: IPGroup[] = [
    { id: 'grp-1', name: 'LAN Karyawan', cidr: '192.168.10.0/24', gateway: '192.168.10.1', vlanId: 10, description: 'Segmen Karyawan', location: 'Lantai 1', pic: 'Admin', color: 'blue', createdAt: now, updatedAt: now },
    { id: 'grp-2', name: 'Server Farm', cidr: '10.0.0.0/24', gateway: '10.0.0.1', vlanId: 100, description: 'DMZ', location: 'Ruang Server', pic: 'Admin', color: 'red', createdAt: now, updatedAt: now }
  ];

  const allocations: IPAllocation[] = [
    { id: 'alloc-1', groupId: 'grp-1', ip: '192.168.10.10', hostname: 'PC-Budi', deviceType: 'cat-3', macAddress: '00:11:22:33:44:55', assignedTo: 'Budi', department: 'IT', status: 'used', assignedDate: now, notes: 'PC Budi', lastPingStatus: 'online', lastPingLatency: 5 },
    { id: 'alloc-2', groupId: 'grp-2', ip: '10.0.0.10', hostname: 'SRV-Web', deviceType: 'cat-1', macAddress: 'AA:BB:CC:DD:EE:FF', assignedTo: 'DevOps', department: 'IT', status: 'used', assignedDate: now, notes: 'Web Server', lastPingStatus: 'online', lastPingLatency: 1 }
  ];

  const services: IPService[] = [
    { id: 'srv-1', allocationId: 'alloc-2', ip: '10.0.0.10', name: 'Web Server', port: 80, protocol: 'TCP', category: 'web', status: 'active', version: 'Nginx', url: 'http://10.0.0.10', description: 'Main web server', createdAt: now, updatedAt: now }
  ];

  // DNS
  const dnsRecords: DnsRecord[] = [
    { id: 'dns-1', domain: 'sekolahku.id', type: 'A', value: '10.0.0.10', ttl: 3600, status: 'active', createdAt: now, updatedAt: now, description: 'Main website' }
  ];

  const subDomains: SubDomainRecord[] = [
    { id: 'sub-1', parentDomainId: 'dns-1', subName: 'www', ipAddress: '10.0.0.10', protocol: 'https', createdAt: now }
  ];

  // LAN
  const lanLocations: LanLocation[] = [
    { id: 'loc-1', name: 'Gedung Utama', code: 'GU', address: 'Jl. Merdeka No 1', pic: 'Andi', phone: '08123456789', createdAt: now, updatedAt: now }
  ];

  const lanZones: LanZone[] = [
    { id: 'zone-1', locationId: 'loc-1', name: 'Ruang Server', code: 'RS', floor: 'Lantai 1', roomType: 'server_room', systemType: 'lan', createdAt: now, updatedAt: now },
    { id: 'zone-2', locationId: 'loc-1', name: 'Lab Komputer A', code: 'LAB-A', floor: 'Lantai 2', roomType: 'lab', systemType: 'lan', createdAt: now, updatedAt: now },
    { id: 'zone-3', locationId: 'loc-1', name: 'Panel Utama', code: 'PU', floor: 'Basement', systemType: 'electricity', createdAt: now, updatedAt: now },
    { id: 'zone-4', locationId: 'loc-1', name: 'Pos Satpam', code: 'POS', floor: 'Lantai 1', systemType: 'cctv', createdAt: now, updatedAt: now },
    { id: 'zone-5', locationId: 'loc-1', name: 'Taman Depan', code: 'TMN', floor: 'Lantai 1', systemType: 'water', createdAt: now, updatedAt: now }
  ];

  const lanDevices: LanDevice[] = [
    { id: 'dev-1', locationId: 'loc-1', zoneId: 'zone-1', name: 'Core Switch', code: 'CS-01', type: 'switch_core', brand: 'Cisco', location: 'Rak 1', totalPorts: 24, ipAddress: '10.0.0.1', status: 'active', createdAt: now, updatedAt: now },
    { id: 'dev-2', locationId: 'loc-1', zoneId: 'zone-2', name: 'Switch Lab', code: 'SW-LAB-A', type: 'switch_access', brand: 'Ruijie', location: 'Dinding Lab', totalPorts: 24, ipAddress: '192.168.10.2', status: 'active', createdAt: now, updatedAt: now }
  ];

  const lanCables: LanCableRun[] = [
    { id: 'cbl-1', locationId: 'loc-1', zoneId: 'zone-1', cableCode: 'FO-01', cableType: 'fiber_sm', sourceDeviceId: 'dev-1', sourceDeviceName: 'Core Switch', sourcePort: 'SFP 1', sourceLocation: 'Ruang Server', targetDeviceId: 'dev-2', targetDeviceName: 'Switch Lab', targetPort: 'SFP 1', targetLocation: 'Lab Komputer A', status: 'connected', lengthMeter: 50, createdAt: now, updatedAt: now }
  ];

  // Electricity
  const electricityDevices: ElectricityDevice[] = [
    { id: 'elec-1', locationId: 'loc-1', zoneId: 'zone-3', name: 'Panel LVMDP', code: 'PNL-01', type: 'panel_mdp', location: 'Basement', phase: '3_phase', voltage: 380, capacityWatt: 100000, currentLoadWatt: 45000, status: 'normal', createdAt: now, updatedAt: now },
    { id: 'elec-2', locationId: 'loc-1', zoneId: 'zone-1', name: 'UPS Server', code: 'UPS-01', type: 'ups', brand: 'APC', location: 'Rak 1', phase: '1_phase', voltage: 220, capacityWatt: 5000, currentLoadWatt: 2000, sourcePanelId: 'elec-1', status: 'normal', createdAt: now, updatedAt: now }
  ];

  const electricityCables: ElectricityCableRun[] = [
    { id: 'ecbl-1', locationId: 'loc-1', zoneId: 'zone-3', cableCode: 'NYY-01', cableType: 'nyy', sourceDeviceId: 'elec-1', sourceDeviceName: 'Panel LVMDP', sourceLocation: 'Basement', targetDeviceId: 'elec-2', targetDeviceName: 'UPS Server', targetLocation: 'Ruang Server', lengthMeter: 20, status: 'connected', createdAt: now, updatedAt: now }
  ];

  // CCTV
  const cctvDevices: CctvDevice[] = [
    { id: 'cctv-1', locationId: 'loc-1', zoneId: 'zone-4', name: 'NVR Pusat', type: 'nvr', location: 'Pos Satpam', brand: 'Hikvision', channelNumber: 16, storageDays: 30, status: 'online', createdAt: now, updatedAt: now },
    { id: 'cctv-2', locationId: 'loc-1', zoneId: 'zone-4', name: 'Kamera Gerbang', type: 'camera_ip_bullet', location: 'Gerbang Utama', brand: 'Hikvision', resolution: '4MP', nvrId: 'cctv-1', status: 'online', createdAt: now, updatedAt: now }
  ];

  const cctvCables: CctvCableRun[] = [
    { id: 'ccbl-1', locationId: 'loc-1', zoneId: 'zone-4', cableCode: 'UTP-CCTV-1', cableType: 'cat6_utp', sourceDeviceId: 'cctv-1', sourceDeviceName: 'NVR Pusat', sourceLocation: 'Pos Satpam', targetDeviceId: 'cctv-2', targetDeviceName: 'Kamera Gerbang', targetLocation: 'Gerbang Utama', lengthMeter: 35, status: 'connected', createdAt: now, updatedAt: now }
  ];

  // Water
  const waterDevices: WaterDevice[] = [
    { id: 'wtr-1', locationId: 'loc-1', zoneId: 'zone-5', name: 'Pompa Sumur Dalam', code: 'PMP-01', type: 'pump_submersible', location: 'Taman Depan', flowRateLpm: 60, pressureBar: 3, powerWatt: 750, status: 'active', sourceSupply: 'Air Tanah', createdAt: now, updatedAt: now },
    { id: 'wtr-2', locationId: 'loc-1', zoneId: 'zone-5', name: 'Toren Utama', code: 'TRN-01', type: 'water_tank', location: 'Atap Gedung Utama', tankCapacityLiter: 5000, currentWaterLevelPct: 80, status: 'active', createdAt: now, updatedAt: now }
  ];

  const waterPipes: WaterPipeRun[] = [
    { id: 'wpip-1', locationId: 'loc-1', zoneId: 'zone-5', pipeCode: 'PVC-01', pipeType: 'pvc_aw', pipeDiameter: '1 inch', sourceDeviceId: 'wtr-1', sourceDeviceName: 'Pompa Sumur Dalam', sourceLocation: 'Taman Depan', targetDeviceId: 'wtr-2', targetDeviceName: 'Toren Utama', targetLocation: 'Atap Gedung Utama', lengthMeter: 40, pressureBar: 2, status: 'active', createdAt: now, updatedAt: now }
  ];

  return {
    categories,
    groups,
    allocations,
    services,
    dnsRecords,
    subDomains,
    lanLocations,
    lanZones,
    lanDevices,
    lanCables,
    electricityDevices,
    electricityCables,
    cctvDevices,
    cctvCables,
    waterDevices,
    waterPipes
  };
};
