// InfoIncentivo — service worker v2 (18/10/2026)
// A aplicação já não traz dados de produtores. Ao activar, apaga todas as caches
// antigas (a v1 guardava o index.html com os dados de todos os produtores).
const CACHE = 'infoincentivo-v2';
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
  if (url.origin !== location.origin) return; // pedidos ao Apps Script seguem direto à rede e nunca são guardados
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.status === 200 && !url.search.includes('versao=')) {
        const cl = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, cl)).catch(() => {});
      }
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match('./index.html')))
  );
});
