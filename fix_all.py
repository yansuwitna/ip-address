import re

# App.tsx
with open('src/App.tsx', 'r') as f:
    app = f.read()

# Fix Modal imports
if 'import { SoundModal }' not in app:
    app = app.replace("import { CctvView } from './components/TampilanCctv';", "import { CctvView } from './components/TampilanCctv';\nimport { SoundModal } from './components/ModalSound';\nimport { KabelSoundModal } from './components/ModalKabelSound';")

# Fix SET_STATE error (arguments expected 1 got 3)
app = re.sub(r'INITIAL_SOUND_DEVICE_TYPES,\s*INITIAL_SOUND_CABLE_TYPES \|\| \[\]\);', 'INITIAL_SOUND_DEVICE_TYPES || []);', app)

# PrintType in ModalCetak
with open('src/components/ModalCetak.tsx', 'r') as f:
    mc = f.read()
mc = mc.replace(" | 'cctv_detail' | 'water_detail';", " | 'cctv_detail' | 'water_detail' | 'sound_detail';")
with open('src/components/ModalCetak.tsx', 'w') as f:
    f.write(mc)

with open('src/App.tsx', 'w') as f:
    f.write(app)

# ModalKabelSound.tsx duplicate keys
with open('src/components/ModalKabelSound.tsx', 'r') as f:
    mks = f.read()
# Replace instances of duplicate keys in objects
mks = re.sub(r'sourceLocation:\s*\'\',\s*sourceLocation:\s*\'\',', "sourceLocation: '',", mks)
mks = re.sub(r'targetLocation:\s*\'\',\s*targetLocation:\s*\'\',', "targetLocation: '',", mks)
mks = re.sub(r'sourceLocation:\s*src,\s*sourceLocation:\s*src,', "sourceLocation: src,", mks)
mks = re.sub(r'targetLocation:\s*tgt,\s*targetLocation:\s*tgt,', "targetLocation: tgt,", mks)
with open('src/components/ModalKabelSound.tsx', 'w') as f:
    f.write(mks)


# ModalSound.tsx
with open('src/components/ModalSound.tsx', 'r') as f:
    ms = f.read()
ms = re.sub(r'resolution:\s*resolution\.trim\(\)\s*\|\|\s*undefined,', '', ms)
ms = re.sub(r'<div[^>]*>\s*<label[^>]*>NVR Induk.*?</select>\s*</div>', '', ms, flags=re.DOTALL)
with open('src/components/ModalSound.tsx', 'w') as f:
    f.write(ms)

# TampilanSound.tsx
with open('src/components/TampilanSound.tsx', 'r') as f:
    ts = f.read()
ts = re.sub(r'import\s*\{\s*Volume2,\s*Speaker\s*as\s*SpeakerIcon,\s*Volume2,', 'import { Volume2, Speaker as SpeakerIcon,', ts)
ts = re.sub(r'\{dev\.streamUrl\s*&&\s*\([\s\S]*?</a>\s*\)\}', '', ts)
with open('src/components/TampilanSound.tsx', 'w') as f:
    f.write(ts)

