import re

with open('src/utils/eksporImpor.ts', 'r') as f:
    ei = f.read()

# Fix parseImportJson return type
ei = re.sub(r'waterDeviceTypes\?: any\[\];\n\s*waterPipeTypes,\n\s*soundCableTypes\?: any\[\];', 'waterDeviceTypes?: any[];\n  soundDeviceTypes?: any[];\n  waterPipeTypes?: any[];\n  soundCableTypes?: any[];', ei)

# Let's also check if soundDevices is in the return type
if 'soundDevices?: SoundDevice[];' not in ei:
    ei = ei.replace('waterDevices?: WaterDevice[];\n  waterPipes?: WaterPipeRun[];', 'waterDevices?: WaterDevice[];\n  soundDevices?: SoundDevice[];\n  waterPipes?: WaterPipeRun[];\n  soundCables?: SoundCableRun[];')

with open('src/utils/eksporImpor.ts', 'w') as f:
    f.write(ei)

