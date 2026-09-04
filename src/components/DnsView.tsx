import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Printer, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Layers,
  Sparkles,
  Server,
  ArrowRight,
  Filter,
  Check,
  Clock,
  Send
} from 'lucide-react';
import { DnsRecord, DnsRecordType, DnsRecordStatus, IPGroup, IPAllocation } from '../types/ipam';
import { showConfirm, showSuccess, showWarning } from '../utils/swal';

interface DnsViewProps {
  dnsRecords: DnsRecord[];
  groups: IPGroup[];
  allocations: IPAllocation[];
  onSaveRecord: (record: Partial<DnsRecord>) => void;
  onDeleteRecord: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (record: DnsRecord) => void;
  onOpenPrintModal: () => void;
}

export const DnsView: React.FC<DnsViewProps> = ({
  dnsRecords,
  groups,
  allocations,
  onSaveRecord,
  onDeleteRecord,
  onOpenAddModal,
  onOpenEditModal,
  onOpenPrintModal
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // DNS Resolver Simulator State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [testDomain, setTestDomain] = useState('');
  const [testType, setTestType] = useState<DnsRecordType>('A');
  const [simResult, setSimResult] = useState<{
    found: boolean;
    records: DnsRecord[];
    latency: number;
    resolvedAt: string;
    server: string;
  } | null>(null);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return dnsRecords.filter(r => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchDomain = r.domain.toLowerCase().includes(q);
        const matchValue = r.value.toLowerCase().includes(q);
        const matchDesc = (r.description || '').toLowerCase().includes(q);
        const matchIp = (r.ip || '').toLowerCase().includes(q);
        if (!matchDomain && !matchValue && !matchDesc && !matchIp) return false;
      }
      return true;
    });
  }, [dnsRecords, typeFilter, statusFilter, search]);

  // Statistics
  const stats = useMemo(() => {
    const total = dnsRecords.length;
    const active = dnsRecords.filter(r => r.status === 'active').length;
    const aRecords = dnsRecords.filter(r => r.type === 'A' || r.type === 'AAAA').length;
    const cnameRecords = dnsRecords.filter(r => r.type === 'CNAME').length;
    const mailServiceRecords = dnsRecords.filter(r => r.type === 'MX' || r.type === 'SRV' || r.type === 'TXT').length;
    return { total, active, aRecords, cnameRecords, mailServiceRecords };
  }, [dnsRecords]);

  // Handle Delete with SweetAlert2
  const handleDelete = async (record: DnsRecord) => {
    const confirmed = await showConfirm({
      title: 'Hapus Catatan DNS?',
      text: `Apakah Anda yakin ingin menghapus catatan "${record.domain}" (${record.type} -> ${record.value})?`,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      isDanger: true
    });

    if (confirmed) {
      onDeleteRecord(record.id);
      showSuccess('Catatan DNS Terhapus', `Record ${record.domain} berhasil dihapus dari sistem.`);
    }
  };

  // Run DNS Resolution Simulation
  const handleRunResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testDomain.trim()) return;

    const query = testDomain.trim().toLowerCase();
    const matched = dnsRecords.filter(r => {
      const isDomainMatch = r.domain.toLowerCase() === query || r.domain.toLowerCase().startsWith(query);
      const isTypeMatch = testType === 'A' ? (r.type === 'A' || r.type === 'CNAME') : r.type === testType;
      return isDomainMatch && isTypeMatch && r.status === 'active';
    });

    setSimResult({
      found: matched.length > 0,
      records: matched,
      latency: Math.floor(Math.random() * 12) + 2, // 2-14ms simulated DNS lookup
      resolvedAt: new Date().toLocaleTimeString('id-ID'),
      server: '192.168.10.1#53 (Local Cache)'
    });
  };

  const getTypeBadgeStyle = (type: DnsRecordType) => {
    switch (type) {
      case 'A':
      case 'AAAA':
        return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'CNAME':
        return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'MX':
        return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'TXT':
        return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'NS':
        return 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Manajemen DNS (Domain Name System)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola record A, AAAA, CNAME, PTR, MX, TXT, pemetaan FQDN ke IP host, dan simulasi resolusi nama.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Uji Resolusi Simulator Button */}
          <button
            onClick={() => {
              setIsSimulatorOpen(!isSimulatorOpen);
              if (!testDomain && dnsRecords[0]) {
                setTestDomain(dnsRecords[0].domain);
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isSimulatorOpen
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Simulasi Uji DNS</span>
          </button>

          {/* Tombol Cetak Dokumen DNS */}
          <button
            onClick={onOpenPrintModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Cetak Direktori Catatan DNS (A4)"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span>Cetak Direktori</span>
          </button>

          {/* Tambah DNS Record Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah DNS Baru</span>
          </button>
        </div>
      </div>

      {/* Simulator Panel (Expandable) */}
      {isSimulatorOpen && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-900/60 rounded-3xl p-6 text-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-cyan-100">
                Simulator Query DNS Resolusi (Dig / Nslookup)
              </h3>
            </div>
            <button
              onClick={() => setIsSimulatorOpen(false)}
              className="text-xs text-indigo-300 hover:text-white cursor-pointer"
            >
              Tutup Panel
            </button>
          </div>

          <form onSubmit={handleRunResolve} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-indigo-200 mb-1">
                Domain FQDN / Hostname Uji:
              </label>
              <input
                type="text"
                required
                value={testDomain}
                onChange={(e) => setTestDomain(e.target.value)}
                placeholder="Contoh: portal.corp.lan atau gateway.office.lan"
                className="w-full px-3.5 py-2 bg-indigo-950/70 border border-indigo-700/60 rounded-xl text-xs font-mono text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div className="w-full sm:w-32">
              <label className="block text-[11px] font-semibold text-indigo-200 mb-1">
                Tipe Record:
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as DnsRecordType)}
                className="w-full px-3 py-2 bg-indigo-950/70 border border-indigo-700/60 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="A">A (IPv4)</option>
                <option value="AAAA">AAAA (IPv6)</option>
                <option value="CNAME">CNAME</option>
                <option value="MX">MX</option>
                <option value="TXT">TXT</option>
                <option value="NS">NS</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Query</span>
            </button>
          </form>

          {/* Simulation Output */}
          {simResult && (
            <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-indigo-800/80 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                <span>;; QUESTION SECTION: <strong>{testDomain}</strong> IN {testType}</span>
                <span className="text-cyan-400">Response: {simResult.latency} ms</span>
              </div>

              {simResult.found ? (
                <div className="space-y-1 py-1">
                  <div className="text-emerald-400 font-bold text-[11px]">;; ANSWER SECTION:</div>
                  {simResult.records.map(r => (
                    <div key={r.id} className="flex items-center gap-3 text-slate-200 pl-3">
                      <span className="text-cyan-300 font-bold">{r.domain}</span>
                      <span className="text-slate-500">{r.ttl}</span>
                      <span className="text-amber-300 font-bold">IN</span>
                      <span className="text-purple-300 font-bold">{r.type}</span>
                      <span className="text-emerald-300 font-bold">{r.value}</span>
                    </div>
                  ))}
                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-center gap-4">
                    <span>;; SERVER: {simResult.server}</span>
                    <span>;; STATUS: NOERROR</span>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-rose-400">
                  <span>;; ->>HEADER&lt;&lt;- opcode: QUERY, status: <strong>NXDOMAIN</strong> (Domain tidak ditemukan atau nonaktif)</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total DNS Records</span>
            <span className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Globe className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {stats.total}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{stats.active} Aktif Resolving</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Record A (Host IPv4)</span>
            <span className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Server className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {stats.aRecords}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Pemetaan langsung ke IP host
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Alias (CNAME)</span>
            <span className="p-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {stats.cnameRecords}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Nama kanonikal subdomain
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mail & Layanan (MX/SRV)</span>
            <span className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.mailServiceRecords}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Routing email & verifikasi SPF
          </p>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        
        {/* Search & Filter Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:flex-none">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari domain, IP, deskripsi..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Semua Tipe Record</option>
              <option value="A">Tipe A (IPv4)</option>
              <option value="AAAA">Tipe AAAA (IPv6)</option>
              <option value="CNAME">Tipe CNAME (Alias)</option>
              <option value="MX">Tipe MX (Mail)</option>
              <option value="TXT">Tipe TXT (Text)</option>
              <option value="PTR">Tipe PTR (Reverse)</option>
              <option value="NS">Tipe NS (Nameserver)</option>
              <option value="SRV">Tipe SRV (Service)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif (Enabled)</option>
              <option value="inactive">Nonaktif (Disabled)</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium self-end sm:self-center">
            Menampilkan <strong>{filteredRecords.length}</strong> catatan DNS
          </div>

        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Nama Host / FQDN</th>
                <th className="py-3 px-4 text-center">Tipe</th>
                <th className="py-3 px-4">Target Nilai (IP / Domain)</th>
                <th className="py-3 px-4">Subnet Terkait</th>
                <th className="py-3 px-4 text-center">TTL</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Catatan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                    Tidak ada catatan DNS yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(item => {
                  const linkedGroup = groups.find(g => g.id === item.groupId);
                  const linkedAlloc = allocations.find(a => a.ip === item.value || a.ip === item.ip);

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Domain Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {item.domain}
                          </span>
                        </div>
                      </td>

                      {/* Record Type Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold border ${getTypeBadgeStyle(item.type)}`}>
                          {item.type}
                        </span>
                      </td>

                      {/* Target Value Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          <span>{item.value}</span>
                          {item.priority !== undefined && (
                            <span className="text-[10px] font-sans font-semibold text-slate-400">
                              (Prio: {item.priority})
                            </span>
                          )}
                          {linkedAlloc && (
                            <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
                              {linkedAlloc.hostname}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Subnet Link */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {linkedGroup ? (
                          <div className="flex items-center gap-1.5">
                            <span 
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: linkedGroup.color || '#3b82f6' }}
                            />
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                              {linkedGroup.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* TTL Column */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono text-slate-500 dark:text-slate-400">
                        {item.ttl}s
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          item.status === 'active'
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span className="capitalize">{item.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                        </span>
                      </td>

                      {/* Description Column */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 dark:text-slate-400" title={item.description}>
                        {item.description || '-'}
                      </td>

                      {/* Action Column */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onOpenEditModal(item)}
                            title="Edit Catatan DNS"
                            className="p-1.5 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            title="Hapus Catatan DNS"
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/40 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
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

      </div>

    </div>
  );
};
