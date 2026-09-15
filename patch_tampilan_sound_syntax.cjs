const fs = require('fs');
let content = fs.readFileSync('src/components/TampilanSound.tsx', 'utf-8');

const regexRec = /return <span[^>]+><span[^>]+><\/span> Merekam \(REC\)<\/span>;/g;
content = content.replace(regexRec, '');

const regexGangguan = /return <span[^>]+><Activity[^>]+><\/Activity> Gangguan<\/span>;/g;
content = content.replace(regexGangguan, '');
content = content.replace(/<Activity className="w-3 h-3" \/>/g, '');
content = content.replace(/Gangguan<\/span>;/g, '');

fs.writeFileSync('src/components/TampilanSound.tsx', content);

