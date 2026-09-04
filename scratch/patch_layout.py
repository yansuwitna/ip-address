import os

filepath = 'src/components/SubDomainView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Fix Header Text Wrap
old_h2 = 'h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2"'
new_h2 = 'h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex flex-wrap items-center gap-1.5 sm:gap-2 leading-snug"'
content = content.replace(old_h2, new_h2)

# Fix Table Cells (prevent squishing)
content = content.replace('td className="py-3.5 px-4 font-mono', 'td className="py-3.5 px-4 whitespace-nowrap font-mono')
content = content.replace('td className="py-3.5 px-4"', 'td className="py-3.5 px-4 whitespace-nowrap"')

with open(filepath, 'w') as f:
    f.write(content)
print("Layout patched.")
