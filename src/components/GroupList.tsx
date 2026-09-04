import React from 'react';
import { 
  Network, 
  Plus, 
  Edit2, 
  Trash2, 
  Download,
  Layers,
  MapPin,
  UserCheck
} from 'lucide-react';
import { IPGroup, IPAllocation } from '../types/ipam';
import { parseCidr } from '../utils/ipCalculator';
import { exportToCsv } from '../utils/exportImport';
import { showConfirm, showSuccess } from '../utils/swal';

interface GroupListProps {
  groups: IPGroup[];
  allocations: IPAllocation[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onAddGroup: () => void;
  onEditGroup: (group: IPGroup) => void;
  onDeleteGroup: (groupId: string) => void;
}

export const GroupList: React.FC<GroupListProps> = ({
  groups,
  allocations,
  selectedGroupId,
  onSelectGroup,
  onAddGroup,
  onEditGroup,
  onDeleteGroup
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs flex flex-col h-full">
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-900 text-sm tracking-tight">Grup IP (Subnet)</h2>
          <span className="text-[11px] font-semibold bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 border border-slate-200">
            {groups.length}
          </span>
        </div>
        <button
          onClick={onAddGroup}
          title="Tambah Subnet / Grup IP Baru"
          className="p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* "All Groups" Filter item */}
      <div className="p-2 border-b border-slate-100 bg-slate-50/50">
        <button
          onClick={() => onSelectGroup(null)}
          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
            selectedGroupId === null
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            <span>Semua Grup IP</span>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${
            selectedGroupId === null ? 'bg-blue-700/80 text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            {allocations.length} IP
          </span>
        </button>
      </div>

      {/* Subnet List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5">
        {groups.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            Belum ada grup IP. Klik tombol "+" untuk menambahkan.
          </div>
        ) : (
          groups.map((group) => {
            const isSelected = selectedGroupId === group.id;
            const groupAllocations = allocations.filter(a => a.groupId === group.id);
            const usedCount = groupAllocations.filter(a => a.status === 'used').length;
            const reservedCount = groupAllocations.filter(a => a.status === 'reserved' || a.status === 'dhcp').length;
            
            const subnet = parseCidr(group.cidr);
            const totalUsable = subnet ? subnet.usableHosts : 254;
            const totalOccupied = usedCount + reservedCount;
            const percent = totalUsable > 0 ? Math.min(100, Math.round((totalOccupied / totalUsable) * 100)) : 0;

            return (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-300 shadow-xs ring-1 ring-blue-400/20'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {/* Color Pill */}
                <div 
                  className="absolute left-0 top-3 bottom-3 w-1 rounded-r"
                  style={{ backgroundColor: group.color || '#3b82f6' }}
                />

                <div className="pl-2">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className={`font-semibold text-xs leading-snug transition-colors ${
                      isSelected ? 'text-blue-950 font-bold' : 'text-slate-800 group-hover:text-blue-600'
                    }`}>
                      {group.name}
                    </h3>
                    <div className="flex items-center space-x-0.5 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportToCsv(group, groupAllocations);
                        }}
                        title="Ekspor CSV Grup Ini"
                        className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditGroup(group);
                        }}
                        title="Edit Grup"
                        className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const confirmed = await showConfirm({
                            title: 'Hapus Grup Subnet?',
                            text: `Hapus grup "${group.name}" beserta ${groupAllocations.length} data IP di dalamnya?`,
                            confirmButtonText: 'Ya, Hapus',
                            cancelButtonText: 'Batal',
                            isDanger: true
                          });
                          if (confirmed) {
                            onDeleteGroup(group.id);
                            showSuccess('Grup Dihapus', `Grup subnet ${group.name} berhasil dihapus.`);
                          }
                        }}
                        title="Hapus Grup"
                        className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* CIDR, VLAN, Gateway */}
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-medium text-[11px] border border-slate-200">
                      {group.cidr}
                    </span>
                    {group.vlanId && (
                      <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-[11px] font-medium border border-purple-200">
                        VLAN {group.vlanId}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500 font-mono">
                      GW: {group.gateway}
                    </span>
                  </div>

                  {/* Location & PIC info */}
                  {(group.location || group.pic) && (
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500 truncate">
                      {group.location && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{group.location}</span>
                        </span>
                      )}
                      {group.pic && (
                        <span className="flex items-center gap-1 truncate text-slate-500">
                          • <UserCheck className="w-3 h-3 flex-shrink-0 text-slate-400" />
                          <span className="truncate">{group.pic}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Progress Bar Utilization */}
                  <div className="mt-2.5">
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="text-slate-500">
                        Terpakai: <strong className="text-slate-800">{totalOccupied}</strong> / {totalUsable}
                      </span>
                      <span className={`font-bold ${percent >= 90 ? 'text-rose-600' : percent >= 70 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {percent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percent >= 90 ? 'bg-rose-500' : percent >= 70 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
