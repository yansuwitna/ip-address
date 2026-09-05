import os
import re

filepath = 'src/components/ServiceModal.tsx'
with open(filepath, 'r') as f:
    content = f.read()

pattern = r'  const handleApplyPreset = \(preset: ServicePreset\) => \{.*?\};\n'
content = re.sub(pattern, '', content, flags=re.DOTALL)

with open(filepath, 'w') as f:
    f.write(content)
print("Removed handleApplyPreset.")
