import os
import re

filepath = 'src/types/ipam.ts'
with open(filepath, 'r') as f:
    content = f.read()

old_interface = """export interface SubDomainRecord {
  id: string;
  parentDomainId: string;
  subName: string; // e.g. "api", resulting in api.example.com
  targetType: SubDomainTargetType;
  targetValue: string; // "192.168.1.10", "8080", "/var/www/html"
  description?: string;
  createdAt: string;
}"""

new_interface = """export interface SubDomainRecord {
  id: string;
  parentDomainId: string;
  subName: string;
  ipAddress?: string;
  port?: string;
  folder?: string;
  database?: string;
  description?: string;
  createdAt: string;
}"""

content = content.replace(old_interface, new_interface)

with open(filepath, 'w') as f:
    f.write(content)
print("ipam.ts updated")
