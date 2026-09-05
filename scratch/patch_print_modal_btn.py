import os

filepath = 'src/components/PrintModal.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_btn = """            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 justify-center flex dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-4 h-4" />
            </button>"""

new_btn = """            <button
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Tutup Tab"
            >
              <X className="w-4 h-4" />
              <span>Tutup Tab</span>
            </button>"""

content = content.replace(old_btn, new_btn)

with open(filepath, 'w') as f:
    f.write(content)
print("PrintModal.tsx close button patched.")
