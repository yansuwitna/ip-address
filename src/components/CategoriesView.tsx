import React, { useState } from 'react';
import { 
  Server, 
  Router, 
  Network, 
  Wifi, 
  Monitor, 
  Video, 
  Printer, 
  Smartphone, 
  Cpu, 
  HardDrive, 
  Tablet, 
  Radio, 
  Laptop, 
  Camera, 
  Shield,
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Layers,
  HelpCircle,
  Cctv,
  Webcam
} from 'lucide-react';
import { DeviceCategory, IPAllocation } from '../types/ipam';
import { showConfirm, showSuccess } from '../utils/swal';

export const AVAILABLE_ICONS: { name: string; label: string; icon: React.FC<{ className?: string }> }[] = [
  { name: 'Cctv', label: 'CCTV Kamera', icon: Cctv },
  { name: 'Video', label: 'CCTV / NVR', icon: Video },
  { name: 'Camera', label: 'Kamera', icon: Camera },
  { name: 'Webcam', label: 'Webcam', icon: Webcam },
  { name: 'Monitor', label: 'PC / Monitor', icon: Monitor },
  { name: 'Laptop', label: 'Laptop', icon: Laptop },
  { name: 'Server', label: 'Server / VM', icon: Server },
  { name: 'Router', label: 'Router', icon: Router },
  { name: 'Network', label: 'Switch / Hub', icon: Network },
  { name: 'Wifi', label: 'Access Point', icon: Wifi },
  { name: 'Printer', label: 'Printer / Scanner', icon: Printer },
  { name: 'Smartphone', label: 'Smartphone', icon: Smartphone },
  { name: 'Tablet', label: 'Tablet', icon: Tablet },
  { name: 'Cpu', label: 'IoT / Processor', icon: Cpu },
  { name: 'HardDrive', label: 'Storage / NAS', icon: HardDrive },
  { name: 'Shield', label: 'Firewall / Security', icon: Shield },
  { name: 'Radio', label: 'Radio / Wireless', icon: Radio }
];

export const getCategoryIconComponent = (iconName: string): React.FC<{ className?: string }> => {
  const found = AVAILABLE_ICONS.find(i => i.name.toLowerCase() === iconName.toLowerCase());
  return found ? found.icon : Cpu;
};

interface CategoriesViewProps {
  categories: DeviceCategory[];
  allocations: IPAllocation[];
  onSaveCategory: (cat: DeviceCategory) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  allocations,
  onSaveCategory,
  onDeleteCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DeviceCategory | null>(null);

  // Form state for Add / Edit
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [icon, setIcon] = useState('Monitor');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setId('');
    setIcon('Monitor');
    setDescription('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: DeviceCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setId(cat.id);
    setIcon(cat.icon || 'Monitor');
    setDescription(cat.description || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      // Auto-generate slug from name
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setId(slug);

      // Auto-suggest icon based on category keywords
      const lower = val.toLowerCase();
      if (lower.includes('cctv') || lower.includes('kamera') || lower.includes('camera')) {
        setIcon('Cctv');
      } else if (lower.includes('router') || lower.includes('modem') || lower.includes('gateway') || lower.includes('mikrotik')) {
        setIcon('Router');
      } else if (lower.includes('switch') || lower.includes('hub') || lower.includes('patch')) {
        setIcon('Network');
      } else if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('access point') || lower.includes('ap ') || lower.endsWith(' ap')) {
        setIcon('Wifi');
      } else if (lower.includes('printer') || lower.includes('scanner') || lower.includes('cetak')) {
        setIcon('Printer');
      } else if (lower.includes('server') || lower.includes('vm') || lower.includes('host') || lower.includes('datacenter')) {
        setIcon('Server');
      } else if (lower.includes('firewall') || lower.includes('security') || lower.includes('fortinet') || lower.includes('pfsense')) {
        setIcon('Shield');
      } else if (lower.includes('nas') || lower.includes('storage') || lower.includes('san') || lower.includes('harddisk')) {
        setIcon('HardDrive');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Nama kategori wajib diisi!');
      return;
    }

    const cleanId = id.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    // Check duplicate ID if new
    if (!editingCategory && categories.some(c => c.id.toLowerCase() === cleanId.toLowerCase())) {
      setFormError(`Kode ID "${cleanId}" sudah digunakan oleh kategori lain!`);
      return;
    }

    onSaveCategory({
      id: cleanId,
      name: name.trim(),
      icon,
      description: description.trim()
    });

    setIsModalOpen(false);
  };

