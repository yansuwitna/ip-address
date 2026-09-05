import os

filepath = 'src/utils/exportImport.ts'
with open(filepath, 'r') as f:
    content = f.read()

old_parse = """export function parseImportJson(fileContent: string): {
  groups: IPGroup[];
  allocations: IPAllocation[];
  categories?: DeviceCategory[];
  users?: UserAccount[];
  services?: IPService[];
  dnsRecords?: DnsRecord[];
} {"""

new_parse = """export function parseImportJson(fileContent: string): {
  groups: IPGroup[];
  allocations: IPAllocation[];
  categories?: DeviceCategory[];
  users?: UserAccount[];
  services?: IPService[];
  dnsRecords?: DnsRecord[];
  subDomains?: SubDomainRecord[];
} {"""

content = content.replace(old_parse, new_parse)

old_return = """    users: Array.isArray(parsed.users) ? parsed.users : undefined,
    services: Array.isArray(parsed.services) ? parsed.services : undefined,
    dnsRecords: Array.isArray(parsed.dnsRecords) ? parsed.dnsRecords : undefined
  };
}"""

new_return = """    users: Array.isArray(parsed.users) ? parsed.users : undefined,
    services: Array.isArray(parsed.services) ? parsed.services : undefined,
    dnsRecords: Array.isArray(parsed.dnsRecords) ? parsed.dnsRecords : undefined,
    subDomains: Array.isArray(parsed.subDomains) ? parsed.subDomains : undefined
  };
}"""

content = content.replace(old_return, new_return)

with open(filepath, 'w') as f:
    f.write(content)
print("exportImport.ts patched.")
