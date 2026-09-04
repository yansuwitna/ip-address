import React from 'react';
import { Printer, X, Download, Shield, Network, Globe, CheckCircle2 } from 'lucide-react';
import { IPGroup, IPAllocation, IPService, DnsRecord, DeviceCategory } from '../types/ipam';
import { User } from '../types/auth';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  type: 'allocations' | 'dns' | 'services';
  group?: IPGroup;
  allocations?: IPAllocation[];
  dnsRecords?: DnsRecord[];
  services?: IPService[];
  categories?: DeviceCategory[];
  currentUser: User | null;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  title = 'Laporan Jaringan',
  type,
  group,
  allocations = [],
  dnsRecords = [],
  services = [],
  categories = [],
  currentUser
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const getCategoryName = (typeId: string) => {
    const cat = categories.find(c => c.id.toLowerCase() === typeId.toLowerCase() || c.name.toLowerCase() === typeId.toLowerCase());
    return cat ? cat.name : typeId;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      
      {/* Container Dialog */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Top Action Bar (Hidden when printing via .no-print) */}
        <div className="no-print p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                Pratinjau Cetak Halaman (Print Preview)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Format standar dokumen resmi cetak ukuran A4
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950/60 print:p-0 print:bg-white dark:bg-slate-900 print:overflow-visible">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto font-sans leading-normal">
            
            {/* Kop / Header Dokumen Resmi */}
            <div className="border-b-2 border-slate-800 pb-4 mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-blue-700 text-white rounded-lg flex items-center justify-center font-black text-sm">
                    IP
                  </div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                    SISTEM MANAJEMEN IP & DNS
                  </h1>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Dokumentasi Inventaris Infrastruktur Jaringan, Alokasi Host IP & DNS Server
                </p>
              </div>

              <div className="text-right text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                <div>Tanggal Cetak: <strong className="text-slate-800 dark:text-slate-200">{currentDate}</strong></div>
                <div>Pukul: {currentTime} WIB</div>
                <div>Operator: {currentUser ? currentUser.name : 'Administrator'}</div>
              </div>
            </div>

            {/* Judul Laporan */}
            <div className="mb-6 text-center">
              <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100">
                {title}
              </h2>
              {group && (
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                  Subnet: <span className="font-mono text-blue-800 font-bold">{group.name} ({group.cidr})</span> • Gateway: <span className="font-mono">{group.gateway}</span> {group.vlanId ? `• VLAN ${group.vlanId}` : ''}
                </p>
              )}
            </div>

            {/* Metadata Ringkasan Subnet jika ada */}
            {group && type === 'allocations' && (
              <div className="grid grid-cols-4 gap-2 text-xs mb-6 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Lokasi Subnet</span>
                  <strong className="text-slate-800 dark:text-slate-200">{group.location || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Penanggung Jawab (PIC)</span>
                  <strong className="text-slate-800 dark:text-slate-200">{group.pic || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Total Terdaftar</span>
                  <strong className="text-blue-700">{allocations.length} Alokasi Host</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Layanan Aktif</span>
                  <strong className="text-emerald-700">{services.length} Port Terbuka</strong>
                </div>
              </div>
            )}

            {/* TABEL: Alokasi IP Host */}
            {type === 'allocations' && (
              <div className="overflow-hidden border border-slate-300 dark:border-slate-600 rounded-lg mb-8">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold">
                      <th className="py-2 px-2.5 border-r border-slate-300 dark:border-slate-600 text-center w-8">No</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 dark:border-slate-600">Alamat IP</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 dark:border-slate-600">Hostname</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 dark:border-slate-600">Status</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 dark:border-slate-600">Kategori Perangkat</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 dark:border-slate-600">MAC Address</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 dark:border-slate-600">PIC / Bagian</th>
                      <th className="py-2 px-2.5">Port Layanan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800 dark:text-slate-200">
                    {allocations.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-400">
                          Tidak ada data alokasi IP host.
                        </td>
                      </tr>
                    ) : (
                      allocations.map((a, idx) => {
                        const itemServices = services.filter(s => s.allocationId === a.id || s.ip === a.ip);
                        return (
                          <tr key={a.id} className={idx % 2 === 1 ? 'bg-slate-50 dark:bg-slate-800/70' : 'bg-white dark:bg-slate-900'}>
                            <td className="py-1.5 px-2.5 border-r border-slate-300 dark:border-slate-600 text-center text-slate-500 dark:text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="py-1.5 px-2.5 border-r border-slate-300 dark:border-slate-600 font-mono font-bold whitespace-nowrap">
                              {a.ip}
                            </td>
                            <td className="py-1.5 px-2.5 border-r border-slate-300 dark:border-slate-600 font-medium">
                              {a.hostname}
                            </td>
                            <td className="py-1.5 px-2.5 border-r border-slate-300 dark:border-slate-600 capitalize text-[10px]">
                              {a.status}
                            </td>
                            <td className="py-1.5 px-2.5 border-r border-slate-300 dark:border-slate-600">
                              {getCategoryName(a.deviceType)}
                            </td>
                            <td className="py-1.5 px-2.5 border-r border-slate-300 dark:border-slate-600 font-mono text-[10px]">
                              {a.macAddress || '-'}
                            </td>
                            <td className="py-1.5 px-2.5 border-r border-slate-300 dark:border-slate-600">
                              {a.assignedTo || '-'}{a.department ? ` (${a.department})` : ''}
                            </td>
                            <td className="py-1.5 px-2.5 text-[10px]">
                              {itemServices.length > 0 
                                ? itemServices.map(s => `:${s.port}`).join(', ')
                                : '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABEL: DNS Records */}
            {type === 'dns' && (
              <div className="overflow-hidden border border-slate-300 dark:border-slate-600 rounded-lg mb-8">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold">
                      <th className="py-2 px-2.5 border-r border-slate-300 dark:border-slate-600 text-center w-8">No</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 dark:border-slate-600">Nama Host / Domain</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 dark:border-slate-600 text-center">Tipe</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 dark:border-slate-600">Nilai Target (Target Value)</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 dark:border-slate-600 text-center">TTL</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 dark:border-slate-600 text-center">Status</th>
                      <th className="py-2 px-2.5">Catatan / Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800 dark:text-slate-200">
                    {dnsRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          Tidak ada catatan DNS terdaftar.
                        </td>
                      </tr>
                    ) : (
                      dnsRecords.map((r, idx) => (
                        <tr key={r.id} className={idx % 2 === 1 ? 'bg-slate-50 dark:bg-slate-800/70' : 'bg-white dark:bg-slate-900'}>
                          <td className="py-1.5 px-2.5 border-r border-slate-300 dark:border-slate-600 text-center text-slate-500 dark:text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-1.5 px-2.5 border-r border-slate-300 dark:border-slate-600 font-mono font-bold text-blue-900">
                            {r.domain}
                          </td>
                          <td className="py-1.5 px-2.5 border-r border-slate-300 dark:border-slate-600 text-center font-bold font-mono">
                            {r.type}
                          </td>
                          <td className="py-1.5 px-2.5 border-r border-slate-300 dark:border-slate-600 font-mono">
                            {r.value} {r.priority ? `(prio: ${r.priority})` : ''}
                          </td>
                          <td className="py-1.5 px-2.5 border-r border-slate-300 dark:border-slate-600 text-center font-mono text-[10px]">
                            {r.ttl}s
                          </td>
                          <td className="py-1.5 px-2.5 border-r border-slate-300 dark:border-slate-600 text-center capitalize text-[10px]">
                            {r.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </td>
                          <td className="py-1.5 px-2.5 text-slate-600 dark:text-slate-400 text-[10px]">
                            {r.description || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bagian Pengesahan / Tanda Tangan */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-12 text-center text-xs break-inside-avoid">
              <div>
                <p className="text-slate-600 dark:text-slate-400 mb-16">
                  Dibuat Oleh,<br />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Administrator Jaringan</span>
                </p>
                <div className="w-44 mx-auto border-b border-slate-400"></div>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {currentUser ? currentUser.name : '(............................................)'}
                </p>
              </div>

              <div>
                <p className="text-slate-600 dark:text-slate-400 mb-16">
                  Mengetahui,<br />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Kepala Bagian IT & Infrastruktur</span>
                </p>
                <div className="w-44 mx-auto border-b border-slate-400"></div>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                  (............................................)
                </p>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
              Dokumen ini digenerate secara otomatis oleh Sistem Manajemen IP & DNS pada {currentDate} pukul {currentTime} WIB.
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
