import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Grid, 
  List, 
  Download, 
  Edit3, 
  MapPin,
  UserCheck,
  Plus,
  Layers,
  ArrowRight,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceCategory } from './types/ipam';
import { User, UserAccount } from './types/auth';
import { 
  getCurrentUser, 
  logoutUser, 
  loadUsers, 
  saveUsers,
  createUser, 
  updateUser, 
  deleteUser, 
  wipeAllUsers 
} from './utils/auth';

import { 
  loadGroups, 
  saveGroups, 
  loadAllocations, 
  saveAllocations, 
  loadDeviceCategories,
  saveDeviceCategories,
  resetDemoData 
} from './utils/storage';
import { exportToXlsx } from './utils/exportImport';
import { parseCidr } from './utils/ipCalculator';

import { HomeView } from './components/HomeView';
import { Login } from './components/Login';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CategoriesView } from './components/CategoriesView';
import { UsersView } from './components/UsersView';
import { IPMatrixGrid } from './components/IPMatrixGrid';
import { IPTable } from './components/IPTable';
import { BackupView } from './components/BackupView';
import { GroupModal } from './components/GroupModal';
import { IPAllocationModal } from './components/IPAllocationModal';
import { BatchReserveModal } from './components/BatchReserveModal';
import { PingSimulatorModal } from './components/PingSimulatorModal';

