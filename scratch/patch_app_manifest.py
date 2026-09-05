import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

global_manifest_effect = """
  // Update manifest dynamically for PWA shortcut URL globally
  useEffect(() => {
    if (currentUser?.magicToken) {
      const manifest = {
        name: "IP & DNS Manager",
        short_name: "NetIPAM",
        description: "Sistem Manajemen Alamat IP dan DNS Terintegrasi",
        start_url: `/?token=${currentUser.magicToken}`,
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2563eb",
        icons: [
          { src: "/favicon.ico", sizes: "64x64 32x32 24x24 16x16", type: "image/x-icon" },
          { src: "/logo.svg", type: "image/svg+xml", sizes: "192x192" },
          { src: "/logo.svg", type: "image/svg+xml", sizes: "512x512" }
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
  }, [currentUser?.magicToken]);

"""

if "Update manifest dynamically for PWA shortcut URL globally" not in content:
    content = content.replace("  const handleToggleTheme = () => {", global_manifest_effect + "  const handleToggleTheme = () => {")

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx global manifest patched.")
