// Types for Jaringan Listrik, CCTV, and AIR (Irigasi)

// --- JARINGAN LISTRIK ---
export type ElectricityDeviceType = 
  | 'panel_mdp' 
  | 'panel_sdp' 
  | 'trafo' 
  | 'genset' 
  | 'ups' 
  | 'mcb' 
  | 'kwh_meter' 
  | 'pdu_stopkontak' 
  | 'stabilizer' 
  | 'inverter' 
  | 'other';

export type ElectricalPhase = '1_phase' | '3_phase';
export type ElectricalStatus = 'normal' | 'maintenance' | 'warning' | 'critical' | 'off';

export interface ElectricityDevice {
  id: string;
  locationId?: string; // Relasi ke LanLocation
  zoneId?: string; // Relasi ke LanZone
  name: string;
  code: string; // e.g., PNL-MDP-01, UPS-SRV-01
  type: ElectricityDeviceType;
  brand?: string;
  model?: string;
  location: string; // e.g., Ruang Panel Lt 1, Rack Server A
  phase: ElectricalPhase; // 1 Phase atau 3 Phase
  voltage: number; // in Volt (220, 380, etc.)
  currentAmpere?: number; // Kapasitas Ampere (e.g. 10A, 63A, 200A)
  capacityWatt?: number; // Kapasitas Daya (Watt / VA)
  currentLoadWatt?: number; // Beban Terpakai Saat Ini (Watt)
  status: ElectricalStatus;
  sourcePanelId?: string; // Menghubungkan jalur/induk panel
  installationDate?: string;
  lastMaintenance?: string;
  pic?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Jalur Kabel / Distribusi Listrik
export interface ElectricityCableRun {
  id: string;
  locationId?: string;
  zoneId?: string;
  cableCode: string; // e.g. NYY-4x16-01, NYM-3x2.5-01
  labelCode?: string; // alias
  cableType: string; // e.g. NYY, NYM, NYA, XLPE, Twisted
  sourceDeviceId?: string;
  sourceDeviceName?: string; // e.g. Panel MDP Utama
  sourceLocation: string; // e.g. Ruang Panel Lt 1
  sourcePoint?: string; // alias for sourceLocation
  targetDeviceId?: string;
  targetDeviceName?: string; // e.g. Sub Panel SDP Lt 2 / Rack Server
  targetLocation: string; // e.g. Ruang Server Lt 2
  targetPoint?: string; // alias for targetLocation
  pathwayRoute?: string; // e.g. Cable Ladder Shaft Timur
  pathDescription?: string; // alias for pathwayRoute
  lengthMeter?: number;
  lengthMeters?: number; // alias
  coreSpec?: string; // e.g. 4 x 16 mm², 3 x 2.5 mm²
  voltageVolt?: number; // 220, 380
  currentAmpere?: number; // Kapasitas breaker jalur
  status: 'connected' | 'idle' | 'fault' | 'maintenance';
  pic?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// --- JARINGAN CCTV ---
export type CctvDeviceType = 
  | 'camera_ip_dome' 
  | 'camera_ip_bullet' 
  | 'camera_ip_ptz' 
  | 'nvr' 
  | 'dvr' 
  | 'switch_poe' 
  | 'storage_nas' 
  | 'monitor_matrix' 
  | 'other';

export type CctvStatus = 'online' | 'offline' | 'recording' | 'issue' | 'maintenance';

export interface CctvDevice {
  id: string;
  locationId?: string; // Relasi ke LanLocation
  zoneId?: string; // Relasi ke LanZone
  name: string; // e.g. CAM-LOBBY-01, NVR-MAIN-32CH
  type: CctvDeviceType;
  ipAddress?: string; // Alamat IP kamera / NVR
  macAddress?: string;
  location: string; // e.g. Lobby Utama, Pintu Gerbang Barat, Koridor Lt 2
  brand?: string; // Hikvision, Dahua, Uniview, Axis
  model?: string;
  resolution?: string; // 2MP (1080p), 4MP (2K), 8MP (4K)
  channelNumber?: number; // Channel ke- berapa di NVR
  nvrId?: string; // ID NVR induk
  poePort?: string; // Port switch PoE (e.g. Port 12 - SW-POE-01)
  rtspUrl?: string; // rtsp://admin:pass@ip:554/stream
  streamUrl?: string; // alias
  storageDays?: number; // Retensi rekaman (hari)
  status: CctvStatus;
  installationDate?: string;
  pic?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Jalur Kabel / Koneksi CCTV (UTP / Coaxial / Fiber)
export interface CctvCableRun {
  id: string;
  locationId?: string;
  zoneId?: string;
  cableCode: string; // e.g. CCTV-CBL-01, RG59-CAM-02
  labelCode?: string; // alias
  cableType: string; // e.g. Cat6 UTP, Cat5e PoE, RG59 Coaxial, Fiber Optic
  sourceDeviceId?: string;
  sourceDeviceName?: string; // e.g. Switch PoE Lt 1 / NVR
  sourcePort?: string; // e.g. Port PoE 1
  sourceLocation: string; // e.g. Rak Server Lt 1
  sourcePoint?: string; // alias
  targetDeviceId?: string;
  targetDeviceName?: string; // e.g. CAM-01 Lobby Depan
  targetPort?: string; // e.g. LAN Port Kamera
  targetLocation: string; // e.g. Plafon Lobby Depan
  targetPoint?: string; // alias
  pathwayRoute?: string; // e.g. Conduit Plafon Lobby -> Tray Shaft
  pathDescription?: string; // alias
  lengthMeter?: number;
  lengthMeters?: number; // alias
  status: 'connected' | 'idle' | 'fault' | 'maintenance';
  pic?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// --- JARINGAN AIR & IRIGASI ---
export type WaterDeviceType = 
  | 'pump_submersible' 
  | 'pump_booster' 
  | 'water_tank' 
  | 'valve_solenoid' 
  | 'valve_manual' 
  | 'flow_meter' 
  | 'water_level_sensor' 
  | 'pressure_sensor' 
  | 'sprinkler_zone' 
  | 'filter_water' 
  | 'other';

export type WaterStatus = 'active' | 'standby' | 'leaking' | 'maintenance' | 'off';

export interface WaterDevice {
  id: string;
  locationId?: string; // Relasi ke LanLocation
  zoneId?: string; // Relasi ke LanZone
  name: string; // e.g. POMPA-SUMUR-01, SOLENOID-ZONA-A
  code: string;
  type: WaterDeviceType;
  location: string; // e.g. Taman Timur, Rumah Pompa Utara, Toren Tower C
  pipeDiameter?: string; // e.g. 1/2 inch, 1 inch, 2 inch, 4 inch
  flowRateLpm?: number; // Debit aliran (Liter per Menit)
  pressureBar?: number; // Tekanan air (Bar / PSI)
  tankCapacityLiter?: number; // Kapasitas toren jika tangki (Liter)
  currentWaterLevelPct?: number; // Persentase isi toren (0 - 100%)
  powerWatt?: number; // Daya listrik pompa (Watt/HP)
  zoneArea?: string; // Blok / Zona Irigasi
  status: WaterStatus;
  sourceSupply?: string; // Sumber air (Sumur Bor, PDAM, Rainwater Harvest)
  installationDate?: string;
  pic?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Jalur Pipa / Distribusi Air & Irigasi
export interface WaterPipeRun {
  id: string;
  locationId?: string;
  zoneId?: string;
  pipeCode: string; // e.g. PIP-DIST-01, PPR-TOWER-02
  labelCode?: string; // alias
  pipeType: string; // e.g. PVC AW, HDPE, PPR, Galvanis, Selang Drip
  pipeDiameter?: string; // 1/2", 3/4", 1", 2", 3", 4"
  diameterInch?: string; // alias
  sourceDeviceId?: string;
  sourceDeviceName?: string; // e.g. Toren Utama Roof Top
  sourceLocation: string; // e.g. Menara Toren Atap
  sourcePoint?: string; // alias
  targetDeviceId?: string;
  targetDeviceName?: string; // e.g. Solenoid Valve Zona A / Kran Toilet
  targetLocation: string; // e.g. Blok Taman Depan
  targetPoint?: string; // alias
  pathwayRoute?: string; // e.g. Tertanam tanah 50cm -> Dinding Shaft
  pathDescription?: string; // alias
  lengthMeter?: number;
  lengthMeters?: number; // alias
  pressureBar?: number; // Tekanan operasional
  status: 'active' | 'standby' | 'leaking' | 'maintenance';
  pic?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// --- JARINGAN LAN (PERANGKAT FISIK & JALUR KABEL) ---
export type LanDeviceType = 
  | 'switch_core' 
  | 'switch_distribution' 
  | 'switch_access' 
  | 'patch_panel' 
  | 'router_gateway' 
  | 'access_point' 
  | 'server_host' 
  | 'otb_fiber' 
  | 'wallplate_jack' 
  | 'media_converter' 
  | 'other';

export type LanCableType = 
  | 'cat5e_utp' 
  | 'cat6_utp' 
  | 'cat6a_stp' 
  | 'cat7_stp' 
  | 'fiber_sm' 
  | 'fiber_mm' 
  | 'dac_sfp' 
  | 'coaxial' 
  | 'other';

export type CableRunStatus = 'connected' | 'idle' | 'fault' | 'maintenance';

// LEVEL 1: LOKASI TEMPAT JARINGAN (contoh: Sekolah 1, Sekolah 2, Gedung Kantor A)
export interface LanLocation {
  id: string;
  name: string; // e.g. "SMK Negeri 1 (Sekolah 1)", "SMA Negeri 2"
  code: string; // e.g. "SEKOLAH-01"
  address?: string; // Jl. Pendidikan No. 12
  pic?: string; // Penanggung Jawab Gedung / Sekolah
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// LEVEL 2: AREA / RUANGAN / JARINGAN DI DALAM LOKASI (contoh: Lab 1, Lab 2, Ruang Guru, Ruang Server)
export interface LanZone {
  id: string;
  locationId: string; // Relasi ke LanLocation
  name: string; // e.g. "Jaringan Lab Komputer 1", "Jaringan Lab Multimedia 2"
  code: string; // e.g. "LAB-01", "LAB-02"
  floor?: string; // e.g. "Lantai 1", "Lantai 2"
  roomType?: string; // "lab" | "office" | "server_room" | "classroom" | "library" | "other"
  pic?: string; // Kepala Lab / Petugas
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// LEVEL 3: PERANGKAT FISIK DI DALAM AREA/LAB TERSEBUT
export interface LanDevice {
  id: string;
  locationId?: string; // Relasi ke LanLocation (Sekolah 1)
  zoneId?: string; // Relasi ke LanZone (Lab 1)
  name: string; // e.g., SW-LAB1-01, PP-LAB1-01, PC-CLIENT-01
  code: string; // Kode unik aset
  type: LanDeviceType;
  brand?: string; // Cisco, Ruijie, Mikrotik, Ubiquiti, TP-Link
  model?: string;
  location: string; // Detail letak: Rak Depan Lab 1, Meja Guru, dsb
  rackNumber?: string; // Rack 01, Meja 01
  totalPorts?: number; // 24 Port, 48 Port
  ipAddress?: string;
  macAddress?: string;
  status: 'active' | 'standby' | 'fault' | 'maintenance';
  pic?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// LEVEL 3: JALUR KABEL & ARAH TARIKAN DI DALAM AREA/LAB MAUPUN ANTAR LAB
export interface LanCableRun {
  id: string;
  locationId?: string; // Relasi ke LanLocation
  zoneId?: string; // Relasi ke LanZone
  cableCode: string; // e.g., CBL-LAB1-01, FO-BACKBONE-01
  cableType: LanCableType;
  
  // Titik Asal (Source / Arah Dari)
  sourceDeviceId?: string;
  sourceDeviceName?: string; // e.g., Switch Core Lab 1
  sourcePort?: string; // e.g., Port 1, Port G0/1
  sourceLocation: string; // Meja Guru Rack Switch Lab 1
  
  // Titik Tujuan (Target / Arah Ke)
  targetDeviceId?: string;
  targetDeviceName?: string; // e.g., PC-Siswa-01 / Patch Panel Meja 1
  targetPort?: string; // e.g., Port LAN PC / Jack RJ45 #01
  targetLocation: string; // Meja Siswa Baris 1 No 1
  
  // Rute Jalur & Spesifikasi Kabel
  pathwayRoute?: string; // e.g., Tray Plafon Lab 1 -> Floor Duct Meja 1
  lengthMeter?: number; // Panjang kabel (meter)
  color?: string; // Warna kabel (Biru, Abu-abu, Kuning FO)
  speedMbps?: number; // 1000 (1Gbps), 10000 (10Gbps)
  status: CableRunStatus;
  pic?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
