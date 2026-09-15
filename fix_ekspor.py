import re

with open('src/utils/eksporImpor.ts', 'r') as f:
    ei = f.read()

# Fix totalData block
totalData_bad = """      waterPipes: waterPipes?.length || 0,
      soundCables: soundCables?.length || 0,
      waterPipeTypes,
      soundCableTypes: waterPipeTypes,
      soundCableTypes?.length || 0,
      soundCableTypes: soundCableTypes?.length || 0"""
totalData_good = """      waterPipes: waterPipes?.length || 0,
      soundCables: soundCables?.length || 0,
      waterPipeTypes: waterPipeTypes?.length || 0,
      soundCableTypes: soundCableTypes?.length || 0"""
ei = ei.replace(totalData_bad, totalData_good)

# Fix assignment block
assign_bad = """    waterPipes: waterPipes || [],
    soundCables: soundCables || [],
    waterPipeTypes,
      soundCableTypes: waterPipeTypes,
      soundCableTypes || [],
    soundCableTypes: soundCableTypes || []"""
assign_good = """    waterPipes: waterPipes || [],
    soundCables: soundCables || [],
    waterPipeTypes: waterPipeTypes || [],
    soundCableTypes: soundCableTypes || []"""
ei = ei.replace(assign_bad, assign_good)

# Let's check parseImportJson return block at line 673
# `soundCableTypes) ? parsed.waterPipeTypes,`
return_bad = """      waterPipes,
      soundCables,
      waterDeviceTypes,
      soundDeviceTypes,
      waterPipeTypes,
      soundCableTypes) ? parsed.waterPipeTypes,
      soundCableTypes"""
return_good = """      waterPipes,
      soundCables,
      waterDeviceTypes,
      soundDeviceTypes,
      waterPipeTypes,
      soundCableTypes"""
ei = ei.replace(return_bad, return_good)
# Or I can just rewrite the return block of parseImportJson

with open('src/utils/eksporImpor.ts', 'w') as f:
    f.write(ei)

