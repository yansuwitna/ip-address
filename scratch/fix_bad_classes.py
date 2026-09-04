import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
        
    # fix things like dark:bg-slate-800/40/80 -> dark:bg-slate-800/80
    new_content = re.sub(r'(dark:[a-z-]+-[a-z0-9-]+)/[0-9]+/([0-9]+)', r'\1/\2', content)
    
    # fix things like dark:bg-slate-800/40/70 -> dark:bg-slate-800/70
    
    # fix duplicate classes like dark:bg-slate-800 dark:bg-slate-800
    # or dark:bg-slate-800/80 dark:bg-slate-800/80
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)

for root, _, files in os.walk('src/components'):
    for f in files:
        if f.endswith('.tsx'):
            process_file(os.path.join(root, f))
