import React, { useState, useEffect } from 'react';
import { 
  X, 
  ServerCog, 
  Globe, 
  AlertCircle, 
  Sparkles, 
  Check, 
  ExternalLink,
  Shield,
  Layers
} from 'lucide-react';
import { IPService, IPAllocation, IPGroup, ServiceCategory, ServiceProtocol, ServiceStatus, DeviceCategory } from '../types/ipam';
import { 
  COMMON_SERVICE_PRESETS, 
  SERVICE_CATEGORIES, 
  buildDefaultServiceUrl,
  ServicePreset 
} from '../utils/servicePresets';
import { showWarning } from '../utils/swal';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: Partial<IPService>) => void;
  editService: IPService | null;
  presetIp?: string;
  allocations: IPAllocation[];
  groups: IPGroup[];
  existingServices: IPService[];
  categories?: DeviceCategory[];
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editService,
  presetIp,
  allocations,
  groups,
  existingServices,
  categories = []
}) => {
  // Determine initial IP
  const defaultIp = editService?.ip || presetIp || allocations[0]?.ip || '';
  const [ip, setIp] = useState(defaultIp);
  const [name, setName] = useState(editService?.name || '');
  const [port, setPort] = useState<number | ''>(editService?.port ?? 80);
  const [protocol, setProtocol] = useState<ServiceProtocol>(editService?.protocol || 'TCP');
  const [category, setCategory] = useState<ServiceCategory>(editService?.category || 'web');
  const [status, setStatus] = useState<ServiceStatus>(editService?.status || 'active');
  const [version, setVersion] = useState(editService?.version || '');
  const [url, setUrl] = useState(editService?.url || '');
  const [description, setDescription] = useState(editService?.description || '');
  const [isCustomUrl, setIsCustomUrl] = useState(Boolean(editService?.url));

  // Reset when editService or presetIp changes
  useEffect(() => {
    if (editService) {
      setIp(editService.ip);
      setName(editService.name);
      setPort(editService.port);
      setProtocol(editService.protocol);
      setCategory(editService.category);
      setStatus(editService.status);
      setVersion(editService.version || '');
      setUrl(editService.url || '');
      setDescription(editService.description || '');
      setIsCustomUrl(Boolean(editService.url));
    } else {
      const target = presetIp || allocations[0]?.ip || '';
      setIp(target);
      setName('');
      setPort(80);
      setProtocol('TCP');
      setCategory('web');
      setStatus('active');
      setVersion('');
      setUrl(target ? `http://${target}` : '');
      setDescription('');
      setIsCustomUrl(false);
    }
  }, [editService, presetIp, allocations]);

  if (!isOpen) return null;

  // Selected IP allocation object
  const currentAlloc = allocations.find(a => a.ip === ip);
  const currentGroup = currentAlloc ? groups.find(g => g.id === currentAlloc.groupId) : null;

  // Conflict detection
  const conflictService = existingServices.find(s => {
    if (editService && s.id === editService.id) return false;
    return s.ip === ip && s.port === Number(port) && (s.protocol === protocol || protocol === 'TCP/UDP' || s.protocol === 'TCP/UDP');
  });

  const handleApplyPreset = (preset: ServicePreset) => {
    setName(preset.name);
    setPort(preset.port);
    setProtocol(preset.protocol);
    setCategory(preset.category);
    setDescription(preset.description);
    if (preset.typicalVersion) setVersion(preset.typicalVersion);

    if (ip) {
      const autoUrl = buildDefaultServiceUrl(ip, preset.port, preset.protocol, preset.category);
      if (autoUrl) {
        setUrl(autoUrl);
        setIsCustomUrl(true);
      }
    }
  };

  const handlePortChange = (val: number | '') => {
    setPort(val);
    if (!isCustomUrl && ip && typeof val === 'number') {
      const autoUrl = buildDefaultServiceUrl(ip, val, protocol, category);
      if (autoUrl) setUrl(autoUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ip) {
      showWarning('Alamat IP Kosong', 'Silakan pilih alamat IP host target layanan terlebih dahulu!');
      return;
    }
    if (!name.trim()) {
      showWarning('Nama Layanan Wajib Diisi', 'Silakan masukkan nama layanan atau aplikasi yang berjalan!');
      return;
    }
    const portNum = Number(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      showWarning('Port Tidak Valid', 'Nomor port jaringan harus berada di antara 1 s/d 65535!');
      return;
    }

    const alloc = allocations.find(a => a.ip === ip);

    onSave({
      id: editService?.id,
      allocationId: alloc?.id || `alloc-${ip}`,
      ip,
      name: name.trim(),
      port: portNum,
      protocol,
      category,
      status,
      version: version.trim() || undefined,
      url: url.trim() || undefined,
      description: description.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-md shadow-blue-500/20">
              <ServerCog className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg tracking-tight">
                {editService ? 'Edit Layanan & Port' : 'Tambah Layanan / Port Baru'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Konfigurasikan aplikasi, daemon, atau port terbuka untuk host IP ini.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Catalog Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Pilih Cepat dari Template Layanan Populer:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {COMMON_SERVICE_PRESETS.map(preset => {
              const isSelected = port === preset.port && protocol === preset.protocol;
              return (
                <button
                  key={`${preset.port}-${preset.protocol}-${preset.name}`}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 hover:bg-blue-50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  <span>{preset.name.split(' ')[0]}</span>
                  <span className="font-mono text-[10px] opacity-80">({preset.port}/{preset.protocol})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Target IP Address & Host Info */}
          <div className="bg-blue-50 dark:bg-blue-900/70 border border-blue-200 dark:border-blue-800/80 rounded-2xl p-3.5">
            <label className="block text-xs font-bold text-blue-900 mb-1.5">
              Alamat IP Target *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  value={ip}
                  onChange={(e) => {
                    const newIp = e.target.value;
                    setIp(newIp);
                    if (!isCustomUrl && port) {
                      const autoUrl = buildDefaultServiceUrl(newIp, Number(port), protocol, category);
                      if (autoUrl) setUrl(autoUrl);
                    }
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-blue-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
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
                </select>
              </div>

              {currentAlloc && (
                <div className="text-xs text-blue-900 flex flex-col justify-center">
                  <div className="font-semibold flex items-center gap-1.5">
                    <span className="truncate">{currentAlloc.hostname}</span>
                    {currentGroup && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-medium">
                        {currentGroup.name}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-blue-700/80 truncate">
                    {currentAlloc.assignedTo ? `PIC: ${currentAlloc.assignedTo}` : `Status: ${currentAlloc.status}`}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Port Conflict Warning */}
          {conflictService && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/40 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Peringatan Potensi Bentrok Port:</strong> Port <code>{port}/{protocol}</code> sudah terdaftar pada IP ini untuk layanan "<strong>{conflictService.name}</strong>".
              </div>
            </div>
          )}

          {/* Main Service Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Service Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Layanan / Aplikasi *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Nginx Web Server, PostgreSQL DB, OpenSSH"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Port & Protocol */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Port & Protokol *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  min={1}
                  max={65535}
                  placeholder="80, 443, 22..."
                  value={port}
                  onChange={(e) => handlePortChange(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="w-2/3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <select
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value as ServiceProtocol)}
                  className="w-1/3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="TCP/UDP">TCP/UDP</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Layanan
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {SERVICE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status Port / Layanan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceStatus)}
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="active">🟢 Aktif / Terbuka (Listening / Open)</option>
                <option value="inactive">🔴 Nonaktif (Closed / Disabled)</option>
                <option value="filtered">🟡 Terfilter Firewall (Filtered)</option>
              </select>
            </div>

            {/* Application Version */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Versi Software / Daemon (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: v1.24.0, 16.1-alpine, OpenSSH 9.6"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Direct URL / Endpoint */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                URL / Akses Cepat (Opsional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="http://192.168.10.1:8080"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setIsCustomUrl(true);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-8 py-2 text-xs font-mono text-blue-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    title="Uji buka link di tab baru"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Keterangan / Catatan Tambahan (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Server database produksi utama transaksi e-commerce"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl shadow-md shadow-blue-600/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editService ? 'Simpan Perubahan' : 'Tambahkan Layanan'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
