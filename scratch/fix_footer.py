import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the footer div
    new_content = re.sub(
        r'className="flex items-center justify-end space-x-2([^"]*)"',
        r'className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:space-x-2 sm:gap-0\1 w-full"',
        content
    )
    
    # Also we need to ensure the buttons inside have w-full sm:w-auto
    # But since the container is flex-col items-stretch, buttons will automatically be full-width!
    # Wait, if they are flex items-center justify-center, we might need justify-center on the buttons
    # Let's add justify-center to standard button classes in modals
    new_content = re.sub(
        r'className="px-4 py-2 text-xs',
        r'className="justify-center px-4 py-2 text-xs',
        new_content
    )
    new_content = re.sub(
        r'className="px-5 py-2 text-xs',
        r'className="justify-center px-5 py-2 text-xs',
        new_content
    )
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)

for root, _, files in os.walk('src/components'):
    for f in files:
        if f.endswith('Modal.tsx'):
            process_file(os.path.join(root, f))
