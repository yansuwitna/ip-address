import os
import re

filepath = 'src/utils/storage.ts'
with open(filepath, 'r') as f:
    content = f.read()

# Make sure api is imported
if "import { syncToServer } from './api';" not in content:
    content = "import { syncToServer } from './api';\n" + content

# Patch all save functions
save_funcs = [
    ('saveGroups', 'groups', 'GROUPS'),
    ('saveAllocations', 'allocations', 'ALLOCATIONS'),
    ('saveDeviceCategories', 'categories', 'DEVICE_CATEGORIES'),
    ('saveServices', 'services', 'SERVICES'),
    ('saveDnsRecords', 'records', 'DNS_RECORDS'),
    ('saveSubDomains', 'records', 'SUB_DOMAINS')
]

for func_name, param_name, key_name in save_funcs:
    old_def = f"""export function {func_name}({param_name}: any[]): void {{
  localStorage.setItem(STORAGE_KEYS.{key_name}, JSON.stringify({param_name}));
}}"""
    # Use regex to find the actual signature as it has precise types
    pattern = rf"export function {func_name}\([^)]+\): void {{\s*localStorage\.setItem\(STORAGE_KEYS\.{key_name}, JSON\.stringify\([^)]+\)\);\s*}}"
    
    def repl(m):
        original = m.group(0)
        # Extract the parameter name safely
        param = original.split('(')[1].split(':')[0].strip()
        new_str = original.replace('}', f"\n  syncToServer(STORAGE_KEYS.{key_name}, {param});\n}}")
        return new_str
        
    content = re.sub(pattern, repl, content)

with open(filepath, 'w') as f:
    f.write(content)
print("storage.ts patched.")
