import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
        
    changed = False
    new_lines = []
    
    for line in lines:
        if 'bg-' in line and not 'dark:bg-' in line and not 'dark:hover:bg-' in line:
            # We look for bg-color-50
            m = re.search(r'bg-([a-z]+)-50\b', line)
            if m:
                color = m.group(1)
                if color not in ['white', 'black', 'transparent', 'slate']:
                    # Let's replace bg-{color}-50 with bg-{color}-50 dark:bg-{color}-900/30
                    line = re.sub(rf'\bbg-{color}-50\b', f'bg-{color}-50 dark:bg-{color}-900/40', line)
                    
                    # Replace text-{color}-600/700/800
                    line = re.sub(rf'\btext-{color}-600\b', f'text-{color}-600 dark:text-{color}-400', line)
                    line = re.sub(rf'\btext-{color}-700\b', f'text-{color}-700 dark:text-{color}-300', line)
                    line = re.sub(rf'\btext-{color}-800\b', f'text-{color}-800 dark:text-{color}-200', line)
                    
                    # Replace border-{color}-100/200
                    line = re.sub(rf'\bborder-{color}-100\b', f'border-{color}-100 dark:border-{color}-800/60', line)
                    line = re.sub(rf'\bborder-{color}-200\b', f'border-{color}-200 dark:border-{color}-800', line)
                    
                    changed = True

            # Also for hover:bg-{color}-50
            m_hover = re.search(r'hover:bg-([a-z]+)-50\b', line)
            if m_hover:
                color = m_hover.group(1)
                if color not in ['white', 'black', 'transparent', 'slate']:
                    line = re.sub(rf'\bhover:bg-{color}-50\b', f'hover:bg-{color}-50 dark:hover:bg-{color}-900/40', line)
                    changed = True
                    
        new_lines.append(line)
        
    if changed:
        with open(filepath, 'w') as f:
            f.writelines(new_lines)

for root, _, files in os.walk('src/components'):
    for f in files:
        if f.endswith('.tsx'):
            process_file(os.path.join(root, f))
