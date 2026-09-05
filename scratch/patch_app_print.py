import os
import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Update window.open handlers for Print
old_print_alloc = """                      onOpenPrint={() => {
                        setPrintType('allocations');
                        setIsPrintModalOpen(true);
                      }}"""
new_print_alloc = """                      onOpenPrint={() => {
                        const groupId = activeGroup ? activeGroup.id : '';
                        window.open(`${window.location.origin}${window.location.pathname}?print=allocations&groupId=${groupId}`, '_blank');
                      }}"""
content = content.replace(old_print_alloc, new_print_alloc)

old_print_dns = """              onOpenPrintModal={() => {
                setPrintType('dns');
                setIsPrintModalOpen(true);
              }}"""
new_print_dns = """              onOpenPrintModal={() => {
                window.open(`${window.location.origin}${window.location.pathname}?print=dns`, '_blank');
              }}"""
content = content.replace(old_print_dns, new_print_dns)

# 2. Check for print in App root render
early_return_print = """
  // Print View Early Return
  const urlParams = new URLSearchParams(window.location.search);
  const isPrintMode = urlParams.get('print');
  if (isPrintMode) {
    const printGroupId = urlParams.get('groupId');
    const printGroup = printGroupId ? groups.find(g => g.id === printGroupId) || null : null;
    const printAllocations = printGroup ? allocations.filter(a => a.groupId === printGroup.id) : allocations;
    
    return (
      <PrintModal
        isOpen={true}
        onClose={() => window.close()}
        type={isPrintMode as any}
        group={printGroup}
        allocations={printAllocations}
        dnsRecords={dnsRecords}
        services={services}
        categories={categories}
        currentUser={currentUser}
      />
    );
  }

"""

if "// Print View Early Return" not in content:
    content = content.replace("  // If not logged in, render HomeView or Login portal", early_return_print + "  // If not logged in, render HomeView or Login portal")

# Remove the inline PrintModal rendering to clean it up
pattern_inline_print = r'      \{isPrintModalOpen && \(\n        <PrintModal[\s\S]*?\/>\n      \)\}\n'
content = re.sub(pattern_inline_print, '', content)

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx print patched.")
