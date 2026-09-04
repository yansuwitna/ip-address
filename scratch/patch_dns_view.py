import os
import re

filepath = 'src/components/DnsView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add import
if 'import { SubDomainView } from' not in content:
    content = content.replace("import { DnsModal } from './DnsModal';", "import { DnsModal } from './DnsModal';\nimport { SubDomainView } from './SubDomainView';")

# Add state
if 'const [selectedDomainForSub, setSelectedDomainForSub]' not in content:
    content = content.replace(
        "const [isDnsModalOpen, setIsDnsModalOpen] = useState(false);",
        "const [selectedDomainForSub, setSelectedDomainForSub] = useState<DnsRecord | null>(null);\n  const [isDnsModalOpen, setIsDnsModalOpen] = useState(false);"
    )

# Change the Action Button in the table
old_btn = """                          <button
                            onClick={() => setSearch('.' + item.domain)}
                            title="Tampilkan Data Sub-Domain"
                            className="p-1.5 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </button>"""
new_btn = """                          <button
                            onClick={() => setSelectedDomainForSub(item)}
                            title="Kelola Pemetaan Sub-Domain"
                            className="p-1.5 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </button>"""
content = content.replace(old_btn, new_btn)

# Render SubDomainView instead of normal view if selected
# We will wrap the main return inside an if statement, or just return SubDomainView at the top
top_render = """
  if (selectedDomainForSub) {
    return (
      <SubDomainView 
        parentDomain={selectedDomainForSub} 
        onBack={() => setSelectedDomainForSub(null)} 
      />
    );
  }
"""

if "if (selectedDomainForSub)" not in content:
    content = content.replace(
        "return (\n    <div className=\"space-y-6",
        top_render + "\n  return (\n    <div className=\"space-y-6"
    )

with open(filepath, 'w') as f:
    f.write(content)
print("DnsView patched for SubDomainView.")
