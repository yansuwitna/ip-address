import os

filepath = 'src/utils/exportImport.ts'
with open(filepath, 'r') as f:
    content = f.read()

# Add SubDomainRecord to types import
content = content.replace("DnsRecord } from '../types/ipam';", "DnsRecord, SubDomainRecord } from '../types/ipam';")

# Replace exportBackupJson
old_export = """export function exportBackupJson(
  groups: IPGroup[],
  allocations: IPAllocation[],
  categories?: DeviceCategory[],
  users?: UserAccount[],
  services?: IPService[],
  dnsRecords?: DnsRecord[]
): void {"""

new_export = """export function exportBackupJson(
  groups: IPGroup[],
  allocations: IPAllocation[],
  categories?: DeviceCategory[],
  users?: UserAccount[],
  services?: IPService[],
  dnsRecords?: DnsRecord[],
  subDomains?: SubDomainRecord[]
): void {"""
content = content.replace(old_export, new_export)

old_export_body = """      users: users?.length || 0,
      services: services?.length || 0,
      dnsRecords: dnsRecords?.length || 0
    },
    groups,
    allocations,
    categories: categories || [],
    users: users || [],
    services: services || [],
    dnsRecords: dnsRecords || []
  };"""

new_export_body = """      users: users?.length || 0,
      services: services?.length || 0,
      dnsRecords: dnsRecords?.length || 0,
      subDomains: subDomains?.length || 0
    },
    groups,
    allocations,
    categories: categories || [],
    users: users || [],
    services: services || [],
    dnsRecords: dnsRecords || [],
    subDomains: subDomains || []
  };"""
content = content.replace(old_export_body, new_export_body)

# Replace parseImportJson
old_parse_return = """    return {
      groups,
      allocations,
      categories: parsed.categories,
      users: parsed.users,
      services: parsed.services,
      dnsRecords: parsed.dnsRecords
    };"""

new_parse_return = """    return {
      groups,
      allocations,
      categories: parsed.categories,
      users: parsed.users,
      services: parsed.services,
      dnsRecords: parsed.dnsRecords,
      subDomains: parsed.subDomains
    };"""
content = content.replace(old_parse_return, new_parse_return)

with open(filepath, 'w') as f:
    f.write(content)
print("exportImport.ts patched.")
