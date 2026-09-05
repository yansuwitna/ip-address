import os
import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

print_modal = """
      {isPrintModalOpen && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          type={printType}
          group={activeGroup}
          allocations={activeGroup ? allocations.filter(a => a.groupId === activeGroup.id) : allocations}
          dnsRecords={dnsRecords}
          services={services}
          categories={categories}
          currentUser={currentUser}
        />
      )}
"""
content = content.replace("    </div>\n  );\n};\nexport default App;", print_modal + "    </div>\n  );\n};\nexport default App;")

with open(filepath, 'w') as f:
    f.write(content)
print("PrintModal appended.")
