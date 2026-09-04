import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the backdrop line
    new_content = re.sub(
        r'className="fixed inset-0 z-50 flex items-center justify-center ([^"]*)"',
        r'className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:items-center sm:pt-4 overflow-y-auto \1"',
        content
    )
    
    # deduplicate overflow-y-auto if it was already there
    new_content = new_content.replace('overflow-y-auto overflow-y-auto', 'overflow-y-auto')
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)

for root, _, files in os.walk('src/components'):
    for f in files:
        if f.endswith('.tsx'):
            process_file(os.path.join(root, f))
