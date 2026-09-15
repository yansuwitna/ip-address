import re

# ModalKabelSound.tsx
with open('src/components/ModalKabelSound.tsx', 'r') as f:
    mks = f.read()

# Fix duplicates
# In TS, object literal { sourceLocation: '', sourceLocation: '' } is an error. We want to remove the second one.
mks = re.sub(r'(sourceLocation:\s*[^,]+,\s*)sourceLocation:\s*[^,]+,', r'\1', mks)
mks = re.sub(r'(targetLocation:\s*[^,]+,\s*)targetLocation:\s*[^,]+,', r'\1', mks)
# Let's also remove `devices: SoundDevice[];` if it's there
with open('src/components/ModalKabelSound.tsx', 'w') as f:
    f.write(mks)

# App.tsx
with open('src/App.tsx', 'r') as f:
    app = f.read()
# Remove devices={soundDevices}
app = app.replace('devices={soundDevices}', '')
with open('src/App.tsx', 'w') as f:
    f.write(app)


# ModalSound.tsx
with open('src/components/ModalSound.tsx', 'r') as f:
    ms = f.read()
# Find the exact NVR block by looking for "NVR Induk"
# <div className="..."><label className="...">NVR Induk</label>...</div>
ms = re.sub(r'<div[^>]*>\s*<label[^>]*>NVR Induk.*?</select>\s*</div>', '', ms, flags=re.DOTALL)
# Alternatively just find "NVR Induk" and delete the whole enclosing div.
if 'NVR Induk' in ms:
    lines = ms.split('\n')
    out = []
    skip = False
    for line in lines:
        if 'NVR Induk' in line:
            # this is inside a div, remove the previous <div line and the next few lines until </div>
            skip = True
        if skip and '</div>' in line:
            skip = False
            continue
        if not skip:
            out.append(line)
    
    # We might have left a dangling <div className="..."> before NVR Induk, let's fix it by regex:
    ms = re.sub(r'<div>\s*<label[^>]*>NVR Induk.*?</select>\s*</div>', '', '\n'.join(out), flags=re.DOTALL)
    
    # Actually just remove anything that mentions nvr.id
    ms = re.sub(r'<div[^>]*>\s*<label[^>]*>NVR Induk.*?</select>\s*</div>', '', ms, flags=re.DOTALL)
    
    # Let's use a stronger regex
    ms = re.sub(r'<div[^>]*>\s*<label[^>]*>\s*NVR Induk\s*</label>[\s\S]*?</select>\s*</div>', '', ms)

with open('src/components/ModalSound.tsx', 'w') as f:
    f.write(ms)

# TampilanSound.tsx
with open('src/components/TampilanSound.tsx', 'r') as f:
    ts = f.read()
ts = re.sub(r'\{dev\.streamUrl && \([\s\S]*?</a>\s*\)\}', '', ts)
with open('src/components/TampilanSound.tsx', 'w') as f:
    f.write(ts)
