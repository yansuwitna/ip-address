with open('src/App.tsx', 'r') as f:
    app = f.read()

app = app.replace('useState<SoundCableTypeItem[]>(\n\n  const [cctvCables', 'useState<SoundCableTypeItem[]>(INITIAL_SOUND_CABLE_TYPES || []);\n\n  const [cctvCables')
app = app.replace('setSoundCableTypes(\n\n    setCctvCables', 'setSoundCableTypes(INITIAL_SOUND_CABLE_TYPES || []);\n\n    setCctvCables')

with open('src/App.tsx', 'w') as f:
    f.write(app)
