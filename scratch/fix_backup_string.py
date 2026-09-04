import os

filepath = 'src/components/BackupView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace the broken string
broken = "Aplikasi akan kembali ke kondisi kosong seperti instalasi baru.\n\nApakah Anda benar-benar yakin?'"
fixed = "Aplikasi akan kembali ke kondisi kosong seperti instalasi baru.\\n\\nApakah Anda benar-benar yakin?'"

content = content.replace(broken, fixed)

with open(filepath, 'w') as f:
    f.write(content)
print("String fixed.")
