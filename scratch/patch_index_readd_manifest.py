import os

filepath = 'index.html'
with open(filepath, 'r') as f:
    content = f.read()

if '<link rel="manifest"' not in content:
    content = content.replace(
        '<meta name="apple-mobile-web-app-title" content="NetIPAM">',
        '<meta name="apple-mobile-web-app-title" content="NetIPAM">\n    <link rel="manifest" href="/manifest.json" />'
    )

with open(filepath, 'w') as f:
    f.write(content)
print("index.html manifest re-added.")
