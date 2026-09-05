import os
import re

filepath = 'src/components/UsersView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add import Swal
if "import Swal from 'sweetalert2';" not in content:
    content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport Swal from 'sweetalert2';")

old_handler = """  const handleInstallPWA = async () => {
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
  };"""

new_handler = """  const handleInstallPWA = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) {
      const isIos = /ipad|iphone|ipod|macintosh/.test(navigator.userAgent.toLowerCase());
      const isAndroid = /android/.test(navigator.userAgent.toLowerCase());

      let htmlContent = '';
      if (isIos) {
        htmlContent = `
          <div class="text-sm text-slate-600 dark:text-slate-300 text-left space-y-3">
            <p>Perangkat <b>Apple (iPhone/iPad/Mac)</b> memerlukan langkah manual untuk instalasi:</p>
            <ol class="list-decimal pl-5 space-y-2">
              <li>Ketuk ikon <b>Bagikan (Share)</b> <svg class="inline w-4 h-4 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg> di menu Safari bagian bawah atau atas.</li>
              <li>Gulir ke bawah dan ketuk opsi <b>Tambah ke Layar Utama (Add to Home Screen)</b> <svg class="inline w-4 h-4 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>.</li>
              <li>Ketuk <b>Tambah (Add)</b> di sudut kanan atas.</li>
            </ol>
          </div>
        `;
      } else if (isAndroid) {
        htmlContent = `
          <div class="text-sm text-slate-600 dark:text-slate-300 text-left space-y-3">
            <p>Sepertinya aplikasi sudah terinstal, atau peramban Chrome/Android Anda memblokir *popup*. Lakukan langkah manual ini:</p>
            <ol class="list-decimal pl-5 space-y-2">
              <li>Ketuk menu <b>Titik Tiga</b> di pojok kanan atas layar peramban Anda.</li>
              <li>Pilih menu <b>Tambahkan ke Layar Utama (Add to Home screen)</b> atau <b>Instal Aplikasi</b>.</li>
            </ol>
          </div>
        `;
      } else {
        htmlContent = `
          <div class="text-sm text-slate-600 dark:text-slate-300 text-left space-y-3">
            <p>Sepertinya aplikasi sudah terinstal di PC Anda, atau peramban (browser) tidak menampilkan *prompt*.</p>
            <ol class="list-decimal pl-5 space-y-2">
              <li>Periksa <b>Bilah Alamat (Address Bar)</b> di Chrome/Edge bagian kanan.</li>
              <li>Cari ikon "Layar Komputer dengan tanda Plus" atau panah ke bawah, lalu klik untuk menginstal.</li>
              <li>Atau buka menu titik tiga browser dan cari opsi <b>Install app / Install NetIPAM</b>.</li>
            </ol>
          </div>
        `;
      }

      Swal.fire({
        title: 'Petunjuk Instalasi',
        html: htmlContent,
        icon: 'info',
        confirmButtonText: 'Saya Mengerti',
        confirmButtonColor: '#2563eb',
        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a'
      });
      return;
    }
    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    if (result.outcome === 'accepted') {
      (window as any).deferredPrompt = null;
    }
  };"""

content = content.replace(old_handler, new_handler)

with open(filepath, 'w') as f:
    f.write(content)
print("UsersView.tsx PWA swal patched.")
