import React, { useState, useEffect } from 'react';
import { X, Video, Save, AlertCircle } from 'lucide-react';
import { CctvDevice, CctvDeviceType, CctvStatus, LanLocation, LanZone } from '../types/utilityNetworks';

interface CctvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: Partial<CctvDevice>) => void;
  editDevice?: CctvDevice | null;
  existingNvrList: CctvDevice[];
  locations?: LanLocation[];
  zones?: LanZone[];
  presetLocationId?: string;
  presetZoneId?: string;
}

export const CctvModal: React.FC<CctvModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editDevice,
  existingNvrList,
  locations = [],
  zones = [],
  presetLocationId,
  presetZoneId
}) => {
  const [locationId, setLocationId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<CctvDeviceType>('camera_ip_bullet');
  const [ipAddress, setIpAddress] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [location, setLocation] = useState('');
  const [brand, setBrand] = useState('Hikvision');
  const [model, setModel] = useState('');
  const [resolution, setResolution] = useState('4MP (2560x1440)');
  const [channelNumber, setChannelNumber] = useState<string>('');
  const [nvrId, setNvrId] = useState<string>('');
  const [poePort, setPoePort] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');
  const [storageDays, setStorageDays] = useState<string>('30');
  const [status, setStatus] = useState<CctvStatus>('online');
  const [installationDate, setInstallationDate] = useState('');
  const [pic, setPic] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editDevice) {
      setLocationId(editDevice.locationId || '');
      setZoneId(editDevice.zoneId || '');
      setName(editDevice.name);
      setType(editDevice.type);
      setIpAddress(editDevice.ipAddress || '');
      setMacAddress(editDevice.macAddress || '');
      setLocation(editDevice.location);
      setBrand(editDevice.brand || '');
      setModel(editDevice.model || '');
      setResolution(editDevice.resolution || '4MP (2560x1440)');
      setChannelNumber(editDevice.channelNumber ? editDevice.channelNumber.toString() : '');
      setNvrId(editDevice.nvrId || '');
      setPoePort(editDevice.poePort || '');
      setRtspUrl(editDevice.rtspUrl || '');
      setStorageDays(editDevice.storageDays ? editDevice.storageDays.toString() : '30');
      setStatus(editDevice.status);
      setInstallationDate(editDevice.installationDate || '');
      setPic(editDevice.pic || '');
      setNotes(editDevice.notes || '');
    } else {
      const initLoc = presetLocationId || (locations[0]?.id || '');
      setLocationId(initLoc);
      const availableZones = zones.filter(z => z.systemType === 'cctv' && z.locationId === initLoc);
      setZoneId(presetZoneId || (availableZones[0]?.id || ''));
      setName('');
      setType('camera_ip_bullet');
      setIpAddress('');
      setMacAddress('');
      setLocation('');
      setBrand('Hikvision');
      setModel('');
      setResolution('4MP (2560x1440)');
      setChannelNumber('');
      setNvrId(existingNvrList[0]?.id || '');
      setPoePort('');
      setRtspUrl('');
      setStorageDays('30');
      setStatus('online');
      setInstallationDate(new Date().toISOString().slice(0, 10));
      setPic('');
      setNotes('');
    }
    setError(null);
  }, [isOpen, editDevice, existingNvrList]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama atau kode kamera/NVR wajib diisi!');
      return;
    }
    if (!location.trim()) {
      setError('Lokasi penempatan atau sudut pandang kamera wajib diisi!');
      return;
    }

    onSave({
      id: editDevice?.id,
      locationId: locationId || undefined,
      zoneId: zoneId || undefined,
      name: name.trim(),
      type,
      ipAddress: ipAddress.trim() || undefined,
      macAddress: macAddress.trim() || undefined,
      location: location.trim(),
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      resolution: resolution.trim() || undefined,
      channelNumber: channelNumber ? Number(channelNumber) : undefined,
      nvrId: nvrId || undefined,
      poePort: poePort.trim() || undefined,
      rtspUrl: rtspUrl.trim() || undefined,
      storageDays: storageDays ? Number(storageDays) : undefined,
      status,
      installationDate: installationDate || undefined,
      pic: pic.trim() || undefined,
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto font-poppins animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-rose-500/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500 text-white rounded-2xl shadow-md shadow-rose-500/20">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editDevice ? 'Edit Perangkat CCTV' : 'Tambah Perangkat CCTV Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data spesifikasi kamera IP, channel NVR, port PoE, dan stream video
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Pilihan Lokasi & Jaringan CCTV */}
            {locations.length > 0 && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Lokasi Tempat *
                    </label>
                    <select
                      value={locationId}
                      onChange={e => {
                        const newLocId = e.target.value;
                        setLocationId(newLocId);
                        const matchingZones = zones.filter(z => z.systemType === 'cctv' && z.locationId === newLocId);
                        setZoneId(matchingZones[0]?.id || '');
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100"
                    >
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} {loc.code ? `(${loc.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Jaringan / Area CCTV *
                    </label>
                    <select
                      value={zoneId}
                      onChange={e => setZoneId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100"
                    >
                      {zones.filter(z => z.systemType === 'cctv' && z.locationId === locationId).map(zone => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} {zone.code ? `(${zone.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama / Identifikasi Kamera *
              </label>
              <input
                type="text"
                placeholder="Contoh: CAM-01 Lobby Utama / NVR-RACK3"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            {/* Tipe Perangkat */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipe Hardware
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as CctvDeviceType)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100"
              >
                <option value="camera_ip_dome">IP Camera - Dome (Indoor / Langit-langit)</option>
                <option value="camera_ip_bullet">IP Camera - Bullet (Outdoor / Tahan Cuaca)</option>
                <option value="camera_ip_ptz">IP Camera - PTZ (Pan-Tilt-Zoom Speed Dome)</option>
                <option value="nvr">NVR (Network Video Recorder)</option>
                <option value="dvr">DVR (Digital Video Recorder)</option>
                <option value="switch_poe">Switch PoE Kamera</option>
                <option value="storage_nas">NAS / Video Storage Server</option>
                <option value="monitor_matrix">Monitor Display / Video Wall</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Alamat IP */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Alamat IP Kamera / Perangkat
              </label>
              <input
                type="text"
                placeholder="172.16.50.21"
                value={ipAddress}
                onChange={e => setIpAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Status Koneksi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status Operasional
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as CctvStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100"
              >
                <option value="online">Online / Streaming Normal</option>
                <option value="recording">Recording / Merekam</option>
                <option value="issue">Gangguan Sinyal / Hilang Gambar</option>
                <option value="offline">Offline / Terputus</option>
                <option value="maintenance">Dalam Pemeliharaan</option>
              </select>
            </div>
          </div>

          {/* Lokasi & Sudut Pandang */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Lokasi Penempatan & Arah Pantau *
            </label>
            <input
              type="text"
              placeholder="Contoh: Pintu Masuk Timur mengarah ke parkiran motor"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100"
              required
            />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Integrasi NVR & Video Streaming
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* NVR Induk */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Terhubung ke NVR
                </label>
                <select
                  value={nvrId}
                  onChange={e => setNvrId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Tanpa NVR / Standalone --</option>
                  {existingNvrList.map(nvr => (
                    <option key={nvr.id} value={nvr.id}>
                      {nvr.name} ({nvr.ipAddress || nvr.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* No Channel NVR */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Channel Ke- di NVR
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 1, 2, 16"
                  value={channelNumber}
                  onChange={e => setChannelNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Port PoE */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Port PoE Switch
                </label>
                <input
                  type="text"
                  placeholder="Port 1 - SW-POE-01"
                  value={poePort}
                  onChange={e => setPoePort(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Resolusi */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Resolusi Sensor
                </label>
                <select
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  <option value="2MP (1080p Full HD)">2MP (1080p Full HD)</option>
                  <option value="4MP (2560x1440 2K)">4MP (2560x1440 2K)</option>
                  <option value="5MP Super HD">5MP Super HD</option>
                  <option value="8MP (4K Ultra HD)">8MP (4K Ultra HD)</option>
                </select>
              </div>

              {/* Retensi Rekaman */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Retensi Simpan (Hari)
                </label>
                <input
                  type="number"
                  placeholder="Hari"
                  value={storageDays}
                  onChange={e => setStorageDays(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Brand / Merk */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Merk / Brand
                </label>
                <input
                  type="text"
                  placeholder="Hikvision, Dahua, Uniview"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* URL RTSP */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                RTSP Stream URL (Live Feed)
              </label>
              <input
                type="text"
                placeholder="rtsp://admin:pass@172.16.50.21:554/Streaming/Channels/101"
                value={rtspUrl}
                onChange={e => setRtspUrl(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PIC */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Penanggung Jawab (PIC Keamanan)
              </label>
              <input
                type="text"
                placeholder="Bambang (Security & CCTV)"
                value={pic}
                onChange={e => setPic(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Tanggal Pasang */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Pemasangan
              </label>
              <input
                type="date"
                value={installationDate}
                onChange={e => setInstallationDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Khusus (Fitur Night Vision, Motion Detection, dll)
            </label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan teknis..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

          {/* Action Buttons */}
          <div className="p-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editDevice ? 'Simpan Perubahan' : 'Tambah Perangkat CCTV'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
