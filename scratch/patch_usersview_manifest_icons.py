import os

filepath = 'src/components/UsersView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace(
    '          { src: "/logo192.png", type: "image/png", sizes: "192x192" },\n          { src: "/logo512.png", type: "image/png", sizes: "512x512" }',
    '          { src: "/logo.svg", type: "image/svg+xml", sizes: "192x192" },\n          { src: "/logo.svg", type: "image/svg+xml", sizes: "512x512" }'
)

with open(filepath, 'w') as f:
    f.write(content)
print("UsersView.tsx icons patched.")
