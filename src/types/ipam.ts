export type DeviceType = string;

export interface DeviceCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  isDefault?: boolean;
}

export type IPStatus = 'used' | 'reserved' | 'dhcp' | 'available';

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
