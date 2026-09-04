import os

filepath = 'src/types/ipam.ts'
with open(filepath, 'r') as f:
    content = f.read()

new_types = """
export type SubDomainTargetType = 'ip' | 'port' | 'folder';

export interface SubDomainRecord {
  id: string;
  parentDomainId: string;
  subName: string; // e.g. "api", resulting in api.example.com
  targetType: SubDomainTargetType;
  targetValue: string; // "192.168.1.10", "8080", "/var/www/html"
  description?: string;
  createdAt: string;
}
"""

if "SubDomainRecord" not in content:
    with open(filepath, 'a') as f:
        f.write(new_types)
    print("Types added.")
