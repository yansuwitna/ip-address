import os
import re

filepath = 'src/components/UsersView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add useEffect for dynamic manifest
effect_code = """
  // Update manifest dynamically for PWA shortcut URL
  React.useEffect(() => {
    if (singleUser?.magicToken) {
      const manifest = {
        name: "IP & DNS Manager",
        short_name: "NetIPAM",
        description: "Sistem Manajemen Alamat IP dan DNS Terintegrasi",
        start_url: `/?token=${singleUser.magicToken}`,
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2563eb",
        icons: [
          { src: "/favicon.ico", sizes: "64x64 32x32 24x24 16x16", type: "image/x-icon" },
          { src: "/logo192.png", type: "image/png", sizes: "192x192" },
          { src: "/logo512.png", type: "image/png", sizes: "512x512" }
        ]
      };
      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (link) {
        link.href = url;
      }
      return () => URL.revokeObjectURL(url);
    }
  }, [singleUser?.magicToken]);

"""

if "// Update manifest dynamically" not in content:
    content = content.replace("  const openEditModal = () => {", effect_code + "  const openEditModal = () => {")

with open(filepath, 'w') as f:
    f.write(content)
print("UsersView.tsx dynamic manifest patched.")
