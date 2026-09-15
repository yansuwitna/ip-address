const fs = require('fs');
let content = fs.readFileSync('src/components/TampilanSound.tsx', 'utf-8');

const regex = /const getStatusBadge = \(status: SoundStatus\) => \{[\s\S]*?^\s*\};\n/m;
const newFunc = `  const getStatusBadge = (status: SoundStatus) => {
    switch (status) {
      case 'online':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><CheckCircle2 className="w-3 h-3" /> Online</span>;
      case 'offline':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700"><WifiOff className="w-3 h-3" /> Offline</span>;
      case 'maintenance':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Perbaikan</span>;
      default:
        return null;
    }
  };
`;
content = content.replace(regex, newFunc);
fs.writeFileSync('src/components/TampilanSound.tsx', content);

