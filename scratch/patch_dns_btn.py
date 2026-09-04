import os
import re

filepath = 'src/components/DnsView.tsx'

with open(filepath, 'r') as f:
    content = f.read()

btn_code = """          {/* Toggle Sub DNS Button */}
          <button
            onClick={() => setShowSubDns(!showSubDns)}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              showSubDns
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title={showSubDns ? "Tampilkan Semua DNS" : "Hanya Tampilkan Sub DNS"}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{showSubDns ? 'Semua DNS' : 'Sub DNS'}</span>
          </button>

          {/* Tambah DNS Record Button */}"""

new_content = content.replace('          {/* Tambah DNS Record Button */}', btn_code)

if new_content != content:
    with open(filepath, 'w') as f:
        f.write(new_content)
    print("Button added!")
else:
    print("Could not find the target comment to replace.")
