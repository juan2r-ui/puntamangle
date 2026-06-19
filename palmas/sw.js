/* Service worker — Calculadora de Palmas (Finca Burica)
   Hace que la app funcione sin internet una vez abierta.
   IMPORTANTE: si actualizás index.html, subí también este archivo
   cambiando la versión de abajo (palmas-v1 -> palmas-v2, etc.)
   para que los celulares descarguen la versión nueva. */
const CACHE = 'palmas-v3';
const ASSETS = ['./', './index.html'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit =>
      hit || fetch(e.request).then(resp => {
        try {
          const u = new URL(e.request.url);
          if (u.origin === location.origin && resp && resp.status === 200) {
            const copy = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
        } catch (_) {}
        return resp;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
