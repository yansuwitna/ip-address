const fs = require('fs');

// App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace(/setLanZoneParentLocationId/g, 'setLanZoneDefaultLocationId');
app = app.replace(/\| 'cctv_detail' \| 'water_detail'/g, "| 'cctv_detail' | 'water_detail' | 'sound_detail'");
// Remove duplicate onOpenAddDeviceModal etc in SoundView
// SoundView has two blocks of onOpen... I'll just regex replace the first block that uses setLanZoneDefaultLocationId for SoundDevice
app = app.replace(/onOpenAddDeviceModal=\{\(locId, zoneId\) => \{[\s\S]*?onOpenEditCableModal=\{\(cable\) => \{\n                setEditingSoundCable\(cable\);\n                setIsSoundCableModalOpen\(true\);\n              \}\}\n/m, '');
fs.writeFileSync('src/App.tsx', app);

// ModalKabelSound.tsx
let mks = fs.readFileSync('src/components/ModalKabelSound.tsx', 'utf-8');
mks = mks.replace(/sourceLocation: '',\n\s*sourceLocation: '',/g, "sourceLocation: '',");
mks = mks.replace(/targetLocation: '',\n\s*targetLocation: '',/g, "targetLocation: '',");
mks = mks.replace(/sourceLocation: src,\n\s*sourceLocation: src,/g, "sourceLocation: src,");
mks = mks.replace(/targetLocation: tgt,\n\s*targetLocation: tgt,/g, "targetLocation: tgt,");
mks = mks.replace(/sourceLocation: e\.target\.value, sourceLocation: e\.target\.value/g, "sourceLocation: e.target.value");
mks = mks.replace(/targetLocation: e\.target\.value, targetLocation: e\.target\.value/g, "targetLocation: e.target.value");
fs.writeFileSync('src/components/ModalKabelSound.tsx', mks);

// ModalSound.tsx
let ms = fs.readFileSync('src/components/ModalSound.tsx', 'utf-8');
ms = ms.replace(/setIpAddress\(.*?\);\n/g, '');
ms = ms.replace(/setMacAddress\(.*?\);\n/g, '');
ms = ms.replace(/setResolution\(.*?\);\n/g, '');
ms = ms.replace(/setChannelNumber\(.*?\);\n/g, '');
ms = ms.replace(/setNvrId\(.*?\);\n/g, '');
ms = ms.replace(/setPoePort\(.*?\);\n/g, '');
ms = ms.replace(/setRtspUrl\(.*?\);\n/g, '');
ms = ms.replace(/setStorageDays\(.*?\);\n/g, '');
ms = ms.replace(/macAddress: macAddress\.trim\(\) \|\| undefined,\n/g, '');
ms = ms.replace(/\{existingNvrList\[\].*?\}[\s\S]*?<\/select>\n\s*<\/div>/g, ''); // Remove NVR dropdown if still there
fs.writeFileSync('src/components/ModalSound.tsx', ms);

// TampilanSound.tsx
let ts = fs.readFileSync('src/components/TampilanSound.tsx', 'utf-8');
ts = ts.replace(/import \{ Volume2, Speaker as SpeakerIcon,\n\s*Volume2,/g, 'import { Volume2, Speaker as SpeakerIcon,');
ts = ts.replace(/\{dev\.streamUrl && \([\s\S]*?<\/a>\n\s*\)\}/g, '');
fs.writeFileSync('src/components/TampilanSound.tsx', ts);

