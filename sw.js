const CACHE = 'meridian-v12';
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './images/hero.jpg', './images/session.jpg', './images/detail.jpg',
  './icon-180.png', './icon-192.png', './icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const isPage = req.mode === 'navigate' || req.destination === 'document' || req.url.endsWith('/index.html');

  if (isPage) {
    // Network-first for the app shell: always get the freshest version online,
    // fall back to cache when offline. (Fixes stale-update lag.)
    e.respondWith(
      fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy));
        return resp;
      }).catch(() => caches.match('./index.html').then(hit => hit || caches.match('./')))
    );
    return;
  }

  // Cache-first for static assets (images, icons, manifest) — fast + offline.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(resp => {
      if (resp.ok && req.url.startsWith(self.location.origin)) {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return resp;
    }).catch(() => hit))
  );
});
