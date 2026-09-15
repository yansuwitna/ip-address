const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Insert useState hooks for Sound
const stateLines = `
  const [soundDevices, setSoundDevices] = useState<SoundDevice[]>([]);
  const [soundCables, setSoundCables] = useState<SoundCableRun[]>([]);
  const [soundDeviceTypes, setSoundDeviceTypes] = useState<SoundDeviceTypeItem[]>(INITIAL_SOUND_DEVICE_TYPES || []);
  const [soundCableTypes, setSoundCableTypes] = useState<SoundCableTypeItem[]>(INITIAL_SOUND_CABLE_TYPES || []);
`;
content = content.replace('const [cctvDevices, setCctvDevices] = useState<CctvDevice[]>([]);', 'const [cctvDevices, setCctvDevices] = useState<CctvDevice[]>([]);\n' + stateLines);

// Insert fetch mapping for Sound
const fetchLines = `
        setSoundDevices(data['netipam_sound_devices_v1'] || []);
        setSoundCables(data['netipam_sound_cables_v1'] || []);
        setSoundDeviceTypes(data['netipam_sound_device_types_v1'] || INITIAL_SOUND_DEVICE_TYPES || []);
        setSoundCableTypes(data['netipam_sound_cable_types_v1'] || INITIAL_SOUND_CABLE_TYPES || []);
`;
content = content.replace("setWaterPipeTypes(data['netipam_water_pipe_types_v1'] || INITIAL_WATER_PIPE_TYPES || []);", "setWaterPipeTypes(data['netipam_water_pipe_types_v1'] || INITIAL_WATER_PIPE_TYPES || []);\n" + fetchLines);

// Insert reset data
const wipeLines = `
    setSoundDevices([]);
    setSoundCables([]);
    setSoundDeviceTypes(INITIAL_SOUND_DEVICE_TYPES || []);
    setSoundCableTypes(INITIAL_SOUND_CABLE_TYPES || []);
`;
content = content.replace('setCctvDevices([]);', 'setCctvDevices([]);\n' + wipeLines);

// Insert import export data
const importDataLines = `
      if (data.soundDevices) setSoundDevices(data.soundDevices);
      if (data.soundCables) setSoundCables(data.soundCables);
`;
content = content.replace('if (data.cctvDevices) setCctvDevices(data.cctvDevices);', 'if (data.cctvDevices) setCctvDevices(data.cctvDevices);\n' + importDataLines);

fs.writeFileSync('src/App.tsx', content);
