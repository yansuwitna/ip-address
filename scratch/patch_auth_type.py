import os

filepath = 'src/types/auth.ts'
with open(filepath, 'r') as f:
    content = f.read()

# Add magicToken
if "magicToken?: string;" not in content:
    content = content.replace("  createdAt: string;", "  createdAt: string;\n  magicToken?: string;")

with open(filepath, 'w') as f:
    f.write(content)
print("auth.ts patched.")
