const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace("setWaterPipeTypes(data['netipam_water_pipe_types_v1'] || INITIAL_WATER_PIPE_TYPES,\n  INITIAL_SOUND_DEVICE_TYPES || []);", "setWaterPipeTypes(data['netipam_water_pipe_types_v1'] || INITIAL_WATER_PIPE_TYPES || []);");
app = app.replace("setWaterPipeTypes(data['netipam_water_pipe_types_v1'] || INITIAL_WATER_PIPE_TYPES || []);", "setWaterPipeTypes(data['netipam_water_pipe_types_v1'] || INITIAL_WATER_PIPE_TYPES || []);\n        setSoundDeviceTypes(data['netipam_sound_device_types_v1'] || INITIAL_SOUND_DEVICE_TYPES || []);\n        setSoundCableTypes(data['netipam_sound_cable_types_v1'] || INITIAL_SOUND_CABLE_TYPES || []);");

fs.writeFileSync('src/App.tsx', app);
