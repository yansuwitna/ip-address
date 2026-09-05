const CACHE_NAME = 'netipam-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return new Response('Sistem NetIPAM Offline. Hubungkan kembali ke jaringan.');
    })
  );
});
