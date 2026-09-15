import re

### 1. src/utils/eksporImpor.ts
with open('src/utils/eksporImpor.ts', 'r') as f:
    ei = f.read()

# Add types to import
if 'SoundDevice' not in ei:
    ei = ei.replace("WaterPipeRun,\n  LanDevice", "WaterPipeRun,\n  SoundDevice,\n  SoundCableRun,\n  LanDevice")

# ComprehensiveExportOptions
if 'soundDevices?:' not in ei:
    ei = ei.replace("waterPipes?: WaterPipeRun[];\n}", "waterPipes?: WaterPipeRun[];\n  soundDevices?: SoundDevice[];\n  soundCables?: SoundCableRun[];\n}")

# exportAllToSingleXlsx destructuring
if 'soundDevices = []' not in ei:
    ei = ei.replace("waterDevices = [],", "waterDevices = [],\n    soundDevices = [],")
if 'soundCables = []' not in ei:
    ei = ei.replace("waterPipes = []\n  } = data;", "waterPipes = [],\n    soundCables = []\n  } = data;")

# Sheet Sound Device
sound_sheet_device = """
  if (soundDevices.length > 0) {
    const wsSound = XLSX.utils.json_to_sheet(soundDevices);
    XLSX.utils.book_append_sheet(workbook, wsSound, 'Sound_Perangkat');
  }
"""
if "Sound_Perangkat" not in ei:
    ei = ei.replace("if (waterPipes.length > 0) {", sound_sheet_device + "  if (waterPipes.length > 0) {")

sound_sheet_cable = """
  if (soundCables.length > 0) {
    const wsSoundC = XLSX.utils.json_to_sheet(soundCables);
    XLSX.utils.book_append_sheet(workbook, wsSoundC, 'Sound_Kabel');
  }
"""
if "Sound_Kabel" not in ei:
    ei = ei.replace("if (waterPipes.length > 0) {", sound_sheet_cable + "  if (waterPipes.length > 0) {")

# exportBackupJson args
if 'soundDevices?: SoundDevice[],' not in ei:
    ei = ei.replace("waterDevices?: WaterDevice[],", "waterDevices?: WaterDevice[],\n  soundDevices?: SoundDevice[],")
    ei = ei.replace("waterPipes?: WaterPipeRun[],", "waterPipes?: WaterPipeRun[],\n  soundCables?: SoundCableRun[],")
    ei = ei.replace("waterDeviceTypes?: any[],", "waterDeviceTypes?: any[],\n  soundDeviceTypes?: any[],")
    ei = ei.replace("waterPipeTypes?: any[],", "waterPipeTypes?: any[],\n  soundCableTypes?: any[],")

# totalData
if 'soundDevices: soundDevices?.length || 0,' not in ei:
    ei = ei.replace("waterDevices: waterDevices?.length || 0,", "waterDevices: waterDevices?.length || 0,\n      soundDevices: soundDevices?.length || 0,")
    ei = ei.replace("waterDeviceTypes: waterDeviceTypes?.length || 0,", "waterDeviceTypes: waterDeviceTypes?.length || 0,\n      soundDeviceTypes: soundDeviceTypes?.length || 0,")
    ei = ei.replace("waterPipes: waterPipes?.length || 0,", "waterPipes: waterPipes?.length || 0,\n      soundCables: soundCables?.length || 0,")
    ei = ei.replace("waterPipeTypes: waterPipeTypes?.length || 0", "waterPipeTypes: waterPipeTypes?.length || 0,\n      soundCableTypes: soundCableTypes?.length || 0")

# body assignment
if 'soundDevices: soundDevices || [],' not in ei:
    ei = ei.replace("waterDevices: waterDevices || [],", "waterDevices: waterDevices || [],\n    soundDevices: soundDevices || [],")
    ei = ei.replace("waterDeviceTypes: waterDeviceTypes || [],", "waterDeviceTypes: waterDeviceTypes || [],\n    soundDeviceTypes: soundDeviceTypes || [],")
    ei = ei.replace("waterPipes: waterPipes || [],", "waterPipes: waterPipes || [],\n    soundCables: soundCables || [],")
    ei = ei.replace("waterPipeTypes: waterPipeTypes || []", "waterPipeTypes: waterPipeTypes || [],\n    soundCableTypes: soundCableTypes || []")

# parseImportJson return type
if 'soundDevices?: SoundDevice[];' not in ei:
    ei = ei.replace("waterDevices?: WaterDevice[];", "waterDevices?: WaterDevice[];\n  soundDevices?: SoundDevice[];")
    ei = ei.replace("waterPipes?: WaterPipeRun[];", "waterPipes?: WaterPipeRun[];\n  soundCables?: SoundCableRun[];")
    ei = ei.replace("waterDeviceTypes?: any[];", "waterDeviceTypes?: any[];\n  soundDeviceTypes?: any[];")
    ei = ei.replace("waterPipeTypes?: any[];", "waterPipeTypes?: any[];\n  soundCableTypes?: any[];")

# parseImportJson body parsing
if 'soundDevices = parsed.soundDevices || [];' not in ei:
    ei = ei.replace("waterDevices = parsed.waterDevices || [];", "waterDevices = parsed.waterDevices || [];\n    const soundDevices = parsed.soundDevices || [];")
    ei = ei.replace("waterPipes = parsed.waterPipes || [];", "waterPipes = parsed.waterPipes || [];\n    const soundCables = parsed.soundCables || [];")
    ei = ei.replace("waterDeviceTypes = parsed.waterDeviceTypes || [];", "waterDeviceTypes = parsed.waterDeviceTypes || [];\n    const soundDeviceTypes = parsed.soundDeviceTypes || [];")
    ei = ei.replace("waterPipeTypes = parsed.waterPipeTypes || [];", "waterPipeTypes = parsed.waterPipeTypes || [];\n    const soundCableTypes = parsed.soundCableTypes || [];")

