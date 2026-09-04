import { SubnetInfo } from '../types/ipam';

/**
 * Konversi string IP (misal "192.168.1.1") ke 32-bit unsigned integer
 */
export function ipToInt(ip: string): number {
  const octets = ip.trim().split('.').map(Number);
  if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) {
    return 0;
  }
  return ((octets[0] << 24) >>> 0) + (octets[1] << 16) + (octets[2] << 8) + octets[3];
}

/**
 * Konversi 32-bit unsigned integer ke string IP
 */
export function intToIp(int: number): string {
  const part1 = (int >>> 24) & 255;
  const part2 = (int >>> 16) & 255;
  const part3 = (int >>> 8) & 255;
  const part4 = int & 255;
  return `${part1}.${part2}.${part3}.${part4}`;
}

/**
 * Menghitung prefix CIDR ke Subnet Mask string
 */
export function prefixToNetmask(prefix: number): string {
  if (prefix < 0 || prefix > 32) return '255.255.255.0';
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return intToIp(mask);
}

/**
 * Menghitung informasi subnet lengkap dari string CIDR (contoh: "192.168.10.0/24")
 */
export function parseCidr(cidr: string): SubnetInfo | null {
  try {
    const parts = cidr.trim().split('/');
    if (parts.length !== 2) return null;

    const baseIp = parts[0].trim();
    const prefix = parseInt(parts[1].trim(), 10);

    if (isNaN(prefix) || prefix < 8 || prefix > 30) {
      return null;
    }

    const ipNum = ipToInt(baseIp);
    const maskNum = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
    const networkNum = (ipNum & maskNum) >>> 0;
    const broadcastNum = (networkNum | ~maskNum) >>> 0;

    const totalHosts = Math.pow(2, 32 - prefix);
    const usableHosts = prefix >= 31 ? totalHosts : totalHosts - 2;

    const firstUsableNum = prefix >= 31 ? networkNum : networkNum + 1;
    const lastUsableNum = prefix >= 31 ? broadcastNum : broadcastNum - 1;

    return {
      networkAddress: intToIp(networkNum),
      broadcastAddress: intToIp(broadcastNum),
      netmask: intToIp(maskNum),
      prefix,
      totalHosts,
      usableHosts,
      firstUsableIp: intToIp(firstUsableNum),
      lastUsableIp: intToIp(lastUsableNum)
    };
  } catch {
    return null;
  }
}

/**
 * Cek apakah sebuah IP berada di dalam jangkauan subnet CIDR
 */
export function isIpInCidr(ip: string, cidr: string): boolean {
  const subnet = parseCidr(cidr);
  if (!subnet) return false;

  const target = ipToInt(ip);
  const first = ipToInt(subnet.firstUsableIp);
  const last = ipToInt(subnet.lastUsableIp);

  return target >= first && target <= last;
}

/**
 * Menghasilkan daftar seluruh IP usable dalam subnet.
 * Untuk subnet besar (> 512 hosts seperti /20, /16), kita limit agar performa UI tetap kilat.
 */
export function generateUsableIps(cidr: string, maxLimit = 256): string[] {
  const subnet = parseCidr(cidr);
  if (!subnet) return [];

  const first = ipToInt(subnet.firstUsableIp);
  const last = ipToInt(subnet.lastUsableIp);
  const count = Math.min(last - first + 1, maxLimit);

  const ips: string[] = [];
  for (let i = 0; i < count; i++) {
    ips.push(intToIp(first + i));
  }
  return ips;
}

/**
 * Fungsi sorting array IP secara numerik (octet 1..4)
 */
export function sortIps(ipList: string[], ascending = true): string[] {
  return [...ipList].sort((a, b) => {
    const numA = ipToInt(a);
    const numB = ipToInt(b);
    return ascending ? numA - numB : numB - numA;
  });
}

/**
 * Validasi string IPv4 format standar (0-255.0-255.0-255.0-255)
 */
export function isValidIpv4(ip: string): boolean {
  const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return regex.test(ip.trim());
}

/**
 * Validasi CIDR format (misal "192.168.1.0/24")
 */
export function isValidCidr(cidr: string): boolean {
  const parts = cidr.trim().split('/');
  if (parts.length !== 2) return false;
  if (!isValidIpv4(parts[0])) return false;
  const prefix = parseInt(parts[1], 10);
  return !isNaN(prefix) && prefix >= 8 && prefix <= 30;
}

/**
 * Validasi MAC Address (format XX:XX:XX:XX:XX:XX atau XX-XX-XX-XX-XX-XX)
 */
export function isValidMac(mac: string): boolean {
  if (!mac || mac.trim() === '') return true; // Opsional
  const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return regex.test(mac.trim());
}

/**
 * Temukan IP pertama yang belum dialokasikan di dalam subnet
 */
export function findNextAvailableIp(cidr: string, allocatedIps: string[], gatewayIp?: string): string | null {
  const subnet = parseCidr(cidr);
  if (!subnet) return null;

  const allocatedSet = new Set(allocatedIps.map(ip => ip.trim()));
  if (gatewayIp) allocatedSet.add(gatewayIp.trim());

  const first = ipToInt(subnet.firstUsableIp);
  const last = ipToInt(subnet.lastUsableIp);

  for (let current = first; current <= last; current++) {
    const ipStr = intToIp(current);
    if (!allocatedSet.has(ipStr)) {
      return ipStr;
    }
  }

  return null; // Subnet penuh
}
