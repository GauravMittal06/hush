const CACHE = 'hush-v1';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// Background sync for mute scheduling
self.addEventListener('sync', e => {
  if (e.tag === 'check-mute') {
    e.waitUntil(checkMuteSchedule());
  }
});

async function checkMuteSchedule() {
  const clients = await self.clients.matchAll();
  clients.forEach(c => c.postMessage({ type: 'TICK' }));
}
