import { IPGroup, IPAllocation } from '../types/ipam';

export function exportToCsv(group: IPGroup, allocations: IPAllocation[]): void {
  const headers = ['IP Address', 'Hostname', 'Device Type', 'MAC Address', 'PIC / User', 'Department', 'Status', 'Date Assigned', 'Notes'];
  
  const rows = allocations.map(a => [
    `"${a.ip}"`,
    `"${a.hostname.replace(/"/g, '""')}"`,
    `"${a.deviceType}"`,
    `"${a.macAddress || ''}"`,
    `"${(a.assignedTo || '').replace(/"/g, '""')}"`,
    `"${(a.department || '').replace(/"/g, '""')}"`,
    `"${a.status}"`,
    `"${a.assignedDate || ''}"`,
    `"${(a.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    `# Laporan Alokasi IP - NetIPAM`,
    `# Nama Grup: ${group.name}`,
    `# Subnet CIDR: ${group.cidr}`,
    `# Gateway: ${group.gateway}`,
    `# Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}`,
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `NetIPAM_${group.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

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
