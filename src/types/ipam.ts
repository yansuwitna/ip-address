export type DeviceType = string;

export interface DeviceCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  isDefault?: boolean;
}

export type IPStatus = 'used' | 'reserved' | 'dhcp' | 'available';

export type ServiceCategory = 
  | 'web' 
  | 'database' 
  | 'remote' 
  | 'network' 
  | 'file' 
  | 'security' 
  | 'streaming' 
  | 'monitoring' 
  | 'iot' 
  | 'mail'
  | 'other';

export type ServiceStatus = 'active' | 'inactive' | 'filtered';
export type ServiceProtocol = 'TCP' | 'UDP' | 'TCP/UDP';

export interface IPService {
  id: string;
  allocationId: string;
  ip: string;
  name: string;
  port: number;
  protocol: ServiceProtocol;
  category: ServiceCategory;
  status: ServiceStatus;
  version?: string;
  url?: string;
  description?: string;
  lastChecked?: string;
  checkStatus?: 'open' | 'closed' | 'timeout';
  checkLatency?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IPAllocation {
  id: string;
  groupId: string;
  ip: string;
  hostname: string;
  deviceType: DeviceType;
  macAddress: string;
  assignedTo: string;
  department: string;
  status: IPStatus;
  assignedDate: string;
  notes: string;
  lastPingStatus?: 'online' | 'offline' | 'untested';
  lastPingLatency?: number; // in ms
  services?: IPService[];
}

export interface IPGroup {
  id: string;
  name: string;
  cidr: string; // e.g., 192.168.1.0/24
  gateway: string;
  vlanId?: number;
  description: string;
  location: string;
  pic: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubnetInfo {
  networkAddress: string;
  broadcastAddress: string;
  netmask: string;
  prefix: number;
  totalHosts: number;
  usableHosts: number;
  firstUsableIp: string;
  lastUsableIp: string;
}

export interface GroupStats {
  totalUsable: number;
  used: number;
  reserved: number;
  dhcp: number;
  available: number;
  utilizationPercentage: number;
}

export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'PTR' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'SOA';
export type DnsRecordStatus = 'active' | 'inactive';

export interface DnsRecord {
  id: string;
  domain: string;
  type: DnsRecordType;
  value: string;
  ttl: number;
  priority?: number;
  ip?: string;
  groupId?: string;
  status: DnsRecordStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
}


export type SubDomainTargetType = 'ip' | 'port' | 'folder';

export interface SubDomainRecord {
  id: string;
  parentDomainId: string;
  subName: string;
  ipAddress?: string;
  port?: string;
  folder?: string;
  database?: string;
  description?: string;
  createdAt: string;
}
