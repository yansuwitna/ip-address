import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Activity, 
  Copy, 
  Check, 
  Sparkles,
  Layers,
  ArrowUpDown,
  Cpu,
  ServerCog,
  Printer
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceType, IPService, DeviceCategory } from '../types/ipam';
import { ipToInt, findNextAvailableIp } from '../utils/ipCalculator';
import { getCategoryIconComponent } from './CategoriesView';
import { showConfirm, showWarning, showSuccess } from '../utils/swal';

interface IPTableProps {
  group: IPGroup;
  allocations: IPAllocation[];
  services?: IPService[];
  categories?: DeviceCategory[];
  onAddAllocation: (initialIp?: string) => void;
  onEditAllocation: (allocation: IPAllocation) => void;
  onDeleteAllocation: (id: string) => void;
  onBatchReserve: () => void;
  onPingAllocation: (allocation: IPAllocation) => void;
  onManageServices: (allocation: IPAllocation) => void;
  onOpenPrint?: () => void;
}

export const IPTable: React.FC<IPTableProps> = ({
  group,
  allocations,
  services = [],
  categories = [],
  onAddAllocation,
  onEditAllocation,
  onDeleteAllocation,
  onBatchReserve,
  onPingAllocation,
  onManageServices,
  onOpenPrint
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [copiedMac, setCopiedMac] = useState<string | null>(null);

  const groupAllocations = useMemo(() => {
    return allocations.filter(a => a.groupId === group.id);
  }, [allocations, group.id]);

  const allocatedIpStrings = useMemo(() => {
    return groupAllocations.map(a => a.ip);
  }, [groupAllocations]);

  const nextFreeIp = useMemo(() => {
    return findNextAvailableIp(group.cidr, allocatedIpStrings, group.gateway);
  }, [group.cidr, allocatedIpStrings, group.gateway]);

  const handleCopyMac = (mac: string) => {
    navigator.clipboard.writeText(mac);
    setCopiedMac(mac);
    setTimeout(() => setCopiedMac(null), 2000);
  };

  const getCategoryInfo = (type: DeviceType) => {
    const rawType = (type || '').trim().toLowerCase();
    const cleanRaw = rawType.replace(/_/g, ' ');
    const found = categories.find(c => {
      const cId = c.id.toLowerCase();
      const cName = c.name.toLowerCase();
      return (
        cId === rawType || 
        cName === rawType ||
        cId.replace(/_/g, ' ') === cleanRaw ||
        cName.replace(/_/g, ' ') === cleanRaw
      );
    });

    if (found) {
      return {
        id: found.id,
        name: found.name,
        icon: getCategoryIconComponent(found.icon)
      };
    }
    const formatted = (type || 'other')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    return {
      id: type,
      name: formatted,
      icon: Cpu
    };
  };

  const filteredAllocations = useMemo(() => {
    return groupAllocations
      .filter(item => {
        if (statusFilter !== 'all' && item.status !== statusFilter) return false;
        if (deviceFilter !== 'all') {
          const filterVal = deviceFilter.toLowerCase();
          const cleanFilter = filterVal.replace(/_/g, ' ');
          const cat = getCategoryInfo(item.deviceType);
          const rawItemType = (item.deviceType || '').toLowerCase();
          const cleanItemType = rawItemType.replace(/_/g, ' ');
          const matchType = rawItemType === filterVal || cleanItemType === cleanFilter;
          const matchCatId = cat.id.toLowerCase() === filterVal || cat.id.toLowerCase().replace(/_/g, ' ') === cleanFilter;
          const matchCatName = cat.name.toLowerCase() === filterVal || cat.name.toLowerCase().replace(/_/g, ' ') === cleanFilter;
          if (!matchType && !matchCatId && !matchCatName) return false;
        }

        if (search.trim()) {
          const q = search.toLowerCase();
          const matchIp = item.ip.toLowerCase().includes(q);
          const matchHost = item.hostname.toLowerCase().includes(q);
          const matchMac = item.macAddress?.toLowerCase().includes(q);
          const matchPic = item.assignedTo?.toLowerCase().includes(q);
          const matchDept = item.department?.toLowerCase().includes(q);
          const matchNotes = item.notes?.toLowerCase().includes(q);
          const catInfo = getCategoryInfo(item.deviceType);
          const matchCat = catInfo.name.toLowerCase().includes(q);
          if (!matchIp && !matchHost && !matchMac && !matchPic && !matchDept && !matchNotes && !matchCat) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const diff = ipToInt(a.ip) - ipToInt(b.ip);
        return sortAsc ? diff : -diff;
      });
  }, [groupAllocations, statusFilter, deviceFilter, search, sortAsc, categories]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col font-poppins">
      
      {/* Table Action Bar */}
      <div className="p-4 border-b border-slate-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari IP, Hostname, MAC, PIC..."
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="used">Aktif Terpakai (Used)</option>
            <option value="reserved">Dicadangkan (Reserved)</option>
            <option value="dhcp">DHCP Pool</option>
          </select>

          {/* Device Type Dropdown */}
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">Semua Kategori Perangkat</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Next Free IP Button */}
          {nextFreeIp && (
            <button
              onClick={() => onAddAllocation(nextFreeIp)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title={`Otomatis pilih IP kosong terdekat: ${nextFreeIp}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>IP Bebas: <strong className="font-mono text-emerald-900">{nextFreeIp}</strong></span>
            </button>
          )}

          {/* Batch Reserve Button */}
          <button
            onClick={onBatchReserve}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-800/50 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Reservasi Rentang</span>
          </button>

          {/* Cetak Button */}
          {onOpenPrint && (
            <button
              onClick={onOpenPrint}
              title="Cetak Laporan Alokasi Host Subnet Ini (A4)"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Cetak</span>
            </button>
          )}

          {/* Add Allocation Button */}
          <button
            onClick={() => onAddAllocation()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Alokasikan IP</span>
          </button>
        </div>

      </div>

      {/* The Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => setSortAsc(!sortAsc)}>
                <div className="flex items-center gap-1.5">
                  <span>Alamat IP</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Hostname</th>
              <th className="py-3 px-4">Kategori Perangkat</th>
              <th className="py-3 px-4">MAC Address</th>
              <th className="py-3 px-4">PIC / Departemen</th>
              <th className="py-3 px-4">Status Ping</th>
              <th className="py-3 px-4">Catatan</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 dark:text-slate-300">
            {filteredAllocations.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                  Tidak ada data alokasi IP yang cocok dengan filter pencarian.
                </td>
              </tr>
            ) : (
              filteredAllocations.map(item => {
                const isGateway = item.ip === group.gateway;
                const itemServices = services.filter(s => s.allocationId === item.id || s.ip === item.ip);

                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-colors group"
                  >
                    {/* IP Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {item.ip}
                        </span>
                        {isGateway && (
                          <span className="text-[10px] bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700 font-bold px-1.5 py-0.2 rounded">
                            GW
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        item.status === 'used'
                          ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                          : item.status === 'reserved'
                          ? 'bg-amber-50 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                          : item.status === 'dhcp'
                          ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800'
                          : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'used' ? 'bg-blue-600' : item.status === 'reserved' ? 'bg-amber-600' : 'bg-purple-600'
                        }`}></span>
                        <span className="capitalize">{item.status}</span>
                      </span>
                    </td>

                    {/* Hostname Column */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                          {item.hostname}
                        </div>

                        {/* Open Ports & Services preview badges */}
                        {itemServices.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mt-1.5">
                            {itemServices.slice(0, 3).map(svc => (
                              <button
                                key={svc.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onManageServices(item);
                                }}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 text-slate-700 dark:text-slate-300 hover:text-blue-800 border border-slate-200/90 dark:border-slate-800 transition-colors cursor-pointer"
                                title={`${svc.name} (Port ${svc.port}/${svc.protocol}) - Klik untuk kelola`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${svc.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                <span>:{svc.port}</span>
                              </button>
                            ))}
                            {itemServices.length > 3 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onManageServices(item);
                                }}
                                className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                                title="Lihat seluruh port terdaftar"
                              >
                                +{itemServices.length - 3} port
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Kategori Perangkat Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {(() => {
                        const catInfo = getCategoryInfo(item.deviceType);
                        const CatIcon = catInfo.icon;
                        return (
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                            <span className="p-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-600 shadow-2xs">
                              <CatIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            </span>
                            <span>{catInfo.name}</span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* MAC Address Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400">
                      {item.macAddress ? (
                        <div className="flex items-center gap-1.5">
                          <span>{item.macAddress}</span>
                          <button
                            onClick={() => handleCopyMac(item.macAddress)}
                            title="Salin MAC Address"
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-0.5 cursor-pointer"
                          >
                            {copiedMac === item.macAddress ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* PIC & Dept Column */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {item.assignedTo || '-'}
                      </div>
                      {item.department && (
                        <div className="text-[11px] text-slate-400">
                          {item.department}
                        </div>
                      )}
                    </td>

                    {/* Ping Test Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.lastPingStatus === 'online' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Online ({item.lastPingLatency ? `${item.lastPingLatency}ms` : 'ok'})
                          </span>
                        ) : item.lastPingStatus === 'offline' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-[11px] font-semibold border border-rose-200 dark:border-rose-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Offline
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Belum diuji
                          </span>
                        )}

                        <button
                          onClick={() => onPingAllocation(item)}
                          title="Simulasikan Uji Ping ICMP"
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Notes Column */}
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 dark:text-slate-400" title={item.notes}>
                      {item.notes || '-'}
                    </td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onManageServices(item)}
                          title={`Kelola Layanan & Port (${itemServices.length} layanan terdaftar)`}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer relative ${
                            itemServices.length > 0
                              ? 'bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white shadow-2xs'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600'
                          }`}
                        >
                          <ServerCog className="w-3.5 h-3.5" />
                          {itemServices.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center ring-1 ring-white">
                              {itemServices.length}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => onEditAllocation(item)}
                          title="Edit Alokasi IP"
                          className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/40 dark:bg-blue-900/40 text-slate-400 hover:text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {(() => {
                          const hasServices = itemServices.length > 0;
                          if (hasServices) {
                            return (
                              <button
                                type="button"
                                disabled={true}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  showWarning(
                                    'IP Tidak Dapat Dihapus',
                                    `Alamat IP ${item.ip} (${item.hostname}) tidak dapat dihapus karena masih memiliki ${itemServices.length} data layanan atau port aktif. Silakan hapus seluruh data layanan terlebih dahulu.`
                                  );
                                }}
                                title={`Tidak dapat dihapus: masih ada ${itemServices.length} data layanan atau port aktif pada IP ini.`}
                                className="p-1.5 text-slate-300 dark:text-slate-600 cursor-not-allowed rounded-lg transition-colors border border-transparent"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            );
                          }

                          return (
                            <button
                              type="button"
                              onClick={async () => {
                                const confirmed = await showConfirm({
                                  title: 'Hapus Alokasi IP?',
                                  text: `Apakah Anda yakin ingin melepaskan alokasi IP ${item.ip} (${item.hostname}) dari subnet ${group.name}?`,
                                  confirmButtonText: 'Ya, Hapus',
                                  cancelButtonText: 'Batal',
                                  isDanger: true
                                });
                                if (confirmed) {
                                  onDeleteAllocation(item.id);
                                  showSuccess('Alokasi IP Dihapus', `IP ${item.ip} berhasil dilepaskan.`);
                                }
                              }}
                              title="Lepaskan IP Ini"
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
