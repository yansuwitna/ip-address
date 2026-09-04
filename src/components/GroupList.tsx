import React from 'react';
import { 
  Network, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  Download,
  Layers,
  MapPin,
  UserCheck
} from 'lucide-react';
import { IPGroup, IPAllocation } from '../types/ipam';
import { parseCidr } from '../utils/ipCalculator';
import { exportToCsv } from '../utils/exportImport';

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
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold text-white text-base">Grup IP (Subnet)</h2>
          <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
            {groups.length}
          </span>
        </div>
        <button
          onClick={onAddGroup}
          title="Tambah Subnet / Grup IP Baru"
          className="p-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* "All Groups" Filter item */}
      <div className="p-2 border-b border-slate-700/60 bg-slate-800/40">
        <button
          onClick={() => onSelectGroup(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
            selectedGroupId === null
              ? 'bg-blue-600 text-white font-medium shadow-sm'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            <span>Semua Grup IP</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900/40 text-slate-300">
            {allocations.length} IP
          </span>
        </button>
      </div>

      {/* Subnet List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-700/40 p-2 space-y-1">
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
                    ? 'bg-slate-700/70 border-blue-500/50 shadow-md ring-1 ring-blue-500/20'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-700/40 hover:border-slate-600'
                }`}
              >
                {/* Color Pill */}
                <div 
                  className="absolute left-0 top-3 bottom-3 w-1 rounded-r"
                  style={{ backgroundColor: group.color || '#3b82f6' }}
                />

                <div className="pl-2">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-medium text-slate-100 text-sm group-hover:text-blue-300 transition-colors leading-snug">
                      {group.name}
                    </h3>
                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportToCsv(group, groupAllocations);
                        }}
                        title="Ekspor CSV Grup Ini"
                        className="p-1 hover:bg-slate-600/60 text-slate-400 hover:text-slate-200 rounded"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditGroup(group);
                        }}
                        title="Edit Grup"
                        className="p-1 hover:bg-slate-600/60 text-slate-400 hover:text-slate-200 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Hapus grup "${group.name}" beserta ${groupAllocations.length} data IP di dalamnya?`)) {
                            onDeleteGroup(group.id);
                          }
                        }}
                        title="Hapus Grup"
                        className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* CIDR, VLAN, Gateway */}
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                    <span className="font-mono bg-slate-900/60 px-1.5 py-0.5 rounded text-blue-300 text-[11px] border border-slate-700/60">
                      {group.cidr}
                    </span>
                    {group.vlanId && (
                      <span className="bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded text-[11px] border border-purple-500/20">
                        VLAN {group.vlanId}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">
                      GW: {group.gateway}
                    </span>
                  </div>

                  {/* Location & PIC info if available */}
                  {(group.location || group.pic) && (
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400 truncate">
                      {group.location && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{group.location}</span>
                        </span>
                      )}
                      {group.pic && (
                        <span className="flex items-center gap-1 truncate text-slate-500">
                          • <UserCheck className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{group.pic}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Progress Bar Utilization */}
                  <div className="mt-2.5">
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="text-slate-400">
                        Terpakai: <strong className="text-slate-200">{totalOccupied}</strong> / {totalUsable} IP
                      </span>
                      <span className={`font-semibold ${percent >= 90 ? 'text-rose-400' : percent >= 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {percent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percent >= 90 ? 'bg-rose-500' : percent >= 70 ? 'bg-amber-500' : 'bg-blue-500'
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
