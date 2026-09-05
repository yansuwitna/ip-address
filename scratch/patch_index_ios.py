import os

filepath = 'index.html'
with open(filepath, 'r') as f:
    content = f.read()

ios_meta = """    <meta name="theme-color" content="#2563eb" />
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="NetIPAM">
    <link rel="apple-touch-icon" href="/logo192.png">"""

if "apple-mobile-web-app-capable" not in content:
    content = content.replace('<meta name="theme-color" content="#2563eb" />', ios_meta)

with open(filepath, 'w') as f:
    f.write(content)
print("index.html patched for iOS.")
