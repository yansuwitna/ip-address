import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add a global to store the prompt
pwa_global = """
// Store PWA install prompt globally
window.deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
});

"""

if "window.deferredPrompt" not in content:
    content = content.replace("export default function App() {", pwa_global + "export default function App() {")

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx PWA global patched.")
