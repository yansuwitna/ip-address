import os
import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Restore the states
states = """  // DNS Modal state
  const [isDnsModalOpen, setIsDnsModalOpen] = useState(false);
  const [editingDnsRecord, setEditingDnsRecord] = useState<DnsRecord | null>(null);

  // Print Modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState<'allocations' | 'dns' | 'services'>('allocations');
"""
content = re.sub(
    r'  // DNS Modal state\n  const \[isDnsModalOpen, setIsDnsModalOpen\] = useState\(false\);\n  const \[editingDnsRecord, setEditingDnsRecord\] = useState<DnsRecord \| null>\(null\);\n',
    states,
    content
)

# 2. Revert window.open handlers
content = content.replace(
    """                      onOpenPrint={() => {
                        const groupId = activeGroup ? activeGroup.id : '';
                        window.open(`${window.location.origin}${window.location.pathname}?print=allocations&groupId=${groupId}`, '_blank');
                      }}""",
    """                      onOpenPrint={() => {
                        setPrintType('allocations');
                        setIsPrintModalOpen(true);
                      }}"""
)

content = content.replace(
    """              onOpenPrintModal={() => {
                window.open(`${window.location.origin}${window.location.pathname}?print=dns`, '_blank');
              }}""",
    """              onOpenPrintModal={() => {
                setPrintType('dns');
                setIsPrintModalOpen(true);
              }}"""
)

# 3. Remove early return print logic
early_return_pattern = r'  // Print View Early Return.*?if \(isPrintMode\) \{.*?\n  \}\n\n'
content = re.sub(early_return_pattern, '', content, flags=re.DOTALL)


# 4. Re-add PrintModal to the bottom of App.tsx
if "<PrintModal" not in content:
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
    content = content.replace("    </div>\n  );\n}\n", print_modal + "    </div>\n  );\n}\n")


with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx reverted to modal print.")
