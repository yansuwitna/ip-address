import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X,
  LucideIcon
} from 'lucide-react';
import { showConfirm, showSuccess } from '../utils/swal';

export interface GenericTypeItem {
  id: string;
  name: string;
  code: string;
  category?: string;
  description?: string;
  icon?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface MasterTypeViewProps {
  title: string;
  subtitle: string;
  badgeLabel: string;
  addLabel: string;
  icon: LucideIcon;
  themeColor: 'blue' | 'amber' | 'rose' | 'cyan' | 'emerald' | 'indigo';
  items: GenericTypeItem[];
  onSaveItem: (item: GenericTypeItem) => void;
  onDeleteItem: (id: string) => void;
}

export const MasterTypeView: React.FC<MasterTypeViewProps> = ({
  title,
  subtitle,
  badgeLabel,
  addLabel,
  icon: HeaderIcon,
  themeColor,
  items = [],
  onSaveItem,
  onDeleteItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GenericTypeItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCode('');
    setDescription('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: GenericTypeItem) => {
    setEditingItem(item);
    setName(item.name);
    setCode(item.code);
    setDescription(item.description || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingItem) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setCode(slug);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama wajib diisi!');
      return;
    }
    const cleanCode = code.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (!editingItem && items.some(r => r.code.toLowerCase() === cleanCode.toLowerCase())) {
      setError(`Kode / slug "${cleanCode}" sudah digunakan!`);
      return;
    }

    onSaveItem({
      id: editingItem ? editingItem.id : `type-${Date.now()}`,
      name: name.trim(),
      code: cleanCode,
      description: description.trim()
    });

    setIsModalOpen(false);
    showSuccess('Berhasil Disimpan', `Data "${name.trim()}" berhasil disimpan.`);
  };

  const filteredItems = items.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q)
    );
  });

  const themeClasses = {
    blue: {
      badge: 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30',
      iconBox: 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/60',
      focusRing: 'focus:ring-blue-500'
    },
    amber: {
      badge: 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30',
      iconBox: 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/60',
      focusRing: 'focus:ring-amber-500'
    },
    rose: {
      badge: 'bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30',
      iconBox: 'bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/60',
      focusRing: 'focus:ring-rose-500'
    },
    cyan: {
      badge: 'bg-cyan-50 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      btn: 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/30',
      iconBox: 'bg-cyan-50 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800/60',
      focusRing: 'focus:ring-cyan-500'
    },
    emerald: {
      badge: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30',
      iconBox: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/60',
      focusRing: 'focus:ring-emerald-500'
    },
    indigo: {
      badge: 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30',
      iconBox: 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/60',
      focusRing: 'focus:ring-indigo-500'
    }
  }[themeColor];

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* Top Banner & Action */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <HeaderIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span>{title}</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${themeClasses.badge}`}>
              {items.length} {badgeLabel}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer w-full sm:w-auto justify-center ${themeClasses.btn}`}
        >
          <Plus className="w-4 h-4" />
          <span>{addLabel}</span>
        </button>
      </div>

      {/* Search & Counter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau kode..."
            className={`w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 ${themeClasses.focusRing} transition-all`}
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium self-end sm:self-center">
          Menampilkan <strong>{filteredItems.length}</strong> dari {items.length} {badgeLabel}
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Tipe / Jenis</th>
                <th className="py-3.5 px-4">Kode / Nilai</th>
                <th className="py-3.5 px-4">Deskripsi</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 dark:text-slate-300">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-slate-400 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <HeaderIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada {badgeLabel}.</p>
                      <p className="text-[11px] text-slate-400">Tambahkan data pertama agar dapat dipilih saat penginputan formulir.</p>
                      <button
                        onClick={openAddModal}
                        className={`mt-2 px-4 py-2 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${themeClasses.btn}`}
                      >
                        + {addLabel}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl border flex-shrink-0 ${themeClasses.iconBox}`}>
                          <HeaderIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                        {item.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {item.description || <span className="italic text-slate-300">Tidak ada deskripsi</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit"
                          className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={async () => {
                            const confirmed = await showConfirm({
                              title: `Hapus ${badgeLabel}?`,
                              text: `Apakah Anda yakin ingin menghapus "${item.name}"?`,
                              confirmButtonText: 'Ya, Hapus',
                              cancelButtonText: 'Batal',
                              isDanger: true
                            });
                            if (confirmed) {
                              onDeleteItem(item.id);
                              showSuccess('Berhasil Dihapus', `${badgeLabel} "${item.name}" berhasil dihapus.`);
                            }
                          }}
                          title="Hapus"
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/40 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-xs overflow-hidden font-poppins animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-b-2xl sm:rounded-t-none border-x border-b border-t-0 border-slate-200/90 dark:border-slate-800 shadow-2xl max-w-2xl w-full mx-auto overflow-hidden h-full flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${themeClasses.iconBox}`}>
                  <HeaderIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {editingItem ? `Edit ${badgeLabel}` : `Tambah ${badgeLabel} Baru`}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Pilihan ini akan muncul pada menu dropdown terkait.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama {badgeLabel} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={`Contoh: Nama ${badgeLabel}`}
                  className={`w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 ${themeClasses.focusRing} transition-all`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kode / Slug Nilai <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingItem}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="Contoh: kode_unik_tipe"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-mono transition-all ${
                    editingItem 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                      : `bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${themeClasses.focusRing}`
                  }`}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Nilai identifikasi internal unik (slug) dalam sistem database.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Keterangan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan atau catatan tambahan..."
                  className={`w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 ${themeClasses.focusRing} transition-all resize-none`}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${themeClasses.btn}`}
                >
                  {editingItem ? 'Simpan Perubahan' : `Tambah ${badgeLabel}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
