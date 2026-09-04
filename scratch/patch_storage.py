import os
import re

filepath = 'src/utils/storage.ts'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("DnsRecord } from '../types/ipam';", "DnsRecord, SubDomainRecord } from '../types/ipam';")

subdomain_code = """
export const STORAGE_KEY_SUBDOMAINS = 'netipam_subdomains';

export function loadSubDomains(): SubDomainRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SUBDOMAINS);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load subdomains', e);
    return [];
  }
}

export function saveSubDomains(records: SubDomainRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUBDOMAINS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save subdomains', e);
  }
}
"""

if "STORAGE_KEY_SUBDOMAINS" not in content:
    content += subdomain_code
    with open(filepath, 'w') as f:
        f.write(content)
    print("Storage patched.")
