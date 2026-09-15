const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('import { SoundView }')) {
  content = content.replace("import { CctvView } from './components/TampilanCctv';", "import { CctvView } from './components/TampilanCctv';\nimport { SoundView } from './components/TampilanSound';");
}

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
                setLanLocationSystemType('sound');
                setIsLanLocationModalOpen(true);
              }}
              onOpenAddZoneModal={(locId) => {
                setEditingLanZone(null);
                setLanZoneSystemType('sound');
                setLanZoneParentLocationId(locId);
                setIsLanZoneModalOpen(true);
              }}
              onOpenEditZoneModal={(zone) => {
                setEditingLanZone(zone);
                setLanZoneSystemType('sound');
                setLanZoneParentLocationId(zone.locationId);
                setIsLanZoneModalOpen(true);
              }}
            />
          )}
`;

content = content.replace("{/* TAB: MASTER PERANGKAT LAN */}", renderSoundView + "\n          {/* TAB: MASTER PERANGKAT LAN */}");

fs.writeFileSync('src/App.tsx', content);

