import React, { useState } from 'react';
import { 
  Server, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X,
  ServerCog
} from 'lucide-react';
import { ServiceCategoryItem, IPService } from '../types/ipam';
import { showConfirm, showSuccess } from '../utils/swal';
import { ModalPortal } from './ModalPortal';

interface ServiceCategoriesViewProps {
  serviceCategories: ServiceCategoryItem[];
  services: IPService[];
  onSaveCategory: (item: ServiceCategoryItem) => void;
  onDeleteCategory: (id: string) => void;
}

export const ServiceCategoriesView: React.FC<ServiceCategoriesViewProps> = ({
  serviceCategories = [],
  services = [],
  onSaveCategory,
  onDeleteCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceCategoryItem | null>(null);

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

  const openEditModal = (item: ServiceCategoryItem) => {
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
      setError('Nama kategori layanan wajib diisi!');
      return;
    }
    const cleanCode = code.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (!editingItem && serviceCategories.some(d => d.code.toLowerCase() === cleanCode.toLowerCase())) {
      setError(`Kode / slug "${cleanCode}" sudah digunakan oleh kategori layanan lain!`);
      return;
    }

    const now = new Date().toISOString();
    onSaveCategory({
      id: editingItem ? editingItem.id : `scat-${Date.now()}`,
      name: name.trim(),
      code: cleanCode,
      description: description.trim(),
      createdAt: editingItem?.createdAt || now,
      updatedAt: now
    });

    setIsModalOpen(false);
  };

  const filteredItems = serviceCategories.filter(d => {
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      (d.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* Top Banner & Action */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <span>Kategori Layanan</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {serviceCategories.length} Kategori
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kelola master pilihan kategori port & layanan aplikasi yang digunakan saat input data Layanan & Port Aplikasi.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/30 transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori Layanan</span>
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
            placeholder="Cari kategori layanan atau kode..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium self-end sm:self-center">
          Menampilkan <strong>{filteredItems.length}</strong> dari {serviceCategories.length} kategori layanan
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Kategori Layanan</th>
                <th className="py-3.5 px-4">Kode / Slug Value Dropdown</th>
                <th className="py-3.5 px-4">Deskripsi / Keterangan</th>
                <th className="py-3.5 px-4 text-center">Layanan Terhubung</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 dark:text-slate-300">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ServerCog className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada Kategori Layanan.</p>
                      <p className="text-[11px] text-slate-400">Tambahkan kategori layanan pertama agar dapat dipilih pada modal Tambah Layanan / Port.</p>
                      <button
                        onClick={openAddModal}
                        className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        + Tambah Kategori Layanan Sekarang
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  const usageCount = services.filter(s => s.category.toLowerCase() === item.code.toLowerCase() || s.category.toLowerCase() === item.name.toLowerCase()).length;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60 flex-shrink-0">
                            <Server className="w-4 h-4" />
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
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          usageCount > 0 
                            ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${usageCount > 0 ? 'bg-indigo-600' : 'bg-slate-400'}`} />
                          <span>{usageCount} Layanan</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            title="Edit Kategori Layanan"
                            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            disabled={usageCount > 0}
                            onClick={async () => {
                              if (usageCount > 0) return;
                              const confirmed = await showConfirm({
                                title: 'Hapus Kategori Layanan?',
                                text: `Apakah Anda yakin ingin menghapus kategori "${item.name}"?`,
                                confirmButtonText: 'Ya, Hapus',
                                cancelButtonText: 'Batal',
                                isDanger: true
                              });
                              if (confirmed) {
                                onDeleteCategory(item.id);
                                showSuccess('Kategori Layanan Dihapus', `Kategori "${item.name}" berhasil dihapus.`);
                              }
                            }}
                            title={usageCount > 0 ? `Tidak dapat dihapus: sedang digunakan oleh ${usageCount} layanan` : "Hapus Kategori Layanan"}
                            className={`p-2 rounded-xl transition-all ${
                              usageCount > 0
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed border border-slate-200/70'
                                : 'bg-rose-50 dark:bg-rose-900/40 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white cursor-pointer'
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

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <ModalPortal>
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs font-poppins animate-in fade-in duration-150">
          <div className="min-h-full flex items-center justify-center p-0">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl max-w-2xl w-full mx-auto overflow-hidden max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] my-auto flex flex-col animate-in zoom-in-95 duration-150">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800/60">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {editingItem ? 'Edit Kategori Layanan' : 'Tambah Kategori Layanan Baru'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Opsi dropdown Kategori Layanan pada modal Tambah Layanan / Port.
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

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                  {error && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Kategori Layanan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Contoh: Web & API Server, Database Engine, Monitoring"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kode / Slug Nilai Dropdown <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!!editingItem}
                      value={code}
                      onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="Contoh: web, database, remote, monitoring"
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-mono transition-all ${
                        editingItem 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                          : 'bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                      }`}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Nilai internal (slug huruf kecil) yang disimpan pada data layanan.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Deskripsi / Catatan (Opsional)
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Keterangan mengenai fungsi kategori layanan ini..."
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                    />
                  </div>

                </div>

                <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex-shrink-0 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    {editingItem ? 'Simpan Perubahan' : 'Tambah Kategori Layanan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

    </div>
  );
};
