const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const defaultStates = `
  const [soundDeviceDefaultLocationId, setSoundDeviceDefaultLocationId] = useState<string | undefined>(undefined);
  const [soundDeviceDefaultZoneId, setSoundDeviceDefaultZoneId] = useState<string | undefined>(undefined);
  const [soundCableDefaultLocationId, setSoundCableDefaultLocationId] = useState<string | undefined>(undefined);
  const [soundCableDefaultZoneId, setSoundCableDefaultZoneId] = useState<string | undefined>(undefined);
`;
content = content.replace("const [waterPipeDefaultLocationId", defaultStates.trim() + "\n  const [waterPipeDefaultLocationId");

// Render SoundView
const renderSoundView = `
          {/* TAB: JARINGAN SOUND */}
          {currentTab === 'sound' && (
            <SoundView
              locations={lanLocations.filter(loc => loc.systemType === 'sound')}
              zones={lanZones}
              devices={soundDevices}
              cables={soundCables}
              onSaveLocation={handleSaveLanLocation}
              onDeleteLocation={handleDeleteLanLocation}
              onSaveZone={handleSaveLanZone}
              onDeleteZone={handleDeleteLanZone}
              onSaveDevice={handleSaveSoundDevice}
              onDeleteDevice={handleDeleteSoundDevice}
              onSaveCable={handleSaveSoundCable}
              onDeleteCable={handleDeleteSoundCable}
              onOpenAddLocationModal={() => {
                setEditingLanLocation(null);
                setLanLocationSystemType('sound');
                setIsLanLocationModalOpen(true);
              }}
              onOpenEditLocationModal={(loc) => {
                setEditingLanLocation(loc);
                setLanLocationSystemType(loc.systemType || 'sound');
                setIsLanLocationModalOpen(true);
              }}
              onOpenAddZoneModal={(locId) => {
                setEditingLanZone(null);
                setLanZoneDefaultLocationId(locId);
                setLanZoneSystemType('sound');
                setIsLanZoneModalOpen(true);
              }}
              onOpenEditZoneModal={(zone) => {
                setEditingLanZone(zone);
                setIsLanZoneModalOpen(true);
              }}
              onOpenAddDeviceModal={(locId, zId) => {
                setEditingSoundDevice(null);
                setSoundDeviceDefaultLocationId(locId);
                setSoundDeviceDefaultZoneId(zId);
                setIsSoundModalOpen(true);
              }}
              onOpenEditDeviceModal={(device) => {
                setEditingSoundDevice(device);
                setIsSoundModalOpen(true);
              }}
              onOpenAddCableModal={(locId, zId) => {
                setEditingSoundCable(null);
                setSoundCableDefaultLocationId(locId);
                setSoundCableDefaultZoneId(zId);
                setIsSoundCableModalOpen(true);
              }}
              onOpenEditCableModal={(cable) => {
                setEditingSoundCable(cable);
                setIsSoundCableModalOpen(true);
              }}
              onOpenPrintDetail={(location, zone) => {
                setPrintType('sound_detail');
                setPrintLocation(location);
                setPrintZone(zone);
                setIsPrintModalOpen(true);
              }}
            />
          )}
`;
content = content.replace("{/* TAB 3: KATEGORI PERANGKAT */}", renderSoundView.trim() + "\n\n          {/* TAB 3: KATEGORI PERANGKAT */}");

// Update Modals
const renderSoundModals = `
      {isSoundModalOpen && (
        <SoundModal
          isOpen={isSoundModalOpen}
          onClose={() => {
            setIsSoundModalOpen(false);
            setEditingSoundDevice(null);
            setSoundDeviceDefaultLocationId(undefined);
            setSoundDeviceDefaultZoneId(undefined);
          }}
          onSave={handleSaveSoundDevice}
          editDevice={editingSoundDevice}
          locations={lanLocations.filter(l => l.systemType === 'sound')}
          zones={lanZones.filter(z => z.systemType === 'sound')}
          deviceTypes={soundDeviceTypes}
          presetLocationId={soundDeviceDefaultLocationId}
          presetZoneId={soundDeviceDefaultZoneId}
        />
      )}

      {isSoundCableModalOpen && (
        <KabelSoundModal
          isOpen={isSoundCableModalOpen}
          onClose={() => {
            setIsSoundCableModalOpen(false);
            setEditingSoundCable(null);
            setSoundCableDefaultLocationId(undefined);
            setSoundCableDefaultZoneId(undefined);
          }}
          onSave={handleSaveSoundCable}
          editCable={editingSoundCable}
          devices={soundDevices}
          locations={lanLocations.filter(l => l.systemType === 'sound')}
          zones={lanZones.filter(z => z.systemType === 'sound')}
          cableTypes={soundCableTypes}
          presetLocationId={soundCableDefaultLocationId}
          presetZoneId={soundCableDefaultZoneId}
        />
      )}
`;
// Remove old mistakenly placed Modals in patch_app_modals
content = content.replace(/\{isSoundModalOpen && \([\s\S]*?presetZoneId=\{editingLanZone\?\.id \|\| undefined\}\n        \/>\n      \)\}/g, '');
content = content.replace(/\{isSoundCableModalOpen && \([\s\S]*?presetZoneId=\{editingLanZone\?\.id \|\| undefined\}\n        \/>\n      \)\}/g, '');
content = content.replace("{isWaterPipeModalOpen", renderSoundModals.trim() + "\n\n      {isWaterPipeModalOpen");


fs.writeFileSync('src/App.tsx', content);

