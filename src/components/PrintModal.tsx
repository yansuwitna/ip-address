import React from 'react';
import { Printer, X, Download, Shield, Network, Globe, CheckCircle2, Zap, Video, Droplets, Cable } from 'lucide-react';
import { IPGroup, IPAllocation, IPService, DnsRecord, DeviceCategory } from '../types/ipam';
import { 
  LanLocation, 
  LanZone, 
  LanDevice, 
  LanCableRun, 
  ElectricityDevice, 
  ElectricityCableRun, 
  CctvDevice, 
  CctvCableRun, 
  WaterDevice, 
  WaterPipeRun 
} from '../types/utilityNetworks';
import { User } from '../types/auth';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  type: 'allocations' | 'dns' | 'services' | 'lan_detail' | 'electricity_detail' | 'cctv_detail' | 'water_detail';
  group?: IPGroup;
  allocations?: IPAllocation[];
  dnsRecords?: DnsRecord[];
  services?: IPService[];
  categories?: DeviceCategory[];
  currentUser: User | null;
  // Detail Jaringan Props
  location?: LanLocation;
  zone?: LanZone;
  lanDevices?: LanDevice[];
  lanCables?: LanCableRun[];
  electricityDevices?: ElectricityDevice[];
  electricityCables?: ElectricityCableRun[];
  cctvDevices?: CctvDevice[];
  cctvCables?: CctvCableRun[];
  waterDevices?: WaterDevice[];
  waterPipes?: WaterPipeRun[];
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
  currentUser,
  location,
  zone,
  lanDevices = [],
  lanCables = [],
  electricityDevices = [],
  electricityCables = [],
  cctvDevices = [],
  cctvCables = [],
  waterDevices = [],
  waterPipes = []
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

  // Filter devices and cables by location and zone if provided
  const filteredLanDevices = location && zone ? lanDevices.filter(d => d.locationId === location.id && d.zoneId === zone.id) : lanDevices;
  const filteredLanCables = location && zone ? lanCables.filter(c => c.locationId === location.id && c.zoneId === zone.id) : lanCables;
  
  const filteredElectricityDevices = location && zone ? electricityDevices.filter(d => d.locationId === location.id && d.zoneId === zone.id) : electricityDevices;
  const filteredElectricityCables = location && zone ? electricityCables.filter(c => c.locationId === location.id && c.zoneId === zone.id) : electricityCables;

  const filteredCctvDevices = location && zone ? cctvDevices.filter(d => d.locationId === location.id && d.zoneId === zone.id) : cctvDevices;
  const filteredCctvCables = location && zone ? cctvCables.filter(c => c.locationId === location.id && c.zoneId === zone.id) : cctvCables;

  const filteredWaterDevices = location && zone ? waterDevices.filter(d => d.locationId === location.id && d.zoneId === zone.id) : waterDevices;
  const filteredWaterPipes = location && zone ? waterPipes.filter(c => c.locationId === location.id && c.zoneId === zone.id) : waterPipes;

  // Dynamic header based on type
  let systemName = "SISTEM MANAJEMEN IP & DNS";
  let systemSubtitle = "Dokumentasi Inventaris Infrastruktur Jaringan, Alokasi Host IP & DNS Server";
  let systemLogo = "IP";
  let systemLogoColor = "bg-blue-700";
  let displayTitle = title;

  if (type === 'electricity_detail') {
    systemName = "SISTEM MANAJEMEN KELISTRIKAN";
    systemSubtitle = "Dokumentasi Inventaris Infrastruktur Listrik, Panel & Rute Kabel";
    systemLogo = "PL";
    systemLogoColor = "bg-amber-600";
    if (title === 'Laporan Jaringan') displayTitle = 'Detail Infrastruktur Listrik';
  } else if (type === 'cctv_detail') {
    systemName = "SISTEM MANAJEMEN CCTV";
    systemSubtitle = "Dokumentasi Inventaris Kamera Keamanan, NVR & Rute Kabel CCTV";
    systemLogo = "CC";
    systemLogoColor = "bg-indigo-600";
    if (title === 'Laporan Jaringan') displayTitle = 'Detail Jaringan CCTV';
  } else if (type === 'water_detail') {
    systemName = "SISTEM MANAJEMEN AIR & IRIGASI";
    systemSubtitle = "Dokumentasi Inventaris Infrastruktur Air Bersih & Pompa Irigasi";
    systemLogo = "AR";
    systemLogoColor = "bg-teal-600";
    if (title === 'Laporan Jaringan') displayTitle = 'Detail Infrastruktur Air';
  } else if (type === 'lan_detail') {
    if (title === 'Laporan Jaringan') displayTitle = 'Detail Jaringan LAN';
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200 print:static print:z-auto print:bg-white print:overflow-visible print:h-auto">
      
      {/* Container Full Page */}
      <div className="w-full h-full flex flex-col print:h-auto print:overflow-visible">
        
        {/* Top Action Bar (Hidden when printing) */}
        <div className="print:hidden p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/80 flex-shrink-0">
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full sm:w-auto">
            <div className={`p-2 ${systemLogoColor} text-white rounded-xl shadow-xs`}>
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

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 ${systemLogoColor.replace('bg-', 'bg-').replace('600', '600 hover:bg-').replace('700', '700')} hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer`}
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 justify-center flex dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-0 print:bg-white print:overflow-visible flex flex-col items-center">
          <div className="bg-white text-black p-8 sm:p-12 shadow-xl border border-slate-200 print:border-none print:shadow-none print:p-0 w-full max-w-[21cm] min-h-[29.7cm] font-sans leading-normal">
            
            {/* Kop / Header Dokumen Resmi */}
            <div className="border-b-2 border-slate-800 pb-4 mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-7 h-7 ${systemLogoColor} text-white rounded-lg flex items-center justify-center font-black text-sm`}>
                    {systemLogo}
                  </div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                    {systemName}
                  </h1>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {systemSubtitle}
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
                {displayTitle}
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

            {/* Metadata Ringkasan Detail Jaringan (Lokasi & Lab/Ruang) */}
            {location && zone && (
              <div className="grid grid-cols-4 gap-2 text-xs mb-6 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Lokasi Utama</span>
                  <strong className="text-slate-800 dark:text-slate-200">{location.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Area / Lab / Ruang</span>
                  <strong className="text-slate-800 dark:text-slate-200">{zone.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Lantai / Kode</span>
                  <strong className="text-slate-800 dark:text-slate-200">{zone.floor || 'Lantai 1'} ({zone.code})</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">PIC / Penanggung Jawab</span>
                  <strong className="text-indigo-700">{zone.pic || location.pic || '-'}</strong>
                </div>
              </div>
            )}

            {/* TABEL: Detail Jaringan LAN */}
            {type === 'lan_detail' && (
              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-700 mb-2 flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5 text-blue-600" />
                    <span>Daftar Perangkat Fisik LAN ({filteredLanDevices.length})</span>
                  </h4>
                  <div className="overflow-hidden border border-slate-300 dark:border-slate-600 rounded-lg">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold">
                          <th className="py-2 px-2 border-r border-slate-300 text-center w-8">No</th>
                          <th className="py-2 px-2 border-r border-slate-300">Nama Perangkat</th>
                          <th className="py-2 px-2 border-r border-slate-300">Kode & Tipe</th>
                          <th className="py-2 px-2 border-r border-slate-300">IP Address</th>
                          <th className="py-2 px-2 border-r border-slate-300">Lokasi / Rak</th>
                          <th className="py-2 px-2 border-r border-slate-300 text-center">Port</th>
                          <th className="py-2 px-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {filteredLanDevices.length === 0 ? (
                          <tr><td colSpan={7} className="py-4 text-center text-slate-400">Tidak ada perangkat LAN terdaftar.</td></tr>
                        ) : (
                          filteredLanDevices.map((d, idx) => (
                            <tr key={d.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-center text-slate-500">{idx + 1}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 font-bold text-blue-900">{d.name}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{d.code} ({d.type})</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 font-mono">{d.ipAddress || '-'}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{d.location || '-'} {d.rackNumber ? `(Rak: ${d.rackNumber})` : ''}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-center">{d.totalPorts ? `${d.totalPorts} Port` : '-'}</td>
                              <td className="py-1.5 px-2 text-center capitalize text-[10px] font-semibold">{d.status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-700 mb-2 flex items-center gap-1.5">
                    <Cable className="w-3.5 h-3.5 text-blue-600" />
                    <span>Daftar Pencatatan Jalur Kabel LAN ({filteredLanCables.length})</span>
                  </h4>
                  <div className="overflow-hidden border border-slate-300 dark:border-slate-600 rounded-lg">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold">
                          <th className="py-2 px-2 border-r border-slate-300 text-center w-8">No</th>
                          <th className="py-2 px-2 border-r border-slate-300">Kode & Tipe</th>
                          <th className="py-2 px-2 border-r border-slate-300">Titik Asal (Arah Dari)</th>
                          <th className="py-2 px-2 border-r border-slate-300">Titik Tujuan (Arah Ke)</th>
                          <th className="py-2 px-2 border-r border-slate-300">Rute Jalur</th>
                          <th className="py-2 px-2 border-r border-slate-300 text-center">Panjang</th>
                          <th className="py-2 px-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {filteredLanCables.length === 0 ? (
                          <tr><td colSpan={7} className="py-4 text-center text-slate-400">Tidak ada jalur kabel LAN terdaftar.</td></tr>
                        ) : (
                          filteredLanCables.map((c, idx) => (
                            <tr key={c.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-center text-slate-500">{idx + 1}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 font-mono font-bold text-blue-900">{c.cableCode} ({c.cableType})</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{c.sourceDeviceName || c.sourceLocation} {c.sourcePort ? `(${c.sourcePort})` : ''}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{c.targetDeviceName || c.targetLocation} {c.targetPort ? `(${c.targetPort})` : ''}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-slate-600 text-[10px]">{c.pathwayRoute || '-'}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-center">{c.lengthMeter || 0} m</td>
                              <td className="py-1.5 px-2 text-center capitalize text-[10px] font-semibold">{c.status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TABEL: Detail Jaringan Listrik */}
            {type === 'electricity_detail' && (
              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-700 mb-2 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Daftar Perangkat Listrik ({filteredElectricityDevices.length})</span>
                  </h4>
                  <div className="overflow-hidden border border-slate-300 dark:border-slate-600 rounded-lg">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold">
                          <th className="py-2 px-2 border-r border-slate-300 text-center w-8">No</th>
                          <th className="py-2 px-2 border-r border-slate-300">Komponen</th>
                          <th className="py-2 px-2 border-r border-slate-300">Kode & Tipe</th>
                          <th className="py-2 px-2 border-r border-slate-300">Fase & Volt</th>
                          <th className="py-2 px-2 border-r border-slate-300">Kapasitas / Beban</th>
                          <th className="py-2 px-2 border-r border-slate-300">Lokasi / Letak</th>
                          <th className="py-2 px-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {filteredElectricityDevices.length === 0 ? (
                          <tr><td colSpan={7} className="py-4 text-center text-slate-400">Tidak ada komponen listrik terdaftar.</td></tr>
                        ) : (
                          filteredElectricityDevices.map((d, idx) => (
                            <tr key={d.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-center text-slate-500">{idx + 1}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 font-bold text-amber-900">{d.name}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{d.code} ({d.type})</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{d.phase === '3_phase' ? '3 Phase' : '1 Phase'} ({d.voltage || 220}V)</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{d.capacityWatt || 0}W / {d.currentLoadWatt || 0}W</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{d.location || '-'}</td>
                              <td className="py-1.5 px-2 text-center capitalize text-[10px] font-semibold">{d.status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-700 mb-2 flex items-center gap-1.5">
                    <Cable className="w-3.5 h-3.5 text-amber-600" />
                    <span>Daftar Distribusi Kabel Listrik ({filteredElectricityCables.length})</span>
                  </h4>
                  <div className="overflow-hidden border border-slate-300 dark:border-slate-600 rounded-lg">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold">
                          <th className="py-2 px-2 border-r border-slate-300 text-center w-8">No</th>
                          <th className="py-2 px-2 border-r border-slate-300">Kode & Tipe</th>
                          <th className="py-2 px-2 border-r border-slate-300">Sumber / Panel Asal</th>
                          <th className="py-2 px-2 border-r border-slate-300">Tujuan Beban / Ruang</th>
                          <th className="py-2 px-2 border-r border-slate-300">Core Spec & Rute</th>
                          <th className="py-2 px-2 border-r border-slate-300 text-center">Panjang</th>
                          <th className="py-2 px-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {filteredElectricityCables.length === 0 ? (
                          <tr><td colSpan={7} className="py-4 text-center text-slate-400">Tidak ada kabel distribusi listrik terdaftar.</td></tr>
                        ) : (
                          filteredElectricityCables.map((c, idx) => (
                            <tr key={c.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-center text-slate-500">{idx + 1}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 font-mono font-bold text-amber-900">{c.cableCode} ({c.cableType})</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{c.sourceDeviceName || c.sourceLocation}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{c.targetDeviceName || c.targetLocation}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-[10px]">{c.coreSpec || '-'} | {c.pathwayRoute || c.pathDescription || '-'}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-center">{c.lengthMeter || c.lengthMeters || 0} m</td>
                              <td className="py-1.5 px-2 text-center capitalize text-[10px] font-semibold">{c.status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TABEL: Detail Jaringan CCTV */}
            {type === 'cctv_detail' && (
              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-700 mb-2 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Daftar Kamera & NVR CCTV ({filteredCctvDevices.length})</span>
                  </h4>
                  <div className="overflow-hidden border border-slate-300 dark:border-slate-600 rounded-lg">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold">
                          <th className="py-2 px-2 border-r border-slate-300 text-center w-8">No</th>
                          <th className="py-2 px-2 border-r border-slate-300">Nama Kamera / NVR</th>
                          <th className="py-2 px-2 border-r border-slate-300">Tipe & Resolusi</th>
                          <th className="py-2 px-2 border-r border-slate-300">IP Address</th>
                          <th className="py-2 px-2 border-r border-slate-300">Channel / Brand</th>
                          <th className="py-2 px-2 border-r border-slate-300">Lokasi / Titik</th>
                          <th className="py-2 px-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {filteredCctvDevices.length === 0 ? (
                          <tr><td colSpan={7} className="py-4 text-center text-slate-400">Tidak ada perangkat CCTV terdaftar.</td></tr>
                        ) : (
                          filteredCctvDevices.map((d, idx) => (
                            <tr key={d.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-center text-slate-500">{idx + 1}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 font-bold text-indigo-900">{d.name}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{d.type} {d.resolution ? `(${d.resolution})` : ''}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 font-mono">{d.ipAddress || '-'}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{d.channelNumber ? `CH-${d.channelNumber}` : '-'} | {d.brand || '-'}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{d.location || '-'}</td>
                              <td className="py-1.5 px-2 text-center capitalize text-[10px] font-semibold">{d.status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-700 mb-2 flex items-center gap-1.5">
                    <Cable className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Daftar Jalur Kabel CCTV ({filteredCctvCables.length})</span>
                  </h4>
                  <div className="overflow-hidden border border-slate-300 dark:border-slate-600 rounded-lg">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold">
                          <th className="py-2 px-2 border-r border-slate-300 text-center w-8">No</th>
                          <th className="py-2 px-2 border-r border-slate-300">Kode & Tipe</th>
                          <th className="py-2 px-2 border-r border-slate-300">Sumber (NVR / Switch PoE)</th>
                          <th className="py-2 px-2 border-r border-slate-300">Tujuan (Kamera / Titik)</th>
                          <th className="py-2 px-2 border-r border-slate-300">Rute Jalur</th>
                          <th className="py-2 px-2 border-r border-slate-300 text-center">Panjang</th>
                          <th className="py-2 px-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {filteredCctvCables.length === 0 ? (
                          <tr><td colSpan={7} className="py-4 text-center text-slate-400">Tidak ada kabel CCTV terdaftar.</td></tr>
                        ) : (
                          filteredCctvCables.map((c, idx) => (
                            <tr key={c.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-center text-slate-500">{idx + 1}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 font-mono font-bold text-indigo-900">{c.cableCode} ({c.cableType})</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{c.sourceDeviceName || c.sourceLocation} {c.sourcePort ? `(${c.sourcePort})` : ''}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{c.targetDeviceName || c.targetLocation} {c.targetPort ? `(${c.targetPort})` : ''}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-[10px]">{c.pathwayRoute || c.pathDescription || '-'}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-center">{c.lengthMeter || c.lengthMeters || 0} m</td>
                              <td className="py-1.5 px-2 text-center capitalize text-[10px] font-semibold">{c.status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TABEL: Detail Jaringan Air */}
            {type === 'water_detail' && (
              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-700 mb-2 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-teal-600" />
                    <span>Daftar Perangkat Air & Irigasi ({filteredWaterDevices.length})</span>
                  </h4>
                  <div className="overflow-hidden border border-slate-300 dark:border-slate-600 rounded-lg">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold">
                          <th className="py-2 px-2 border-r border-slate-300 text-center w-8">No</th>
                          <th className="py-2 px-2 border-r border-slate-300">Nama Titik / Pompa</th>
                          <th className="py-2 px-2 border-r border-slate-300">Kode & Tipe</th>
                          <th className="py-2 px-2 border-r border-slate-300">Pipa & Debit</th>
                          <th className="py-2 px-2 border-r border-slate-300">Kapasitas Toren</th>
                          <th className="py-2 px-2 border-r border-slate-300">Lokasi / Penempatan</th>
                          <th className="py-2 px-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {filteredWaterDevices.length === 0 ? (
                          <tr><td colSpan={7} className="py-4 text-center text-slate-400">Tidak ada komponen air terdaftar.</td></tr>
                        ) : (
                          filteredWaterDevices.map((d, idx) => (
                            <tr key={d.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-center text-slate-500">{idx + 1}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 font-bold text-teal-900">{d.name}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{d.code} ({d.type})</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{d.pipeDiameter || '-'} | {d.flowRateLpm ? `${d.flowRateLpm} L/m` : '-'}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{d.tankCapacityLiter ? `${d.tankCapacityLiter} Liter` : '-'} {d.currentWaterLevelPct !== undefined ? `(${d.currentWaterLevelPct}%)` : ''}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{d.location || '-'}</td>
                              <td className="py-1.5 px-2 text-center capitalize text-[10px] font-semibold">{d.status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-700 mb-2 flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5 text-teal-600" />
                    <span>Daftar Distribusi Pipa Air ({filteredWaterPipes.length})</span>
                  </h4>
                  <div className="overflow-hidden border border-slate-300 dark:border-slate-600 rounded-lg">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold">
                          <th className="py-2 px-2 border-r border-slate-300 text-center w-8">No</th>
                          <th className="py-2 px-2 border-r border-slate-300">Kode & Pipa</th>
                          <th className="py-2 px-2 border-r border-slate-300">Titik Asal / Sumber</th>
                          <th className="py-2 px-2 border-r border-slate-300">Titik Tujuan / Distribusi</th>
                          <th className="py-2 px-2 border-r border-slate-300">Diameter & Rute</th>
                          <th className="py-2 px-2 border-r border-slate-300 text-center">Panjang</th>
                          <th className="py-2 px-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {filteredWaterPipes.length === 0 ? (
                          <tr><td colSpan={7} className="py-4 text-center text-slate-400">Tidak ada jalur pipa air terdaftar.</td></tr>
                        ) : (
                          filteredWaterPipes.map((p, idx) => (
                            <tr key={p.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-center text-slate-500">{idx + 1}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 font-mono font-bold text-teal-900">{p.pipeCode} ({p.pipeType})</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{p.sourceDeviceName || p.sourceLocation}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300">{p.targetDeviceName || p.targetLocation}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-[10px]">{p.pipeDiameter || p.diameterInch || '-'} | {p.pathwayRoute || p.pathDescription || '-'}</td>
                              <td className="py-1.5 px-2 border-r border-slate-300 text-center">{p.lengthMeter || p.lengthMeters || 0} m</td>
                              <td className="py-1.5 px-2 text-center capitalize text-[10px] font-semibold">{p.status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
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
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end text-center text-xs break-inside-avoid">
              <div className="w-56">
                <p className="text-slate-600 dark:text-slate-400 mb-16">
                  Dibuat Oleh,<br />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Administrator Jaringan</span>
                </p>
                <div className="w-44 mx-auto border-b border-slate-400"></div>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {currentUser ? currentUser.name : '(............................................)'}
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
