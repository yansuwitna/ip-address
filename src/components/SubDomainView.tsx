import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Edit2, Trash2, Globe, Check, Database, Folder, Hash, Server } from 'lucide-react';
import { DnsRecord, SubDomainRecord } from '../types/ipam';
import { loadSubDomains, saveSubDomains } from '../utils/storage';
import Swal from 'sweetalert2';

interface SubDomainViewProps {
  parentDomain: DnsRecord;
  onBack: () => void;
}

export const SubDomainView: React.FC<SubDomainViewProps> = ({ parentDomain, onBack }) => {
  const [subDomains, setSubDomains] = useState<SubDomainRecord[]>([]);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubDomainRecord | null>(null);
  
  const [subName, setSubName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('');
  const [folder, setFolder] = useState('');
  const [database, setDatabase] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setSubDomains(loadSubDomains());
  }, []);

  const handleSave = (records: SubDomainRecord[]) => {
    setSubDomains(records);
    saveSubDomains(records);
  };

  const parentSubs = subDomains.filter(s => s.parentDomainId === parentDomain.id);
  
  const filteredSubs = parentSubs.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.subName.toLowerCase().includes(q) || 
           (s.ipAddress || '').toLowerCase().includes(q) ||
           (s.folder || '').toLowerCase().includes(q) ||
           (s.database || '').toLowerCase().includes(q) ||
           (s.description || '').toLowerCase().includes(q);
  });

  const openAddModal = () => {
    setEditingSub(null);
    setSubName('');
    setIpAddress('');
    setPort('');
    setFolder('');
    setDatabase('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (sub: SubDomainRecord) => {
    setEditingSub(sub);
    setSubName(sub.subName);
    setIpAddress(sub.ipAddress || '');
    setPort(sub.port || '');
    setFolder(sub.folder || '');
    setDatabase(sub.database || '');
    setDescription(sub.description || '');
    setIsModalOpen(true);
  };

  const handleDelete = (sub: SubDomainRecord) => {
    Swal.fire({
      title: 'Hapus Sub Domain?',
      text: `Anda yakin ingin menghapus ${sub.subName}.${parentDomain.domain}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a'
    }).then((result) => {
      if (result.isConfirmed) {
        handleSave(subDomains.filter(s => s.id !== sub.id));
      }
    });
  };

  const submitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName) return;

    if (editingSub) {
      handleSave(subDomains.map(s => s.id === editingSub.id ? {
        ...s,
        subName,
        ipAddress,
        port,
        folder,
        database,
        description
      } : s));
    } else {
      const newSub: SubDomainRecord = {
        id: Date.now().toString(),
        parentDomainId: parentDomain.id,
        subName,
        ipAddress,
        port,
        folder,
        database,
        description,
        createdAt: new Date().toISOString()
      };
      handleSave([...subDomains, newSub]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all"
            title="Kembali ke DNS Utama"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800/60">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex flex-wrap items-center gap-1.5 sm:gap-2 leading-snug">
              Sub Domain
              <span className="text-sm font-normal text-slate-500">untuk</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800/60">
                {parentDomain.domain}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kelola konfigurasi layanan virtual host lengkap untuk setiap sub domain.
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Sub Domain</span>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari sub domain..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium self-end sm:self-center">
            Menampilkan <strong>{filteredSubs.length}</strong> catatan
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Sub Domain (FQDN)</th>
                <th className="py-3 px-4">IP & Port</th>
                <th className="py-3 px-4">Folder Root</th>
                <th className="py-3 px-4">Database</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    Belum ada data sub domain.
                  </td>
                </tr>
              ) : (
                filteredSubs.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-900 dark:text-slate-100">
                      <span className="text-blue-600 dark:text-blue-400">{item.subName}</span>
                      <span className="text-slate-400 dark:text-slate-500">.{parentDomain.domain}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {item.ipAddress && (
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Server className="w-3 h-3 text-blue-500" />
                            <span className="font-mono text-[11px]">{item.ipAddress}</span>
                          </div>
                        )}
                        {item.port && (
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Hash className="w-3 h-3 text-orange-500" />
                            <span className="font-mono text-[11px]">{item.port}</span>
                          </div>
                        )}
                        {!item.ipAddress && !item.port && <span className="text-slate-400">-</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.folder ? (
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Folder className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          <span className="font-mono text-[11px] max-w-[120px] truncate" title={item.folder}>{item.folder}</span>
                        </div>
                      ) : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.database ? (
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Database className="w-3 h-3 text-purple-500 flex-shrink-0" />
                          <span className="font-mono text-[11px] max-w-[120px] truncate" title={item.database}>{item.database}</span>
                        </div>
                      ) : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/40 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:items-center sm:pt-4 p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto font-poppins">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                {editingSub ? 'Edit Sub Domain' : 'Tambah Sub Domain Baru'}
              </h3>
            </div>

            <form onSubmit={submitModal} className="p-6 space-y-5">
              
              <div className="space-y-4">
                {/* Prefix Subdomain */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nama Sub Domain *
                  </label>
                  <div className="flex items-stretch shadow-xs rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <input
                      type="text"
                      required
                      value={subName}
                      onChange={(e) => setSubName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="contoh: api, dev, atau blog"
                      className="flex-1 px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors font-mono"
                    />
                    <div className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex items-center font-mono text-sm text-slate-500 font-semibold select-none">
                      .{parentDomain.domain}
                    </div>
                  </div>
                </div>

                {/* Configuration Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* IP Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      IP Address
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                        <Server className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={ipAddress}
                        onChange={(e) => setIpAddress(e.target.value)}
                        placeholder="Misal: 10.0.0.5"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Port */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Port
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                        <Hash className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        placeholder="Misal: 8080"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Folder */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Folder / Direktori
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                        <Folder className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={folder}
                        onChange={(e) => setFolder(e.target.value)}
                        placeholder="/var/www/html"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Database */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nama Database
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                        <Database className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={database}
                        onChange={(e) => setDatabase(e.target.value)}
                        placeholder="Misal: db_api"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Keterangan Singkat
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Catatan opsional..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 w-full">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="justify-center px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSub ? 'Simpan Perubahan' : 'Tambah Sub Domain'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
