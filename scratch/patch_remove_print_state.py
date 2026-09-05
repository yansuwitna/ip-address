import os
import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = re.sub(r'  // Print Modal state\n', '', content)
content = re.sub(r'  const \[isPrintModalOpen, setIsPrintModalOpen\] = useState\(false\);\n', '', content)
content = re.sub(r'  const \[printType, setPrintType\] = useState<\'allocations\' \| \'dns\' \| \'services\'>\(\'allocations\'\);\n', '', content)

with open(filepath, 'w') as f:
    f.write(content)
print("Removed unused print states.")
