const fs = require('fs');
let content = fs.readFileSync('src/components/BilahSisi.tsx', 'utf-8');

// Update TabType type definition
content = content.replace("  | 'water_pipe_types'", "  | 'water_pipe_types'\n  | 'sound'\n  | 'sound_device_types'\n  | 'sound_cable_types'");

// Add Volume2 icon if not imported
if (!content.includes('Volume2')) {
  content = content.replace('Video,', 'Video,\n  Volume2,');
}

// Add soundGroupItems after waterGroupItems
const soundGroupStr = `
  // 5. Sektor SOUND (Jaringan Tata Suara)
  const soundGroupItems: NavItem[] = [
    {
      id: 'sound',
      label: 'Jaringan Sound',
      icon: Volume2,
      description: 'Speaker, Amp & Mixer',
      activeColor: 'bg-indigo-500'
    },
    {
      id: 'sound_device_types',
      label: 'Tipe Hardware Sound',
      icon: Volume2,
      description: 'Master Jenis Alat Suara',
      activeColor: 'bg-indigo-500'
    },
    {
      id: 'sound_cable_types',
      label: 'Jenis Kabel Sound',
      icon: Volume2,
      description: 'Master Tipe Kabel Audio',
      activeColor: 'bg-indigo-500'
    }
  ];
`;
content = content.replace('  // --- MENU MASTER UTAMA ---', soundGroupStr + '\n  // --- MENU MASTER UTAMA ---');

// Render the menu
const renderSound = `
        {/* --- KELOMPOK 5: JARINGAN SOUND --- */}
        <div className="mb-6">
          <div className="px-4 mb-2">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              5. Jaringan Sound & Audio
            </h3>
          </div>
          <div className="space-y-1">
            {soundGroupItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={\`w-full flex items-start text-left px-4 py-2.5 transition-all duration-200 group relative \${
                    isActive 
                      ? 'bg-indigo-50/80 dark:bg-indigo-500/10' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }\`}
                >
                  <div className={\`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mr-3 transition-colors \${
                    isActive 
                      ? '\${item.activeColor} text-white shadow-sm shadow-indigo-200 dark:shadow-none' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }\`}>
                    <Icon size={16} className={isActive ? 'animate-pulse-slow' : ''} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className={\`text-sm font-semibold truncate transition-colors \${
                      isActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
                    }\`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-r-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
`;

content = content.replace('{/* --- KELOMPOK 5: MASTER DATA --- */}', renderSound + '\n        {/* --- KELOMPOK 6: MASTER DATA --- */}');
content = content.replace('5. Master Data', '6. Master Data');
content = content.replace('6. Konfigurasi', '7. Konfigurasi');
content = content.replace('{/* --- KELOMPOK 6: SISTEM --- */}', '{/* --- KELOMPOK 7: SISTEM --- */}');

fs.writeFileSync('src/components/BilahSisi.tsx', content);
