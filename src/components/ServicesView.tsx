import React, { useState, useMemo } from 'react';
import { 
  ServerCog, 
  Plus, 
  Search, 
  ArrowLeft, 
  ExternalLink, 
  Copy, 
  Check, 
  Activity, 
  Edit2, 
  Trash2, 
  Sparkles, 
  Filter, 
  Layers, 
  Network, 
  Globe, 
  Database, 
  Terminal, 
  ShieldCheck, 
  HardDrive, 
  Radio, 
  Video, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Play,
  RotateCw,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';
import { 
  IPService, 
  IPAllocation, 
  IPGroup, 
  ServiceCategory, 
  ServiceProtocol, 
  ServiceStatus,
  DeviceCategory 
} from '../types/ipam';
import { 
  COMMON_SERVICE_PRESETS, 
  SERVICE_CATEGORIES, 
  getCategoryMeta, 
  ServicePreset 
} from '../utils/servicePresets';
import { ServiceModal } from './ServiceModal';
import { showConfirm, showSuccess } from '../utils/swal';

interface ServicesViewProps {
  services: IPService[];
  allocations: IPAllocation[];
  groups: IPGroup[];
  categories?: DeviceCategory[];
  focusedIp?: string | null;
  onSelectIp?: (ip: string | null) => void;
  onBackToGroups?: (targetIp?: string | null) => void;
  onSaveService: (service: Partial<IPService>) => void;
  onDeleteService: (id: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  allocations,
  groups,
  categories = [],
  focusedIp,
  onSelectIp,
  onBackToGroups,
  onSaveService,
  onDeleteService
}) => {
  const [selectedIp, setSelectedIp] = useState<string>(focusedIp || 'all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [protocolFilter, setProtocolFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedSubnetId, setSelectedSubnetId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<IPService | null>(null);
  const [presetForNew, setPresetForNew] = useState<ServicePreset | null>(null);

  // Port testing simulator state
  const [testingServiceId, setTestingServiceId] = useState<string | null>(null);
  const [isTestingAll, setIsTestingAll] = useState(false);

  // Keep selectedIp synced if prop changes
  React.useEffect(() => {
    if (focusedIp) {
      setSelectedIp(focusedIp);
    }
  }, [focusedIp]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Find allocation and group for currently focused IP
  const activeAllocation = useMemo(() => {
    if (selectedIp === 'all') return null;
    return allocations.find(a => a.ip === selectedIp) || null;
  }, [selectedIp, allocations]);

  const activeGroup = useMemo(() => {
    if (!activeAllocation) return null;
    return groups.find(g => g.id === activeAllocation.groupId) || null;
  }, [activeAllocation, groups]);

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return services.filter(svc => {
      // Filter by IP
      if (selectedIp !== 'all' && svc.ip !== selectedIp) return false;

      // Filter by Subnet if set
      if (selectedSubnetId !== 'all') {
        const alloc = allocations.find(a => a.ip === svc.ip);
        if (!alloc || alloc.groupId !== selectedSubnetId) return false;
      }

      // Filter by Status
      if (statusFilter !== 'all' && svc.status !== statusFilter) return false;

      // Filter by Protocol
      if (protocolFilter !== 'all' && svc.protocol !== protocolFilter) return false;

      // Filter by Category
      if (categoryFilter !== 'all' && svc.category !== categoryFilter) return false;

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const alloc = allocations.find(a => a.ip === svc.ip);
        const matchName = svc.name.toLowerCase().includes(q);
        const matchPort = svc.port.toString().includes(q);
        const matchIp = svc.ip.toLowerCase().includes(q);
        const matchDesc = svc.description?.toLowerCase().includes(q) || false;
        const matchVer = svc.version?.toLowerCase().includes(q) || false;
        const matchHost = alloc?.hostname?.toLowerCase().includes(q) || false;
        if (!matchName && !matchPort && !matchIp && !matchDesc && !matchVer && !matchHost) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort by IP first, then port number
      if (a.ip !== b.ip) return a.ip.localeCompare(b.ip);
      return a.port - b.port;
    });
  }, [services, selectedIp, selectedSubnetId, statusFilter, protocolFilter, categoryFilter, search, allocations]);

  // KPI Calculations
  const totalListed = filteredServices.length;
  const activeCount = filteredServices.filter(s => s.status === 'active').length;
  const inactiveCount = filteredServices.filter(s => s.status === 'inactive').length;
  const filteredCount = filteredServices.filter(s => s.status === 'filtered').length;

  // Single port test simulator
  const handleTestPort = (service: IPService) => {
    setTestingServiceId(service.id);
    setTimeout(() => {
      const simulatedLatency = Number((Math.random() * 2 + 0.3).toFixed(1));
      const simulatedStatus = service.status === 'inactive' ? 'closed' : 'open';
      onSaveService({
        ...service,
        lastChecked: new Date().toISOString(),
        checkStatus: simulatedStatus,
        checkLatency: simulatedLatency
      });
      setTestingServiceId(null);
    }, 600);
  };

  // Test all ports batch simulator
  const handleTestAllPorts = () => {
    if (filteredServices.length === 0) return;
    setIsTestingAll(true);
    setTimeout(() => {
      filteredServices.forEach((service, idx) => {
        setTimeout(() => {
          const simulatedLatency = Number((Math.random() * 2.5 + 0.2).toFixed(1));
          const simulatedStatus = service.status === 'inactive' ? 'closed' : 'open';
          onSaveService({
            ...service,
            lastChecked: new Date().toISOString(),
            checkStatus: simulatedStatus,
            checkLatency: simulatedLatency
          });
        }, idx * 100);
      });
      setTimeout(() => {
        setIsTestingAll(false);
      }, filteredServices.length * 100 + 400);
    }, 400);
  };

  const getCategoryIcon = (cat: ServiceCategory) => {
    switch (cat) {
      case 'web': return <Globe className="w-3.5 h-3.5" />;
      case 'database': return <Database className="w-3.5 h-3.5" />;
      case 'remote': return <Terminal className="w-3.5 h-3.5" />;
      case 'security': return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'file': return <HardDrive className="w-3.5 h-3.5" />;
      case 'network': return <Network className="w-3.5 h-3.5" />;
      case 'streaming': return <Video className="w-3.5 h-3.5" />;
      case 'iot': return <Cpu className="w-3.5 h-3.5" />;
      default: return <ServerCog className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER & BREADCRUMB BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBackToGroups && (
            <button
              onClick={() => onBackToGroups(selectedIp !== 'all' ? selectedIp : (focusedIp || null))}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-xs transition-all cursor-pointer group"
              title="Kembali ke halaman kelola alokasi IP host"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:hover:text-slate-100 dark:text-slate-100" />
              <span>Kembali ke Kelola IP Host</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-xs">
                <ServerCog className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Layanan & Port Aplikasi
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manajemen port terbuka, service daemon, dan aplikasi yang terpasang pada host IP.
            </p>
          </div>
        </div>

        {/* Action Button: Tambah Layanan */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleTestAllPorts}
            disabled={isTestingAll || filteredServices.length === 0}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isTestingAll 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 shadow-xs'
            }`}
            title="Simulasikan uji ping & respon seluruh port terdaftar"
          >
            <RotateCw className={`w-3.5 h-3.5 text-blue-600 ${isTestingAll ? 'animate-spin' : ''}`} />
            <span>{isTestingAll ? 'Sedang Menguji...' : 'Uji Semua Port'}</span>
          </button>

          <button
            onClick={() => {
              setEditingService(null);
              setPresetForNew(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Layanan</span>
          </button>
        </div>
      </div>

      {/* 2. TARGET HOST CARD / IP CONTEXT SELECTOR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Host Info Context */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Fokus Host IP:
              </span>

              {activeAllocation ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-base font-black text-slate-900 dark:text-slate-100 bg-blue-50 px-2.5 py-0.5 rounded-xl border border-blue-200">
                    {activeAllocation.ip}
                  </span>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {activeAllocation.hostname}
                  </span>
                  {(() => {
                    const raw = (activeAllocation.deviceType || '').toLowerCase();
                    const cleanRaw = raw.replace(/_/g, ' ');
                    const cat = categories.find(c => 
                      c.id.toLowerCase() === raw || 
                      c.name.toLowerCase() === raw ||
                      c.id.toLowerCase().replace(/_/g, ' ') === cleanRaw ||
                      c.name.toLowerCase().replace(/_/g, ' ') === cleanRaw
                    );
                    return (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {cat ? cat.name : activeAllocation.deviceType.replace(/_/g, ' ')}
                      </span>
                    );
                  })()}
                  {activeGroup && (
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      Subnet: {activeGroup.name} ({activeGroup.cidr})
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    Semua Host IP ({allocations.length} Host Terdaftar)
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Menampilkan seluruh port & layanan di seluruh subnet jaringan.
                  </span>
                </div>
              )}
            </div>

            {activeAllocation && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                {activeAllocation.macAddress && (
                  <span>MAC: <strong className="font-mono text-slate-700 dark:text-slate-300">{activeAllocation.macAddress}</strong></span>
                )}
                {activeAllocation.assignedTo && (
                  <>
                    <span>•</span>
                    <span>PIC: <strong className="text-slate-700 dark:text-slate-300">{activeAllocation.assignedTo}</strong></span>
                  </>
                )}
                {activeAllocation.department && (
                  <>
                    <span>•</span>
                    <span>Departemen: <strong className="text-slate-700 dark:text-slate-300">{activeAllocation.department}</strong></span>
                  </>
                )}
                {activeAllocation.notes && (
                  <>
                    <span>•</span>
                    <span className="italic text-slate-400 truncate max-w-sm">"{activeAllocation.notes}"</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quick IP Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:block">
              Pilih Host:
            </label>
            <select
              value={selectedIp}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedIp(val);
                if (onSelectIp) onSelectIp(val === 'all' ? null : val);
              }}
              className="bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer min-w-[200px]"
            >
              <option value="all">🌐 Tampilkan Semua Host IP</option>
              <optgroup label="Daftar Host IP Terdaftar">
                {allocations.map(a => {
                  const raw = (a.deviceType || '').toLowerCase();
                  const cleanRaw = raw.replace(/_/g, ' ');
                  const cat = categories.find(c => 
                    c.id.toLowerCase() === raw || 
                    c.name.toLowerCase() === raw ||
                    c.id.toLowerCase().replace(/_/g, ' ') === cleanRaw ||
                    c.name.toLowerCase().replace(/_/g, ' ') === cleanRaw
                  );
                  return (
                    <option key={a.id} value={a.ip}>
                      {a.ip} — {a.hostname} ({cat ? cat.name : (a.deviceType ? a.deviceType.replace(/_/g, ' ') : '-')})
                    </option>
                  );
                })}
              </optgroup>
            </select>
          </div>

        </div>
      </div>

      {/* 3. KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Services */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Layanan</span>
            <ServerCog className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{totalListed}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Port & Aplikasi Terdata</div>
        </div>

        {/* Active Open Ports */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Port Terbuka (Open)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Layanan Aktif / Listening</div>
        </div>

        {/* Closed Ports */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Port Nonaktif</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{inactiveCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tidak Beroperasi / Off</div>
        </div>

        {/* Filtered Ports */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Terfilter Firewall</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{filteredCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Akses Dibatasi Firewall</div>
        </div>
      </div>

      {/* 4. QUICK PRESET STRIP */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Katalog Template Cepat (Klik untuk Menambahkan ke Host):</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Pintasan port aplikasi populer
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {COMMON_SERVICE_PRESETS.slice(0, 12).map(preset => (
            <button
              key={`${preset.port}-${preset.protocol}-${preset.name}`}
              onClick={() => {
                setEditingService(null);
                setPresetForNew(preset);
                setIsModalOpen(true);
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 text-slate-700 dark:text-slate-300 hover:text-blue-700 border border-slate-200/80 hover:border-blue-300 font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3 h-3 text-blue-600" />
              <span>{preset.name.split(' ')[0]}</span>
              <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded">
                {preset.port}/{preset.protocol}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. SEARCH, FILTER BAR & TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col">
        
        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama layanan, nomor port, host, versi..."
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Subnet Filter (if viewing all) */}
            {selectedIp === 'all' && (
              <select
                value={selectedSubnetId}
                onChange={(e) => setSelectedSubnetId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 font-medium focus:bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="all">Semua Subnet</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 font-medium focus:bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">Semua Status Port</option>
              <option value="active">🟢 Aktif / Open</option>
              <option value="inactive">🔴 Nonaktif / Closed</option>
              <option value="filtered">🟡 Terfilter Firewall</option>
            </select>

            {/* Protocol Filter */}
            <select
              value={protocolFilter}
              onChange={(e) => setProtocolFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 font-medium focus:bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">Semua Protokol</option>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="TCP/UDP">TCP/UDP</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 font-medium focus:bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">Semua Kategori</option>
              {SERVICE_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-blue-700 shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 dark:text-slate-200'
                }`}
                title="Tampilan Tabel"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white dark:bg-slate-900 text-blue-700 shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 dark:text-slate-200'
                }`}
                title="Tampilan Kartu"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

        {/* 6. CONTENT: TABLE OR CARDS */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4">Status Port</th>
                  <th className="py-3 px-4">Port / Protokol</th>
                  <th className="py-3 px-4">Nama Layanan & Kategori</th>
                  <th className="py-3 px-4">Alamat Host / IP</th>
                  <th className="py-3 px-4">Versi Software</th>
                  <th className="py-3 px-4">Akses Cepat / Endpoint</th>
                  <th className="py-3 px-4">Uji Koneksi Port</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 dark:text-slate-300">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                      Tidak ada data layanan atau port yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map(svc => {
                    const meta = getCategoryMeta(svc.category);
                    const alloc = allocations.find(a => a.ip === svc.ip);
                    const isTesting = testingServiceId === svc.id || isTestingAll;

                    return (
                      <tr 
                        key={svc.id} 
                        className="hover:bg-blue-50/40 transition-colors group"
                      >
                        {/* Status Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            svc.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : svc.status === 'inactive'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              svc.status === 'active' ? 'bg-emerald-500 animate-pulse' : svc.status === 'inactive' ? 'bg-rose-500' : 'bg-amber-500'
                            }`} />
                            <span className="capitalize">
                              {svc.status === 'active' ? 'Aktif (Open)' : svc.status === 'inactive' ? 'Nonaktif' : 'Filtered'}
                            </span>
                          </span>
                        </td>

                        {/* Port & Protocol Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-sm font-black text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg">
                              :{svc.port}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {svc.protocol}
                            </span>
                          </div>
                        </td>

                        {/* Service Name & Category */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            {svc.name}
                          </div>
                          <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                            {getCategoryIcon(svc.category)}
                            <span>{meta.label}</span>
                          </div>
                        </td>

                        {/* Host IP Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-blue-700">{svc.ip}</span>
                            {alloc && (
                              <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400">
                                ({alloc.hostname})
                              </span>
                            )}
                            <button
                              onClick={() => handleCopy(`${svc.ip}:${svc.port}`)}
                              title="Salin IP:Port"
                              className="text-slate-400 hover:text-slate-700 dark:text-slate-300 p-0.5 cursor-pointer"
                            >
                              {copiedText === `${svc.ip}:${svc.port}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Version Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                          {svc.version ? (
                            <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                              {svc.version}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* URL / Endpoint Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {svc.url ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={svc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline max-w-[160px] truncate"
                                title={`Buka ${svc.url}`}
                              >
                                {svc.url}
                              </a>
                              <a
                                href={svc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-blue-600 p-0.5"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Port Test Simulator Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isTesting ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-semibold">
                                <RotateCw className="w-3 h-3 animate-spin" />
                                <span>Menguji...</span>
                              </span>
                            ) : svc.checkStatus === 'open' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Open ({svc.checkLatency ? `${svc.checkLatency}ms` : 'ok'})
                              </span>
                            ) : svc.checkStatus === 'closed' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                Closed
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                Belum diuji
                              </span>
                            )}

                            <button
                              onClick={() => handleTestPort(svc)}
                              disabled={isTesting}
                              title="Uji Port Ini Sekarang"
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Activity className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Notes Column */}
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 dark:text-slate-400" title={svc.description}>
                          {svc.description || '-'}
                        </td>

                        {/* Action Buttons Column */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => {
                                setEditingService(svc);
                                setPresetForNew(null);
                                setIsModalOpen(true);
                              }}
                              title="Edit Layanan & Port"
                              className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                const confirmed = await showConfirm({
                                  title: 'Hapus Layanan?',
                                  text: `Apakah Anda yakin ingin menghapus layanan "${svc.name}" (Port :${svc.port}) dari IP ${svc.ip}?`,
                                  confirmButtonText: 'Ya, Hapus',
                                  cancelButtonText: 'Batal',
                                  isDanger: true
                                });
                                if (confirmed) {
                                  onDeleteService(svc.id);
                                  showSuccess('Layanan Dihapus', `Layanan "${svc.name}" berhasil dihapus.`);
                                }
                              }}
                              title="Hapus Layanan Ini"
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View Mode */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                Tidak ada data layanan atau port yang cocok dengan filter.
              </div>
            ) : (
              filteredServices.map(svc => {
                const meta = getCategoryMeta(svc.category);
                const alloc = allocations.find(a => a.ip === svc.ip);

                return (
                  <div
                    key={svc.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all space-y-3 relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                            {svc.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                              :{svc.port} / {svc.protocol}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                              {meta.label}
                            </span>
                          </div>
                        </div>

                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${
                          svc.status === 'active' ? 'bg-emerald-500' : svc.status === 'inactive' ? 'bg-rose-500' : 'bg-amber-500'
                        }`} title={svc.status} />
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Host IP:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{svc.ip}</span>
                        </div>
                        {alloc && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Hostname:</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{alloc.hostname}</span>
                          </div>
                        )}
                        {svc.version && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Versi:</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">{svc.version}</span>
                          </div>
                        )}
                        {svc.url && (
                          <div className="flex justify-between items-center gap-2 pt-1">
                            <span className="text-slate-400">Endpoint:</span>
                            <a
                              href={svc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-xs text-blue-600 hover:underline truncate max-w-[150px]"
                            >
                              {svc.url}
                            </a>
                          </div>
                        )}
                      </div>

                      {svc.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 line-clamp-2">
                          {svc.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleTestPort(svc)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>{svc.checkStatus === 'open' ? `Open (${svc.checkLatency}ms)` : 'Uji Port'}</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setEditingService(svc);
                            setIsModalOpen(true);
                          }}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            const confirmed = await showConfirm({
                              title: 'Hapus Layanan?',
                              text: `Apakah Anda yakin ingin menghapus layanan "${svc.name}" dari IP ${svc.ip}?`,
                              confirmButtonText: 'Ya, Hapus',
                              cancelButtonText: 'Batal',
                              isDanger: true
                            });
                            if (confirmed) {
                              onDeleteService(svc.id);
                              showSuccess('Layanan Dihapus', `Layanan "${svc.name}" berhasil dihapus.`);
                            }
                          }}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

      </div>

      {/* Service Modal */}
      {isModalOpen && (
        <ServiceModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingService(null);
            setPresetForNew(null);
          }}
          onSave={onSaveService}
          editService={editingService}
          presetIp={selectedIp !== 'all' ? selectedIp : allocations[0]?.ip}
          allocations={allocations}
          groups={groups}
          existingServices={services}
          categories={categories}
        />
      )}

    </div>
  );
};
