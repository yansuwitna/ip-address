import React, { useState, useEffect, useMemo } from 'react';
import { 
  Network, 
  Grid, 
  List, 
  Download, 
  Edit3, 
  MapPin,
  UserCheck
} from 'lucide-react';
import { IPGroup, IPAllocation } from './types/ipam';
import { User } from './types/auth';
import { getCurrentUser, logoutUser } from './utils/auth';
import { 
  loadGroups, 
  saveGroups, 
  loadAllocations, 
  saveAllocations, 
  resetDemoData 
} from './utils/storage';
import { exportToCsv } from './utils/exportImport';
import { parseCidr, findNextAvailableIp } from './utils/ipCalculator';

import { Login } from './components/Login';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { GroupList } from './components/GroupList';
import { IPMatrixGrid } from './components/IPMatrixGrid';
import { IPTable } from './components/IPTable';
import { GroupModal } from './components/GroupModal';
import { IPAllocationModal } from './components/IPAllocationModal';
import { BatchReserveModal } from './components/BatchReserveModal';
import { PingSimulatorModal } from './components/PingSimulatorModal';

export const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser);

  // Application Data State
  const [groups, setGroups] = useState<IPGroup[]>(loadGroups);
  const [allocations, setAllocations] = useState<IPAllocation[]>(loadAllocations);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groups[0]?.id || null);
  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('matrix');
  const [globalSearch, setGlobalSearch] = useState('');

  // Modals state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<IPGroup | null>(null);

  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [editingAlloc, setEditingAlloc] = useState<IPAllocation | null>(null);
  const [presetIp, setPresetIp] = useState<string | undefined>(undefined);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);
  const [pingAlloc, setPingAlloc] = useState<IPAllocation | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    saveGroups(groups);
  }, [groups]);

  useEffect(() => {
    saveAllocations(allocations);
  }, [allocations]);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  // If not logged in, render the Login portal exclusively
  if (!currentUser) {
    return <Login onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  // Active selected group object
  const activeGroup = selectedGroupId ? groups.find(g => g.id === selectedGroupId) || null : null;

  // Filtered allocations if global search is typed
  const displayedAllocations = globalSearch.trim()
    ? allocations.filter(a => {
        const q = globalSearch.toLowerCase();
        return (
          a.ip.toLowerCase().includes(q) ||
          a.hostname.toLowerCase().includes(q) ||
          a.macAddress?.toLowerCase().includes(q) ||
          a.assignedTo?.toLowerCase().includes(q) ||
          a.department?.toLowerCase().includes(q)
        );
      })
    : allocations;

  // Group Management Handlers
  const handleSaveGroup = (groupData: Partial<IPGroup>) => {
    const now = new Date().toISOString();
    if (groupData.id) {
      setGroups(prev => prev.map(g => g.id === groupData.id ? { ...g, ...groupData, updatedAt: now } as IPGroup : g));
    } else {
      const newGroup: IPGroup = {
        id: `grp-${Date.now()}`,
        name: groupData.name || 'Subnet Baru',
        cidr: groupData.cidr || '192.168.1.0/24',
        gateway: groupData.gateway || '192.168.1.1',
        vlanId: groupData.vlanId,
        description: groupData.description || '',
        location: groupData.location || '',
        pic: groupData.pic || '',
        color: groupData.color || '#2563eb',
        createdAt: now,
        updatedAt: now
      };
      setGroups(prev => [...prev, newGroup]);
      setSelectedGroupId(newGroup.id);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    setAllocations(prev => prev.filter(a => a.groupId !== groupId));
    if (selectedGroupId === groupId) {
      setSelectedGroupId(null);
    }
  };

  // Allocation Handlers
  const handleSaveAllocation = (allocData: Partial<IPAllocation>) => {
    if (allocData.id) {
      setAllocations(prev => prev.map(a => a.id === allocData.id ? { ...a, ...allocData } as IPAllocation : a));
    } else {
      const newAlloc: IPAllocation = {
        id: `alloc-${Date.now()}`,
        groupId: allocData.groupId || selectedGroupId || groups[0]?.id || '',
        ip: allocData.ip || '',
        hostname: allocData.hostname || 'new-host',
        deviceType: allocData.deviceType || 'pc_workstation',
        macAddress: allocData.macAddress || '',
        assignedTo: allocData.assignedTo || '',
        department: allocData.department || '',
        status: allocData.status || 'used',
        assignedDate: allocData.assignedDate || new Date().toISOString().slice(0, 10),
        notes: allocData.notes || ''
      };
      setAllocations(prev => [...prev, newAlloc]);
    }
  };

  const handleDeleteAllocation = (id: string) => {
    setAllocations(prev => prev.filter(a => a.id !== id));
  };

  const handleBatchSaveAllocations = (batch: Partial<IPAllocation>[]) => {
    const newItems: IPAllocation[] = batch.map((item, idx) => ({
      id: `alloc-${Date.now()}-${idx}`,
      groupId: item.groupId || selectedGroupId || '',
      ip: item.ip || '',
      hostname: item.hostname || 'dhcp-client',
      deviceType: item.deviceType || 'other',
      macAddress: item.macAddress || '',
      assignedTo: item.assignedTo || 'DHCP Pool',
      department: item.department || 'System',
      status: item.status || 'dhcp',
      assignedDate: item.assignedDate || new Date().toISOString().slice(0, 10),
      notes: item.notes || ''
    }));
    setAllocations(prev => [...prev, ...newItems]);
  };

  const handleUpdatePingStatus = (id: string, status: 'online' | 'offline', latency: number) => {
    setAllocations(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          lastPingStatus: status,
          lastPingLatency: latency
        };
      }
      return a;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-poppins antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation */}
      <Header
        groups={groups}
        allocations={allocations}
        currentUser={currentUser}
        onLogout={handleLogout}
        onAddGroup={() => {
          setEditingGroup(null);
          setIsGroupModalOpen(true);
        }}
        onResetDemo={() => {
          if (window.confirm('Reset database ke sampel data awal? Data kustom Anda akan ditimpa dengan demo data.')) {
            const demo = resetDemoData();
            setGroups(demo.groups);
            setAllocations(demo.allocations);
            setSelectedGroupId(demo.groups[0]?.id || null);
          }
        }}
        onImportData={(newGroups, newAllocations) => {
          setGroups(newGroups);
          setAllocations(newAllocations);
          setSelectedGroupId(newGroups[0]?.id || null);
        }}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Dashboard Overview Cards */}
        <DashboardStats
          groups={groups}
          allocations={allocations}
          activeGroup={activeGroup}
        />

        {/* Global Search Results Alert */}
        {globalSearch.trim() && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between text-xs text-blue-900 shadow-xs">
            <div>
              Ditemukan <strong>{displayedAllocations.length}</strong> IP yang cocok dengan kata kunci "<strong>{globalSearch}</strong>" di seluruh grup jaringan.
            </div>
            <button
              onClick={() => setGlobalSearch('')}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              Reset Pencarian
            </button>
          </div>
        )}

        {/* 2-Column Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Column: Groups Sidebar */}
          <div className="lg:col-span-1">
            <GroupList
              groups={groups}
              allocations={allocations}
              selectedGroupId={selectedGroupId}
              onSelectGroup={(id) => setSelectedGroupId(id)}
              onAddGroup={() => {
                setEditingGroup(null);
                setIsGroupModalOpen(true);
              }}
              onEditGroup={(grp) => {
                setEditingGroup(grp);
                setIsGroupModalOpen(true);
              }}
              onDeleteGroup={handleDeleteGroup}
            />
          </div>

          {/* Right Column: Group Details, IP Matrix & IP Table */}
          <div className="lg:col-span-3 space-y-4">
            
            {activeGroup ? (
              <>
                {/* Active Group Header Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Title & Badge */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs"
                          style={{ backgroundColor: activeGroup.color || '#3b82f6' }}
                        />
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                          {activeGroup.name}
                        </h1>
                        {activeGroup.vlanId && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            VLAN {activeGroup.vlanId}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-lg text-blue-700 font-semibold border border-slate-200">
                          {activeGroup.cidr}
                        </span>
                        <span>•</span>
                        <span>Gateway: <strong className="text-slate-800 font-mono">{activeGroup.gateway}</strong></span>
                        {activeGroup.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {activeGroup.location}
                            </span>
                          </>
                        )}
                        {activeGroup.pic && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-slate-400" />
                              {activeGroup.pic}
                            </span>
                          </>
                        )}
                      </div>

                      {activeGroup.description && (
                        <p className="text-xs text-slate-500 pt-0.5">
                          {activeGroup.description}
                        </p>
                      )}
                    </div>

                    {/* Quick View Controls & Actions */}
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {/* View Mode Toggle */}
                      <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          onClick={() => setViewMode('matrix')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            viewMode === 'matrix'
                              ? 'bg-white text-blue-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Visual IP Matrix Grid (Peta Interaktif)"
                        >
                          <Grid className="w-3.5 h-3.5" />
                          <span>Visual Grid</span>
                        </button>
                        <button
                          onClick={() => setViewMode('table')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            viewMode === 'table'
                              ? 'bg-white text-blue-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Daftar Tabel Rinci"
                        >
                          <List className="w-3.5 h-3.5" />
                          <span>Tabel Rinci</span>
                        </button>
                      </div>

                      {/* Export CSV for this group */}
                      <button
                        onClick={() => exportToCsv(activeGroup, allocations.filter(a => a.groupId === activeGroup.id))}
                        title="Ekspor CSV Data Grup Ini"
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Edit Group */}
                      <button
                        onClick={() => {
                          setEditingGroup(activeGroup);
                          setIsGroupModalOpen(true);
                        }}
                        title="Edit Info Grup IP"
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>

                {/* View Content (Matrix vs Table) */}
                {viewMode === 'matrix' ? (
                  <IPMatrixGrid
                    group={activeGroup}
                    allocations={allocations.filter(a => a.groupId === activeGroup.id)}
                    onSelectIp={(ip, existingAlloc) => {
                      if (existingAlloc) {
                        setEditingAlloc(existingAlloc);
                        setPresetIp(undefined);
                      } else {
                        setEditingAlloc(null);
                        setPresetIp(ip);
                      }
                      setIsAllocModalOpen(true);
                    }}
                    onPingIp={(alloc) => {
                      setPingAlloc(alloc);
                      setIsPingModalOpen(true);
                    }}
                  />
                ) : (
                  <IPTable
                    group={activeGroup}
                    allocations={allocations}
                    onAddAllocation={(initialIp) => {
                      setEditingAlloc(null);
                      setPresetIp(initialIp);
                      setIsAllocModalOpen(true);
                    }}
                    onEditAllocation={(alloc) => {
                      setEditingAlloc(alloc);
                      setPresetIp(undefined);
                      setIsAllocModalOpen(true);
                    }}
                    onDeleteAllocation={handleDeleteAllocation}
                    onBatchReserve={() => setIsBatchModalOpen(true)}
                    onPingAllocation={(alloc) => {
                      setPingAlloc(alloc);
                      setIsPingModalOpen(true);
                    }}
                  />
                )}
              </>
            ) : (
              /* Global View: All Groups Overview */
              <div className="space-y-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                  <h2 className="text-lg font-bold text-slate-900 mb-1">
                    Ikhtisar Seluruh Segmen Jaringan
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pilih salah satu subnet di sebelah kiri untuk melihat visual IP grid (.1 s/d .254) dan mengelola data host perangkat.
                  </p>
                </div>

                {/* Grid of Group Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groups.map(grp => {
                    const grpAllocs = allocations.filter(a => a.groupId === grp.id);
                    const used = grpAllocs.filter(a => a.status === 'used').length;
                    const resv = grpAllocs.filter(a => a.status === 'reserved' || a.status === 'dhcp').length;
                    const sub = parseCidr(grp.cidr);
                    const usable = sub ? sub.usableHosts : 254;
                    const pct = usable > 0 ? Math.round(((used + resv) / usable) * 100) : 0;

                    return (
                      <div
                        key={grp.id}
                        onClick={() => setSelectedGroupId(grp.id)}
                        className="bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md relative overflow-hidden group"
                      >
                        <div 
                          className="absolute top-0 left-0 right-0 h-1.5"
                          style={{ backgroundColor: grp.color || '#3b82f6' }}
                        />
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                            {grp.name}
                          </h3>
                          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                            {grp.cidr}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                          {grp.description || 'Tidak ada deskripsi.'}
                        </p>

                        <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100 font-medium">
                          <span>Terpakai: <strong className="text-slate-900">{used + resv}</strong> / {usable} Host</span>
                          <span className="font-bold text-blue-600">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">NetIPAM</span>
            <span>•</span>
            <span>Sistem Manajemen Alamat & Grup IP Modern</span>
          </div>
          <div>
            Masuk sebagai: <strong className="text-blue-600 font-medium">{currentUser.name}</strong> ({currentUser.role})
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isGroupModalOpen && (
        <GroupModal
          isOpen={isGroupModalOpen}
          onClose={() => {
            setIsGroupModalOpen(false);
            setEditingGroup(null);
          }}
          onSave={handleSaveGroup}
          editGroup={editingGroup}
        />
      )}

      {isAllocModalOpen && activeGroup && (
        <IPAllocationModal
          isOpen={isAllocModalOpen}
          onClose={() => {
            setIsAllocModalOpen(false);
            setEditingAlloc(null);
            setPresetIp(undefined);
          }}
          onSave={handleSaveAllocation}
          group={activeGroup}
          allocations={allocations}
          editAllocation={editingAlloc}
          presetIp={presetIp}
        />
      )}

      {isBatchModalOpen && activeGroup && (
        <BatchReserveModal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          onBatchSave={handleBatchSaveAllocations}
          group={activeGroup}
          existingAllocations={allocations}
        />
      )}

      {isPingModalOpen && (
        <PingSimulatorModal
          isOpen={isPingModalOpen}
          onClose={() => {
            setIsPingModalOpen(false);
            setPingAlloc(null);
          }}
          allocation={pingAlloc}
          onUpdateStatus={handleUpdatePingStatus}
        />
      )}

    </div>
  );
};
export default App;
