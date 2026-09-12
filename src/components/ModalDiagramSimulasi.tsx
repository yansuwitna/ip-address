import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ModalPortal } from './ModalPortal';
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
  Split,
  Zap,
  Video,
  Droplets,
  ChevronUp,
  ChevronDown,
  Move,
  RefreshCw,
  Columns,
  Rows
} from 'lucide-react';
import { LanLocation, LanZone } from '../types/jaringanUtilitas';

export type SimulationUtilityType = 'lan' | 'listrik' | 'cctv' | 'air';

export interface GenericSimulationDevice {
  id: string;
  name: string;
  code?: string;
  type: string;
  location?: string;
  status: string;
  locationId?: string;
  zoneId?: string;
  ipAddress?: string;
  brand?: string;
  model?: string;
  notes?: string;
  // Listrik specific
  voltage?: number;
  phase?: string;
  capacityWatt?: number;
  currentAmpere?: number;
  // CCTV specific
  resolution?: string;
  channelNumber?: number;
  poePort?: string;
  // Air specific
  pipeDiameter?: string;
  flowRateLpm?: number;
  pressureBar?: number;
  tankCapacityLiter?: number;
  powerWatt?: number;
}

export interface GenericSimulationCable {
  id: string;
  locationId?: string;
  zoneId?: string;
  cableCode?: string;
  pipeCode?: string;
  cableType?: string;
  pipeType?: string;
  sourceDeviceId?: string;
  sourceDeviceName?: string;
  sourceLocation?: string;
  sourcePort?: string;
  targetDeviceId?: string;
  targetDeviceName?: string;
  targetLocation?: string;
  targetPort?: string;
  pathwayRoute?: string;
  lengthMeter?: number;
  lengthMeters?: number;
  status: string;
  notes?: string;
}

