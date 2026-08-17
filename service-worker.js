const CACHE = 'saju-app-shell-v24';
const ASSETS = ['./', './index.html', './privacy.html', './terms.html', './fonts/noto-sans-kr-5.3.0/400.css', './annual/client.mjs', './annual/storage.mjs', './chart/natal-engine.mjs', './chart/natal-ephemeris-data.mjs', './chart/daewoon-engine.mjs', './chart/daewoon-branch-analysis.mjs', './server/domain/daewoon-domains.mjs', './server/domain/daily-reading-selection.mjs', './server/domain/natal-chapter-selection.mjs', './server/storage/seeds/daily-readings.mjs', './server/storage/seeds/natal-chapters.mjs', './web/consent-gate.mjs', './web/loading-narrative.mjs', './web/result-packaging.mjs', './web/daily-reading.mjs', './manifest.webmanifest', './icon.svg'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(
  caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key.startsWith('saju-app-shell-') && key !== CACHE).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()),
));
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && (url.pathname.startsWith('/auth/') || url.pathname.startsWith('/v1/'))) {
    event.respondWith(fetch(event.request));
    return;
  }
  if (url.origin === self.location.origin && url.pathname.startsWith('/fonts/noto-sans-kr-5.3.0/')) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); }
      return response;
    })));
    return;
  }
  if (event.request.mode === 'navigate' || event.request.url.endsWith('/index.html')) {
    event.respondWith(fetch(event.request)
      .then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response; })
      .catch(async () => (await caches.match(event.request)) || (await caches.match('./index.html')) || caches.match('./')));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
