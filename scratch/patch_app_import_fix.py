import os
import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Fix import saveSubDomains
content = content.replace("saveDnsRecords\n}", "saveDnsRecords,\n  saveSubDomains\n}")

# 2. Fix handleImportData
# We'll use regex to replace the entire handleImportData function block
# It starts with `const handleImportData` and ends before `return (` or the next big function.

old_import_match = re.search(r'const handleImportData = \(data: \{.*?\};', content, re.DOTALL)
if old_import_match:
    old_code = old_import_match.group(0)
    
    new_code = """const handleImportData = (data: {
    groups?: IPGroup[];
    allocations?: IPAllocation[];
    categories?: DeviceCategory[];
    users?: UserAccount[];
    services?: IPService[];
    dnsRecords?: DnsRecord[];
    subDomains?: SubDomainRecord[];
  }) => {
    if (data.groups) {
      setGroups(data.groups);
      saveGroups(data.groups);
    }
    if (data.allocations) {
      setAllocations(data.allocations);
      saveAllocations(data.allocations);
    }
    if (data.categories) {
      setCategories(data.categories);
      saveDeviceCategories(data.categories);
    }
    if (data.users && data.users.length > 0) {
      setUsers(data.users);
      wipeAllUsers();
      data.users.forEach(u => saveUser(u));
    }
    if (data.services) {
      setServices(data.services);
      saveServices(data.services);
    }
    if (data.dnsRecords) {
      setDnsRecords(data.dnsRecords);
      saveDnsRecords(data.dnsRecords);
    }
    if (data.subDomains) {
      saveSubDomains(data.subDomains);
    }
    
    if (data.groups && data.groups.length > 0) {
      setSelectedGroupId(data.groups[0].id);
    }
    
    setAuthView('home');
    setIsViewingPublicHome(false);
  };"""
    content = content.replace(old_code, new_code)
else:
    print("Failed to find handleImportData")

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx fixed.")
