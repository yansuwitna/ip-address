with open('src/utils/eksporImpor.ts', 'r') as f:
    ei = f.read()

bad_block = """    waterDeviceTypes: Array.isArray(parsed.waterDeviceTypes) ? parsed.waterDeviceTypes : undefined,
    waterPipeTypes,
      soundCableTypes: Array.isArray(parsed.waterPipeTypes,
      soundCableTypes) ? parsed.waterPipeTypes,
      soundCableTypes : undefined
  };"""

good_block = """    waterDeviceTypes: Array.isArray(parsed.waterDeviceTypes) ? parsed.waterDeviceTypes : undefined,
    soundDeviceTypes: Array.isArray(parsed.soundDeviceTypes) ? parsed.soundDeviceTypes : undefined,
    waterPipeTypes: Array.isArray(parsed.waterPipeTypes) ? parsed.waterPipeTypes : undefined,
    soundCableTypes: Array.isArray(parsed.soundCableTypes) ? parsed.soundCableTypes : undefined
  };"""

ei = ei.replace(bad_block, good_block)

with open('src/utils/eksporImpor.ts', 'w') as f:
    f.write(ei)
