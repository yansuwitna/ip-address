import os

filepath = 'src/components/DnsView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

target = """                      {/* Action Column */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">"""

new_btn = """                      {/* Action Column */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setSearch('.' + item.domain)}
                            title="Tampilkan Data Sub-Domain"
                            className="p-1.5 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </button>"""

new_content = content.replace(target, new_btn)

if new_content != content:
    with open(filepath, 'w') as f:
        f.write(new_content)
    print("Action column patched.")
else:
    print("Failed to find target.")
