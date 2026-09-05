import os
import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_effect = """  // Update manifest dynamically for PWA shortcut URL globally
  useEffect(() => {
    const manifest = {
      name: "IP & DNS Manager",
      short_name: "NetIPAM",
      description: "Sistem Manajemen Alamat IP dan DNS Terintegrasi",
      start_url: currentUser?.magicToken ? `/?token=${currentUser.magicToken}` : `/`,
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
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = url;
    
    // Invalidate deferredPrompt so Chrome re-evaluates the new manifest if token changes
    if ((window as any).deferredPrompt) {
      (window as any).deferredPrompt = null;
    }

    return () => URL.revokeObjectURL(url);
  }, [currentUser?.magicToken]);"""

new_effect = """  // Update manifest dynamically for PWA shortcut URL ONLY on Users tab
  useEffect(() => {
    let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    
    if (currentTab !== 'users') {
      if (link) link.remove();
      return;
    }

    const manifest = {
      name: "IP & DNS Manager",
      short_name: "NetIPAM",
      description: "Sistem Manajemen Alamat IP dan DNS Terintegrasi",
      start_url: currentUser?.magicToken ? `/?token=${currentUser.magicToken}` : `/`,
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
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = url;
    
    if ((window as any).deferredPrompt) {
      (window as any).deferredPrompt = null;
    }

    return () => URL.revokeObjectURL(url);
  }, [currentUser?.magicToken, currentTab]);"""

content = content.replace(old_effect, new_effect)

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx manifest tab condition patched.")
