import os

filepath = 'index.html'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace('    <link rel="manifest" href="/manifest.json" />\n', '')

with open(filepath, 'w') as f:
    f.write(content)
print("index.html manifest link removed.")