export const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser);
  const [authView, setAuthView] = useState<'home' | 'login'>('home');
  const [users, setUsers] = useState<UserAccount[]>(loadUsers);
  const [isViewingPublicHome, setIsViewingPublicHome] = useState(false);

  // Navigation & UI State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isViewingGroupAllocations, setIsViewingGroupAllocations] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data State
  const [groups, setGroups] = useState<IPGroup[]>(loadGroups);
  const [allocations, setAllocations] = useState<IPAllocation[]>(loadAllocations);
  const [categories, setCategories] = useState<DeviceCategory[]>(loadDeviceCategories);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || '');
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

  useEffect(() => {
    saveDeviceCategories(categories);
  }, [categories]);

  const handleSaveCategory = (cat: DeviceCategory) => {
    setCategories(prev => {
      const exists = prev.some(c => c.id === cat.id);
      if (exists) {
        return prev.map(c => c.id === cat.id ? cat : c);
      }
      return [...prev, cat];
    });
  };

  const handleDeleteCategory = (catId: string) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  // Keep selectedGroupId valid
  useEffect(() => {
    if (groups.length > 0 && (!selectedGroupId || !groups.some(g => g.id === selectedGroupId))) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  const handleSaveUser = (userData: {
    id?: string;
    username: string;
    name: string;
    email: string;
    password?: string;
    role?: string;
    avatar?: string;
  }) => {
    if (userData.id) {
      const res = updateUser(userData.id, userData);
      if (res.success) {
        setUsers(loadUsers());
        if (currentUser && currentUser.id === userData.id) {
          const updated = getCurrentUser();
          if (updated) setCurrentUser(updated);
        }
      }
      return res;
    } else {
      const res = createUser({
        username: userData.username,
        name: userData.name,
        email: userData.email,
        password: userData.password || '123456',
        avatar: userData.avatar
      });
      if (res.success) {
        setUsers(loadUsers());
      }
      return res;
    }
  };


  const handleDeleteUser = (userId: string) => {
    const res = deleteUser(userId);
    if (res.success) {
      setUsers(loadUsers());
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(null);
        setAuthView('home');
      }
    }
    return res;
  };

  const handleWipeAllData = () => {
    setGroups([]);
    setAllocations([]);
    setCategories([]);
    setSelectedGroupId('');
    saveGroups([]);
    saveAllocations([]);
    saveDeviceCategories([]);
    wipeAllUsers();
    setUsers([]);
    setCurrentUser(null);
    setAuthView('home');
    setIsViewingPublicHome(false);
  };

  const handleResetDemo = () => {
    const demo = resetDemoData();
    setGroups(demo.groups);
    setAllocations(demo.allocations);
    setCategories(demo.categories);
    setSelectedGroupId(demo.groups[0]?.id || '');
    setUsers(loadUsers());
  };

  const handleImportData = (data: {
    groups: IPGroup[];
    allocations: IPAllocation[];
    categories?: DeviceCategory[];
    users?: UserAccount[];
  }) => {
    setGroups(data.groups);
    setAllocations(data.allocations);
    if (data.categories) {
      setCategories(data.categories);
    }
    if (data.users) {
      saveUsers(data.users);
      setUsers(data.users);
    }
    setSelectedGroupId(data.groups[0]?.id || '');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setAuthView('home');
    setIsViewingPublicHome(false);
  };

  // If not logged in, render HomeView or Login portal
  if (!currentUser) {
    if (authView === 'login') {
      return (
        <Login 
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setUsers(loadUsers());
          }}
          onBackToHome={() => setAuthView('home')}
        />
      );
    }
    return (
      <HomeView
        groups={groups}
        allocations={allocations}
        categories={categories}
        currentUser={null}
        onNavigateToLogin={() => setAuthView('login')}
      />
    );
  }

  // If logged in but clicked "Lihat Halaman Depan"
  if (isViewingPublicHome) {
    return (
      <HomeView
        groups={groups}
        allocations={allocations}
        categories={categories}
        currentUser={currentUser}
        onNavigateToLogin={() => setIsViewingPublicHome(false)}
        onNavigateToDashboard={() => setIsViewingPublicHome(false)}
      />
    );
  }


  // Active selected group object for allocations view
  const activeGroup = groups.find(g => g.id === selectedGroupId) || groups[0] || null;

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

  const totalUsedIps = allocations.filter(a => a.status === 'used').length;

  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'groups': return 'Grup IP (Subnet)';
      case 'categories': return 'Kategori Perangkat';
      case 'users': return 'Akun Pengguna';
      case 'backup': return 'Cadangan & Data';
    }
  };


  const handleSelectTab = (tab: NavTab) => {
    if (tab === 'groups') {
      setIsViewingGroupAllocations(false);
    }
    setCurrentTab(tab);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50 text-slate-800 font-poppins antialiased selection:bg-blue-600 selection:text-white">
      
      {/* 1. Left STATIC Dedicated Sidebar (Permanently anchored & pinned) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        totalGroups={groups.length}
        totalUsedIps={totalUsedIps}
        totalCategories={categories.length}
        totalUsers={users.length}
      />

      {/* 2. Main Work Area with Independent Smooth Scroll */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0 bg-slate-50">
        
        {/* Top Header (Sticky) */}
        <Header 
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
          title={getTabTitle(currentTab)}
          onViewHome={() => setIsViewingPublicHome(true)}
        />


        {/* Dynamic Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Global Search Results Alert */}
          {globalSearch.trim() && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between text-xs text-blue-900 shadow-xs">
              <div>
                Ditemukan <strong>{displayedAllocations.length}</strong> IP yang cocok dengan kata kunci "<strong>{globalSearch}</strong>".
              </div>
              <button
                onClick={() => setGlobalSearch('')}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Reset Pencarian
              </button>
            </div>
          )}

          {/* TAB 1: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <DashboardView
              groups={groups}
              allocations={allocations}
              categories={categories}
              onNavigateToGroups={() => {
                setIsViewingGroupAllocations(false);
                setCurrentTab('groups');
              }}
              onNavigateToAllocations={(groupId) => {
                if (groupId) setSelectedGroupId(groupId);
                setIsViewingGroupAllocations(true);
                setCurrentTab('groups');
              }}
              onAddGroup={() => {
                setEditingGroup(null);
                setIsGroupModalOpen(true);
              }}
              onAddAllocation={() => {
                setEditingAlloc(null);
                setPresetIp(undefined);
                setIsAllocModalOpen(true);
              }}
            />
          )}

          {/* TAB 2: GRUP IP (SUBNET & VLAN MANAGEMENT DENGAN KELOLA ALOKASI HOST) */}
          {currentTab === 'groups' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {isViewingGroupAllocations && activeGroup ? (
                /* Sub-tampilan: Kelola Alokasi IP Host untuk Subnet Terpilih */
                <div className="space-y-4">
                  {/* Top Bar: Tombol Kembali & Tambah Alokasi */}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => setIsViewingGroupAllocations(false)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold shadow-xs transition-all cursor-pointer group"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-slate-500 group-hover:text-slate-900" />
                      <span>Kembali</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingAlloc(null);
                        setPresetIp(undefined);
                        setIsAllocModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Alokasikan IP Host</span>
                    </button>
                  </div>

                  {/* Active Group Header Card */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span 
                            className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs"
                            style={{ backgroundColor: activeGroup.color || '#3b82f6' }}
                          />
                          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                            {activeGroup.name}
                          </h2>
                          {activeGroup.vlanId && (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                              VLAN {activeGroup.vlanId}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-lg text-blue-700 font-bold border border-slate-200">
                            {activeGroup.cidr}
                          </span>
                          <span>•</span>
                          <span>Gateway: <strong className="text-slate-800 font-mono">{activeGroup.gateway}</strong></span>
                          {activeGroup.location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {activeGroup.location}
                              </span>
                            </>
                          )}
                          {activeGroup.pic && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                {activeGroup.pic}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* View Mode Toggle & XLSX Export */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                          <button
                            onClick={() => setViewMode('matrix')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              viewMode === 'matrix'
                                ? 'bg-white text-blue-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Peta Grid Visual Seluruh Host"
                          >
                            <Grid className="w-3.5 h-3.5" />
                            <span>Visual Grid</span>
                          </button>
                          <button
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

                        <button
                          onClick={() => exportToXlsx(activeGroup, allocations.filter(a => a.groupId === activeGroup.id))}
                          title="Ekspor Laporan Excel (.xlsx)"
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Ekspor (.xlsx)</span>
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
                </div>
              ) : (
                /* Sub-tampilan: Daftar Kartu Grup IP */
                <div className="space-y-6">
                  {/* Top Banner */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        Manajemen Grup IP & Subnet
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Kelola segmen subnet CIDR, VLAN ID, Gateway, dan lokasi infrastruktur jaringan.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingGroup(null);
                        setIsGroupModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Grup IP Baru</span>
                    </button>
                  </div>

                  {/* Grid of Groups */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {groups.map(grp => {
                      const grpAllocs = allocations.filter(a => a.groupId === grp.id);
                      const used = grpAllocs.filter(a => a.status === 'used').length;
                      const resv = grpAllocs.filter(a => a.status === 'reserved' || a.status === 'dhcp').length;
                      const subnet = parseCidr(grp.cidr);
                      const usable = subnet ? subnet.usableHosts : 254;
                      const pct = usable > 0 ? Math.round(((used + resv) / usable) * 100) : 0;
                      const hasUsedIps = used > 0 || grpAllocs.length > 0;

                      return (
                        <div
                          key={grp.id}
                          className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
                        >
                          <div 
                            className="absolute top-0 left-0 right-0 h-1.5"
                            style={{ backgroundColor: grp.color || '#3b82f6' }}
                          />

                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-extrabold text-slate-900 text-base">
                                {grp.name}
                              </h3>
                              {grp.vlanId && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex-shrink-0">
                                  VLAN {grp.vlanId}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-mono mb-3">
                              <span className="bg-slate-100 px-2 py-0.5 rounded-lg text-blue-700 font-bold border border-slate-200">
                                {grp.cidr}
                              </span>
                              <span>GW: {grp.gateway}</span>
                            </div>

                            <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                              {grp.description || 'Tidak ada catatan deskripsi.'}
                            </p>

                            {(grp.location || grp.pic) && (
                              <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 pt-2 border-t border-slate-100">
                                {grp.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{grp.location}</span>
                                  </span>
                                )}
                                {grp.pic && (
                                  <span className="flex items-center gap-1">
                                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{grp.pic}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Footer Actions */}
                          <div className="pt-3 border-t border-slate-100 space-y-2.5">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-500">Host Terpakai:</span>
                              <span className="text-slate-900">
                                <strong className="text-blue-600 font-black">{used}</strong> / {usable} IP ({pct}%)
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedGroupId(grp.id);
                                  setIsViewingGroupAllocations(true);
                                }}
                                className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <span>Kelola IP Host</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setEditingGroup(grp);
                                  setIsGroupModalOpen(true);
                                }}
                                title="Edit Grup"
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                disabled={hasUsedIps}
                                onClick={() => {
                                  if (hasUsedIps) return;
                                  if (window.confirm(`Hapus grup "${grp.name}" (${grp.cidr})?`)) {
                                    handleDeleteGroup(grp.id);
                                  }
                                }}
                                title={
                                  hasUsedIps
                                    ? `Tidak dapat dihapus: masih ada ${used > 0 ? `${used} IP terpakai` : `${grpAllocs.length} data IP`} pada grup ini`
                                    : "Hapus Grup IP"
                                }
                                className={`p-2 rounded-xl transition-all ${
                                  hasUsedIps
                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200/70'
                                    : 'bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white cursor-pointer'
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}



          {/* TAB 3: KATEGORI PERANGKAT */}
          {currentTab === 'categories' && (
            <CategoriesView
              categories={categories}
              allocations={allocations}
              onSaveCategory={handleSaveCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {/* TAB 4: PENGGUNA SISTEM */}
          {currentTab === 'users' && (
            <UsersView
              users={users}
              currentUser={currentUser}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {/* TAB 5: CADANGAN & DATA */}
          {currentTab === 'backup' && (
            <BackupView
              groups={groups}
              allocations={allocations}
              categories={categories}
              users={users}
              onImportData={handleImportData}
              onResetDemo={handleResetDemo}
              onWipeAllData={handleWipeAllData}
            />
          )}


        </main>
      </div>

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
          categories={categories}
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
