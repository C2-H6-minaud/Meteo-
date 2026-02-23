const CACHE_NAME = 'meteo-v2';
const ASSETS = [
  './',
  './index.html',
  './forecast.html',
  './style.css',
  './script.js',
  './forecast.js',
  './manifest.json',
  './logo-85.png'
];

// 1. Installation : Met en cache les nouveaux fichiers
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  // Force le nouveau Service Worker à prendre la place de l'ancien immédiatement
  self.skipWaiting();
});

// 2. Activation : Supprime l'ancien cache (v1) automatiquement
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Permet au SW de contrôler la page dès maintenant sans attendre un rechargement
  return self.clients.claim();
});

// 3. Stratégie de Fetch : Sert le cache, puis le réseau
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
