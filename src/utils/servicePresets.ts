import { ServiceCategory, ServiceProtocol } from '../types/ipam';

export interface ServicePreset {
  name: string;
  port: number;
  protocol: ServiceProtocol;
  category: ServiceCategory;
  description: string;
  defaultPathOrScheme?: string;
  typicalVersion?: string;
}

export const COMMON_SERVICE_PRESETS: ServicePreset[] = [
  // Web & API
  {
    name: 'HTTP Web Server',
    port: 80,
    protocol: 'TCP',
    category: 'web',
    description: 'Layanan web standar tanpa enkripsi (Nginx, Apache, Caddy)',
    defaultPathOrScheme: 'http://',
    typicalVersion: '1.24'
  },
  {
    name: 'HTTPS Secure Web',
    port: 443,
    protocol: 'TCP',
    category: 'web',
    description: 'Layanan web terenkripsi SSL/TLS (HTTPS)',
    defaultPathOrScheme: 'https://',
    typicalVersion: 'TLS 1.3'
  },
  {
    name: 'HTTP Alt / Dev Web',
    port: 8080,
    protocol: 'TCP',
    category: 'web',
    description: 'Port alternatif server web / backend API (Tomcat, Spring, Node)',
    defaultPathOrScheme: 'http://',
    typicalVersion: 'v20.x'
  },
  {
    name: 'HTTPS Alt / Web Admin',
    port: 8443,
    protocol: 'TCP',
    category: 'web',
    description: 'Port SSL alternatif untuk panel kontrol atau web GUI',
    defaultPathOrScheme: 'https://'
  },

  // Remote Management
  {
    name: 'SSH Secure Shell',
    port: 22,
    protocol: 'TCP',
    category: 'remote',
    description: 'Akses remote terminal terenkripsi aman (OpenSSH)',
    defaultPathOrScheme: 'ssh://',
    typicalVersion: 'OpenSSH 9.6'
  },
  {
    name: 'RDP Remote Desktop',
    port: 3389,
    protocol: 'TCP',
    category: 'remote',
    description: 'Remote Desktop Protocol untuk Windows Server / Desktop',
    defaultPathOrScheme: 'rdp://'
  },
  {
    name: 'Telnet Console',
    port: 23,
    protocol: 'TCP',
    category: 'remote',
    description: 'Protokol terminal teks standar tanpa enkripsi (Legacy)'
  },
  {
    name: 'VNC Remote Display',
    port: 5900,
    protocol: 'TCP',
    category: 'remote',
    description: 'Virtual Network Computing graphical desktop sharing'
  },

  // Databases
  {
    name: 'MySQL / MariaDB',
    port: 3306,
    protocol: 'TCP',
    category: 'database',
    description: 'Database relasional open-source standar industri',
    typicalVersion: '8.0'
  },
  {
    name: 'PostgreSQL Database',
    port: 5432,
    protocol: 'TCP',
    category: 'database',
    description: 'Sistem basis data objek-relasional kelas enterprise',
    typicalVersion: '16.1'
  },
  {
    name: 'Redis In-Memory Cache',
    port: 6379,
    protocol: 'TCP',
    category: 'database',
    description: 'Key-value cache dan message broker berkecepatan tinggi',
    typicalVersion: '7.2'
  },
  {
    name: 'MongoDB NoSQL',
    port: 27017,
    protocol: 'TCP',
    category: 'database',
    description: 'Dokumen database terdistribusi NoSQL',
    typicalVersion: '7.0'
  },
  {
    name: 'Microsoft SQL Server',
    port: 1433,
    protocol: 'TCP',
    category: 'database',
    description: 'Relational Database Management System Microsoft',
    typicalVersion: 'SQL 2022'
  },

  // Network & Routing
  {
    name: 'Mikrotik Winbox',
    port: 8291,
    protocol: 'TCP',
    category: 'network',
    description: 'Aplikasi manajemen grafis GUI RouterOS Mikrotik',
    typicalVersion: 'RouterOS v7'
  },
  {
    name: 'Mikrotik API',
    port: 8728,
    protocol: 'TCP',
    category: 'network',
    description: 'Antarmuka Application Programming Interface Mikrotik'
  },
  {
    name: 'DNS Domain Name System',
    port: 53,
    protocol: 'UDP',
    category: 'network',
    description: 'Resolusi nama domain ke alamat IP (BIND, PowerDNS, AdGuard)'
  },
  {
    name: 'DHCP Server',
    port: 67,
    protocol: 'UDP',
    category: 'network',
    description: 'Alokasi alamat IP host dinamis secara otomatis'
  },
  {
    name: 'SNMP Network Monitoring',
    port: 161,
    protocol: 'UDP',
    category: 'monitoring',
    description: 'Protokol pemantauan metrik dan status perangkat jaringan'
  },
  {
    name: 'NTP Time Server',
    port: 123,
    protocol: 'UDP',
    category: 'network',
    description: 'Sinkronisasi waktu jam presisi seluruh perangkat jaringan'
  },

  // Security & VPN
  {
    name: 'OpenVPN',
    port: 1194,
    protocol: 'UDP',
    category: 'security',
    description: 'Terowongan Virtual Private Network berbasis SSL/TLS'
  },
  {
    name: 'WireGuard VPN',
    port: 51820,
    protocol: 'UDP',
    category: 'security',
    description: 'VPN modern, cepat dan berkinerja tinggi'
  },
  {
    name: 'FortiGate SSL VPN',
    port: 10443,
    protocol: 'TCP',
    category: 'security',
    description: 'Portal akses remote user FortiClient SSL-VPN',
    defaultPathOrScheme: 'https://'
  },

  // File & Storage
  {
    name: 'FTP File Transfer',
    port: 21,
    protocol: 'TCP',
    category: 'file',
    description: 'Transfer file standar (FileZilla, vsftpd)',
    defaultPathOrScheme: 'ftp://'
  },
  {
    name: 'SMB / CIFS File Share',
    port: 445,
    protocol: 'TCP',
    category: 'file',
    description: 'Berbagi berkas folder jaringan Windows & Samba Linux'
  },
  {
    name: 'NFS Network File System',
    port: 2049,
    protocol: 'TCP',
    category: 'file',
    description: 'Sistem berkas jaringan terdistribusi berbasis Unix/Linux'
  },
  {
    name: 'MinIO S3 Object Storage',
    port: 9000,
    protocol: 'TCP',
    category: 'file',
    description: 'High performance object storage kompatibel AWS S3 API',
    defaultPathOrScheme: 'http://'
  },

  // Monitoring & DevOps
  {
    name: 'Prometheus Node Exporter',
    port: 9100,
    protocol: 'TCP',
    category: 'monitoring',
    description: 'Ekspor metrik hardware & sistem Linux ke Prometheus Server',
    defaultPathOrScheme: 'http://'
  },
  {
    name: 'Grafana Dashboard',
    port: 3000,
    protocol: 'TCP',
    category: 'monitoring',
    description: 'Visualisasi analitik metrik performa & log sistem',
    defaultPathOrScheme: 'http://'
  },
  {
    name: 'Docker Daemon API',
    port: 2375,
    protocol: 'TCP',
    category: 'network',
    description: 'REST API remote untuk manajemen container Docker'
  },
  {
    name: 'Portainer Container UI',
    port: 9443,
    protocol: 'TCP',
    category: 'web',
    description: 'Web dashboard pengelolaan container Docker & Kubernetes',
    defaultPathOrScheme: 'https://'
  },

  // Video & IoT
  {
    name: 'RTSP CCTV Video Stream',
    port: 554,
    protocol: 'TCP',
    category: 'streaming',
    description: 'Real-Time Streaming Protocol untuk feed kamera IP & NVR',
    defaultPathOrScheme: 'rtsp://'
  },
  {
    name: 'MQTT IoT Broker',
    port: 1883,
    protocol: 'TCP',
    category: 'iot',
    description: 'Broker pesan ringan untuk komunikasi sensor dan IoT (Mosquitto)'
  }
];

