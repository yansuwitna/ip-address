import os

filepath = 'src/components/HomeView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Imports
if "Sun" not in content:
    content = content.replace(
        "import { \n  Network,",
        "import { \n  Network,\n  Sun,\n  Moon,"
    )

# 2. Props
old_props = """  dnsRecords?: DnsRecord[];
  currentUser: User | null;
  onNavigateToLogin: () => void;
  onNavigateToDashboard?: () => void;
}"""

new_props = """  dnsRecords?: DnsRecord[];
  currentUser: User | null;
  onNavigateToLogin: () => void;
  onNavigateToDashboard?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}"""
content = content.replace(old_props, new_props)

# 3. Signature
old_sig = """export const HomeView: React.FC<HomeViewProps> = ({
  groups,
  allocations,
  categories,
  dnsRecords = [],
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
  onNavigateToDashboard,
  theme = 'light',
  onToggleTheme
}) => {"""
content = content.replace(old_sig, new_sig)

# 4. The Button
old_right = """          {/* Right Action: Login or Dashboard Button */}
          <div className="flex items-center gap-3">"""

new_right = """          {/* Right Action: Login or Dashboard Button */}
          <div className="flex items-center gap-3">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            )}"""

content = content.replace(old_right, new_right)

with open(filepath, 'w') as f:
    f.write(content)
print("HomeView.tsx theme patched.")
