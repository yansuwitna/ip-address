import React, { useState, useEffect } from 'react';
import { X, Video, Save, AlertCircle, Lock } from 'lucide-react';
import { SoundDevice, SoundDeviceType, SoundStatus, LanLocation, LanZone, SoundDeviceTypeItem } from '../types/jaringanUtilitas';
import { ModalPortal } from './ModalPortal';

interface SoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: Partial<SoundDevice>) => void;
  editDevice?: SoundDevice | null;
  
  locations?: LanLocation[];
  zones?: LanZone[];
  deviceTypes?: SoundDeviceTypeItem[];
  presetLocationId?: string;
  presetZoneId?: string;
}

export const SoundModal: React.FC<SoundModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editDevice,
  
  locations = [],
  zones = [],
  deviceTypes = [],
  presetLocationId,
  presetZoneId
}) => {
  const [locationId, setLocationId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<SoundDeviceType>('camera_ip_bullet');
  const [ipAddress, setIpAddress] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [location, setLocation] = useState('');
  const [brand, setBrand] = useState('Hikvision');
  const [model, setModel] = useState('');
  const [resolution, setResolution] = useState('4MP (2560x1440)');
    const [nvrId, setNvrId] = useState<string>('');
  const [poePort, setPoePort] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');
  const [storageDays, setStorageDays] = useState<string>('30');
  const [status, setStatus] = useState<SoundStatus>('online');
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
      setCode(editDevice.code || '');
      setType(editDevice.type);
                  setLocation(editDevice.location);
      setBrand(editDevice.brand || '');
      setModel(editDevice.model || '');
                                          setStatus(editDevice.status);
      setInstallationDate(editDevice.installationDate || '');
      setPic(editDevice.pic || '');
      setNotes(editDevice.notes || '');
    } else {
      const initLoc = presetLocationId || (locations[0]?.id || '');
      setLocationId(initLoc);
      const availableZones = zones.filter(z => z.systemType === 'sound' && z.locationId === initLoc);
      setZoneId(presetZoneId || (availableZones[0]?.id || ''));
      setName('');
      setCode('');
      setType('camera_ip_bullet');
                  setLocation('');
      setBrand('Hikvision');
      setModel('');
                                          setStatus('online');
      setInstallationDate(new Date().toISOString().slice(0, 10));
      setPic('');
      setNotes('');
    }
    setError(null);
  }, [isOpen, editDevice, []]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama atau kode speaker/NVR wajib diisi!');
      return;
    }
    if (!location.trim()) {
      setError('Lokasi penempatan atau sudut pandang speaker wajib diisi!');
      return;
    }

    onSave({
      id: editDevice?.id,
      locationId: locationId || undefined,
      zoneId: zoneId || undefined,
      name: name.trim(),
      code: code.trim() || undefined,
      type,
      
            location: location.trim(),
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      
      
      
      
      
      
      status,
      installationDate: installationDate || undefined,
      pic: pic.trim() || undefined,
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs font-poppins animate-in fade-in duration-150">
      <div className="min-h-full flex items-center justify-center p-0">
      <div className="relative w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] my-auto flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-rose-500/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500 text-white rounded-2xl shadow-md shadow-rose-500/20">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editDevice ? 'Edit Perangkat SOUND' : 'Tambah Perangkat SOUND Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data spesifikasi speaker IP, channel NVR, port PoE, dan stream video
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

            {/* Pilihan Lokasi & Jaringan SOUND */}
            {locations.length > 0 && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Lokasi Tempat *
                      </label>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Terkunci</span>
                      </span>
                    </div>
                    <select
                      value={locationId}
                      onChange={e => {
                        const newLocId = e.target.value;
                        setLocationId(newLocId);
                        const matchingZones = zones.filter(z => z.systemType === 'sound' && z.locationId === newLocId);
                        setZoneId(matchingZones[0]?.id || '');
                      }}
                      disabled={true}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 cursor-not-allowed select-none opacity-80"
                    >
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} {loc.code ? `(${loc.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Jaringan / Area SOUND *
                      </label>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Terkunci</span>
                      </span>
                    </div>
                    <select
                      value={zoneId}
                      onChange={e => setZoneId(e.target.value)}
                      disabled={true}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 cursor-not-allowed select-none opacity-80"
                    >
                      {zones.filter(z => z.systemType === 'sound' && z.locationId === locationId).map(zone => (
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
                Nama Perangkat / Speaker *
              </label>
              <input
                type="text"
                placeholder="Contoh: Speaker Gerbang Depan / NVR Pusat"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kode / Tag Identifikasi
              </label>
              <input
                type="text"
                placeholder="Contoh: CAM-GB-01 / NVR-PUSAT-01"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Tipe Perangkat */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipe Hardware
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as SoundDeviceType)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 dark:text-slate-100"
              >
                {deviceTypes && deviceTypes.length > 0 ? (
                  deviceTypes.map(dt => (
                    <option key={dt.id} value={dt.code || dt.name}>
                      {dt.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="camera_ip_dome">IP Camera - Dome (Indoor / Langit-langit)</option>
                    <option value="camera_ip_bullet">IP Camera - Bullet (Outdoor / Tahan Cuaca)</option>
                    <option value="camera_ip_ptz">IP Camera - PTZ (Pan-Tilt-Zoom Speed Dome)</option>
                    <option value="nvr">NVR (Network Video Recorder)</option>
                    <option value="dvr">DVR (Digital Video Recorder)</option>
                    <option value="switch_poe">Switch PoE Speaker</option>
                    <option value="storage_nas">NAS / Video Storage Server</option>
                    <option value="monitor_matrix">Monitor Display / Video Wall</option>
                    <option value="other">Lainnya</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Alamat IP */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Alamat IP Speaker / Perangkat
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
                onChange={e => setStatus(e.target.value as SoundStatus)}
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
              <span>{editDevice ? 'Simpan Perubahan' : 'Tambah Perangkat SOUND'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
    </div>
    </ModalPortal>
  );
};
