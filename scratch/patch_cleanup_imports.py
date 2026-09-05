import os
import re

# 1. Patch ServicesView.tsx
filepath_view = 'src/components/ServicesView.tsx'
with open(filepath_view, 'r') as f:
    content_view = f.read()

content_view = content_view.replace("  COMMON_SERVICE_PRESETS, \n", "")

with open(filepath_view, 'w') as f:
    f.write(content_view)

# 2. Patch ServiceModal.tsx
filepath_modal = 'src/components/ServiceModal.tsx'
with open(filepath_modal, 'r') as f:
    content_modal = f.read()

content_modal = content_modal.replace("  COMMON_SERVICE_PRESETS, \n", "")

with open(filepath_modal, 'w') as f:
    f.write(content_modal)
print("Cleaned up unused imports.")
