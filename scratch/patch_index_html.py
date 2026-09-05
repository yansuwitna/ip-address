import os

filepath = 'index.html'
with open(filepath, 'r') as f:
    content = f.read()

if '<link rel="manifest"' not in content:
    content = content.replace(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <link rel="manifest" href="/manifest.json" />\n    <meta name="theme-color" content="#2563eb" />'
    )

if 'navigator.serviceWorker' not in content:
    content = content.replace(
        '  </body>\n</html>',
        '    <script>\n      if ("serviceWorker" in navigator) {\n        window.addEventListener("load", () => {\n          navigator.serviceWorker.register("/sw.js");\n        });\n      }\n    </script>\n  </body>\n</html>'
    )

with open(filepath, 'w') as f:
    f.write(content)
print("index.html patched.")
