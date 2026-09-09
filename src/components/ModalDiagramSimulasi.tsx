import React, { useState, useMemo } from 'react';
import { 
  Network, 
  Cable, 
  Server, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  X, 
  Activity, 
  Info,
  Tv,
  Wifi,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Split
} from 'lucide-react';
import { LanDevice, LanCableRun, LanLocation, LanZone } from '../types/jaringanUtilitas';

interface ModalDiagramSimulasiProps {
  isOpen: boolean;
  onClose: () => void;
  location: LanLocation;
  zone: LanZone;
  devices: LanDevice[];
  cables: LanCableRun[];
}

interface NodePosition {
  x: number;
  y: number;
  tier: number;
}

export const ModalDiagramSimulasi: React.FC<ModalDiagramSimulasiProps> = ({
  isOpen,
  onClose,
  location,
  zone,
  devices,
  cables
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedCableId, setSelectedCableId] = useState<string | null>(null);
  const [showAnimatedFlow, setShowAnimatedFlow] = useState<boolean>(true);

  // Filter devices belonging to this zone
  const zoneDevices = useMemo(() => {
    return devices.filter(d => d.locationId === location.id && d.zoneId === zone.id);
  }, [devices, location.id, zone.id]);

  // Filter cables belonging to this zone
  const zoneCables = useMemo(() => {
    return cables.filter(c => c.locationId === location.id && c.zoneId === zone.id);
  }, [cables, location.id, zone.id]);

  // Kategorisasi perangkat berdasarkan peran/tier topologi
  const categorizedNodes = useMemo(() => {
    const tier1: LanDevice[] = [];
    const tier2: LanDevice[] = [];
    const tier3: LanDevice[] = [];
    const tier4: LanDevice[] = [];

    zoneDevices.forEach(d => {
      const type = (d.type || '').toLowerCase();
      if (type.includes('router') || type.includes('gateway') || type.includes('core') || type.includes('otb')) {
        tier1.push(d);
      } else if (type.includes('switch') || type.includes('distribution') || type.includes('patch')) {
        tier2.push(d);
      } else if (type.includes('access_point') || type.includes('ap') || type.includes('server')) {
        tier3.push(d);
      } else {
        tier4.push(d);
      }
    });

    return { tier1, tier2, tier3, tier4 };
  }, [zoneDevices]);

  // Hitung posisi koordinat graf (X, Y) untuk setiap node perangkat terdaftar
  const nodePositions = useMemo(() => {
    const positions: Record<string, NodePosition> = {};
    const tiers = [
      categorizedNodes.tier1,
      categorizedNodes.tier2,
      categorizedNodes.tier3,
      categorizedNodes.tier4
    ];

    const canvasWidth = 1050;
    const tierY = [120, 280, 440, 600];

    tiers.forEach((tierDevices, tierIdx) => {
      const count = tierDevices.length;
      if (count === 0) return;

      const spacing = canvasWidth / (count + 1);
      tierDevices.forEach((dev, idx) => {
        positions[dev.id] = {
          x: Math.round(spacing * (idx + 1)),
          y: tierY[tierIdx],
          tier: tierIdx + 1
        };
      });
    });

    // Cek perangkat berdasarkan kecocokan nama jika id kosong
    zoneDevices.forEach(dev => {
      if (!positions[dev.id] && dev.name) {
        positions[dev.name.toLowerCase()] = {
          x: 200,
          y: 200,
          tier: 2
        };
      }
    });

    return positions;
  }, [categorizedNodes, zoneDevices]);

  // Kalkulasi kabel yang tidak memiliki salah satu atau kedua ujung perangkat fisik
  // (misal hanya berupa titik lokasi: "Wallplate Meja 1", "Plafon", dll)
  const processedCables = useMemo(() => {
    let unattachedIndex = 0;

    return zoneCables.map(cable => {
      // 1. Cari koordinat titik awal (Source)
      let sPos: { x: number; y: number } | null = null;
      let isSourceVirtual = false;

      if (cable.sourceDeviceId && nodePositions[cable.sourceDeviceId]) {
        sPos = nodePositions[cable.sourceDeviceId];
      } else if (cable.sourceDeviceName) {
        const found = zoneDevices.find(d => d.name.toLowerCase() === cable.sourceDeviceName?.toLowerCase());
        if (found && nodePositions[found.id]) {
          sPos = nodePositions[found.id];
        }
      }

      // 2. Cari koordinat titik akhir (Target)
      let tPos: { x: number; y: number } | null = null;
      let isTargetVirtual = false;

      if (cable.targetDeviceId && nodePositions[cable.targetDeviceId]) {
        tPos = nodePositions[cable.targetDeviceId];
      } else if (cable.targetDeviceName) {
        const found = zoneDevices.find(d => d.name.toLowerCase() === cable.targetDeviceName?.toLowerCase());
        if (found && nodePositions[found.id]) {
          tPos = nodePositions[found.id];
        }
      }

      // 3. Jika salah satu atau kedua ujungnya tidak terdaftar sebagai perangkat:
      // Buat titik virtual cerdas sehingga kabel tetap tampil jelas di kanvas
      if (!sPos && !tPos) {
        // Kedua ujungnya tidak ada perangkat (kabel berdiri sendiri/dalam jalur)
        const col = (unattachedIndex % 4);
        const row = Math.floor(unattachedIndex / 4);
        unattachedIndex++;

        const startX = 140 + col * 240;
        const startY = 660 + row * 80;
        sPos = { x: startX, y: startY };
        tPos = { x: startX + 160, y: startY + 40 };
        isSourceVirtual = true;
        isTargetVirtual = true;
      } else if (!sPos && tPos) {
        // Hanya Target yang terhubung, Source berupa titik/lokasi
        sPos = { 
          x: Math.max(60, tPos.x - 130), 
          y: Math.max(70, tPos.y - 110) 
        };
        isSourceVirtual = true;
      } else if (sPos && !tPos) {
        // Hanya Source yang terhubung, Target berupa titik/lokasi (misal drop cable ke dinding)
        tPos = { 
          x: Math.min(990, sPos.x + 130), 
          y: Math.min(710, sPos.y + 110) 
        };
        isTargetVirtual = true;
      }

      return {
        cable,
        sourcePos: sPos!,
        targetPos: tPos!,
        isSourceVirtual,
        isTargetVirtual
      };
    });
  }, [zoneCables, nodePositions, zoneDevices]);

  // Perangkat aktif terpilih
  const activeDevice = useMemo(() => {
    return zoneDevices.find(d => d.id === selectedDeviceId) || null;
  }, [zoneDevices, selectedDeviceId]);

  // Kabel aktif terpilih
  const activeCable = useMemo(() => {
    return zoneCables.find(c => c.id === selectedCableId) || null;
  }, [zoneCables, selectedCableId]);

  // Kabel yang terhubung dengan perangkat yang sedang diklik
  const relatedCableIds = useMemo(() => {
    if (!selectedDeviceId) return new Set<string>();
    const ids = new Set<string>();
    zoneCables.forEach(c => {
      if (c.sourceDeviceId === selectedDeviceId || c.targetDeviceId === selectedDeviceId) {
        ids.add(c.id);
      }
    });
    return ids;
  }, [zoneCables, selectedDeviceId]);

  // Helper mendapatkan warna status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return {
          badge: 'bg-emerald-500 text-white',
          border: 'border-emerald-500',
          stroke: '#10b981',
          glow: 'rgba(16, 185, 129, 0.4)'
        };
      case 'standby':
      case 'idle':
        return {
          badge: 'bg-amber-500 text-white',
          border: 'border-amber-500',
          stroke: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.4)'
        };
      case 'fault':
        return {
          badge: 'bg-rose-500 text-white',
          border: 'border-rose-500',
          stroke: '#ef4444',
          glow: 'rgba(239, 68, 68, 0.4)'
        };
      case 'maintenance':
        return {
          badge: 'bg-purple-500 text-white',
          border: 'border-purple-500',
          stroke: '#a855f7',
          glow: 'rgba(168, 85, 247, 0.4)'
        };
      default:
        return {
          badge: 'bg-slate-500 text-white',
          border: 'border-slate-400',
          stroke: '#64748b',
          glow: 'rgba(100, 116, 139, 0.3)'
        };
    }
  };

  // Helper render ikon perangkat
  const renderDeviceIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('router') || t.includes('gateway')) return <Activity className="w-5 h-5 text-indigo-400" />;
    if (t.includes('switch') || t.includes('distribution')) return <Network className="w-5 h-5 text-blue-400" />;
    if (t.includes('server')) return <Server className="w-5 h-5 text-cyan-400" />;
    if (t.includes('ap') || t.includes('access_point')) return <Wifi className="w-5 h-5 text-emerald-400" />;
    if (t.includes('patch')) return <Layers className="w-5 h-5 text-amber-400" />;
    return <Tv className="w-5 h-5 text-slate-300" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex flex-col font-poppins animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-blue-500 text-white rounded-2xl shadow-md shadow-indigo-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Simulasi Topologi Jaringan & Jalur Kabel
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Semua Jalur Kabel ({zoneCables.length})
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {location.name} • <span className="text-indigo-300 font-semibold">{zone.name} ({zone.code})</span>
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center justify-end gap-2">
          {/* Toggle animasi aliran data */}
          <button
            onClick={() => setShowAnimatedFlow(!showAnimatedFlow)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showAnimatedFlow 
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-xs' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Animasi Aliran Jalur Kabel"
          >
            <Activity className={`w-3.5 h-3.5 ${showAnimatedFlow ? 'text-indigo-400 animate-pulse' : ''}`} />
            <span>Aliran Jalur {showAnimatedFlow ? 'Aktif' : 'Nonaktif'}</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-xl p-0.5 shadow-xs">
            <button
              onClick={() => setZoom(prev => Math.max(0.6, prev - 0.15))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
              title="Perkecil (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-slate-300 px-2 select-none min-w-[45px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(1.8, prev + 0.15))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
              title="Perbesar (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer border-l border-slate-700"
              title="Reset Skala"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tombol Tutup */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer ml-1"
            title="Tutup Simulasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Workspace (Canvas Topologi + Sidebar Info Panel) */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* 1. Canvas SVG Viewport */}
        <div className="flex-1 overflow-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 flex justify-center items-center select-none relative">
          
          {/* Subtle Grid Background */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />

          {zoneDevices.length === 0 && zoneCables.length === 0 ? (
            <div className="text-center p-8 bg-slate-900/60 border border-slate-800 rounded-3xl max-w-md z-10">
              <Network className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200">Belum Ada Komponen Terdaftar</h3>
              <p className="text-xs text-slate-400 mt-1">
                Tambahkan perangkat fisik atau catat jalur kabel di ruangan ini untuk melihat simulasi diagram visual.
              </p>
            </div>
          ) : (
            <div 
              className="transition-transform duration-150 origin-center relative"
              style={{ transform: `scale(${zoom})` }}
            >
              <svg 
                width="1050" 
                height="780" 
                className="overflow-visible"
              >
                <defs>
                  {/* Filter Glow Effect */}
                  <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Layer 1: Garis Jalur Kabel (Connections) - SEMUA KABEL DITAMPILKAN */}
                {processedCables.map(({ cable, sourcePos, targetPos, isSourceVirtual, isTargetVirtual }) => {
                  const isSelected = selectedCableId === cable.id;
                  const isRelatedToDevice = selectedDeviceId && relatedCableIds.has(cable.id);
                  const isHighlighted = isSelected || isRelatedToDevice;

                  const statusStyle = getStatusColor(cable.status);
                  const strokeColor = isHighlighted ? '#38bdf8' : statusStyle.stroke;
                  const strokeWidth = isHighlighted ? 3.5 : 2;

                  // Curved Bezier Path calculation
                  const deltaY = targetPos.y - sourcePos.y;
                  const curveOffset = Math.min(80, Math.abs(deltaY) * 0.4);
                  const pathD = `M ${sourcePos.x} ${sourcePos.y + (isSourceVirtual ? 0 : 20)} C ${sourcePos.x} ${sourcePos.y + (isSourceVirtual ? 0 : 20) + curveOffset}, ${targetPos.x} ${targetPos.y - (isTargetVirtual ? 0 : 20) - curveOffset}, ${targetPos.x} ${targetPos.y - (isTargetVirtual ? 0 : 20)}`;

                  const midX = (sourcePos.x + targetPos.x) / 2;
                  const midY = (sourcePos.y + targetPos.y) / 2;

                  return (
                    <g 
                      key={cable.id}
                      onClick={() => {
                        setSelectedCableId(cable.id);
                        setSelectedDeviceId(null);
                      }}
                      className="cursor-pointer group"
                    >
                      {/* Invisible wider stroke for easy click interaction */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="18"
                      />

                      {/* Main Cable Path */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeOpacity={isHighlighted ? 1 : (isSourceVirtual || isTargetVirtual ? 0.75 : 0.65)}
                        strokeDasharray={cable.status === 'fault' ? '6 4' : (isSourceVirtual || isTargetVirtual ? '5 3' : undefined)}
                        className="transition-all group-hover:stroke-cyan-400 group-hover:stroke-opacity-100"
                        style={{ filter: isHighlighted ? 'url(#glow-cyan)' : undefined }}
                      />

                      {/* Animated Flow Particles when active */}
                      {showAnimatedFlow && cable.status === 'connected' && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth={strokeWidth + 1}
                          strokeDasharray="4 28"
                          strokeLinecap="round"
                          className="pointer-events-none"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="100"
                            to="0"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </path>
                      )}

                      {/* Endpoint Bullets jika ujung kabel berupa titik virtual (bukan kotak perangkat) */}
                      {isSourceVirtual && (
                        <g transform={`translate(${sourcePos.x}, ${sourcePos.y})`}>
                          <circle r="6" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
                          <circle r="2.5" fill={strokeColor} />
                          <text x="10" y="4" fill="#94a3b8" fontSize="9" fontWeight="600" className="pointer-events-none">
                            {cable.sourceLocation || cable.sourceDeviceName || 'Titik Asal'}
                          </text>
                        </g>
                      )}

                      {isTargetVirtual && (
                        <g transform={`translate(${targetPos.x}, ${targetPos.y})`}>
                          <circle r="6" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
                          <circle r="2.5" fill={strokeColor} />
                          <text x="10" y="4" fill="#94a3b8" fontSize="9" fontWeight="600" className="pointer-events-none">
                            {cable.targetLocation || cable.targetDeviceName || 'Titik Tujuan'}
                          </text>
                        </g>
                      )}

                      {/* Badge Label Kode Kabel di Tengah Jalur */}
                      <g transform={`translate(${midX}, ${midY})`} className="pointer-events-none">
                        <rect
                          x="-42"
                          y="-10"
                          width="84"
                          height="20"
                          rx="6"
                          fill="#0f172a"
                          stroke={isHighlighted ? '#38bdf8' : '#334155'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fill={isHighlighted ? '#38bdf8' : '#cbd5e1'}
                          fontSize="9"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {cable.cableCode}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Layer 2: Node Perangkat Fisik */}
                {zoneDevices.map(dev => {
                  const pos = nodePositions[dev.id];
                  if (!pos) return null;

                  const isSelected = selectedDeviceId === dev.id;
                  const isConnectedToSelectedCable = activeCable && (activeCable.sourceDeviceId === dev.id || activeCable.targetDeviceId === dev.id);
                  const isHighlighted = isSelected || isConnectedToSelectedCable;
                  const statusStyle = getStatusColor(dev.status);

                  return (
                    <g
                      key={dev.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      onClick={() => {
                        setSelectedDeviceId(dev.id);
                        setSelectedCableId(null);
                      }}
                      className="cursor-pointer group"
                    >
                      {/* Pulse Ring when Selected */}
                      {isHighlighted && (
                        <circle
                          r="42"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2"
                          strokeOpacity="0.8"
                          className="animate-ping"
                        />
                      )}

                      {/* Node Card Container */}
                      <rect
                        x="-70"
                        y="-26"
                        width="140"
                        height="52"
                        rx="14"
                        fill={isHighlighted ? '#1e293b' : '#0f172a'}
                        stroke={isHighlighted ? '#38bdf8' : '#334155'}
                        strokeWidth={isHighlighted ? 2.5 : 1.5}
                        className="transition-all group-hover:stroke-indigo-400 group-hover:fill-slate-800 shadow-xl"
                      />

                      {/* Icon Circle */}
                      <g transform="translate(-48, 0)">
                        <circle
                          r="16"
                          fill="#1e293b"
                          stroke="#334155"
                          strokeWidth="1"
                        />
                        <g transform="translate(-10, -10)">
                          {renderDeviceIcon(dev.type)}
                        </g>
                      </g>

                      {/* Device Text Labels */}
                      <text
                        x="-24"
                        y="-6"
                        fill="#f8fafc"
                        fontSize="11"
                        fontWeight="800"
                        className="truncate"
                      >
                        {dev.name.length > 13 ? `${dev.name.substring(0, 12)}…` : dev.name}
                      </text>

                      <text
                        x="-24"
                        y="8"
                        fill="#94a3b8"
                        fontSize="9"
                        fontWeight="500"
                        fontFamily="monospace"
                      >
                        {dev.ipAddress || dev.code || '-'}
                      </text>

                      <text
                        x="-24"
                        y="18"
                        fill="#64748b"
                        fontSize="8"
                        className="capitalize"
                      >
                        {dev.type.replace(/_/g, ' ')}
                      </text>

                      {/* Small Status Indicator Dot */}
                      <circle
                        cx="58"
                        cy="-16"
                        r="4.5"
                        fill={statusStyle.stroke}
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* 2. Sidebar Info Detail Panel (Right Drawer) */}
        <div className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto flex flex-col gap-5 flex-shrink-0 shadow-2xl z-20">
          
          {/* Panel Header */}
          <div className="pb-4 border-b border-slate-800">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
              Panel Informasi Topologi
            </span>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Detail Komponen Terpilih</span>
            </h3>
          </div>

          {/* Info Card: Jika ada perangkat yang diklik */}
          {activeDevice ? (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Kode Aset: {activeDevice.code}</span>
                    <h4 className="text-base font-extrabold text-white">{activeDevice.name}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(activeDevice.status).badge}`}>
                    {activeDevice.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Tipe Perangkat</span>
                    <strong className="text-slate-200 capitalize">{activeDevice.type.replace(/_/g, ' ')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Alamat IP</span>
                    <strong className="text-blue-400 font-mono">{activeDevice.ipAddress || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Merek / Model</span>
                    <strong className="text-slate-200">{activeDevice.brand || '-'} {activeDevice.model ? `(${activeDevice.model})` : ''}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Total Port Fisik</span>
                    <strong className="text-slate-200">{activeDevice.totalPorts ? `${activeDevice.totalPorts} Port` : '-'}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 text-[10px] block">Posisi / Rak</span>
                    <strong className="text-slate-200">{activeDevice.location || '-'} {activeDevice.rackNumber ? `(Rak: ${activeDevice.rackNumber})` : ''}</strong>
                  </div>
                </div>
              </div>

              {/* Jalur Kabel yang terhubung ke perangkat ini */}
              <div>
                <h5 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Cable className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Jalur Kabel Terkoneksi ({relatedCableIds.size})</span>
                </h5>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {zoneCables.filter(c => relatedCableIds.has(c.id)).map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedCableId(c.id)}
                      className="p-2.5 bg-slate-950/50 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-xs transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between font-mono font-bold text-cyan-400 mb-1">
                        <span>{c.cableCode}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-normal uppercase">{c.cableType}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                        <span className="truncate text-slate-300">{c.sourceDeviceName || c.sourceLocation}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                        <span className="truncate text-slate-300">{c.targetDeviceName || c.targetLocation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeCable ? (
            /* Info Card: Jika ada kabel yang diklik */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Kode Kabel</span>
                    <h4 className="text-base font-extrabold text-cyan-400 font-mono">{activeCable.cableCode}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(activeCable.status).badge}`}>
                    {activeCable.status}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Arah Dari (Titik Asal / Source)</span>
                    <strong className="text-slate-200 block">{activeCable.sourceDeviceName || '-'}</strong>
                    <span className="text-[11px] text-slate-400">{activeCable.sourceLocation} {activeCable.sourcePort ? `(Port: ${activeCable.sourcePort})` : ''}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/50">
                    <span className="text-slate-500 text-[10px] block">Arah Ke (Titik Tujuan / Target)</span>
                    <strong className="text-slate-200 block">{activeCable.targetDeviceName || '-'}</strong>
                    <span className="text-[11px] text-slate-400">{activeCable.targetLocation} {activeCable.targetPort ? `(Port: ${activeCable.targetPort})` : ''}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/50">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Tipe Kabel</span>
                      <strong className="text-slate-200 uppercase">{activeCable.cableType}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Panjang</span>
                      <strong className="text-slate-200">{activeCable.lengthMeter ? `${activeCable.lengthMeter} Meter` : '-'}</strong>
                    </div>
                  </div>

                  {activeCable.pathwayRoute && (
                    <div className="pt-2 border-t border-slate-800/50">
                      <span className="text-slate-500 text-[10px] block">Rute / Jalur Penarikan</span>
                      <p className="text-[11px] text-slate-300 italic">{activeCable.pathwayRoute}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* State Default Saat Belum Memilih */
            <div className="text-center py-10 px-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl">
              <Info className="w-8 h-8 text-slate-600 mx-auto mb-2.5" />
              <h5 className="text-xs font-bold text-slate-300">Pilih Node atau Jalur Kabel</h5>
              <p className="text-[11px] text-slate-500 mt-1">
                Seluruh jalur kabel ({zoneCables.length} kabel) ditampilkan pada diagram. Klik pada garis kabel atau kotak perangkat untuk melihat rincian koneksinya.
              </p>
            </div>
          )}

          {/* Ringkasan Jumlah Komponen */}
          <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Perangkat: <strong className="text-slate-200">{zoneDevices.length}</strong></span>
            <span>Semua Kabel: <strong className="text-cyan-400">{zoneCables.length}</strong></span>
          </div>

        </div>

      </div>

    </div>
  );
};
