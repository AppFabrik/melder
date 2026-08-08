const CACHE_NAME = 'mangelmelder-cache-v2';

// Alle Dateien, die für den Offline-Betrieb geladen werden müssen
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './background.png'
];

// Service Worker installieren und Dateien in den Cache laden
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Alten Cache löschen, wenn eine neue Version aktiviert wird
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Alten Cache gelöscht:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Anfragen abfangen und wenn möglich aus dem Cache beantworten (Offline-Modus)
self.addEventListener('fetch', (event) => {
  // Nur GET-Anfragen cachen (wichtig, da Formular-Submits sonst Fehler erzeugen)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request);
      })
  );
});
