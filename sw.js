/* Étrend – service worker
   App shell: network-first, cache fallbackkel (offline is működik).
   A week.json-t SOHA nem cache-eli – mindig a hálózatról jön. */
const CACHE = 'etrend-shell-v2';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(u => c.add(new Request(u, {cache: 'reload'})).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('etrend-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // külső linkek: nem nyúlunk hozzá
  if (url.pathname.endsWith('/week.json') || url.pathname.endsWith('week.json')) return; // mindig hálózat, nincs cache

  event.respondWith((async () => {
    try {
      const res = await fetch(req, {cache: 'no-cache'});
      if (res && res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    } catch (err) {
      const hit = await caches.match(req, {ignoreSearch: true});
      if (hit) return hit;
      if (req.mode === 'navigate') {
        const shell = (await caches.match('./index.html')) || (await caches.match('./'));
        if (shell) return shell;
      }
      return new Response('Offline', {status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}});
    }
  })());
});
