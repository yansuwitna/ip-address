import React, { useState, useEffect } from 'react';
import { Menu, Globe, Sun, Moon, Download, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface HeaderProps {
  onToggleSidebar?: () => void;
  title?: string;
  onViewHome?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  showInstallPwa?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  title = 'Dashboard', 
  onViewHome,
  theme = 'light',
  onToggleTheme,
  showInstallPwa = false
}) => {
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    if ((window as any).deferredPrompt) {
      setIsInstallable(true);
    }

    const handleInstallable = () => setIsInstallable(true);
    const handleInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        (window as any).deferredPrompt = null;
        setIsInstallable(false);
        setIsInstalled(true);
      }
    } else {
      Swal.fire({
        title: 'Instal Aplikasi NetIPAM (PWA)',
        html: `
          <div class="text-xs text-left space-y-2.5 text-slate-600 dark:text-slate-300">
            <p>Untuk menginstal NetIPAM sebagai aplikasi desktop di komputer Anda:</p>
            <ol class="list-decimal pl-5 space-y-1.5 font-medium">
              <li>Periksa <b>Bilah Alamat (Address Bar)</b> di peramban Chrome/Edge/Brave sebelah kanan.</li>
              <li>Klik ikon <b>Komputer dengan tanda panah ke bawah/plus</b> atau <b>Instal NetIPAM</b>.</li>
              <li>Atau klik menu <b>Titik Tiga</b> browser &rarr; <b>Simpan & Bagikan / Pasang NetIPAM</b>.</li>
            </ol>
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Saya Mengerti',
        confirmButtonColor: '#2563eb',
        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a'
      });
    }
  };

  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-30 font-poppins flex-shrink-0">
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer lg:hidden"
            title="Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-slate-100 tracking-tight leading-none truncate max-w-[130px] sm:max-w-none">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Tombol Install PWA Aktif Khusus di Halaman Pengguna */}
        {showInstallPwa && !isInstalled && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer animate-pulse"
            title="Instal NetIPAM ke Desktop / PC"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="inline">Instal Aplikasi</span>
          </button>
        )}

        {showInstallPwa && isInstalled && (
          <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terinstal</span>
          </span>
        )}

        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            title={`Ganti tema (${theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'})`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Mode Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span className="hidden sm:inline">Mode Gelap</span>
              </>
            )}
          </button>
        )}

        {onViewHome && (
          <button
            onClick={onViewHome}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Lihat Halaman Depan (Home)</span>
          </button>
        )}
      </div>
    </header>
  );
};
