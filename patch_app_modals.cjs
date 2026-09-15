const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const importLines = `
import { SoundModal } from './components/ModalSound';
import { KabelSoundModal } from './components/ModalKabelSound';
`;
content = content.replace("import { KabelCctvModal } from './components/ModalKabelCctv';", "import { KabelCctvModal } from './components/ModalKabelCctv';\n" + importLines.trim());

const modalStates = `
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [editingSoundDevice, setEditingSoundDevice] = useState<SoundDevice | null>(null);
  
  const [isSoundCableModalOpen, setIsSoundCableModalOpen] = useState(false);
  const [editingSoundCable, setEditingSoundCable] = useState<SoundCableRun | null>(null);
`;
content = content.replace("const [isCctvModalOpen", modalStates.trim() + "\n  const [isCctvModalOpen");

const soundViewHandlers = `
              onOpenAddDeviceModal={(locId, zoneId) => {
                setEditingSoundDevice(null);
                setLanZoneParentLocationId(locId); // as preset location
                setEditingLanZone(zoneId ? lanZones.find(z => z.id === zoneId) || null : null); // as preset zone
                setIsSoundModalOpen(true);
              }}
              onOpenEditDeviceModal={(dev) => {
                setEditingSoundDevice(dev);
                setIsSoundModalOpen(true);
              }}
              onOpenAddCableModal={(locId, zoneId) => {
                setEditingSoundCable(null);
                setLanZoneParentLocationId(locId);
                setEditingLanZone(zoneId ? lanZones.find(z => z.id === zoneId) || null : null);
                setIsSoundCableModalOpen(true);
              }}
              onOpenEditCableModal={(cable) => {
                setEditingSoundCable(cable);
                setIsSoundCableModalOpen(true);
              }}
`;
content = content.replace("onOpenAddZoneModal={(locId) => {", soundViewHandlers.trim() + "\n              onOpenAddZoneModal={(locId) => {");

const renderModals = `
      {isSoundModalOpen && (
        <SoundModal
          isOpen={isSoundModalOpen}
          onClose={() => {
            setIsSoundModalOpen(false);
            setEditingSoundDevice(null);
          }}
          onSave={handleSaveSoundDevice}
          editDevice={editingSoundDevice}
          locations={lanLocations.filter(l => l.systemType === 'sound')}
          zones={lanZones.filter(z => z.systemType === 'sound')}
          deviceTypes={soundDeviceTypes}
          presetLocationId={lanZoneParentLocationId || undefined}
          presetZoneId={editingLanZone?.id || undefined}
        />
      )}

      {isSoundCableModalOpen && (
        <KabelSoundModal
          isOpen={isSoundCableModalOpen}
          onClose={() => {
            setIsSoundCableModalOpen(false);
            setEditingSoundCable(null);
          }}
          onSave={handleSaveSoundCable}
          editCable={editingSoundCable}
          devices={soundDevices}
          locations={lanLocations.filter(l => l.systemType === 'sound')}
          zones={lanZones.filter(z => z.systemType === 'sound')}
          cableTypes={soundCableTypes}
          presetLocationId={lanZoneParentLocationId || undefined}
          presetZoneId={editingLanZone?.id || undefined}
        />
      )}
`;
content = content.replace("{isCctvModalOpen", renderModals.trim() + "\n\n      {isCctvModalOpen");

fs.writeFileSync('src/App.tsx', content);

