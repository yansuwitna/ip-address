import os

filepath = 'src/types/auth.ts'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("  createdAt?: string;\n}", "  createdAt?: string;\n  magicToken?: string;\n}")

with open(filepath, 'w') as f:
    f.write(content)
print("auth.ts correctly patched.")
