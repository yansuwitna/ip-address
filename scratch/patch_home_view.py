import os
import re

filepath = 'src/components/HomeView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Imports
if "import { DnsRecord" not in content:
    content = content.replace(
        "import { IPGroup, IPAllocation, DeviceCategory } from '../types/ipam';",
        "import { IPGroup, IPAllocation, DeviceCategory, DnsRecord } from '../types/ipam';\nimport { loadSubDomains } from '../utils/storage';"
    )

# 2. Props
if "dnsRecords?: DnsRecord[];" not in content:
    content = content.replace(
        "  categories: DeviceCategory[];\n  currentUser: User | null;",
        "  categories: DeviceCategory[];\n  dnsRecords?: DnsRecord[];\n  currentUser: User | null;"
    )

# 3. Component signature
old_sig = """export const HomeView: React.FC<HomeViewProps> = ({
  groups,
  allocations,
  categories,
  currentUser,
  onNavigateToLogin,
  onNavigateToDashboard
}) => {"""

new_sig = """export const HomeView: React.FC<HomeViewProps> = ({
  groups,
  allocations,
  categories,
  dnsRecords = [],
  currentUser,
  onNavigateToLogin,
  onNavigateToDashboard
}) => {
  const subDomains = loadSubDomains();"""

if "const subDomains = loadSubDomains();" not in content:
    content = content.replace(old_sig, new_sig)

# 4. Remove Center Badges
old_badges = """          {/* Center Badges (Desktop) */}
          <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Aktif</span>
            </span>
            <span className="text-slate-400">•</span>
            <span>{groups.length} Subnet Terdaftar</span>
            <span className="text-slate-400">•</span>
            <span>{allocations.length} Alokasi Host</span>
          </div>"""
content = content.replace(old_badges, "")


# 5. Add Domain and Sub Domain Cards and change grid
old_grid = """<div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6">"""
new_grid = """<div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto pt-6">"""
content = content.replace(old_grid, new_grid)

# Find the end of the last card (Kategori Device)
old_last_card = """          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kategori Device</span>
              <HardDrive className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{categories.length}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Hardware Tervalidasi</div>
          </div>"""

new_last_card = """          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kategori Device</span>
              <HardDrive className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{categories.length}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Hardware Tervalidasi</div>
          </div>

          {/* New Cards */}
          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Domain Utama</span>
              <Globe className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{dnsRecords?.length || 0}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Record DNS Server</div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sub Domain</span>
              <Layers className="w-4 h-4 text-pink-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{subDomains.length}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Virtual Host / Reverse Proxy</div>
          </div>"""
          
content = content.replace(old_last_card, new_last_card)

# Add Globe import if missing
if "Globe" not in content[:content.find("import { IPGroup")]:
    content = content.replace("HardDrive\n} from 'lucide-react';", "HardDrive,\n  Globe\n} from 'lucide-react';")


with open(filepath, 'w') as f:
    f.write(content)
print("HomeView.tsx patched.")
