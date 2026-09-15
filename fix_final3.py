import re

# App.tsx
with open('src/App.tsx', 'r') as f:
    app = f.read()

app = app.replace('cables={soundCables}', 'devices={soundDevices}\n              cables={soundCables}')
app = app.replace('editCable={editingSoundCable}', 'editCable={editingSoundCable}\n          soundDevices={soundDevices}')
with open('src/App.tsx', 'w') as f:
    f.write(app)

# ModalKabelSound.tsx
with open('src/components/ModalKabelSound.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # If the previous line is identical (except whitespace), skip
    if i > 0 and line.strip() == lines[i-1].strip() and line.strip() in ["sourceLocation: '',", "targetLocation: '',", "sourceLocation: src,", "targetLocation: tgt,"]:
        continue
    new_lines.append(line)

with open('src/components/ModalKabelSound.tsx', 'w') as f:
    f.writelines(new_lines)