interface ModalDiagramSimulasiProps {
  isOpen: boolean;
  onClose: () => void;
  location: LanLocation;
  zone: LanZone;
  devices: any[];
  cables: any[];
  utilityType?: SimulationUtilityType;
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
  cables,
  utilityType = 'lan'
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedCableId, setSelectedCableId] = useState<string | null>(null);
  const [showAnimatedFlow, setShowAnimatedFlow] = useState<boolean>(true);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState<boolean>(false);

  // Filter devices belonging to this zone
  const zoneDevices = useMemo(() => {
    return devices.filter(d => d.locationId === location.id && d.zoneId === zone.id);
  }, [devices, location.id, zone.id]);

  // Filter cables belonging to this zone
  const zoneCables = useMemo(() => {
    return cables.filter(c => c.locationId === location.id && c.zoneId === zone.id);
  }, [cables, location.id, zone.id]);

  // Konfigurasi tema dan judul berdasarkan jenis utilitas
  const utilityConfig = useMemo(() => {
    switch (utilityType) {
      case 'listrik':
        return {
          title: 'Simulasi Jaringan Distribusi Kelistrikan & Jalur Kabel',
          badgeText: 'Kabel Distribusi',
          icon: Zap,
          headerGradient: 'from-amber-600 to-orange-500',
          accentColor: '#f59e0b',
          cableLabel: 'Jalur Kabel Listrik',
          particleColor: '#fef08a'
        };
      case 'cctv':
        return {
          title: 'Simulasi Topologi Pengawasan CCTV & Jalur Sinyal',
          badgeText: 'Kabel CCTV & PoE',
          icon: Video,
          headerGradient: 'from-rose-600 to-indigo-600',
          accentColor: '#f43f5e',
          cableLabel: 'Jalur Kabel CCTV',
          particleColor: '#fecdd3'
        };
      case 'air':
        return {
          title: 'Simulasi Jaringan Distribusi Air, Pompa & Irigasi',
          badgeText: 'Jalur Pipa Air',
          icon: Droplets,
          headerGradient: 'from-cyan-600 to-blue-500',
          accentColor: '#06b6d4',
          cableLabel: 'Jalur Pipa Air',
          particleColor: '#a5f3fc'
        };
      case 'lan':
      default:
        return {
          title: 'Simulasi Topologi Jaringan Komputer & Jalur Kabel LAN',
          badgeText: 'Semua Jalur Kabel',
          icon: Network,
          headerGradient: 'from-indigo-600 to-blue-500',
          accentColor: '#38bdf8',
          cableLabel: 'Jalur Kabel Data',
          particleColor: '#ffffff'
        };
    }
  }, [utilityType]);

  // Kategorisasi perangkat berdasarkan peran/tier topologi sesuai jenis utilitas
  const categorizedNodes = useMemo(() => {
    const tier1: any[] = [];
    const tier2: any[] = [];
    const tier3: any[] = [];
    const tier4: any[] = [];

    zoneDevices.forEach(d => {
      const type = (d.type || '').toLowerCase();

      if (utilityType === 'listrik') {
        // Tier 1: Sumber Utama (Trafo, Genset, MDP Utama)
        if (type.includes('trafo') || type.includes('genset') || type.includes('panel_mdp')) {
          tier1.push(d);
        }
        // Tier 2: Sub-distribusi (SDP, Stabilizer, Inverter)
        else if (type.includes('panel_sdp') || type.includes('stabilizer') || type.includes('inverter') || type.includes('ups')) {
          tier2.push(d);
        }
        // Tier 3: Pengaman & Meter (MCB, KWH Meter)
        else if (type.includes('mcb') || type.includes('kwh_meter')) {
          tier3.push(d);
        }
        // Tier 4: Beban / Titik Akhir (PDU, Stopkontak)
        else {
          tier4.push(d);
        }
      } else if (utilityType === 'cctv') {
        // Tier 1: NVR / DVR / Server Rekaman
        if (type.includes('nvr') || type.includes('dvr') || type.includes('nas')) {
          tier1.push(d);
        }
        // Tier 2: Switch PoE / Matrix Monitor
        else if (type.includes('switch_poe') || type.includes('monitor_matrix') || type.includes('switch')) {
          tier2.push(d);
        }
        // Tier 3: Kamera PTZ & Dome
        else if (type.includes('ptz') || type.includes('dome')) {
          tier3.push(d);
        }
        // Tier 4: Kamera Bullet & Lainnya
        else {
          tier4.push(d);
        }
      } else if (utilityType === 'air') {
        // Tier 1: Sumber Air (Toren / Tandon, Pompa Submersible)
        if (type.includes('water_tank') || type.includes('submersible') || type.includes('filter')) {
          tier1.push(d);
        }
        // Tier 2: Pompa Booster / Sensor Tekanan
        else if (type.includes('pump_booster') || type.includes('pressure') || type.includes('level')) {
          tier2.push(d);
        }
        // Tier 3: Valve Solenoid / Valve Manual / Flow Meter
        else if (type.includes('valve') || type.includes('flow_meter')) {
          tier3.push(d);
        }
        // Tier 4: Sprinkler / Keran Distribusi
        else {
          tier4.push(d);
        }
      } else {
        // LAN default
        if (type.includes('router') || type.includes('gateway') || type.includes('core') || type.includes('otb')) {
          tier1.push(d);
        } else if (type.includes('switch') || type.includes('distribution') || type.includes('patch')) {
          tier2.push(d);
        } else if (type.includes('access_point') || type.includes('ap') || type.includes('server')) {
          tier3.push(d);
        } else {
          tier4.push(d);
        }
      }
    });

    return { tier1, tier2, tier3, tier4 };
  }, [zoneDevices, utilityType]);

  // State orientasi topologi: 'vertical' (Atas ke Bawah) atau 'horizontal' (Kiri ke Kanan)
  const orientationStorageKey = useMemo(() => {
    return `simulasi_orient_${utilityType}_${location.id}_${zone.id}`;
  }, [utilityType, location.id, zone.id]);

  const [layoutOrientation, setLayoutOrientation] = useState<'vertical' | 'horizontal'>(() => {
    try {
      const saved = localStorage.getItem(`simulasi_orient_${utilityType}_${location.id}_${zone.id}`);
      return saved === 'horizontal' ? 'horizontal' : 'vertical';
    } catch {
      return 'vertical';
    }
  });

  // Ganti orientasi dan simpan ke localStorage
  const handleToggleOrientation = useCallback((newOrient: 'vertical' | 'horizontal') => {
    setLayoutOrientation(newOrient);
    try {
      localStorage.setItem(orientationStorageKey, newOrient);
    } catch (e) {
      console.warn('Gagal menyimpan preferensi orientasi:', e);
    }
    // Bersihkan posisi kustom agar otomatis tersusun sesuai layout baru
    setCustomPositions({});
    try {
      localStorage.removeItem(`simulasi_pos_${utilityType}_${location.id}_${zone.id}_${newOrient}`);
    } catch {}
  }, [orientationStorageKey, utilityType, location.id, zone.id]);

  // State posisi kustom yang bisa digeser (drag & drop) per orientasi
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; nodeX: number; nodeY: number } | null>(null);
  const hasDraggedRef = useRef<boolean>(false);
  const svgContainerRef = useRef<SVGSVGElement | null>(null);

  // Storage key per zona, utilitas, dan orientasi
  const storageKey = useMemo(() => {
    return `simulasi_pos_${utilityType}_${location.id}_${zone.id}_${layoutOrientation}`;
  }, [utilityType, location.id, zone.id, layoutOrientation]);

  // Muat posisi tersimpan dari localStorage saat komponen / zona / orientasi dibuka
  useEffect(() => {
    try {
      // Cek format spesifik orientasi terlebih dahulu
      let saved = localStorage.getItem(storageKey);
      if (!saved && layoutOrientation === 'vertical') {
        // Fallback untuk backward compatibility ke key lama
        saved = localStorage.getItem(`simulasi_pos_${utilityType}_${location.id}_${zone.id}`);
      }
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setCustomPositions(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Gagal memuat posisi simulasi:', e);
    }
    setCustomPositions({});
  }, [storageKey, layoutOrientation, utilityType, location.id, zone.id]);

  // Simpan posisi kustom ke localStorage saat posisi berubah
  const saveCustomPositions = useCallback((newPositions: Record<string, { x: number; y: number }>) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newPositions));
    } catch (e) {
      console.warn('Gagal menyimpan posisi simulasi:', e);
    }
  }, [storageKey]);

  // Reset tata letak kembali ke posisi otomatis default
  const handleResetPositions = useCallback(() => {
    setCustomPositions({});
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`simulasi_pos_${utilityType}_${location.id}_${zone.id}`);
    } catch (e) {
      console.warn('Gagal mereset posisi simulasi:', e);
    }
  }, [storageKey, utilityType, location.id, zone.id]);

  // Dimensi Kanvas SVG dinamis sesuai orientasi
  const canvasDimensions = useMemo(() => {
    return layoutOrientation === 'horizontal' 
      ? { width: 1260, height: 760 } 
      : { width: 1100, height: 840 };
  }, [layoutOrientation]);

  // Hitung posisi koordinat graf (X, Y) untuk setiap node perangkat terdaftar
  const nodePositions = useMemo(() => {
    const positions: Record<string, NodePosition> = {};
    const tiers = [
      categorizedNodes.tier1,
      categorizedNodes.tier2,
      categorizedNodes.tier3,
      categorizedNodes.tier4
    ];

    if (layoutOrientation === 'horizontal') {
      // --- TOPOLOGI HORIZONTAL (Kiri ke Kanan) ---
      // Tier 1 (Core/Source) di paling kiri -> Tier 4 (End Device) di paling kanan
      const tierX = [130, 420, 750, 1070];
      const canvasHeight = canvasDimensions.height;

      tiers.forEach((tierDevices, tierIdx) => {
        const count = tierDevices.length;
        if (count === 0) return;

        const spacing = canvasHeight / (count + 1);
        tierDevices.forEach((dev, idx) => {
          // Jika dalam 1 kolom ada banyak perangkat, beri variasi X selang-seling agar tidak menumpuk
          const staggerX = count > 4 ? (idx % 2 === 1 ? 30 : -30) : 0;
          const defaultX = tierX[tierIdx] + staggerX;
          const defaultY = Math.round(spacing * (idx + 1));

          const custom = customPositions[dev.id];
          positions[dev.id] = {
            x: custom ? custom.x : defaultX,
            y: custom ? custom.y : defaultY,
            tier: tierIdx + 1
          };
        });
      });
    } else {
      // --- TOPOLOGI VERTIKAL (Atas ke Bawah) ---
      // Tier 1 (Core/Source) di paling atas -> Tier 4 (End Device) di paling bawah
      const canvasWidth = canvasDimensions.width;
      const tierY = [110, 290, 480, 670];

      tiers.forEach((tierDevices, tierIdx) => {
        const count = tierDevices.length;
        if (count === 0) return;

        const spacing = canvasWidth / (count + 1);
        tierDevices.forEach((dev, idx) => {
          const staggerY = count > 4 ? (idx % 2 === 1 ? 32 : -32) : 0;
          const defaultX = Math.round(spacing * (idx + 1));
          const defaultY = tierY[tierIdx] + staggerY;

          const custom = customPositions[dev.id];
          positions[dev.id] = {
            x: custom ? custom.x : defaultX,
            y: custom ? custom.y : defaultY,
            tier: tierIdx + 1
          };
        });
      });
    }

    // Cek perangkat berdasarkan kecocokan nama jika id kosong
    zoneDevices.forEach(dev => {
      if (!positions[dev.id] && dev.name) {
        const custom = customPositions[dev.id] || customPositions[dev.name.toLowerCase()];
        positions[dev.name.toLowerCase()] = {
          x: custom ? custom.x : 200,
          y: custom ? custom.y : 200,
          tier: 2
        };
      }
    });

    return positions;
  }, [categorizedNodes, zoneDevices, customPositions, layoutOrientation, canvasDimensions]);

  // Helper Cerdas untuk membaca posisi relatif perangkat target (apakah di bawah, di atas, di samping kanan, atau di samping kiri)
  // Menghitung titik jangkar (docking port) tepat di tepi kartu perangkat (140x52px, center di 0,0)
  const getNodeBorderPort = (
    center: { x: number; y: number },
    target: { x: number; y: number },
    isVirtual: boolean
  ) => {
    if (isVirtual) return { x: center.x, y: center.y, side: 'center' as const };

    const dx = target.x - center.x;
    const dy = target.y - center.y;
    const halfW = 70; // Setengah lebar kartu perangkat (140px / 2)
    const halfH = 26; // Setengah tinggi kartu perangkat (52px / 2)

    // Rasio kemiringan sudut untuk menentukan bidang kontak
    // Membaca posisi apakah perangkat dominan berada di bawah/atas atau di sampingnya
    if (Math.abs(dy) * halfW >= Math.abs(dx) * halfH) {
      // Vertikal: Posisi di bawah atau di atas
      if (dy >= 0) {
        // Target di BAWAHNYA -> Port keluar dari sisi BAWAH kartu
        const offsetX = Math.max(-42, Math.min(42, dx * 0.25));
        return { x: center.x + offsetX, y: center.y + halfH, side: 'bottom' as const };
      } else {
        // Target di ATASNYA -> Port keluar dari sisi ATAS kartu
        const offsetX = Math.max(-42, Math.min(42, dx * 0.25));
        return { x: center.x + offsetX, y: center.y - halfH, side: 'top' as const };
      }
    } else {
      // Horizontal: Posisi di samping kanan atau di samping kiri
      if (dx >= 0) {
        // Target di SAMPING KANAN -> Port keluar dari sisi KANAN kartu
        const offsetY = Math.max(-14, Math.min(14, dy * 0.25));
        return { x: center.x + halfW, y: center.y + offsetY, side: 'right' as const };
      } else {
        // Target di SAMPING KIRI -> Port keluar dari sisi KIRI kartu
        const offsetY = Math.max(-14, Math.min(14, dy * 0.25));
        return { x: center.x - halfW, y: center.y + offsetY, side: 'left' as const };
      }
    }
  };

  // Kalkulasi kabel/pipa yang tidak memiliki salah satu atau kedua ujung perangkat fisik
  const processedCables = useMemo(() => {
    let unattachedIndex = 0;

    return zoneCables.map(cable => {
      // 1. Cari koordinat titik awal (Source)
      let sPos: { x: number; y: number } | null = null;
      let isSourceVirtual = false;

      if (cable.sourceDeviceId && nodePositions[cable.sourceDeviceId]) {
        sPos = nodePositions[cable.sourceDeviceId];
      } else if (cable.sourceDeviceName) {
        const found = zoneDevices.find(d => d.name?.toLowerCase() === cable.sourceDeviceName?.toLowerCase());
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
        const found = zoneDevices.find(d => d.name?.toLowerCase() === cable.targetDeviceName?.toLowerCase());
        if (found && nodePositions[found.id]) {
          tPos = nodePositions[found.id];
        }
      }

      // 3. Jika salah satu atau kedua ujungnya tidak terdaftar sebagai perangkat:
      if (!sPos && !tPos) {
        const col = (unattachedIndex % 4);
        const row = Math.floor(unattachedIndex / 4);
        unattachedIndex++;

        const startX = 140 + col * 240;
        const startY = 720 + row * 80;
        sPos = { x: startX, y: startY };
        tPos = { x: startX + 160, y: startY + 40 };
        isSourceVirtual = true;
        isTargetVirtual = true;
      } else if (!sPos && tPos) {
        sPos = { 
          x: Math.max(60, tPos.x - 130), 
          y: Math.max(70, tPos.y - 110) 
        };
        isSourceVirtual = true;
      } else if (sPos && !tPos) {
        tPos = { 
          x: Math.min(canvasDimensions.width - 60, sPos.x + 130), 
          y: Math.min(canvasDimensions.height - 60, sPos.y + 110) 
        };
        isTargetVirtual = true;
      }

      // 4. Hitung port docking cerdas di batas tepi perangkat
      const dockSource = getNodeBorderPort(sPos!, tPos!, isSourceVirtual);
      const dockTarget = getNodeBorderPort(tPos!, sPos!, isTargetVirtual);

      return {
        cable,
        sourcePos: sPos!,
        targetPos: tPos!,
        dockSource,
        dockTarget,
        isSourceVirtual,
        isTargetVirtual
      };
    });
  }, [zoneCables, nodePositions, zoneDevices, canvasDimensions]);

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
      case 'normal':
      case 'online':
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
      case 'critical':
      case 'warning':
      case 'leaking':
      case 'issue':
        return {
          badge: 'bg-rose-500 text-white',
          border: 'border-rose-500',
          stroke: '#ef4444',
          glow: 'rgba(239, 68, 68, 0.4)'
        };
      case 'maintenance':
      case 'recording':
        return {
          badge: 'bg-purple-500 text-white',
          border: 'border-purple-500',
          stroke: '#a855f7',
          glow: 'rgba(168, 85, 247, 0.4)'
        };
      default:
        return {
          badge: 'bg-slate-500 text-white',
          border: 'border-slate-500',
          stroke: '#64748b',
          glow: 'rgba(100, 116, 139, 0.4)'
        };
    }
  };

  // Helper render ikon perangkat dinamis sesuai jenis utilitas
  const renderDeviceIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    if (utilityType === 'listrik') {
      return <Zap className="w-5 h-5 text-amber-400" />;
    }
    if (utilityType === 'cctv') {
      if (t.includes('nvr') || t.includes('dvr')) return <Server className="w-5 h-5 text-indigo-400" />;
      return <Video className="w-5 h-5 text-rose-400" />;
    }
    if (utilityType === 'air') {
      return <Droplets className="w-5 h-5 text-cyan-400" />;
    }
    // LAN
    if (t.includes('router') || t.includes('gateway')) return <Activity className="w-5 h-5 text-indigo-400" />;
    if (t.includes('switch') || t.includes('distribution')) return <Network className="w-5 h-5 text-blue-400" />;
    if (t.includes('server')) return <Server className="w-5 h-5 text-cyan-400" />;
    if (t.includes('ap') || t.includes('access_point')) return <Wifi className="w-5 h-5 text-emerald-400" />;
    if (t.includes('patch')) return <Layers className="w-5 h-5 text-amber-400" />;
    return <Tv className="w-5 h-5 text-slate-300" />;
  };

  // Event handler untuk geser-geser perangkat (Drag and Drop)
  const handleNodePointerDown = (e: React.PointerEvent, devId: string) => {
    // Hanya tangani klik kiri / primary touch
    if (e.button !== 0) return;
    e.stopPropagation();
    
    // Tangkap pointer pada target agar drag lancar meskipun cursor keluar dari node
    (e.currentTarget as Element).setPointerCapture(e.pointerId);

    const pos = nodePositions[devId];
    if (!pos) return;

    setDraggingNodeId(devId);
    hasDraggedRef.current = false;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      nodeX: pos.x,
      nodeY: pos.y
    };
  };

  const rafRef = useRef<number | null>(null);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingNodeId || !dragStartRef.current) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (!dragStartRef.current || !draggingNodeId) return;

      const dx = (clientX - dragStartRef.current.mouseX) / zoom;
      const dy = (clientY - dragStartRef.current.mouseY) / zoom;

      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        hasDraggedRef.current = true;
      }

      const maxX = canvasDimensions.width - 75;
      const maxY = canvasDimensions.height - 35;
      const newX = Math.round(Math.max(75, Math.min(maxX, dragStartRef.current.nodeX + dx)));
      const newY = Math.round(Math.max(35, Math.min(maxY, dragStartRef.current.nodeY + dy)));

      setCustomPositions(prev => {
        if (prev[draggingNodeId]?.x === newX && prev[draggingNodeId]?.y === newY) {
          return prev;
        }
        return {
          ...prev,
          [draggingNodeId]: { x: newX, y: newY }
        };
      });
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (draggingNodeId) {
      try {
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Abaikan jika pointer capture telah terlepas
      }
      setDraggingNodeId(null);
      dragStartRef.current = null;
      // Persist posisi ke localStorage saat selesai digeser
      setCustomPositions(current => {
        saveCustomPositions(current);
        return current;
      });
    }
  };

  if (!isOpen) return null;

  const HeaderIcon = utilityConfig.icon;

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex flex-col font-poppins animate-in fade-in duration-200 overflow-hidden">
      
      {/* Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0 shadow-lg">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className={`p-2 sm:p-2.5 bg-gradient-to-tr ${utilityConfig.headerGradient} text-white rounded-2xl shadow-md flex-shrink-0`}>
              <HeaderIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-base font-extrabold text-white tracking-tight truncate">
                  {utilityConfig.title}
                </h2>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                  {zoneCables.length} {utilityType === 'air' ? 'Pipa' : 'Jalur'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                {location.name} • <span className="text-slate-200 font-semibold">{zone.name} ({zone.code})</span>
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="sm:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Tutup Simulasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
          {/* Toggle animasi aliran */}
          <button
            onClick={() => setShowAnimatedFlow(!showAnimatedFlow)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showAnimatedFlow 
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-xs' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Animasi Aliran Jalur"
          >
            <Activity className={`w-3.5 h-3.5 ${showAnimatedFlow ? 'animate-pulse text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">Aliran Jalur {showAnimatedFlow ? 'Aktif' : 'Off'}</span>
            <span className="sm:hidden">{showAnimatedFlow ? 'Aliran ON' : 'OFF'}</span>
          </button>

          {/* Toggle Orientasi: Vertikal (Atas-Bawah) vs Horizontal (Kiri-Kanan) */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-xl p-0.5 shadow-xs">
            <button
              onClick={() => handleToggleOrientation('vertical')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutOrientation === 'vertical'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Tata letak vertikal (Alur dari atas ke bawah)"
            >
              <Rows className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Vertikal</span>
            </button>
            <button
              onClick={() => handleToggleOrientation('horizontal')}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutOrientation === 'horizontal'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Tata letak horizontal (Alur dari kiri ke kanan)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Horizontal</span>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-xl p-0.5 shadow-xs">
            <button
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.15))}
              className="p-1 sm:p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
              title="Perkecil (-)"
            >
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 px-1.5 select-none min-w-[36px] sm:min-w-[44px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(2.0, prev + 0.15))}
              className="p-1 sm:p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
              title="Perbesar (+)"
            >
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 sm:p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer border-l border-slate-700"
              title="Reset Skala"
            >
              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          {/* Tombol Reset Posisi Tata Letak */}
          <button
            onClick={handleResetPositions}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700/70 transition-all cursor-pointer shadow-xs"
            title="Kembalikan posisi semua perangkat ke tata letak default"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset Posisi</span>
            <span className="sm:hidden">Reset</span>
          </button>

          {/* Mobile Inspector Toggle */}
          <button
            onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
            className={`lg:hidden px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
              activeDevice || activeCable 
                ? 'bg-blue-600 text-white border-blue-500 shadow-xs' 
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Detail</span>
            {isMobilePanelOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>

          {/* Desktop Close Button */}
          <button
            onClick={onClose}
            className="hidden sm:flex p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer ml-1"
            title="Tutup Simulasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* 1. Canvas SVG Viewport */}
        <div className="flex-1 overflow-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 flex justify-center items-center select-none relative min-h-0">
          
          {/* Subtle Grid Background */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle, ${utilityConfig.accentColor} 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />

          {zoneDevices.length === 0 && zoneCables.length === 0 ? (
            <div className="text-center p-8 bg-slate-900/60 border border-slate-800 rounded-3xl max-w-md z-10 mx-4">
              <HeaderIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-300">Belum Ada Komponen di Area Ini</h4>
              <p className="text-xs text-slate-500 mt-1">
                Silakan tambahkan perangkat atau jalur kabel terlebih dahulu untuk melihat visualisasi topologi simulasi interaktif.
              </p>
            </div>
          ) : (
            <div 
              className="origin-center transition-transform duration-75 relative p-4"
              style={{ transform: `scale(${zoom})` }}
            >
              <svg 
                ref={svgContainerRef}
                width={canvasDimensions.width} 
                height={canvasDimensions.height} 
                className="overflow-visible select-none"
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <defs>
                  <filter id="glow-dynamic" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Layer 1: Garis Jalur Kabel/Pipa - Terhubung ke Tepi Perangkat Cerdas & Rapi */}
                {processedCables.map(({ cable, sourcePos, targetPos, dockSource, dockTarget, isSourceVirtual, isTargetVirtual }) => {
                  const isSelected = selectedCableId === cable.id;
                  const isRelatedToDevice = selectedDeviceId && relatedCableIds.has(cable.id);
                  const isHighlighted = isSelected || isRelatedToDevice;

                  const statusStyle = getStatusColor(cable.status);
                  const strokeColor = isHighlighted ? utilityConfig.accentColor : statusStyle.stroke;
                  const strokeWidth = isHighlighted ? 3.5 : 2;

                  // Gunakan dockSource dan dockTarget pada batas tepi node perangkat
                  const sx = dockSource.x;
                  const sy = dockSource.y;
                  const tx = dockTarget.x;
                  const ty = dockTarget.y;

                  const deltaX = tx - sx;
                  const deltaY = ty - sy;
                  const dist = Math.hypot(deltaX, deltaY);

                  // Kalkulasi Kontrol Bezier Cerdas berdasarkan SISI KELUAR & MASUK kabel
                  // Memastikan jalur keluar lurus tegak lurus dari bodi perangkat (ortogonal / curve profesional)
                  const offsetDist = Math.min(90, Math.max(30, dist * 0.35));
                  
                  let cp1x = sx;
                  let cp1y = sy;
                  let cp2x = tx;
                  let cp2y = ty;

                  // Orientasi vektor awal dari sisi dockSource (keluar tegak lurus bodi kartu)
                  if (dockSource.side === 'bottom') cp1y = sy + offsetDist;
                  else if (dockSource.side === 'top') cp1y = sy - offsetDist;
                  else if (dockSource.side === 'right') cp1x = sx + offsetDist;
                  else if (dockSource.side === 'left') cp1x = sx - offsetDist;

                  // Orientasi vektor akhir ke sisi dockTarget (masuk tegak lurus bodi kartu)
                  if (dockTarget.side === 'bottom') cp2y = ty + offsetDist;
                  else if (dockTarget.side === 'top') cp2y = ty - offsetDist;
                  else if (dockTarget.side === 'right') cp2x = tx + offsetDist;
                  else if (dockTarget.side === 'left') cp2x = tx - offsetDist;

                  // Jika kedua ujungnya virtual, gunakan kurva santai
                  if (isSourceVirtual && isTargetVirtual) {
                    cp1x = sx + deltaX * 0.25;
                    cp1y = sy + deltaY * 0.1;
                    cp2x = tx - deltaX * 0.25;
                    cp2y = ty - deltaY * 0.1;
                  }

                  const pathD = `M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tx} ${ty}`;

                  const midX = (sx + tx) / 2;
                  const midY = (sy + ty) / 2;
                  const cableCodeDisplay = cable.cableCode || cable.pipeCode || cable.labelCode || 'JALUR';

                  return (
                    <g 
                      key={cable.id}
                      onClick={() => {
                        setSelectedCableId(cable.id);
                        setSelectedDeviceId(null);
                        setIsMobilePanelOpen(true);
                      }}
                      className="cursor-pointer group"
                    >
                      {/* Interactive broad hit area */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="18"
                      />

                      {/* Main cable line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeOpacity={isHighlighted ? 1 : (isSourceVirtual || isTargetVirtual ? 0.8 : 0.7)}
                        strokeDasharray={cable.status === 'fault' || cable.status === 'leaking' ? '6 4' : (isSourceVirtual || isTargetVirtual ? '5 3' : undefined)}
                        className="group-hover:stroke-opacity-100"
                        style={{ filter: isHighlighted ? 'url(#glow-dynamic)' : undefined }}
                      />

                      {/* Dot konektor kecil di ujung kabel batas perangkat */}
                      {!isSourceVirtual && (
                        <circle
                          cx={sx}
                          cy={sy}
                          r={isHighlighted ? 3.5 : 2.5}
                          fill={strokeColor}
                          stroke="#0f172a"
                          strokeWidth="1"
                        />
                      )}
                      {!isTargetVirtual && (
                        <circle
                          cx={tx}
                          cy={ty}
                          r={isHighlighted ? 3.5 : 2.5}
                          fill={strokeColor}
                          stroke="#0f172a"
                          strokeWidth="1"
                        />
                      )}

                      {showAnimatedFlow && (cable.status === 'connected' || cable.status === 'normal' || cable.status === 'online' || cable.status === 'active') && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke={utilityConfig.particleColor}
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

                      {/* Cable Badge Label */}
                      <g transform={`translate(${midX}, ${midY})`} className="pointer-events-none">
                        <rect
                          x="-42"
                          y="-10"
                          width="84"
                          height="20"
                          rx="6"
                          fill="#0f172a"
                          stroke={isHighlighted ? utilityConfig.accentColor : '#334155'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fill={isHighlighted ? utilityConfig.accentColor : '#cbd5e1'}
                          fontSize="9"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {cableCodeDisplay}
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

                    const isDraggingThis = draggingNodeId === dev.id;

                    return (
                      <g
                        key={dev.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onPointerDown={(e) => handleNodePointerDown(e, dev.id)}
                        onClick={() => {
                          // Jika baru saja digeser (drag), jangan picu pemilihan klik
                          if (hasDraggedRef.current) return;
                          setSelectedDeviceId(dev.id);
                          setSelectedCableId(null);
                          setIsMobilePanelOpen(true);
                        }}
                        className={`group ${isDraggingThis ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
                        style={{ touchAction: 'none' }}
                      >
                        {isHighlighted && (
                          <circle
                            r="42"
                            fill="none"
                            stroke={utilityConfig.accentColor}
                            strokeWidth="2"
                            strokeOpacity="0.8"
                            className="animate-ping pointer-events-none"
                          />
                        )}

                        {/* Background kartu node perangkat */}
                        <rect
                          x="-70"
                          y="-26"
                          width="140"
                          height="52"
                          rx="14"
                          fill={isDraggingThis ? '#334155' : isHighlighted ? '#1e293b' : '#0f172a'}
                          stroke={isDraggingThis ? '#60a5fa' : isHighlighted ? utilityConfig.accentColor : '#334155'}
                          strokeWidth={isDraggingThis || isHighlighted ? 2.5 : 1.5}
                          className="transition-colors group-hover:stroke-slate-500 shadow-xl"
                        />

                        {/* Drag Handle Grip Icon (indikator visual perangkat bisa digeser) */}
                        <g 
                          transform="translate(-62, -18)" 
                          className="opacity-40 group-hover:opacity-100 transition-opacity pointer-events-none"
                        >
                          <circle cx="0" cy="0" r="1.2" fill="#94a3b8" />
                          <circle cx="3" cy="0" r="1.2" fill="#94a3b8" />
                          <circle cx="0" cy="4" r="1.2" fill="#94a3b8" />
                          <circle cx="3" cy="4" r="1.2" fill="#94a3b8" />
                        </g>

                        <g transform="translate(-48, 0)" className="pointer-events-none">
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

                        <text
                          x="-24"
                          y="-6"
                          fill="#f8fafc"
                          fontSize="11"
                          fontWeight="800"
                          className="truncate pointer-events-none"
                        >
                          {dev.name && dev.name.length > 13 ? `${dev.name.substring(0, 12)}…` : (dev.name || 'Perangkat')}
                        </text>

                        <text
                          x="-24"
                          y="8"
                          fill="#94a3b8"
                          fontSize="9"
                          fontWeight="500"
                          fontFamily="monospace"
                          className="pointer-events-none"
                        >
                          {dev.ipAddress || dev.code || dev.voltage ? `${dev.voltage}V` : dev.pipeDiameter || '-'}
                        </text>

                        <text
                          x="-24"
                          y="18"
                          fill="#64748b"
                          fontSize="8"
                          className="capitalize pointer-events-none"
                        >
                          {(dev.type || '').replace(/_/g, ' ')}
                        </text>

                        <circle
                          cx="58"
                          cy="-16"
                          r="4.5"
                          fill={statusStyle.stroke}
                          stroke="#0f172a"
                          strokeWidth="1.5"
                          className="pointer-events-none"
                        />
                      </g>
                    );
                  })}
              </svg>
            </div>
          )}
        </div>

        {/* 2. Responsive Sidebar / Bottom Sheet Info Panel */}
        <div className={`
          bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 sm:p-5 overflow-y-auto flex flex-col gap-4 flex-shrink-0 shadow-2xl z-20 transition-all duration-300
          ${isMobilePanelOpen ? 'max-h-[60vh] h-auto lg:h-full lg:max-h-none' : 'max-h-0 lg:max-h-none lg:h-full hidden lg:flex'}
          lg:w-80 xl:w-96
        `}>
          
          {/* Panel Header */}
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                Panel Informasi Komponen
              </span>
              <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Detail Terpilih</span>
              </h3>
            </div>
            <button
              onClick={() => setIsMobilePanelOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Info Card: Jika ada perangkat yang diklik */}
          {activeDevice ? (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {activeDevice.code && (
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Kode: {activeDevice.code}</span>
                    )}
                    <h4 className="text-sm sm:text-base font-extrabold text-white">{activeDevice.name}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(activeDevice.status).badge}`}>
                    {activeDevice.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Tipe Komponen</span>
                    <strong className="text-slate-200 capitalize">{(activeDevice.type || '').replace(/_/g, ' ')}</strong>
                  </div>

                  {activeDevice.ipAddress && (
                    <div>
                      <span className="text-slate-500 text-[10px] block">Alamat IP</span>
                      <strong className="text-blue-400 font-mono">{activeDevice.ipAddress}</strong>
                    </div>
                  )}

                  {activeDevice.voltage && (
                    <div>
                      <span className="text-slate-500 text-[10px] block">Tegangan Listrik</span>
                      <strong className="text-amber-400 font-mono">{activeDevice.voltage} Volt {activeDevice.phase ? `(${activeDevice.phase.replace('_', ' ')})` : ''}</strong>
                    </div>
                  )}

                  {activeDevice.capacityWatt && (
                    <div>
                      <span className="text-slate-500 text-[10px] block">Kapasitas Daya</span>
                      <strong className="text-slate-200">{activeDevice.capacityWatt} Watt / VA</strong>
                    </div>
                  )}

                  {activeDevice.pipeDiameter && (
                    <div>
                      <span className="text-slate-500 text-[10px] block">Diameter Pipa</span>
                      <strong className="text-cyan-400 font-mono">{activeDevice.pipeDiameter}</strong>
                    </div>
                  )}

                  {activeDevice.pressureBar && (
                    <div>
                      <span className="text-slate-500 text-[10px] block">Tekanan Air</span>
                      <strong className="text-slate-200">{activeDevice.pressureBar} Bar</strong>
                    </div>
                  )}

                  {activeDevice.resolution && (
                    <div>
                      <span className="text-slate-500 text-[10px] block">Resolusi Kamera</span>
                      <strong className="text-slate-200">{activeDevice.resolution}</strong>
                    </div>
                  )}

                  {activeDevice.brand && (
                    <div>
                      <span className="text-slate-500 text-[10px] block">Merek / Model</span>
                      <strong className="text-slate-200">{activeDevice.brand} {activeDevice.model ? `(${activeDevice.model})` : ''}</strong>
                    </div>
                  )}

                  <div className="col-span-2">
                    <span className="text-slate-500 text-[10px] block">Posisi / Lokasi Titik</span>
                    <strong className="text-slate-200">{activeDevice.location || '-'}</strong>
                  </div>
                </div>
              </div>

              {/* Jalur yang terhubung ke perangkat ini */}
              <div>
                <h5 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Cable className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Jalur Terkoneksi ({relatedCableIds.size})</span>
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {zoneCables.filter(c => relatedCableIds.has(c.id)).map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedCableId(c.id)}
                      className="p-2.5 bg-slate-950/50 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-xs transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between font-mono font-bold text-cyan-400 mb-1">
                        <span>{c.cableCode || c.pipeCode || c.labelCode || 'Jalur'}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-normal uppercase">{c.cableType || c.pipeType || '-'}</span>
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
            /* Info Card: Jika ada kabel/pipa yang diklik */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Kode Jalur</span>
                    <h4 className="text-base font-extrabold text-cyan-400 font-mono">
                      {activeCable.cableCode || activeCable.pipeCode || activeCable.labelCode || 'Jalur Distribusi'}
                    </h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(activeCable.status).badge}`}>
                    {activeCable.status}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Arah Dari (Titik Asal)</span>
                    <strong className="text-slate-200 block">{activeCable.sourceDeviceName || '-'}</strong>
                    <span className="text-[11px] text-slate-400">{activeCable.sourceLocation} {activeCable.sourcePort ? `(Port: ${activeCable.sourcePort})` : ''}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/50">
                    <span className="text-slate-500 text-[10px] block">Arah Ke (Titik Tujuan)</span>
                    <strong className="text-slate-200 block">{activeCable.targetDeviceName || '-'}</strong>
                    <span className="text-[11px] text-slate-400">{activeCable.targetLocation} {activeCable.targetPort ? `(Port: ${activeCable.targetPort})` : ''}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/50">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Tipe Jalur</span>
                      <strong className="text-slate-200 uppercase">{activeCable.cableType || activeCable.pipeType || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Panjang</span>
                      <strong className="text-slate-200">{activeCable.lengthMeter || activeCable.lengthMeters ? `${activeCable.lengthMeter || activeCable.lengthMeters} Meter` : '-'}</strong>
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
            <div className="text-center py-8 px-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl">
              <Info className="w-7 h-7 text-slate-600 mx-auto mb-2" />
              <h5 className="text-xs font-bold text-slate-300">Pilih Komponen atau Jalur</h5>
              <p className="text-[11px] text-slate-500 mt-1">
                Seluruh jalur ({zoneCables.length} jalur) ditampilkan pada diagram. Klik pada garis kabel/pipa atau kotak perangkat untuk melihat rincian koneksinya.
              </p>
            </div>
          )}

          {/* Ringkasan Jumlah Komponen */}
          <div className="mt-auto pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Perangkat: <strong className="text-slate-200">{zoneDevices.length}</strong></span>
            <span>Jalur: <strong className="text-cyan-400">{zoneCables.length}</strong></span>
          </div>

        </div>

      </div>

    </div>
    </ModalPortal>
  );
};
