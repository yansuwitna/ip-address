import os
import re

filepath = 'src/components/ServicesView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Remove state declaration
content = re.sub(r'  const \[presetForNew, setPresetForNew\] = useState<ServicePreset \| null>\(null\);\n', '', content)

# Remove setPresetForNew calls
content = content.replace("setPresetForNew(null);\n", "")
content = content.replace("setPresetForNew(null);", "")

with open(filepath, 'w') as f:
    f.write(content)
print("Removed presetForNew.")
