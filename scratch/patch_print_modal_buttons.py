import os
import re

filepath = 'src/components/PrintModal.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Change no-print to print:hidden
content = content.replace(
    '        {/* Top Action Bar (Hidden when printing via .no-print) */}\n        <div className="no-print ',
    '        {/* Top Action Bar (Hidden when printing) */}\n        <div className="print:hidden '
)

# 2. Change "Tutup Tab" back to "Tutup Pratinjau"
content = content.replace(
    """            <button
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Tutup Tab"
            >
              <X className="w-4 h-4" />
              <span>Tutup Tab</span>
            </button>""",
    """            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 justify-center flex dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-4 h-4" />
            </button>"""
)

# 3. Make sure the container acts correctly (revert new page feel to modal feel)
# Wait, the user didn't say to revert the FULL PAGE feel of the modal, just the "buka tab baru" (open new tab)
# "kembalikan jika klik cetak tidak membuka tab baru" -> just revert the window.open part.
# But it's better to revert the PrintModal root classes back to what they were before to be safe.
old_root = """    <div className="fixed inset-0 z-[9999] bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200 print:static print:z-auto print:bg-white print:overflow-visible print:h-auto">
      
      {/* Container Full Page */}
      <div className="w-full h-full flex flex-col print:h-auto print:overflow-visible">"""

new_root = """    <div className="fixed inset-0 z-[9999] bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200 print:static print:z-auto print:bg-white print:overflow-visible print:h-auto">
      
      {/* Container Full Page */}
      <div className="w-full h-full flex flex-col print:h-auto print:overflow-visible">"""

# Actually, the user liked the full screen modal, they just hated the NEW BROWSER TAB popup. 
# So I'll keep the full page styling in the modal! It's much better anyway.

with open(filepath, 'w') as f:
    f.write(content)
print("PrintModal.tsx patched for buttons and print:hidden.")
