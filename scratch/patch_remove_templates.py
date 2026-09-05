import os
import re

# 1. Patch ServicesView.tsx
filepath_view = 'src/components/ServicesView.tsx'
with open(filepath_view, 'r') as f:
    content_view = f.read()

# Locate QUICK PRESET STRIP
pattern_view = r'\{\/\* 4\. QUICK PRESET STRIP \*\/\}.*?\{\/\* 5\. SEARCH, FILTER BAR & TABLE \*\/\}'
content_view = re.sub(pattern_view, '{/* 5. SEARCH, FILTER BAR & TABLE */}', content_view, flags=re.DOTALL)

with open(filepath_view, 'w') as f:
    f.write(content_view)
print("ServicesView.tsx patched.")

# 2. Patch ServiceModal.tsx
filepath_modal = 'src/components/ServiceModal.tsx'
with open(filepath_modal, 'r') as f:
    content_modal = f.read()

# Locate Quick Presets Catalog Bar
pattern_modal = r'\{\/\* Quick Presets Catalog Bar \*\/\}.*?\{\/\* Form Body \*\/\}'
content_modal = re.sub(pattern_modal, '{/* Form Body */}', content_modal, flags=re.DOTALL)

with open(filepath_modal, 'w') as f:
    f.write(content_modal)
print("ServiceModal.tsx patched.")
