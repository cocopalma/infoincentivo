const CACHE = 'infoincentivo-v1';
const FICHEIROS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHEIROS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// rede primeiro (para apanhar versões novas), cache quando offline
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // JSONP do Apps Script segue direto à rede
  e.respondWith(
    fetch(e.request).then(r => {
      const cl = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, cl));
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match('./index.html')))
  );
});
