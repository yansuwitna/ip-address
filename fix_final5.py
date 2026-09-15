import re

# App.tsx
with open('src/App.tsx', 'r') as f:
    app = f.read()

app = app.replace("saveWaterPipes,", "saveWaterPipes,\n  saveSoundDevices,\n  saveSoundCableRuns,\n  saveSoundDeviceTypes,\n  saveSoundCableTypes,")
app = app.replace("saveSoundCables(data.soundCables);", "saveSoundCableRuns(data.soundCables);")

with open('src/App.tsx', 'w') as f:
    f.write(app)

# eksporImpor.ts
with open('src/utils/eksporImpor.ts', 'r') as f:
    ei = f.read()

# Fix exportBackupJson args
bad_args = """  waterPipes?: WaterPipeRun[],
  soundCables?: SoundCableRun[],
  lanDeviceTypes?: any[],
  lanRoomTypes?: any[],
  lanCableTypes?: any[],
  electricityDeviceTypes?: any[],
  electricityCableTypes?: any[],
  cctvDeviceTypes?: any[],
  cctvCableTypes?: any[],
  waterDeviceTypes?: any[],
  soundDeviceTypes?: any[],
  waterPipeTypes,
      soundCableTypes?: any[],
  soundCableTypes?: any[],
  urlProtocols?: any[],
  dnsRecordTypes?: any[]"""

good_args = """  waterPipes?: WaterPipeRun[],
  soundCables?: SoundCableRun[],
  lanDeviceTypes?: any[],
  lanRoomTypes?: any[],
  lanCableTypes?: any[],
  electricityDeviceTypes?: any[],
  electricityCableTypes?: any[],
  cctvDeviceTypes?: any[],
  cctvCableTypes?: any[],
  waterDeviceTypes?: any[],
  soundDeviceTypes?: any[],
  waterPipeTypes?: any[],
  soundCableTypes?: any[],
  urlProtocols?: any[],
  dnsRecordTypes?: any[]"""

ei = ei.replace(bad_args, good_args)

# Fix parseImportJson return type
bad_ret_type = """  waterDevices?: WaterDevice[];
  soundDevices?: SoundDevice[];
  waterPipes,
      soundCables?: SoundCableRun[];
  urlProtocols?: any[];
  dnsRecordTypes?: any[];
  lanDeviceTypes?: any[];
  lanRoomTypes?: any[];
  lanCableTypes?: any[];
  electricityDeviceTypes?: any[];
  electricityCableTypes?: any[];
  cctvDeviceTypes?: any[];
  cctvCableTypes?: any[];
  waterDeviceTypes?: any[];
  soundDeviceTypes?: any[];
  waterPipeTypes,
      soundCableTypes?: any[];"""

good_ret_type = """  waterDevices?: WaterDevice[];
  soundDevices?: SoundDevice[];
  waterPipes?: WaterPipeRun[];
  soundCables?: SoundCableRun[];
  urlProtocols?: any[];
  dnsRecordTypes?: any[];
  lanDeviceTypes?: any[];
  lanRoomTypes?: any[];
  lanCableTypes?: any[];
  electricityDeviceTypes?: any[];
  electricityCableTypes?: any[];
  cctvDeviceTypes?: any[];
  cctvCableTypes?: any[];
  waterDeviceTypes?: any[];
  soundDeviceTypes?: any[];
  waterPipeTypes?: any[];
  soundCableTypes?: any[];"""
ei = ei.replace(bad_ret_type, good_ret_type)

with open('src/utils/eksporImpor.ts', 'w') as f:
    f.write(ei)

