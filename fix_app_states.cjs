const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace("setSoundCableTypes(\n\n  const [cctvCables, setCctvCables] = useState<CctvCableRun[]>", "setSoundCableTypes(INITIAL_SOUND_CABLE_TYPES || []);\n\n  const [cctvCables, setCctvCables] = useState<CctvCableRun[]>");
app = app.replace("setSoundCableTypes(\n\n  const [cctvCables, setCctvCables] = useState<CctvCableRun[]>([]);", "setSoundCableTypes(INITIAL_SOUND_CABLE_TYPES || []);\n\n  const [cctvCables, setCctvCables] = useState<CctvCableRun[]>([]);");

app = app.replace("setSoundCableTypes(\n\n    setCctvCables([]);", "setSoundCableTypes(INITIAL_SOUND_CABLE_TYPES || []);\n\n    setCctvCables([]);");

fs.writeFileSync('src/App.tsx', app);
