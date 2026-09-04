import * as XLSX from 'xlsx';
import { IPGroup, IPAllocation } from '../types/ipam';

export function exportToXlsx(group: IPGroup, allocations: IPAllocation[]): void {
  const headers = [
    'No',
    'Alamat IP',
    'Hostname',
    'Tipe Perangkat',
    'MAC Address',
    'PIC / Pengguna',
    'Departemen',
    'Status',
    'Tanggal Alokasi',
    'Keterangan'
  ];

  const rows = allocations.map((a, idx) => [
    idx + 1,
    a.ip,
    a.hostname,
    a.deviceType,
    a.macAddress || '-',
    a.assignedTo || '-',
    a.department || '-',
    a.status === 'used' ? 'Digunakan' : a.status === 'reserved' ? 'Reserved' : a.status === 'dhcp' ? 'DHCP Pool' : 'Bebas',
    a.assignedDate || '-',
    a.notes || '-'
  ]);

  // Informative header rows in sheet
  const summaryRows = [
    ['LAPORAN ALOKASI IP ADDRESS - NETIPAM PRO'],
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
    { wch: 16 }, // Tanggal Alokasi
    { wch: 32 }  // Keterangan
  ];

  const workbook = XLSX.utils.book_new();
  const safeSheetName = (group.name.replace(/[:\\/?*\[\]]/g, '').slice(0, 31)) || 'Alokasi IP';
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  const fileName = `NetIPAM_${group.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

// Backwards compatibility alias
export const exportToCsv = exportToXlsx;

export function exportBackupJson(groups: IPGroup[], allocations: IPAllocation[]): void {
  const backupData = {
    appName: 'NetIPAM',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    groups,
    allocations
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `NetIPAM_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseImportJson(fileContent: string): { groups: IPGroup[]; allocations: IPAllocation[] } {
  const parsed = JSON.parse(fileContent);
  if (!parsed || !Array.isArray(parsed.groups) || !Array.isArray(parsed.allocations)) {
    throw new Error('Format file backup JSON tidak valid!');
  }
  return {
    groups: parsed.groups,
    allocations: parsed.allocations
  };
}
