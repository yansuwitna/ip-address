const fs = require('fs');

// App.tsx
let appStr = fs.readFileSync('src/App.tsx', 'utf-8');
// Fix missing import
if (!appStr.includes('KabelSoundModal')) {
  appStr = appStr.replace(/import \{ SoundModal \}/g, "import { SoundModal } from './components/ModalSound';\nimport { KabelSoundModal }");
}
fs.writeFileSync('src/App.tsx', appStr);

// ModalSound.tsx
let mSoundStr = fs.readFileSync('src/components/ModalSound.tsx', 'utf-8');
mSoundStr = mSoundStr.replace(/existingNvrList/g, '[]');
mSoundStr = mSoundStr.replace(/ipAddress: [^,]+,/g, '');
fs.writeFileSync('src/components/ModalSound.tsx', mSoundStr);

// TampilanSound.tsx
let tSoundStr = fs.readFileSync('src/components/TampilanSound.tsx', 'utf-8');
tSoundStr = tSoundStr.replace(/import \{ Volume2, Speaker as SpeakerIcon,\n  Volume2,/g, 'import { Volume2, Speaker as SpeakerIcon,');
tSoundStr = tSoundStr.replace(/d\.status === 'recording'/g, 'false');
tSoundStr = tSoundStr.replace(/d\.status === 'issue'/g, 'false');
tSoundStr = tSoundStr.replace(/\(d\.ipAddress && d\.ipAddress\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\)\) \|\|/g, '');
tSoundStr = tSoundStr.replace(/c\.sourcePoint \|\| /g, '');
tSoundStr = tSoundStr.replace(/c\.targetPoint \|\| /g, '');
tSoundStr = tSoundStr.replace(/case 'recording':/g, '');
tSoundStr = tSoundStr.replace(/case 'issue':/g, '');
tSoundStr = tSoundStr.replace(/dev\.ipAddress \|\| /g, '');
tSoundStr = tSoundStr.replace(/\{dev\.ipAddress && \([\s\S]*?\{dev\.ipAddress\}<\/span>[\s\S]*?<\/div>\n                          \)\}/g, '');
tSoundStr = tSoundStr.replace(/\{dev\.resolution \? \`\(\$\{dev\.resolution\}\)\` : ''\}/g, '');
tSoundStr = tSoundStr.replace(/\{dev\.streamUrl && \([\s\S]*?<\/a>\n                          \)\}/g, '');
tSoundStr = tSoundStr.replace(/cable\.sourcePoint \|\| /g, '');
tSoundStr = tSoundStr.replace(/cable\.targetPoint \|\| /g, '');
tSoundStr = tSoundStr.replace(/ \|\| cable\.lengthMeters/g, '');
tSoundStr = tSoundStr.replace(/utilityType="sound"/g, '');
fs.writeFileSync('src/components/TampilanSound.tsx', tSoundStr);

// ModalKabelSound.tsx
let mkSoundStr = fs.readFileSync('src/components/ModalKabelSound.tsx', 'utf-8');
mkSoundStr = mkSoundStr.replace(/sourcePoint/g, 'sourceLocation');
mkSoundStr = mkSoundStr.replace(/targetPoint/g, 'targetLocation');
mkSoundStr = mkSoundStr.replace(/pathDescription/g, 'pathwayRoute');
mkSoundStr = mkSoundStr.replace(/lengthMeters/g, 'lengthMeter');
mkSoundStr = mkSoundStr.replace(/labelCode/g, 'cableCode');
fs.writeFileSync('src/components/ModalKabelSound.tsx', mkSoundStr);