  const filteredCategories = categories.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* Top Banner & Action */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <span>Kategori Perangkat</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {categories.length} Kategori
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kelola daftar tipe & kategori perangkat jaringan (tambah atau kurangi) yang digunakan saat pengalokasian IP.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kategori atau kode ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800/80 focus:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium self-end sm:self-center">
          Menampilkan <strong>{filteredCategories.length}</strong> dari {categories.length} kategori
        </div>
      </div>

      {/* Table of Device Categories */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama & Ikon Kategori</th>
                <th className="py-3.5 px-4">Kode Kunci (Slug)</th>
                <th className="py-3.5 px-4">Deskripsi</th>
                <th className="py-3.5 px-4 text-center">Host Terhubung</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 dark:text-slate-300">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Tidak ditemukan kategori perangkat yang cocok.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat, idx) => {
                  const IconComp = getCategoryIconComponent(cat.icon);
                  const usageCount = allocations.filter(a => {
                    const rawType = (a.deviceType || '').toLowerCase();
                    const cleanRaw = rawType.replace(/_/g, ' ');
                    const cId = cat.id.toLowerCase();
                    const cName = cat.name.toLowerCase();
                    return (
                      rawType === cId ||
                      rawType === cName ||
                      cleanRaw === cId.replace(/_/g, ' ') ||
                      cleanRaw === cName.replace(/_/g, ' ')
                    );
                  }).length;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50/60 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{cat.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                          {cat.id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {cat.description || <span className="italic text-slate-300">Tidak ada deskripsi</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          usageCount > 0 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${usageCount > 0 ? 'bg-blue-600' : 'bg-slate-400'}`} />
                          <span>{usageCount} IP</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(cat)}
                            title="Edit Kategori"
                            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 dark:text-slate-100 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            disabled={usageCount > 0}
                            onClick={async () => {
                              if (usageCount > 0) return;
                              const confirmed = await showConfirm({
                                title: 'Hapus Kategori?',
                                text: `Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`,
                                confirmButtonText: 'Ya, Hapus',
                                cancelButtonText: 'Batal',
                                isDanger: true
                              });
                              if (confirmed) {
                                onDeleteCategory(cat.id);
                                showSuccess('Kategori Dihapus', `Kategori "${cat.name}" berhasil dihapus.`);
                              }
                            }}
                            title={
                              usageCount > 0
                                ? `Tidak dapat dihapus: kategori ini sedang digunakan oleh ${usageCount} IP`
                                : "Hapus Kategori"
                            }
                            className={`p-2 rounded-xl transition-all ${
                              usageCount > 0
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed border border-slate-200/70'
                                : 'bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white cursor-pointer'
                            }`}
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

      {/* Modal Tambah / Edit Kategori */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {editingCategory ? 'Edit Kategori Perangkat' : 'Tambah Kategori Perangkat Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingCategory ? 'Perbarui informasi tipe perangkat' : 'Daftarkan tipe hardware baru'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nama Kategori */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Mesin Absensi Fingerprint"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800/70 focus:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Kode ID / Slug */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kode Kunci / Slug ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingCategory}
                  value={id}
                  onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="Contoh: mesin_absensi"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-mono transition-all ${
                    editingCategory 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800/70 focus:bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Digunakan sebagai kode unik internal (huruf kecil & garis bawah).
                </p>
              </div>

              {/* Pilihan Ikon */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Ikon Perangkat
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50/60">
                  {AVAILABLE_ICONS.map(item => {
                    const IconComponent = item.icon;
                    const isSelected = icon.toLowerCase() === item.name.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={item.name}
                        onClick={() => setIcon(item.name)}
                        title={`${item.label} (${item.name})`}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-[10px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 hover:border-slate-300 dark:border-slate-600 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <IconComponent className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate w-full text-center text-[10px] leading-tight">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Kategori (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan mengenai peruntukan kategori perangkat ini..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800/70 focus:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
