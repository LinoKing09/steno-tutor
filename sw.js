// Service Worker: hält das Lernportal auch ohne Netzverbindung verfügbar.
const CACHE = 'kurzschrift-v1';
const FILES = [
  './', 'index.html', 'css/style.css', 'manifest.webmanifest',
  'img/icon.svg', 'img/icon-180.png', 'img/icon-192.png', 'img/icon-512.png',
  'js/app.js', 'js/ui.js', 'js/exercise.js', 'js/lessons.js', 'js/pad.js', 'js/recognizer.js', 'js/speech.js', 'js/store.js',
  'js/steno/geometry.js', 'js/steno/glyphs.js', 'js/steno/parser.js', 'js/steno/layout.js', 'js/steno/render.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

// Netz zuerst (damit Aktualisierungen ankommen), bei fehlender Verbindung aus dem Zwischenspeicher
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))),
  );
});
