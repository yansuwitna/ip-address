import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    def replacer(match):
        full = match.group(0)
        if 'className="' in full and 'w-full' not in full:
            return full.replace('className="', 'className="w-full sm:w-auto ')
        return full
        
    new_content = re.sub(r'<select[^>]+>', replacer, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Patched {filepath}")

for root, _, files in os.walk('src/components'):
    for f in files:
        if f.endswith('.tsx'):
            process_file(os.path.join(root, f))
