import os

filepath = 'src/components/UsersView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

if "Download" not in content:
    content = content.replace("  RefreshCw\n} from 'lucide-react';", "  RefreshCw,\n  Download\n} from 'lucide-react';")

pwa_handler = """  const handleInstallPWA = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) {
      alert("Browser Anda tidak mendukung instalasi PWA atau aplikasi sudah diinstal/tidak memenuhi syarat.");
      return;
    }
    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    if (result.outcome === 'accepted') {
      (window as any).deferredPrompt = null;
    }
  };

"""

if "const handleInstallPWA" not in content:
    content = content.replace("  const generateMagicToken = () => {", pwa_handler + "  const generateMagicToken = () => {")


pwa_ui = """          {/* Magic Link Section */}"""

new_pwa_ui = """          {/* PWA Install Section */}
          <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl border border-blue-500 shadow-lg text-white space-y-4 relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Instal Aplikasi (PWA)</h4>
                  <p className="text-[11px] text-blue-100 max-w-sm">Jadikan sistem ini sebagai aplikasi desktop/mobile independen di perangkat Anda untuk akses cepat dan layar penuh.</p>
                </div>
              </div>
              <button
                onClick={handleInstallPWA}
                className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer w-full sm:w-auto flex-shrink-0"
              >
                Instal Sekarang
              </button>
            </div>
            {/* Decorative background shapes */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </div>

          {/* Magic Link Section */}"""

content = content.replace(pwa_ui, new_pwa_ui)

with open(filepath, 'w') as f:
    f.write(content)
print("UsersView.tsx patched for PWA.")
