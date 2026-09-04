import React, { useState, useEffect } from 'react';
import { 
  X, 
  Globe, 
  AlertCircle, 
  Check, 
  Server, 
  HelpCircle,
  Clock,
  ArrowRight,
  Shield
} from 'lucide-react';
import { DnsRecord, DnsRecordType, DnsRecordStatus, IPGroup, IPAllocation } from '../types/ipam';

interface DnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Partial<DnsRecord>) => void;
  editRecord?: DnsRecord | null;
  groups: IPGroup[];
  allocations: IPAllocation[];
}

export const DnsModal: React.FC<DnsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editRecord,
  groups,
  allocations
}) => {
  const [domain, setDomain] = useState('');
  const [type, setType] = useState<DnsRecordType>('A');
  const [value, setValue] = useState('');
  const [ttl, setTtl] = useState<number>(3600);
  const [priority, setPriority] = useState<number | ''>('');
  const [groupId, setGroupId] = useState<string>('');
  const [status, setStatus] = useState<DnsRecordStatus>('active');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Quick IP selector helper
  const [selectedIpPick, setSelectedIpPick] = useState<string>('');

  useEffect(() => {
    if (editRecord) {
      setDomain(editRecord.domain);
      setType(editRecord.type);
      setValue(editRecord.value);
      setTtl(editRecord.ttl || 3600);
      setPriority(editRecord.priority !== undefined ? editRecord.priority : '');
      setGroupId(editRecord.groupId || '');
      setStatus(editRecord.status);
      setDescription(editRecord.description || '');
      setSelectedIpPick(editRecord.ip || editRecord.value || '');
    } else {
      setDomain('');
      setType('A');
      setValue('');
      setTtl(3600);
      setPriority('');
      setGroupId(groups[0]?.id || '');
      setStatus('active');
      setDescription('');
      setSelectedIpPick('');
    }
    setFormError(null);
  }, [editRecord, isOpen, groups]);

  if (!isOpen) return null;

  const handleIpSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ip = e.target.value;
    setSelectedIpPick(ip);
    if (ip) {
      setValue(ip);
      const matchedAlloc = allocations.find(a => a.ip === ip);
      if (matchedAlloc) {
        setGroupId(matchedAlloc.groupId);
        if (!domain && matchedAlloc.hostname) {
          setDomain(`${matchedAlloc.hostname.toLowerCase()}.corp.lan`);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanDomain = domain.trim().toLowerCase();
    const cleanValue = value.trim();

    if (!cleanDomain) {
      setFormError('Nama domain / hostname wajib diisi!');
      return;
    }
    if (!cleanValue) {
      setFormError('Target nilai record (IP atau host tujuan) wajib diisi!');
      return;
    }

    if (type === 'A') {
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipv4Regex.test(cleanValue)) {
        setFormError('Untuk record tipe A, nilai harus berupa format IPv4 valid (contoh: 192.168.1.10)!');
        return;
      }
    }

    const payload: Partial<DnsRecord> = {
      id: editRecord ? editRecord.id : undefined,
      domain: cleanDomain,
      type,
      value: cleanValue,
      ttl: Number(ttl) || 3600,
      priority: (type === 'MX' || type === 'SRV') && priority !== '' ? Number(priority) : undefined,
      ip: (type === 'A' || type === 'AAAA') ? cleanValue : undefined,
      groupId: groupId || undefined,
      status,
      description: description.trim() || undefined
    };

    onSave(payload);
    onClose();
  };

  const recordTypes: { type: DnsRecordType; label: string; desc: string }[] = [
    { type: 'A', label: 'A (IPv4)', desc: 'Memetakan hostname ke alamat IPv4' },
    { type: 'AAAA', label: 'AAAA (IPv6)', desc: 'Memetakan hostname ke alamat IPv6' },
    { type: 'CNAME', label: 'CNAME (Alias)', desc: 'Alias nama domain ke domain lain' },
    { type: 'PTR', label: 'PTR (Reverse DNS)', desc: 'Resolusi balik IP ke domain' },
    { type: 'MX', label: 'MX (Mail Server)', desc: 'Pengarah server surat internal' },
    { type: 'TXT', label: 'TXT (Text / SPF)', desc: 'Teks deskriptif atau konfigurasi verifikasi' },
    { type: 'NS', label: 'NS (Name Server)', desc: 'Server DNS otoritatif' },
    { type: 'SRV', label: 'SRV (Service)', desc: 'Lokasi layanan protokol spesifik' },
    { type: 'SOA', label: 'SOA (Authority)', desc: 'Start of Authority zona domain' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                {editRecord ? 'Edit Catatan DNS' : 'Tambah Catatan DNS Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Konfigurasi resolusi nama domain, IP target, dan parameter TTL.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Notification */}
        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Domain / Hostname */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Host / Domain FQDN *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value.toLowerCase().trim())}
                placeholder="misal: gateway.office.lan atau app.corp.net"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-800 transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Gunakan nama hostname internal atau nama domain lengkap (FQDN).
            </p>
          </div>

          {/* Record Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipe Record DNS *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DnsRecordType)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {recordTypes.map(rt => (
                  <option key={rt.type} value={rt.type}>
                    {rt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Record *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DnsRecordStatus)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Aktif (Resolvable)</option>
                <option value="inactive">Nonaktif (Disabled)</option>
              </select>
            </div>
          </div>

          {/* Quick Pick IP Host if type is A */}
          {type === 'A' && allocations.length > 0 && (
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/60 space-y-1.5">
              <label className="text-[11px] font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-600" />
                <span>Pilih dari Inventaris IP Host:</span>
              </label>
              <select
                value={selectedIpPick}
                onChange={handleIpSelect}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Atau Ketik Manual di Bawah --</option>
                {allocations.map(a => (
                  <option key={a.id} value={a.ip}>
                    {a.ip} - {a.hostname} ({a.department || a.assignedTo || 'Unassigned'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Target Value */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Nilai (IP / Domain Tujuan) *
            </label>
            <input
              type="text"
              required
              value={value}
              onChange={(e) => setValue(e.target.value.trim())}
              placeholder={
                type === 'A' 
                  ? 'Contoh: 192.168.10.1' 
                  : type === 'CNAME' 
                  ? 'Contoh: portal.corp.lan' 
                  : type === 'MX'
                  ? 'Contoh: mail.corp.lan'
                  : type === 'TXT'
                  ? 'Contoh: v=spf1 ip4:10.10.20.20 -all'
                  : 'Nilai target'
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-800 transition-all"
            />
          </div>

          {/* Priority (if MX or SRV) & TTL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(type === 'MX' || type === 'SRV') ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prioritas (Priority)
                </label>
                <input
                  type="number"
                  min="0"
                  max="65535"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Contoh: 10"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kaitkan Grup Subnet
                </label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">(Tanpa Subnet Khusus)</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.cidr})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                TTL (Time To Live / Detik)
              </label>
              <select
                value={ttl}
                onChange={(e) => setTtl(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={60}>60 detik (1 menit - Uji Coba)</option>
                <option value={300}>300 detik (5 menit - Dinamis)</option>
                <option value={1800}>1800 detik (30 menit)</option>
                <option value={3600}>3600 detik (1 jam - Standar)</option>
                <option value={14400}>14400 detik (4 jam)</option>
                <option value={86400}>86400 detik (1 hari - Statis)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Deskripsi Record
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Server portal intranet dev & testing lantai 2"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-900 dark:focus:bg-slate-800 transition-all resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editRecord ? 'Simpan Perubahan' : 'Tambahkan DNS'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
