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

  // 1. Kategori Perangkat
  const categories: DeviceCategory[] = [
    { id: 'cat-srv', name: 'Server & Host', icon: 'server', description: 'Server Fisik, Node Virtualisasi, NAS Storage', isDefault: true },
    { id: 'cat-net', name: 'Network Infrastructure', icon: 'network', description: 'Router Core, Switch Distribution, Access Switch', isDefault: true },
    { id: 'cat-wifi', name: 'Wireless & AP', icon: 'wifi', description: 'Access Point Enterprise, Wi-Fi Bridge outdoor', isDefault: true },
    { id: 'cat-sec', name: 'Firewall & Security', icon: 'shield', description: 'Hardware UTM Firewall, Gateway IDS/IPS', isDefault: true },
    { id: 'cat-pc', name: 'Desktop Client', icon: 'desktop', description: 'Workstation Kantor, PC Lab, Terminal Admin', isDefault: true },
    { id: 'cat-cctv', name: 'CCTV Surveillance', icon: 'video', description: 'IP Camera, NVR Server, Decoders', isDefault: true },
    { id: 'cat-iot', name: 'IoT & Smart Facility', icon: 'cpu', description: 'Sensor Suhu, Smart PDU, Flow Meter, Controller Pompa', isDefault: true },
    { id: 'cat-prn', name: 'Network Printer', icon: 'printer', description: 'Mesin Fotocopy Multifungsi & Print Server', isDefault: true }
  ];

  // 2. IPAM Groups (Subnet / VLAN)
  const groups: IPGroup[] = [
    { id: 'grp-mgmt', name: 'VLAN 10 - Mgmt Infrastructure', cidr: '10.10.10.0/24', gateway: '10.10.10.1', vlanId: 10, description: 'Manajemen Router, Switch, PDU, dan IPMI Server', location: 'Data Center / NOC', pic: 'Dwi Siswanto', color: 'slate', createdAt: now, updatedAt: now },
    { id: 'grp-srv', name: 'VLAN 20 - Data Center Farm', cidr: '10.10.20.0/24', gateway: '10.10.20.1', vlanId: 20, description: 'Cluster Proxmox, TrueNAS, Web Portal, DB Server', location: 'Ruang Server NOC', pic: 'Fajar Nugraha', color: 'blue', createdAt: now, updatedAt: now },
    { id: 'grp-lan-a', name: 'VLAN 30 - LAN Lab Komputer A', cidr: '192.168.30.0/24', gateway: '192.168.30.1', vlanId: 30, description: 'Client PC Praktikum Multimedia & Pemrograman', location: 'Gedung B Lt 2', pic: 'Siti Rahma', color: 'indigo', createdAt: now, updatedAt: now },
    { id: 'grp-lan-b', name: 'VLAN 40 - LAN Lab Jaringan & IoT', cidr: '192.168.40.0/24', gateway: '192.168.40.1', vlanId: 40, description: 'Client & Workbench Cisco/MikroTik Lab Jaringan', location: 'Gedung B Lt 2', pic: 'Budi Santoso', color: 'cyan', createdAt: now, updatedAt: now },
    { id: 'grp-staff', name: 'VLAN 50 - Kantor Guru & Tata Usaha', cidr: '192.168.50.0/24', gateway: '192.168.50.1', vlanId: 50, description: 'Komputer Staf, Guru, Keuangan, dan Printer Sentral', location: 'Gedung A Lt 1', pic: 'Hendra Gunawan', color: 'emerald', createdAt: now, updatedAt: now },
    { id: 'grp-cctv', name: 'VLAN 60 - Kamera Keamanan CCTV', cidr: '172.16.60.0/24', gateway: '172.16.60.1', vlanId: 60, description: 'Segmen Terisolasi NVR dan Semua IP Camera', location: 'Kampus Terpadu', pic: 'Agus Triono', color: 'rose', createdAt: now, updatedAt: now },
    { id: 'grp-wifi', name: 'VLAN 70 - Wi-Fi Publik & Tamu', cidr: '172.16.70.0/23', gateway: '172.16.70.1', vlanId: 70, description: 'Hotspot Captive Portal Siswa & Tamu', location: 'Outdoor & Koridor', pic: 'Dwi Siswanto', color: 'amber', createdAt: now, updatedAt: now },
    { id: 'grp-iot', name: 'VLAN 80 - Smart Utilities & Air Listrik', cidr: '172.16.80.0/24', gateway: '172.16.80.1', vlanId: 80, description: 'Sensor Ketinggian Air Toren, Panel Listrik, Pompa Otomatis', location: 'Utility Rooms', pic: 'Wahyu Hidayat', color: 'violet', createdAt: now, updatedAt: now }
  ];

  // 3. Alokasi Alamat IP
  const allocations: IPAllocation[] = [
    // Mgmt
    { id: 'alc-1', groupId: 'grp-mgmt', ip: '10.10.10.1', hostname: 'CORE-GW-CCR2004', deviceType: 'cat-net', macAddress: '48:8F:5A:11:22:33', assignedTo: 'NOC Team', department: 'Infrastruktur', status: 'used', assignedDate: now, notes: 'MikroTik Core Gateway & BGP Router', lastPingStatus: 'online', lastPingLatency: 0.8 },
    { id: 'alc-2', groupId: 'grp-mgmt', ip: '10.10.10.2', hostname: 'CORE-SW-CRS328', deviceType: 'cat-net', macAddress: '48:8F:5A:22:33:44', assignedTo: 'NOC Team', department: 'Infrastruktur', status: 'used', assignedDate: now, notes: 'Switch Core Backbone 24 Port SFP+', lastPingStatus: 'online', lastPingLatency: 1.1 },
    { id: 'alc-3', groupId: 'grp-mgmt', ip: '10.10.10.5', hostname: 'DIST-SW-GEDA', deviceType: 'cat-net', macAddress: '74:83:C2:55:66:77', assignedTo: 'NOC Team', department: 'Infrastruktur', status: 'used', assignedDate: now, notes: 'Distribution Switch Gedung A Ruijie Cloud', lastPingStatus: 'online', lastPingLatency: 1.5 },
    { id: 'alc-4', groupId: 'grp-mgmt', ip: '10.10.10.6', hostname: 'DIST-SW-GEDB', deviceType: 'cat-net', macAddress: '74:83:C2:88:99:AA', assignedTo: 'NOC Team', department: 'Infrastruktur', status: 'used', assignedDate: now, notes: 'Distribution Switch Gedung B Ruijie Cloud', lastPingStatus: 'online', lastPingLatency: 1.9 },
    // Servers
    { id: 'alc-5', groupId: 'grp-srv', ip: '10.10.20.10', hostname: 'SRV-PVE-CLUSTER01', deviceType: 'cat-srv', macAddress: '00:25:90:AA:BB:01', assignedTo: 'Server Admin', department: 'IT', status: 'used', assignedDate: now, notes: 'Dell PowerEdge R740 Proxmox VE Node 1', lastPingStatus: 'online', lastPingLatency: 0.6 },
    { id: 'alc-6', groupId: 'grp-srv', ip: '10.10.20.11', hostname: 'SRV-PVE-CLUSTER02', deviceType: 'cat-srv', macAddress: '00:25:90:AA:BB:02', assignedTo: 'Server Admin', department: 'IT', status: 'used', assignedDate: now, notes: 'Dell PowerEdge R740 Proxmox VE Node 2', lastPingStatus: 'online', lastPingLatency: 0.7 },
    { id: 'alc-7', groupId: 'grp-srv', ip: '10.10.20.20', hostname: 'STORAGE-TRUENAS-ZFS', deviceType: 'cat-srv', macAddress: 'D8:5E:D3:10:20:30', assignedTo: 'Storage Admin', department: 'IT', status: 'used', assignedDate: now, notes: 'TrueNAS Scale ZFS Pool 48TB iSCSI/NFS', lastPingStatus: 'online', lastPingLatency: 0.9 },
    { id: 'alc-8', groupId: 'grp-srv', ip: '10.10.20.50', hostname: 'VM-WEB-PORTAL', deviceType: 'cat-srv', macAddress: 'BC:24:11:50:50:50', assignedTo: 'Web Dev', department: 'IT', status: 'used', assignedDate: now, notes: 'Web Portal & Landing Page Sekolah (Nginx/NodeJS)', lastPingStatus: 'online', lastPingLatency: 1.2 },
    { id: 'alc-9', groupId: 'grp-srv', ip: '10.10.20.51', hostname: 'VM-SIAKAD-DB', deviceType: 'cat-srv', macAddress: 'BC:24:11:51:51:51', assignedTo: 'DBA Team', department: 'Akademik', status: 'used', assignedDate: now, notes: 'Database PostgreSQL Master SIAKAD', lastPingStatus: 'online', lastPingLatency: 1.0 },
    // Lab A & B
    { id: 'alc-10', groupId: 'grp-lan-a', ip: '192.168.30.2', hostname: 'SW-ACC-LAB-A1', deviceType: 'cat-net', macAddress: 'AC:84:C6:11:11:11', assignedTo: 'Laboran A', department: 'Multimedia', status: 'used', assignedDate: now, notes: 'Switch Akses Ruang Lab Komputer 1', lastPingStatus: 'online', lastPingLatency: 2.1 },
    { id: 'alc-11', groupId: 'grp-lan-a', ip: '192.168.30.10', hostname: 'PC-LABA-GURU', deviceType: 'cat-pc', macAddress: 'E0:D5:5E:20:01:00', assignedTo: 'Instruktur Lab A', department: 'Multimedia', status: 'used', assignedDate: now, notes: 'PC Master Pengajar Lab Multimedia', lastPingStatus: 'online', lastPingLatency: 2.5 },
    { id: 'alc-12', groupId: 'grp-lan-a', ip: '192.168.30.11', hostname: 'PC-LABA-CLIENT-01', deviceType: 'cat-pc', macAddress: 'E0:D5:5E:20:01:01', assignedTo: 'Siswa Meja 1', department: 'Multimedia', status: 'used', assignedDate: now, notes: 'PC Client Core i5 Gen 12', lastPingStatus: 'online', lastPingLatency: 3.1 },
    { id: 'alc-13', groupId: 'grp-lan-b', ip: '192.168.40.10', hostname: 'PC-LABB-GURU', deviceType: 'cat-pc', macAddress: 'E0:D5:5E:30:01:00', assignedTo: 'Guru TKJ', department: 'Teknik Jaringan', status: 'used', assignedDate: now, notes: 'Workstation Guru Lab Komputer Jaringan', lastPingStatus: 'online', lastPingLatency: 2.4 },
    // Staff & Printer
    { id: 'alc-14', groupId: 'grp-staff', ip: '192.168.50.25', hostname: 'PC-TU-KEUANGAN', deviceType: 'cat-pc', macAddress: '10:7C:61:55:01:02', assignedTo: 'Ibu Ratna', department: 'Tata Usaha', status: 'used', assignedDate: now, notes: 'PC Aplikasi Keuangan & SPP', lastPingStatus: 'online', lastPingLatency: 2.8 },
    { id: 'alc-15', groupId: 'grp-staff', ip: '192.168.50.200', hostname: 'PRN-CANON-TU', deviceType: 'cat-prn', macAddress: '70:B3:D5:AA:11:22', assignedTo: 'Kantor TU', department: 'Tata Usaha', status: 'used', assignedDate: now, notes: 'Network Multifunction Printer Heavy Duty', lastPingStatus: 'online', lastPingLatency: 4.2 },
    // CCTV
    { id: 'alc-16', groupId: 'grp-cctv', ip: '172.16.60.10', hostname: 'NVR-HIKVISION-64CH', deviceType: 'cat-cctv', macAddress: 'E4:24:6C:60:00:01', assignedTo: 'Security NOC', department: 'Keamanan', status: 'used', assignedDate: now, notes: 'NVR Induk Rekaman CCTV Kampus 8 HDD', lastPingStatus: 'online', lastPingLatency: 1.8 },
    { id: 'alc-17', groupId: 'grp-cctv', ip: '172.16.60.21', hostname: 'CAM-GERBANG-BARAT', deviceType: 'cat-cctv', macAddress: 'E4:24:6C:60:00:21', assignedTo: 'Pos Satpam', department: 'Keamanan', status: 'used', assignedDate: now, notes: 'Hikvision 4K IP Bullet ANPR Plat Nomor', lastPingStatus: 'online', lastPingLatency: 2.2 },
    { id: 'alc-18', groupId: 'grp-cctv', ip: '172.16.60.22', hostname: 'CAM-SERVER-ROOM', deviceType: 'cat-cctv', macAddress: 'E4:24:6C:60:00:22', assignedTo: 'NOC Team', department: 'Infrastruktur', status: 'used', assignedDate: now, notes: 'Dome Camera Face Detection 360', lastPingStatus: 'online', lastPingLatency: 1.1 },
    // Wi-Fi & IoT
    { id: 'alc-19', groupId: 'grp-wifi', ip: '172.16.70.10', hostname: 'AP-UNIFI-LOBBY', deviceType: 'cat-wifi', macAddress: 'B4:FB:E4:70:00:10', assignedTo: 'NOC Team', department: 'Infrastruktur', status: 'used', assignedDate: now, notes: 'UniFi U6 Pro Access Point Ceiling Mount', lastPingStatus: 'online', lastPingLatency: 2.0 },
    { id: 'alc-20', groupId: 'grp-iot', ip: '172.16.80.15', hostname: 'IOT-SMART-WATER-WELL', deviceType: 'cat-iot', macAddress: 'A0:20:A6:80:00:15', assignedTo: 'Maintenance', department: 'Sarpras', status: 'used', assignedDate: now, notes: 'ESP32 Modbus RTU Sensor Debit & Saklar Pompa', lastPingStatus: 'online', lastPingLatency: 5.5 }
  ];

  // 4. Layanan & Port (Services)
  const services: IPService[] = [
    { id: 'srv-1', allocationId: 'alc-5', ip: '10.10.20.10', name: 'Proxmox VE Cluster', port: 8006, protocol: 'TCP', category: 'web', status: 'active', version: '8.1', url: 'https://10.10.20.10:8006', description: 'Web UI Hypervisor Node 1', checkStatus: 'open', checkLatency: 3.1, createdAt: now, updatedAt: now },
    { id: 'srv-2', allocationId: 'alc-7', ip: '10.10.20.20', name: 'TrueNAS Storage Portal', port: 443, protocol: 'TCP', category: 'file', status: 'active', version: '23.10', url: 'https://10.10.20.20', description: 'Web UI Storage & iSCSI Portal', checkStatus: 'open', checkLatency: 2.8, createdAt: now, updatedAt: now },
    { id: 'srv-3', allocationId: 'alc-8', ip: '10.10.20.50', name: 'Web Server Portal Nginx', port: 80, protocol: 'TCP', category: 'web', status: 'active', version: '1.24', url: 'http://10.10.20.50', description: 'HTTP Redirect ke HTTPS Portal', checkStatus: 'open', checkLatency: 1.9, createdAt: now, updatedAt: now },
    { id: 'srv-4', allocationId: 'alc-8', ip: '10.10.20.50', name: 'Web Server HTTPS SSL', port: 443, protocol: 'TCP', category: 'web', status: 'active', version: '1.24', url: 'https://10.10.20.50', description: 'Aplikasi Web Portal Utama & CMS', checkStatus: 'open', checkLatency: 2.1, createdAt: now, updatedAt: now },
    { id: 'srv-5', allocationId: 'alc-9', ip: '10.10.20.51', name: 'PostgreSQL Database Engine', port: 5432, protocol: 'TCP', category: 'database', status: 'active', version: '16.2', description: 'RDBMS Master Data SIAKAD', checkStatus: 'open', checkLatency: 1.4, createdAt: now, updatedAt: now },
    { id: 'srv-6', allocationId: 'alc-1', ip: '10.10.10.1', name: 'MikroTik Winbox GUI', port: 8291, protocol: 'TCP', category: 'remote', status: 'active', version: 'v7.14', description: 'Management Port Router Core Gateway', checkStatus: 'open', checkLatency: 1.0, createdAt: now, updatedAt: now },
    { id: 'srv-7', allocationId: 'alc-16', ip: '172.16.60.10', name: 'Hikvision NVR RTSP Video Stream', port: 554, protocol: 'TCP', category: 'streaming', status: 'active', version: 'v4.5', url: 'rtsp://172.16.60.10:554/streaming/channels/101', description: 'Stream Live Feed CCTV 64 Kanal', checkStatus: 'open', checkLatency: 4.5, createdAt: now, updatedAt: now },
    { id: 'srv-8', allocationId: 'alc-20', ip: '172.16.80.15', name: 'MQTT Broker IoT Telemetry', port: 1883, protocol: 'TCP', category: 'iot', status: 'active', version: 'Mosquitto 2.0', description: 'Sensor Data Ingestion Pompa Air & Meteran Listrik', checkStatus: 'open', checkLatency: 6.2, createdAt: now, updatedAt: now }
  ];

  // 5. DNS Records
  const dnsRecords: DnsRecord[] = [
    { id: 'dns-1', domain: 'sekolahku.sch.id', type: 'A', value: '10.10.20.50', ttl: 3600, status: 'active', protocol: 'https', description: 'Domain Web Utama Sekolah', createdAt: now, updatedAt: now },
    { id: 'dns-2', domain: 'gateway.lan', type: 'A', value: '10.10.10.1', ttl: 86400, status: 'active', protocol: 'http', description: 'DNS Resolusi Router NOC', createdAt: now, updatedAt: now },
    { id: 'dns-3', domain: 'siakad.sekolahku.sch.id', type: 'A', value: '10.10.20.51', ttl: 3600, status: 'active', protocol: 'https', description: 'Sistem Informasi Akademik Terpadu', createdAt: now, updatedAt: now },
    { id: 'dns-4', domain: 'cctv.local', type: 'A', value: '172.16.60.10', ttl: 3600, status: 'active', protocol: 'http', description: 'Web Client Live View NVR', createdAt: now, updatedAt: now }
  ];

  // 6. Subdomain Records
  const subDomains: SubDomainRecord[] = [
    { id: 'sub-1', parentDomainId: 'dns-1', subName: 'www', ipAddress: '10.10.20.50', port: '443', protocol: 'https', description: 'Alias WWW Portal Sekolah', createdAt: now },
    { id: 'sub-2', parentDomainId: 'dns-1', subName: 'elearning', ipAddress: '10.10.20.50', port: '443', folder: '/var/www/moodle', protocol: 'https', description: 'LMS Moodle Pembelajaran Daring', createdAt: now },
    { id: 'sub-3', parentDomainId: 'dns-1', subName: 'pve', ipAddress: '10.10.20.10', port: '8006', protocol: 'https', description: 'Web Console Virtual Machine Proxmox', createdAt: now },
    { id: 'sub-4', parentDomainId: 'dns-1', subName: 'nas', ipAddress: '10.10.20.20', port: '443', protocol: 'https', description: 'Storage Berkas & Backup Guru', createdAt: now }
  ];

  // 7. Lokasi Induk (LanLocation)
  const lanLocations: LanLocation[] = [
    { id: 'loc-gedung-a', name: 'Gedung A - Kantor Pusat & Akademik', code: 'GED-A', address: 'Jl. Pemuda No. 12 Kompleks Pendidikan', pic: 'Fajar Nugraha (NOC Lead)', phone: '0812-3456-7890', notes: 'Pusat operasional NOC, Data Center, dan kantor pimpinan', createdAt: now, updatedAt: now },
    { id: 'loc-gedung-b', name: 'Gedung B - Laboratorium & Praktikum', code: 'GED-B', address: 'Jl. Pemuda Sayap Barat', pic: 'Budi Santoso (Kepala Lab)', phone: '0813-9876-5432', notes: 'Gedung 3 lantai khusus Lab Komputer, Jaringan, dan Multimedia', createdAt: now, updatedAt: now },
    { id: 'loc-gedung-c', name: 'Gedung C - Sarana Olahraga & Fasilitas Umum', code: 'GED-C', address: 'Jl. Pemuda Area Timur', pic: 'Wahyu Hidayat (Sarpras)', phone: '0815-4321-8765', notes: 'Auditorium, Kantin, Lapangan Olahraga, Pos Keamanan, & Rumah Pompa', createdAt: now, updatedAt: now }
  ];

  // 8. Zona Ruangan / Sub-sistem (LanZone)
  const lanZones: LanZone[] = [
    // LAN
    { id: 'zn-lan-noc', locationId: 'loc-gedung-a', name: 'Ruang Server & NOC', code: 'NOC-01', floor: 'Lantai 1', roomType: 'server_room', pic: 'Dwi Siswanto', systemType: 'lan', notes: 'Rak server utama 42U dengan pendingin presisi inverter', createdAt: now, updatedAt: now },
    { id: 'zn-lan-staff', locationId: 'loc-gedung-a', name: 'Ruang Staf Guru & TU', code: 'STAFF-01', floor: 'Lantai 1', roomType: 'office', pic: 'Hendra Gunawan', systemType: 'lan', notes: 'Area 24 Meja staf administrasi dan kepala sekolah', createdAt: now, updatedAt: now },
    { id: 'zn-lan-laba', locationId: 'loc-gedung-b', name: 'Lab Komputer Multimedia A', code: 'LAB-A', floor: 'Lantai 2', roomType: 'lab', pic: 'Siti Rahma', systemType: 'lan', notes: '36 Unit PC spesifikasi grafis & render video', createdAt: now, updatedAt: now },
    { id: 'zn-lan-labb', locationId: 'loc-gedung-b', name: 'Lab Praktik Jaringan Komputer', code: 'LAB-B', floor: 'Lantai 2', roomType: 'lab', pic: 'Budi Santoso', systemType: 'lan', notes: 'Workbench Routerboard, Switch Cisco, & Patching Panel', createdAt: now, updatedAt: now },
    
    // Electricity
    { id: 'zn-pwr-pln', locationId: 'loc-gedung-a', name: 'Gardu Trafo PLN & LVMDP', code: 'PLN-A', floor: 'Basement', pic: 'Wahyu Hidayat', systemType: 'electricity', notes: 'Titik suplai utama PLN 197 kVA dan ATS Genset', createdAt: now, updatedAt: now },
    { id: 'zn-pwr-noc', locationId: 'loc-gedung-a', name: 'Panel UPS & PDU Server NOC', code: 'UPS-NOC', floor: 'Lantai 1', pic: 'Dwi Siswanto', systemType: 'electricity', notes: 'Sistem baterai UPS Online 10 kVA backup 2 jam', createdAt: now, updatedAt: now },
    { id: 'zn-pwr-lab', locationId: 'loc-gedung-b', name: 'Sub-Distribution Panel Lab (SDP)', code: 'SDP-B', floor: 'Lantai 1', pic: 'Budi Santoso', systemType: 'electricity', notes: 'Panel pembagi sirkuit stopkontak meja lab komputer', createdAt: now, updatedAt: now },
    
    // CCTV
    { id: 'zn-cctv-gate', locationId: 'loc-gedung-c', name: 'Pos Gerbang Keamanan Barat', code: 'POS-01', floor: 'Lantai 1', pic: 'Agus Triono', systemType: 'cctv', notes: 'Ruang monitor satpam & perekam CCTV NVR', createdAt: now, updatedAt: now },
    { id: 'zn-cctv-koridor', locationId: 'loc-gedung-a', name: 'Area Koridor & Tangga Gedung A', code: 'KOR-A', floor: 'Lantai 1 & 2', pic: 'Agus Triono', systemType: 'cctv', notes: 'Jalur lalu lalang tamu, aula pertemuan, dan tangga darurat', createdAt: now, updatedAt: now },
    { id: 'zn-cctv-lab', locationId: 'loc-gedung-b', name: 'Pengawasan Ruang Lab & Hall B', code: 'CCTV-B', floor: 'Lantai 2', pic: 'Agus Triono', systemType: 'cctv', notes: 'Pengawasan aset inventaris komputer lab', createdAt: now, updatedAt: now },

    // Water
    { id: 'zn-wtr-pump', locationId: 'loc-gedung-c', name: 'Rumah Pompa Sumur Bor Dalam', code: 'SUMUR-01', floor: 'Lantai 1', pic: 'Wahyu Hidayat', systemType: 'water', notes: 'Sumur artesis 80 meter dengan pompa celup submersible', createdAt: now, updatedAt: now },
    { id: 'zn-wtr-tower', locationId: 'loc-gedung-a', name: 'Menara Toren Air Atap Gedung A', code: 'TOREN-A', floor: 'Rooftop', pic: 'Wahyu Hidayat', systemType: 'water', notes: 'Dua unit toren stainless steel kapasitas total 10.000 liter', createdAt: now, updatedAt: now },
    { id: 'zn-wtr-toilet', locationId: 'loc-gedung-b', name: 'Jalur Distribusi & Toilet Gedung B', code: 'DIST-B', floor: 'Lantai 1-3', pic: 'Wahyu Hidayat', systemType: 'water', notes: 'Pipa gravitasi dari toren ke fasilitas sanitasi dan wastafel', createdAt: now, updatedAt: now }
  ];

  // 9. LAN Devices
  const lanDevices: LanDevice[] = [
    { id: 'ld-1', locationId: 'loc-gedung-a', zoneId: 'zn-lan-noc', name: 'Router Core CCR2004', code: 'RTR-CORE-01', type: 'router_gateway', brand: 'MikroTik', model: 'CCR2004-1G-12S+2XS', location: 'Rak Server A Unit 40', rackNumber: 'Rack-01', totalPorts: 16, ipAddress: '10.10.10.1', macAddress: '48:8F:5A:11:22:33', status: 'active', pic: 'Dwi Siswanto', notes: 'Router induk BGP, NAT, firewall & traffic shaper', createdAt: now, updatedAt: now },
    { id: 'ld-2', locationId: 'loc-gedung-a', zoneId: 'zn-lan-noc', name: 'Switch Core Backbone SFP+', code: 'SW-CORE-01', type: 'switch_core', brand: 'MikroTik', model: 'CRS328-4C-20S-4S+RM', location: 'Rak Server A Unit 38', rackNumber: 'Rack-01', totalPorts: 28, ipAddress: '10.10.10.2', macAddress: '48:8F:5A:22:33:44', status: 'active', pic: 'Dwi Siswanto', notes: 'Switch agregasi 10G antar gedung', createdAt: now, updatedAt: now },
    { id: 'ld-3', locationId: 'loc-gedung-a', zoneId: 'zn-lan-noc', name: 'Patch Panel Fiber OTB 24 Port', code: 'OTB-FO-24P', type: 'otb_fiber', brand: 'Panduit', model: 'Enclosure 1U', location: 'Rak Server A Unit 42', rackNumber: 'Rack-01', totalPorts: 24, status: 'active', pic: 'Dwi Siswanto', notes: 'Terminasi kabel FO antar Gedung A, B, dan C', createdAt: now, updatedAt: now },
    { id: 'ld-4', locationId: 'loc-gedung-a', zoneId: 'zn-lan-noc', name: 'Server Proxmox Cluster 01', code: 'SRV-PVE-01', type: 'server_host', brand: 'Dell', model: 'PowerEdge R740', location: 'Rak Server A Unit 25', rackNumber: 'Rack-01', totalPorts: 4, ipAddress: '10.10.20.10', macAddress: '00:25:90:AA:BB:01', status: 'active', pic: 'Fajar Nugraha', notes: '2x Intel Xeon Gold, 128GB RAM, SAS RAID 10', createdAt: now, updatedAt: now },
    { id: 'ld-5', locationId: 'loc-gedung-a', zoneId: 'zn-lan-staff', name: 'Switch Akses Staf TU', code: 'SW-STAFF-01', type: 'switch_access', brand: 'Ruijie', model: 'RG-NBS3100-24GT4SFP', location: 'Dinding Samping Rak Kantor TU', totalPorts: 28, ipAddress: '10.10.10.5', macAddress: '74:83:C2:55:66:77', status: 'active', pic: 'Hendra Gunawan', notes: 'Gigabit Switch untuk PC Staf dan Printer', createdAt: now, updatedAt: now },
    { id: 'ld-6', locationId: 'loc-gedung-b', zoneId: 'zn-lan-laba', name: 'Switch Distribusi Lab B', code: 'SW-DIST-GEDB', type: 'switch_distribution', brand: 'Ruijie', model: 'RG-NBS5200-24GT4XS', location: 'Rak Dinding Lab 1 Lt 2', totalPorts: 28, ipAddress: '10.10.10.6', macAddress: '74:83:C2:88:99:AA', status: 'active', pic: 'Budi Santoso', notes: 'Distribusi uplink FO 10G dari Gedung A', createdAt: now, updatedAt: now },
    { id: 'ld-7', locationId: 'loc-gedung-b', zoneId: 'zn-lan-laba', name: 'Switch Akses Lab Komputer A', code: 'SW-LABA-48P', type: 'switch_access', brand: 'Ruijie', model: 'RG-ES224GC', location: 'Meja Guru Rak Bawah', totalPorts: 24, ipAddress: '192.168.30.2', macAddress: 'AC:84:C6:11:11:11', status: 'active', pic: 'Siti Rahma', notes: 'Koneksi ke 24 unit PC siswa baris depan', createdAt: now, updatedAt: now },
    { id: 'ld-8', locationId: 'loc-gedung-b', zoneId: 'zn-lan-labb', name: 'Patch Panel Cat6 24 Port Lab Jaringan', code: 'PP-CAT6-LABB', type: 'patch_panel', brand: 'Belden', model: 'KeyConnect 24P', location: 'Rak Meja Praktik', totalPorts: 24, status: 'active', pic: 'Budi Santoso', notes: 'Modul patching kabel simulasi siswa', createdAt: now, updatedAt: now },
    { id: 'ld-9', locationId: 'loc-gedung-a', zoneId: 'zn-lan-staff', name: 'Access Point Wi-Fi Gedung A', code: 'AP-WIFI-A1', type: 'access_point', brand: 'Ubiquiti', model: 'UniFi U6 Pro', location: 'Plafon Tengah Kantor TU', totalPorts: 1, ipAddress: '172.16.70.10', macAddress: 'B4:FB:E4:70:00:10', status: 'active', pic: 'Dwi Siswanto', notes: 'Wi-Fi 6 Dual Band 5GHz/2.4GHz', createdAt: now, updatedAt: now }
  ];

  // 10. LAN Cables
  const lanCables: LanCableRun[] = [
    { id: 'lc-1', locationId: 'loc-gedung-a', zoneId: 'zn-lan-noc', cableCode: 'FO-BACKBONE-GA-GB', cableType: 'fiber_sm', sourceDeviceId: 'ld-2', sourceDeviceName: 'Switch Core Backbone SFP+', sourcePort: 'SFP+ 1 (10G)', sourceLocation: 'Ruang Server Gedung A', targetDeviceId: 'ld-6', targetDeviceName: 'Switch Distribusi Lab B', targetPort: 'SFP+ 1 (10G)', targetLocation: 'Gedung B Lt 2 Rak Lab', pathwayRoute: 'Tray Kabel Udara Inter-Building -> Shaft Gedung B', lengthMeter: 85, color: 'yellow', speedMbps: 10000, status: 'connected', pic: 'Dwi Siswanto', notes: 'Kabel Fiber Optik Single Mode 12 Core Armored', createdAt: now, updatedAt: now },
    { id: 'lc-2', locationId: 'loc-gedung-a', zoneId: 'zn-lan-noc', cableCode: 'DAC-10G-CORE-RTR', cableType: 'dac_sfp', sourceDeviceId: 'ld-1', sourceDeviceName: 'Router Core CCR2004', sourcePort: 'SFP+ 1', sourceLocation: 'Rak Server A Unit 40', targetDeviceId: 'ld-2', targetDeviceName: 'Switch Core Backbone SFP+', targetPort: 'SFP+ 28', targetLocation: 'Rak Server A Unit 38', pathwayRoute: 'Vertical Cable Manager Rak 1', lengthMeter: 1.5, color: 'black', speedMbps: 10000, status: 'connected', pic: 'Dwi Siswanto', notes: 'Kabel DAC Copper SFP+ 10Gbps High Speed Direct Attach', createdAt: now, updatedAt: now },
    { id: 'lc-3', locationId: 'loc-gedung-a', zoneId: 'zn-lan-noc', cableCode: 'CBL-SRV-PVE01-LAN', cableType: 'cat6a_stp', sourceDeviceId: 'ld-4', sourceDeviceName: 'Server Proxmox Cluster 01', sourcePort: 'NIC 1 (eno1)', sourceLocation: 'Rak Server A Unit 25', targetDeviceId: 'ld-2', targetDeviceName: 'Switch Core Backbone SFP+', targetPort: 'Port 1 (RJ45 10G)', targetLocation: 'Rak Server A Unit 38', pathwayRoute: 'Cable Ladder Rack-01', lengthMeter: 3, color: 'blue', speedMbps: 10000, status: 'connected', pic: 'Fajar Nugraha', notes: 'Uplink trunk VM traffic VLAN 10,20,30,40,50', createdAt: now, updatedAt: now },
    { id: 'lc-4', locationId: 'loc-gedung-a', zoneId: 'zn-lan-staff', cableCode: 'UTP-CAT6-STAFF-01', cableType: 'cat6_utp', sourceDeviceId: 'ld-2', sourceDeviceName: 'Switch Core Backbone SFP+', sourcePort: 'Port 5 (1G)', sourceLocation: 'Ruang Server Gedung A', targetDeviceId: 'ld-5', targetDeviceName: 'Switch Akses Staf TU', targetPort: 'Port Uplink 25', targetLocation: 'Ruang Staf TU Lt 1', pathwayRoute: 'Ducting Dinding Shaft Lantai 1', lengthMeter: 28, color: 'grey', speedMbps: 1000, status: 'connected', pic: 'Hendra Gunawan', notes: 'Kabel Cat6 Belden Solid UTP', createdAt: now, updatedAt: now },
    { id: 'lc-5', locationId: 'loc-gedung-b', zoneId: 'zn-lan-laba', cableCode: 'UTP-CAT6-LABA-SW-SW', cableType: 'cat6_utp', sourceDeviceId: 'ld-6', sourceDeviceName: 'Switch Distribusi Lab B', sourcePort: 'Port 1 (1G)', sourceLocation: 'Rak Dinding Lab B', targetDeviceId: 'ld-7', targetDeviceName: 'Switch Akses Lab Komputer A', targetPort: 'Port 24', targetLocation: 'Meja Guru Rak Bawah Lab A', pathwayRoute: 'Conduit PVC Plafon Lab 1', lengthMeter: 18, color: 'blue', speedMbps: 1000, status: 'connected', pic: 'Siti Rahma', notes: 'Koneksi uplink switch lab komputer', createdAt: now, updatedAt: now }
  ];

  // 11. Electricity Devices
  const electricityDevices: ElectricityDevice[] = [
    { id: 'ed-1', locationId: 'loc-gedung-a', zoneId: 'zn-pwr-pln', name: 'Trafo Distribusi PLN 197 kVA', code: 'TRF-PLN-01', type: 'trafo', brand: 'Schneider Electric', model: 'Minera Oil 20kV / 400V', location: 'Ruang Gardu Induk Basement', phase: '3_phase', voltage: 380, currentAmpere: 300, capacityWatt: 197000, currentLoadWatt: 85000, status: 'normal', pic: 'Wahyu Hidayat', notes: 'Sumber daya listrik utama seluruh gedung sekolah', createdAt: now, updatedAt: now },
    { id: 'ed-2', locationId: 'loc-gedung-a', zoneId: 'zn-pwr-pln', name: 'Genset Silent Diesel 150 kVA', code: 'GEN-CUMMINS-01', type: 'genset', brand: 'Cummins', model: '6BTA5.9-G2', location: 'Rumah Genset Halaman Belakang', phase: '3_phase', voltage: 380, currentAmpere: 228, capacityWatt: 150000, currentLoadWatt: 0, status: 'normal', pic: 'Wahyu Hidayat', notes: 'Backup otomatis ATS menyala dalam 8 detik saat PLN padam', createdAt: now, updatedAt: now },
    { id: 'ed-3', locationId: 'loc-gedung-a', zoneId: 'zn-pwr-pln', name: 'Panel Utama LVMDP', code: 'PNL-LVMDP-01', type: 'panel_mdp', brand: 'Schneider', model: 'Prisma Plus G', location: 'Ruang Panel Basement Gedung A', phase: '3_phase', voltage: 380, currentAmpere: 400, capacityWatt: 180000, currentLoadWatt: 82000, status: 'normal', sourcePanelId: 'ed-1', pic: 'Wahyu Hidayat', notes: 'Breaker MCCB utama dan metering digital Schneider PM5350', createdAt: now, updatedAt: now },
    { id: 'ed-4', locationId: 'loc-gedung-a', zoneId: 'zn-pwr-noc', name: 'UPS Sentral Server NOC 10 kVA', code: 'UPS-NOC-10K', type: 'ups', brand: 'APC by Schneider', model: 'Smart-UPS On-Line SRT10KXLI', location: 'Rak Server A Unit 1-6', phase: '1_phase', voltage: 220, currentAmpere: 45, capacityWatt: 10000, currentLoadWatt: 3800, status: 'normal', sourcePanelId: 'ed-3', pic: 'Dwi Siswanto', notes: 'Double Conversion Online UPS suplai listrik murni ke router & server', createdAt: now, updatedAt: now },
    { id: 'ed-5', locationId: 'loc-gedung-b', zoneId: 'zn-pwr-lab', name: 'Sub Distribution Panel SDP Lab Gedung B', code: 'SDP-GEDB-01', type: 'panel_sdp', brand: 'ABB', model: 'System Pro E', location: 'Dinding Depan Lab 1 Gedung B', phase: '3_phase', voltage: 380, currentAmpere: 100, capacityWatt: 45000, currentLoadWatt: 22000, status: 'normal', sourcePanelId: 'ed-3', pic: 'Budi Santoso', notes: 'Panel MCB pembagi per grup meja komputer dan pendingin AC', createdAt: now, updatedAt: now }
  ];

  // 12. Electricity Cables
  const electricityCables: ElectricityCableRun[] = [
    { id: 'ec-1', locationId: 'loc-gedung-a', zoneId: 'zn-pwr-pln', cableCode: 'NYFGBY-4x70-TRF-MDP', cableType: 'NYFGBY Bawah Tanah', sourceDeviceId: 'ed-1', sourceDeviceName: 'Trafo Distribusi PLN 197 kVA', sourceLocation: 'Gardu Trafo Basement', targetDeviceId: 'ed-3', targetDeviceName: 'Panel Utama LVMDP', targetLocation: 'Ruang LVMDP Basement', pathwayRoute: 'Trench Beton Bawah Tanah', lengthMeter: 15, coreSpec: '4 x 70 mm² Tembaga Baja', voltageVolt: 380, currentAmpere: 250, status: 'connected', pic: 'Wahyu Hidayat', notes: 'Kabel daya utama dari trafo ke panel induk', createdAt: now, updatedAt: now },
    { id: 'ec-2', locationId: 'loc-gedung-a', zoneId: 'zn-pwr-noc', cableCode: 'NYY-3x10-MDP-UPS', cableType: 'NYY', sourceDeviceId: 'ed-3', sourceDeviceName: 'Panel Utama LVMDP', sourceLocation: 'Panel LVMDP Basement', targetDeviceId: 'ed-4', targetDeviceName: 'UPS Sentral Server NOC 10 kVA', targetLocation: 'Ruang Server NOC Lt 1', pathwayRoute: 'Cable Ladder Shaft Daya Gedung A', lengthMeter: 22, coreSpec: '3 x 10 mm²', voltageVolt: 220, currentAmpere: 50, status: 'connected', pic: 'Dwi Siswanto', notes: 'Sirkuit isolasi input bypass & charger UPS', createdAt: now, updatedAt: now },
    { id: 'ec-3', locationId: 'loc-gedung-b', zoneId: 'zn-pwr-lab', cableCode: 'NYY-4x25-MDP-SDPB', cableType: 'NYY Feeder', sourceDeviceId: 'ed-3', sourceDeviceName: 'Panel Utama LVMDP', sourceLocation: 'Panel LVMDP Basement Gedung A', targetDeviceId: 'ed-5', targetDeviceName: 'Sub Distribution Panel SDP Lab Gedung B', targetLocation: 'Panel Hall Gedung B', pathwayRoute: 'Pipa Conduit Bawah Tanah Inter-Gedung', lengthMeter: 65, coreSpec: '4 x 25 mm²', voltageVolt: 380, currentAmpere: 100, status: 'connected', pic: 'Wahyu Hidayat', notes: 'Feeder utama suplai listrik komputer Lab A & B', createdAt: now, updatedAt: now }
  ];

  // 13. CCTV Devices
  const cctvDevices: CctvDevice[] = [
    { id: 'cd-1', locationId: 'loc-gedung-c', zoneId: 'zn-cctv-gate', name: 'NVR Pusat 64 Kanal 4K', code: 'NVR-PUSAT-01', type: 'nvr', brand: 'Hikvision', model: 'DS-7764NI-K4', location: 'Pos Satpam Gedung C', ipAddress: '172.16.60.10', macAddress: 'E4:24:6C:60:00:01', resolution: '8MP (4K)', channelNumber: 64, storageDays: 30, status: 'recording', pic: 'Agus Triono', notes: 'Terisi 4x 8TB Seagate SkyHawk AI HDD', createdAt: now, updatedAt: now },
    { id: 'cd-2', locationId: 'loc-gedung-c', zoneId: 'zn-cctv-gate', name: 'Kamera Gerbang Utama ANPR', code: 'CAM-GB-01', type: 'camera_ip_bullet', brand: 'Hikvision', model: 'DS-2CD4A26FWD-IZS', location: 'Tiang Gerbang Depan Barat', ipAddress: '172.16.60.21', macAddress: 'E4:24:6C:60:00:21', resolution: '2MP (1080p 60fps)', channelNumber: 1, nvrId: 'cd-1', poePort: 'Port 1 (Switch PoE)', status: 'online', pic: 'Agus Triono', notes: 'Dilengkapi lampu infrared & pembaca plat nomor otomatis', createdAt: now, updatedAt: now },
    { id: 'cd-3', locationId: 'loc-gedung-a', zoneId: 'zn-cctv-koridor', name: 'Kamera Dome Ruang Server', code: 'CAM-NOC-01', type: 'camera_ip_dome', brand: 'Hikvision', model: 'DS-2CD2143G2-I', location: 'Plafon Atas Rak Server NOC', ipAddress: '172.16.60.22', macAddress: 'E4:24:6C:60:00:22', resolution: '4MP (2K)', channelNumber: 2, nvrId: 'cd-1', poePort: 'Port 2', status: 'online', pic: 'Dwi Siswanto', notes: 'Sensor gerak deteksi akses tak dikenal di ruang server', createdAt: now, updatedAt: now },
    { id: 'cd-4', locationId: 'loc-gedung-a', zoneId: 'zn-cctv-koridor', name: 'Kamera Koridor Utama Lantai 1', code: 'CAM-KOR-01', type: 'camera_ip_dome', brand: 'Hikvision', model: 'DS-2CD2143G2-I', location: 'Plafon Depan Kantor Tata Usaha', ipAddress: '172.16.60.23', macAddress: 'E4:24:6C:60:00:23', resolution: '4MP (2K)', channelNumber: 3, nvrId: 'cd-1', poePort: 'Port 3', status: 'online', pic: 'Agus Triono', notes: 'Pengawasan pintu masuk gedung administrasi', createdAt: now, updatedAt: now },
    { id: 'cd-5', locationId: 'loc-gedung-b', zoneId: 'zn-cctv-lab', name: 'Kamera PTZ 360 Lapangan & Hall B', code: 'CAM-PTZ-HALL', type: 'camera_ip_ptz', brand: 'Hikvision', model: 'DS-2DE4425IW-DE', location: 'Sudut Dinding Luar Lantai 2 Gedung B', ipAddress: '172.16.60.25', macAddress: 'E4:24:6C:60:00:25', resolution: '4MP (25x Optical Zoom)', channelNumber: 5, nvrId: 'cd-1', poePort: 'Port 5', status: 'online', pic: 'Agus Triono', notes: 'Bisa diputar pan-tilt-zoom dari monitor satpam', createdAt: now, updatedAt: now }
  ];

  // 14. CCTV Cables
  const cctvCables: CctvCableRun[] = [
    { id: 'cc-1', locationId: 'loc-gedung-c', zoneId: 'zn-cctv-gate', cableCode: 'UTP-POE-CAM-GERBANG', cableType: 'Cat6 UTP Outdoor PE', sourceDeviceId: 'cd-1', sourceDeviceName: 'NVR Pusat 64 Kanal 4K', sourcePort: 'PoE Port 1', sourceLocation: 'Pos Satpam', targetDeviceId: 'cd-2', targetDeviceName: 'Kamera Gerbang Utama ANPR', targetPort: 'RJ45 PoE', targetLocation: 'Tiang Gerbang Barat', pathwayRoute: 'Pipa Conduit PVC Tertanam 30cm', lengthMeter: 45, status: 'connected', pic: 'Agus Triono', notes: 'Kabel anti UV dengan pelindung gel outdoor', createdAt: now, updatedAt: now },
    { id: 'cc-2', locationId: 'loc-gedung-a', zoneId: 'zn-cctv-koridor', cableCode: 'UTP-POE-CAM-NOC', cableType: 'Cat6 UTP Indoor', sourceDeviceId: 'cd-1', sourceDeviceName: 'NVR Pusat 64 Kanal 4K', sourcePort: 'PoE Port 2 via LAN Trunk', sourceLocation: 'Switch Ruang Server', targetDeviceId: 'cd-3', targetDeviceName: 'Kamera Dome Ruang Server', targetPort: 'RJ45 Port', targetLocation: 'Plafon Atas Rak NOC', pathwayRoute: 'Tray Plafon Ruang Server', lengthMeter: 12, status: 'connected', pic: 'Dwi Siswanto', notes: 'Daya via switch PoE 802.3af', createdAt: now, updatedAt: now },
    { id: 'cc-3', locationId: 'loc-gedung-a', zoneId: 'zn-cctv-koridor', cableCode: 'UTP-POE-CAM-KORIDOR', cableType: 'Cat6 UTP Indoor', sourceDeviceId: 'cd-1', sourceDeviceName: 'NVR Pusat 64 Kanal 4K', sourcePort: 'PoE Port 3', sourceLocation: 'Pos Satpam', targetDeviceId: 'cd-4', targetDeviceName: 'Kamera Koridor Utama Lantai 1', targetPort: 'RJ45 Port', targetLocation: 'Plafon Lobby TU', pathwayRoute: 'Conduit Plafon Koridor', lengthMeter: 38, status: 'connected', pic: 'Agus Triono', notes: 'Koneksi stabil tanpa interferensi', createdAt: now, updatedAt: now }
  ];

  // 15. Water Devices
  const waterDevices: WaterDevice[] = [
    { id: 'wd-1', locationId: 'loc-gedung-c', zoneId: 'zn-wtr-pump', name: 'Pompa Submersible Artetis 3 HP', code: 'PMP-ARTESIS-01', type: 'pump_submersible', location: 'Rumah Pompa Gedung C', pipeDiameter: '2 inch', flowRateLpm: 120, pressureBar: 4.5, powerWatt: 2200, status: 'active', sourceSupply: 'Sumur Bor Kedalaman 80m', pic: 'Wahyu Hidayat', notes: 'Menyedot air tanah dan memompa vertikal ke toren atap Gedung A', createdAt: now, updatedAt: now },
    { id: 'wd-2', locationId: 'loc-gedung-a', zoneId: 'zn-wtr-tower', name: 'Toren Air Stainless 5.000 Liter A', code: 'TRN-STAINLESS-01', type: 'water_tank', location: 'Rooftop Menara Gedung A', tankCapacityLiter: 5000, currentWaterLevelPct: 88, status: 'active', sourceSupply: 'Pompa Sumur Artesis', pic: 'Wahyu Hidayat', notes: 'Dilengkapi pelampung radar otomatis pemutus saklar listrik pompa', createdAt: now, updatedAt: now },
    { id: 'wd-3', locationId: 'loc-gedung-a', zoneId: 'zn-wtr-tower', name: 'Toren Air Stainless 5.000 Liter B', code: 'TRN-STAINLESS-02', type: 'water_tank', location: 'Rooftop Menara Gedung A', tankCapacityLiter: 5000, currentWaterLevelPct: 85, status: 'active', sourceSupply: 'Pompa Sumur Artesis', pic: 'Wahyu Hidayat', notes: 'Paralel reservoir toren cadangan darurat', createdAt: now, updatedAt: now },
    { id: 'wd-4', locationId: 'loc-gedung-a', zoneId: 'zn-wtr-tower', name: 'Pompa Booster Pendorong Otomatis', code: 'PMP-BOOSTER-01', type: 'pump_booster', location: 'Bawah Menara Toren Rooftop', pipeDiameter: '1.5 inch', flowRateLpm: 80, pressureBar: 3.2, powerWatt: 550, status: 'active', sourceSupply: 'Toren Rooftop', pic: 'Wahyu Hidayat', notes: 'Menjaga tekanan air stabil di toilet lantai 2 dan 3', createdAt: now, updatedAt: now },
    { id: 'wd-5', locationId: 'loc-gedung-b', zoneId: 'zn-wtr-toilet', name: 'Solenoid Valve Otomatis Zona Lab', code: 'VALVE-SOL-01', type: 'valve_solenoid', location: 'Shaft Pipa Lantai 1 Gedung B', pipeDiameter: '1 inch', pressureBar: 2.8, powerWatt: 25, status: 'active', sourceSupply: 'Pipa Utama Distribusi', pic: 'Wahyu Hidayat', notes: 'Katup solenoid IoT penutup suplai jika terdeteksi kebocoran', createdAt: now, updatedAt: now }
  ];

  // 16. Water Pipes
  const waterPipes: WaterPipeRun[] = [
    { id: 'wp-1', locationId: 'loc-gedung-c', zoneId: 'zn-wtr-pump', pipeCode: 'HDPE-2INCH-PUMP-TOWER', pipeType: 'HDPE SDR11 PN16 High Pressure', pipeDiameter: '2 inch', sourceDeviceId: 'wd-1', sourceDeviceName: 'Pompa Submersible Artetis 3 HP', sourceLocation: 'Rumah Pompa Gedung C', targetDeviceId: 'wd-2', targetDeviceName: 'Toren Air Stainless 5.000 Liter A', targetLocation: 'Rooftop Menara Gedung A', pathwayRoute: 'Tertanam Bawah Tanah 60cm -> Shaft Pipa Gedung A', lengthMeter: 110, pressureBar: 4.5, status: 'active', pic: 'Wahyu Hidayat', notes: 'Pipa tekan suplai utama air bersih dari sumur ke toren', createdAt: now, updatedAt: now },
    { id: 'wp-2', locationId: 'loc-gedung-a', zoneId: 'zn-wtr-tower', pipeCode: 'PPR-1.5INCH-TOWER-DIST', pipeType: 'PPR PN10 Air Bersih', pipeDiameter: '1.5 inch', sourceDeviceId: 'wd-4', sourceDeviceName: 'Pompa Booster Pendorong Otomatis', sourceLocation: 'Rooftop Menara Gedung A', targetDeviceId: 'wd-5', targetDeviceName: 'Solenoid Valve Otomatis Zona Lab', targetLocation: 'Shaft Gedung B Lantai 1', pathwayRoute: 'Tray Shaft Plafon Koridor Antar Gedung', lengthMeter: 48, pressureBar: 3.2, status: 'active', pic: 'Wahyu Hidayat', notes: 'Pipa distribusi gravitasi + dorongan booster ke Gedung B', createdAt: now, updatedAt: now },
    { id: 'wp-3', locationId: 'loc-gedung-b', zoneId: 'zn-wtr-toilet', pipeCode: 'PVC-1INCH-DIST-LAB', pipeType: 'PVC AW Heavy Duty', pipeDiameter: '1 inch', sourceDeviceId: 'wd-5', sourceDeviceName: 'Solenoid Valve Otomatis Zona Lab', sourceLocation: 'Shaft Pipa Lantai 1 Gedung B', targetLocation: 'Wastafel & Toilet Lab Multimedia', pathwayRoute: 'Tanam Dinding & Bawah Lantai Toilet', lengthMeter: 24, pressureBar: 2.5, status: 'active', pic: 'Wahyu Hidayat', notes: 'Cabang distribusi kran air bersih dan wastafel', createdAt: now, updatedAt: now }
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
