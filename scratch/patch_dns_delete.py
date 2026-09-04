import os

filepath = 'src/components/DnsView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Add import for loadSubDomains
if "import { loadSubDomains }" not in content:
    content = content.replace(
        "import { showConfirm, showSuccess, showWarning } from '../utils/swal';",
        "import { showConfirm, showSuccess, showWarning } from '../utils/swal';\nimport { loadSubDomains } from '../utils/storage';"
    )

# 2. Add loadSubDomains() inside DnsView body
if "const subDomains = loadSubDomains();" not in content:
    content = content.replace(
        "const [search, setSearch] = useState('');",
        "const [search, setSearch] = useState('');\n  const subDomains = loadSubDomains();"
    )

# 3. Add hasSubDomains
old_map = """                filteredRecords.map(item => {
                  const linkedGroup = groups.find(g => g.id === item.groupId);"""
new_map = """                filteredRecords.map(item => {
                  const hasSubDomains = subDomains.some(s => s.parentDomainId === item.id);
                  const linkedGroup = groups.find(g => g.id === item.groupId);"""
content = content.replace(old_map, new_map)


# 4. Modify the Trash button
old_trash = """                          <button
                            onClick={() => handleDelete(item)}
                            title="Hapus Catatan DNS"
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/40 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>"""

new_trash = """                          <button
                            onClick={() => {
                              if (hasSubDomains) return;
                              handleDelete(item);
                            }}
                            title={hasSubDomains ? "Tidak dapat dihapus (memiliki Sub Domain)" : "Hapus Catatan DNS"}
                            disabled={hasSubDomains}
                            className={`p-1.5 rounded-lg transition-colors ${
                              hasSubDomains 
                                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                                : 'hover:bg-rose-50 dark:hover:bg-rose-900/40 text-slate-400 hover:text-rose-600 cursor-pointer'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>"""

content = content.replace(old_trash, new_trash)

with open(filepath, 'w') as f:
    f.write(content)
print("Trash button patched.")
