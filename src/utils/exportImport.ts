import * as XLSX from 'xlsx';
import { IPGroup, IPAllocation, DeviceCategory, IPService, DnsRecord } from '../types/ipam';
import { UserAccount } from '../types/auth';

export function exportToXlsx(
  group: IPGroup, 
  allocations: IPAllocation[], 
  services?: IPService[],
  categories?: DeviceCategory[]
): void {
  const headers = [
    'No',
    'Alamat IP',
    'Hostname',
    'Kategori Perangkat',
    'MAC Address',
    'PIC / Pengguna',
    'Departemen',
    'Status',
    'Layanan & Port',
    'Tanggal Alokasi',
    'Keterangan'
  ];

  const rows = allocations.map((a, idx) => {
    const itemServices = (services || []).filter(s => s.allocationId === a.id || s.ip === a.ip);
    const servicesStr = itemServices.length > 0 
      ? itemServices.map(s => `${s.name} (${s.port}/${s.protocol})`).join(', ')
      : '-';

    const raw = (a.deviceType || '').toLowerCase();
    const cleanRaw = raw.replace(/_/g, ' ');
    const cat = categories?.find(c => 
      c.id.toLowerCase() === raw || 
      c.name.toLowerCase() === raw ||
      c.id.toLowerCase().replace(/_/g, ' ') === cleanRaw ||
      c.name.toLowerCase().replace(/_/g, ' ') === cleanRaw
    );
    const categoryName = cat ? cat.name : (a.deviceType ? a.deviceType.replace(/_/g, ' ') : '-');

    return [
      idx + 1,
      a.ip,
      a.hostname,
      categoryName,
      a.macAddress || '-',
      a.assignedTo || '-',
      a.department || '-',
      a.status === 'used' ? 'Digunakan' : a.status === 'reserved' ? 'Reserved' : a.status === 'dhcp' ? 'DHCP Pool' : 'Bebas',
      servicesStr,
      a.assignedDate || '-',
      a.notes || '-'
    ];
  });

  // Informative header rows in sheet
  const summaryRows = [
    ['LAPORAN ALOKASI IP HOST & INFRASTRUKTUR - IP & DNS'],
    ['Nama Subnet / Grup', group.name],
    ['Subnet CIDR', group.cidr],
    ['Default Gateway', group.gateway],
    ['VLAN ID', group.vlanId ? `VLAN ${group.vlanId}` : '-'],
    ['Lokasi', group.location || '-'],
    ['Penanggung Jawab Subnet', group.pic || '-'],
    ['Tanggal Ekspor', new Date().toLocaleString('id-ID')],
    [], // empty spacer row
    headers,
    ...rows
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(summaryRows);

  // Column widths for neat layout
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 18 }, // Alamat IP
    { wch: 24 }, // Hostname
    { wch: 18 }, // Tipe Perangkat
    { wch: 20 }, // MAC Address
    { wch: 22 }, // PIC / Pengguna
    { wch: 18 }, // Departemen
    { wch: 14 }, // Status
    { wch: 30 }, // Layanan & Port
    { wch: 16 }, // Tanggal Alokasi
    { wch: 32 }  // Keterangan
  ];

  const workbook = XLSX.utils.book_new();
  const safeSheetName = (group.name.replace(/[:\\/?*\[\]]/g, '').slice(0, 31)) || 'Alokasi IP';
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  const fileName = `IP_DNS_${group.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

// Backwards compatibility alias
export const exportToCsv = exportToXlsx;


export function exportBackupJson(
  groups: IPGroup[],
  allocations: IPAllocation[],
  categories?: DeviceCategory[],
  users?: UserAccount[],
  services?: IPService[],
  dnsRecords?: DnsRecord[]
): void {
  const backupData = {
    appName: 'IP & DNS',
    version: '2.2.0',
    exportDate: new Date().toISOString(),
    totalData: {
      groups: groups.length,
      allocations: allocations.length,
      categories: categories?.length || 0,
      users: users?.length || 0,
      services: services?.length || 0,
      dnsRecords: dnsRecords?.length || 0
    },
    groups,
    allocations,
    categories: categories || [],
    users: users || [],
    services: services || [],
    dnsRecords: dnsRecords || []
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `IP_DNS_Cadangan_Lengkap_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseImportJson(fileContent: string): {
  groups: IPGroup[];
  allocations: IPAllocation[];
  categories?: DeviceCategory[];
  users?: UserAccount[];
  services?: IPService[];
  dnsRecords?: DnsRecord[];
} {
  const parsed = JSON.parse(fileContent);
  if (!parsed || !Array.isArray(parsed.groups) || !Array.isArray(parsed.allocations)) {
    throw new Error('Format file backup JSON tidak valid! Wajib memiliki array groups dan allocations.');
  }
  return {
    groups: parsed.groups,
    allocations: parsed.allocations,
    categories: Array.isArray(parsed.categories) ? parsed.categories : undefined,
    users: Array.isArray(parsed.users) ? parsed.users : undefined,
    services: Array.isArray(parsed.services) ? parsed.services : undefined,
    dnsRecords: Array.isArray(parsed.dnsRecords) ? parsed.dnsRecords : undefined
  };
}
