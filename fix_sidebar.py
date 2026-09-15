import re

with open('src/components/BilahSisi.tsx', 'r') as f:
    bs = f.read()

# Add TabTypes if not already added
if "'sound'" not in bs:
    bs = bs.replace("  | 'water_pipe_types'", "  | 'water_pipe_types'\n  | 'sound'\n  | 'sound_device_types'\n  | 'sound_cable_types'")

# Add Volume2 icon
if "Volume2" not in bs:
    bs = bs.replace("import {", "import { Volume2,", 1)

# Add soundGroupItems
soundGroup = """
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
"""
if "soundGroupItems" not in bs:
    bs = re.sub(r'(\s*// 5\. Ruangan & Lokasi)', soundGroup + r'\1', bs)

# Add rendering block
renderBlock = """
          {/* 7. SEKTOR SOUND */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Jaringan Sound</span>
            </div>

            {soundGroupItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const activeBg = item.activeColor || 'bg-indigo-500';

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? `${activeBg} text-white shadow-sm font-bold`
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                    }`} />
                    <div className="text-left">
                      <div>{item.label}</div>
                      <div className={`text-[10px] font-normal ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity ${
                    isActive ? 'opacity-100 text-white' : 'text-slate-400'
                  }`} />
                </button>
              );
            })}
          </div>
"""
if "7. SEKTOR SOUND" not in bs:
    bs = re.sub(r'(\s*{/\* 4\. SISTEM & UTILITAS \*/})', renderBlock + r'\1', bs)

with open('src/components/BilahSisi.tsx', 'w') as f:
    f.write(bs)

