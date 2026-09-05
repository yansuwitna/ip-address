import os
import re

filepath = 'src/components/UsersView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

pattern = r'  // Update manifest dynamically for PWA shortcut URL\n  React\.useEffect\(\(\) => \{[\s\S]*?\}, \[singleUser\?\.magicToken\]\);\n\n'
content = re.sub(pattern, '', content)

with open(filepath, 'w') as f:
    f.write(content)
print("UsersView.tsx local manifest removed.")