# parseImportJson return block
if 'soundDevices,' not in ei:
    ei = ei.replace("waterDevices,", "waterDevices,\n      soundDevices,")
    ei = ei.replace("waterPipes,", "waterPipes,\n      soundCables,")
    ei = ei.replace("waterDeviceTypes,", "waterDeviceTypes,\n      soundDeviceTypes,")
    ei = ei.replace("waterPipeTypes", "waterPipeTypes,\n      soundCableTypes")

with open('src/utils/eksporImpor.ts', 'w') as f:
    f.write(ei)

### 2. src/components/TampilanCadangan.tsx
with open('src/components/TampilanCadangan.tsx', 'r') as f:
    tc = f.read()

# Add types to import
if 'SoundDevice' not in tc:
    tc = tc.replace("WaterPipeRun,\n  LanDevice", "WaterPipeRun,\n  SoundDevice,\n  SoundCableRun,\n  LanDevice")

# BackupViewProps
if 'soundDevices?: SoundDevice[];' not in tc:
    tc = tc.replace("waterDevices?: WaterDevice[];", "waterDevices?: WaterDevice[];\n  soundDevices?: SoundDevice[];")
    tc = tc.replace("waterPipes?: WaterPipeRun[];", "waterPipes?: WaterPipeRun[];\n  soundCables?: SoundCableRun[];")
    tc = tc.replace("waterDeviceTypes?: any[];", "waterDeviceTypes?: any[];\n  soundDeviceTypes?: any[];")
    tc = tc.replace("waterPipeTypes?: any[];", "waterPipeTypes?: any[];\n  soundCableTypes?: any[];")

# BackupView function args
if 'soundDevices = [],' not in tc:
    tc = tc.replace("waterDevices = [],", "waterDevices = [],\n  soundDevices = [],")
    tc = tc.replace("waterPipes = [],", "waterPipes = [],\n  soundCables = [],")
    tc = tc.replace("waterDeviceTypes = [],", "waterDeviceTypes = [],\n  soundDeviceTypes = [],")
    tc = tc.replace("waterPipeTypes = [],", "waterPipeTypes = [],\n  soundCableTypes = [],")

# exportBackupJson call
if 'soundDevices,' not in tc:
    tc = tc.replace("waterDevices,\n      lanDevices,", "waterDevices,\n      soundDevices,\n      lanDevices,")
    tc = tc.replace("cctvCables,\n      waterPipes,", "cctvCables,\n      waterPipes,\n      soundCables,")
    tc = tc.replace("waterDeviceTypes,\n      waterPipeTypes,", "waterDeviceTypes,\n      waterPipeTypes,\n      soundDeviceTypes,\n      soundCableTypes,")

# exportAllToSingleXlsx call
if 'soundDevices,' not in tc:
    tc = tc.replace("waterDevices,\n        waterPipes", "waterDevices,\n        waterPipes,\n        soundDevices,\n        soundCables")

with open('src/components/TampilanCadangan.tsx', 'w') as f:
    f.write(tc)

### 3. src/App.tsx
with open('src/App.tsx', 'r') as f:
    app = f.read()

# handleImportData signature
if 'soundDevices?: SoundDevice[];' not in app:
    app = app.replace("waterDevices?: WaterDevice[];", "waterDevices?: WaterDevice[];\n    soundDevices?: SoundDevice[];")
    app = app.replace("waterPipes?: WaterPipeRun[];", "waterPipes?: WaterPipeRun[];\n    soundCables?: SoundCableRun[];")
    app = app.replace("waterDeviceTypes?: any[];", "waterDeviceTypes?: any[];\n    soundDeviceTypes?: any[];")
    app = app.replace("waterPipeTypes?: any[];", "waterPipeTypes?: any[];\n    soundCableTypes?: any[];")

# handleImportData body
sound_import_body = """
    if (data.soundDevices) {
      setSoundDevices(data.soundDevices);
      saveSoundDevices(data.soundDevices);
    }
    if (data.soundCables) {
      setSoundCables(data.soundCables);
      saveSoundCables(data.soundCables);
    }
    if (data.soundDeviceTypes) {
      setSoundDeviceTypes(data.soundDeviceTypes);
      saveSoundDeviceTypes(data.soundDeviceTypes);
    }
    if (data.soundCableTypes) {
      setSoundCableTypes(data.soundCableTypes);
      saveSoundCableTypes(data.soundCableTypes);
    }
"""
if "setSoundDevices(data.soundDevices);" not in app:
    app = app.replace("if (data.waterPipes) {", sound_import_body + "    if (data.waterPipes) {")

# JSX BackupView props
if 'soundDevices={soundDevices}' not in app:
    app = app.replace("waterDevices={waterDevices}", "waterDevices={waterDevices}\n              soundDevices={soundDevices}")
    app = app.replace("waterPipes={waterPipes}", "waterPipes={waterPipes}\n              soundCables={soundCables}")
    app = app.replace("waterDeviceTypes={waterDeviceTypes}", "waterDeviceTypes={waterDeviceTypes}\n              soundDeviceTypes={soundDeviceTypes}")
    app = app.replace("waterPipeTypes={waterPipeTypes}", "waterPipeTypes={waterPipeTypes}\n              soundCableTypes={soundCableTypes}")

with open('src/App.tsx', 'w') as f:
    f.write(app)

