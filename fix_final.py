import re

# App.tsx
with open('src/App.tsx', 'r') as f:
    app = f.read()

app = app.replace('import { KabelSoundModal } from', 'import { SoundCableModal } from')
app = app.replace('<KabelSoundModal', '<SoundCableModal')
app = re.sub(r'INITIAL_SOUND_DEVICE_TYPES\s*\|\|\s*\[\]\);', 'INITIAL_SOUND_DEVICE_TYPES || []);', app) # wait, what was the error exactly?
# Let's fix lines around 390
# The issue: setSoundDeviceTypes(data['netipam_sound_device_types_v1'] || INITIAL_SOUND_DEVICE_TYPES || []);
app = app.replace("INITIAL_SOUND_CABLE_TYPES || []);", "") 
# Actually let's just see line 390
with open('src/App.tsx', 'w') as f:
    f.write(app)

# ModalKabelSound.tsx
with open('src/components/ModalKabelSound.tsx', 'r') as f:
    mks = f.read()
# Replace ALL sourceLocation: '', sourceLocation: '', with just sourceLocation: '',
mks = re.sub(r'sourceLocation:\s*\'\',\s*sourceLocation:\s*\'\',', "sourceLocation: '',", mks)
mks = re.sub(r'targetLocation:\s*\'\',\s*targetLocation:\s*\'\',', "targetLocation: '',", mks)
mks = re.sub(r'sourceLocation:\s*src,\s*sourceLocation:\s*src,', "sourceLocation: src,", mks)
mks = re.sub(r'targetLocation:\s*tgt,\s*targetLocation:\s*tgt,', "targetLocation: tgt,", mks)
with open('src/components/ModalKabelSound.tsx', 'w') as f:
    f.write(mks)

# ModalSound.tsx
with open('src/components/ModalSound.tsx', 'r') as f:
    ms = f.read()
ms = re.sub(r'channelNumber:\s*channelNumber[^,]+,', '', ms)
ms = re.sub(r'nvrId:\s*nvrId[^,]+,', '', ms)
ms = re.sub(r'poePort:\s*poePort[^,]+,', '', ms)
ms = re.sub(r'rtspUrl:\s*rtspUrl[^,]+,', '', ms)
ms = re.sub(r'storageDays:\s*storageDays[^,]+,', '', ms)
# NVR block
ms = re.sub(r'<div>\s*<label[^>]+>NVR Induk.*?</select>\s*</div>', '', ms, flags=re.DOTALL)
with open('src/components/ModalSound.tsx', 'w') as f:
    f.write(ms)

# TampilanSound.tsx
with open('src/components/TampilanSound.tsx', 'r') as f:
    ts = f.read()
ts = re.sub(r'\{dev\.streamUrl && \([\s\S]*?</a>\n\s*\)\}', '', ts)
with open('src/components/TampilanSound.tsx', 'w') as f:
    f.write(ts)
