import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add SubDomainRecord to types import
content = content.replace("DnsRecord } from './types/ipam';", "DnsRecord, SubDomainRecord } from './types/ipam';")

old_import = """  const handleImportData = (data: {
    groups: IPGroup[];
    allocations: IPAllocation[];
    categories?: DeviceCategory[];
    users?: UserAccount[];
    services?: IPService[];
    dnsRecords?: DnsRecord[];
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
    
    setSelectedGroupId(data.groups[0]?.id || '');
    setAuthView('home');
    setIsViewingPublicHome(false);
  };"""

new_import = """  const handleImportData = (data: {
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
  };"""

content = content.replace(old_import, new_import)

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx import patched.")
