import os

filepath = 'src/components/PrintModal.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_root = """    <div className="fixed inset-0 z-[9999] bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200">"""
new_root = """    <div className="fixed inset-0 z-[9999] bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200 print:static print:z-auto print:bg-white print:overflow-visible print:h-auto">"""
content = content.replace(old_root, new_root)

old_container = """      {/* Container Full Page */}
      <div className="w-full h-full flex flex-col">"""
new_container = """      {/* Container Full Page */}
      <div className="w-full h-full flex flex-col print:h-auto print:overflow-visible">"""
content = content.replace(old_container, new_container)

with open(filepath, 'w') as f:
    f.write(content)
print("PrintModal.tsx print CSS patched.")
