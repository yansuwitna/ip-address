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
  storageDays?: number; // Retensi rekaman (hari)
  status: CctvStatus;
  installationDate?: string;
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
