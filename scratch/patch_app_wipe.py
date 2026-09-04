import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Import saveSubDomains
if "saveSubDomains" not in content:
    content = content.replace("saveDnsRecords,", "saveDnsRecords,\n  saveSubDomains,")

# Add saveSubDomains([]) to wipeAllData
if "saveSubDomains([])" not in content:
    content = content.replace("saveDnsRecords([]);", "saveDnsRecords([]);\n    saveSubDomains([]);")

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx patched for wipeAllData.")
