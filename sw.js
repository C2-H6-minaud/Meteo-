
const CACHE_NAME = 'meteo-v2'; // <--- On change le nom ici
const ASSETS = [
  './',
  './index.html',
  './forecast.html',
  './style.css',
  './script.js',
  './forecast.js',
  './manifest.json',
  './logo-85.png' // Assure-toi que le logo est bien dans la liste !
];

// ... reste du code ...
// Installation du Service Worker et mise en cache des fichiers
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Stratégie de fetch (permet de fonctionner hors-ligne)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );

});
