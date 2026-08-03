const CACHE = 'saju-app-shell-v9';
const ASSETS = ['./', './index.html', './annual/client.mjs', './annual/storage.mjs', './manifest.webmanifest', './icon.svg'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(
  caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key.startsWith('saju-app-shell-') && key !== CACHE).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()),
));
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate' || event.request.url.endsWith('/index.html')) {
    event.respondWith(fetch(event.request)
      .then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response; })
      .catch(async () => (await caches.match(event.request)) || (await caches.match('./index.html')) || caches.match('./')));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