export const SERVICE_CATEGORIES: { id: ServiceCategory; label: string; color: string; badgeBg: string; badgeText: string }[] = [
  { id: 'web', label: 'Web & API', color: '#2563eb', badgeBg: 'bg-blue-50 border-blue-200', badgeText: 'text-blue-700' },
  { id: 'database', label: 'Basis Data (DB)', color: '#7c3aed', badgeBg: 'bg-purple-50 border-purple-200', badgeText: 'text-purple-700' },
  { id: 'remote', label: 'Akses Remote / SSH', color: '#0284c7', badgeBg: 'bg-sky-50 border-sky-200', badgeText: 'text-sky-700' },
  { id: 'network', label: 'Jaringan & Routing', color: '#059669', badgeBg: 'bg-emerald-50 border-emerald-200', badgeText: 'text-emerald-700' },
  { id: 'security', label: 'Keamanan & VPN', color: '#dc2626', badgeBg: 'bg-rose-50 border-rose-200', badgeText: 'text-rose-700' },
  { id: 'file', label: 'File & Storage', color: '#d97706', badgeBg: 'bg-amber-50 border-amber-200', badgeText: 'text-amber-700' },
  { id: 'monitoring', label: 'Monitoring & Log', color: '#4f46e5', badgeBg: 'bg-indigo-50 border-indigo-200', badgeText: 'text-indigo-700' },
  { id: 'streaming', label: 'Video & Streaming', color: '#0d9488', badgeBg: 'bg-teal-50 border-teal-200', badgeText: 'text-teal-700' },
  { id: 'iot', label: 'IoT & Sensor', color: '#ea580c', badgeBg: 'bg-orange-50 border-orange-200', badgeText: 'text-orange-700' },
  { id: 'mail', label: 'Email Service', color: '#9333ea', badgeBg: 'bg-fuchsia-50 border-fuchsia-200', badgeText: 'text-fuchsia-700' },
  { id: 'other', label: 'Lainnya', color: '#64748b', badgeBg: 'bg-slate-50 border-slate-200', badgeText: 'text-slate-700' }
];

export function getCategoryMeta(cat: ServiceCategory) {
  return SERVICE_CATEGORIES.find(c => c.id === cat) || SERVICE_CATEGORIES[SERVICE_CATEGORIES.length - 1];
}

export function buildDefaultServiceUrl(ip: string, port: number, _protocol: ServiceProtocol, category: ServiceCategory): string | undefined {
  if (port === 80) return `http://${ip}`;
  if (port === 443) return `https://${ip}`;
  if (port === 8080 || port === 3000 || port === 8000 || port === 9000 || port === 9100) return `http://${ip}:${port}`;
  if (port === 8443 || port === 9443 || port === 10443) return `https://${ip}:${port}`;
  if (port === 22) return `ssh://${ip}`;
  if (port === 21) return `ftp://${ip}`;
  if (port === 554) return `rtsp://${ip}:554`;
  if (category === 'web') return `http://${ip}:${port}`;
  return undefined;
}
