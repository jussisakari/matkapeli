// sw.js – the service worker: keeps the game on the tablet so it works offline
// (installed from the browser with "Add to Home screen").
// Network first: when online you always get the newest version from GitHub,
// and it is saved; without a network the saved copy is used.
const CACHE = 'matkapeli-v3';
const FILES = [
    './',
    './index.html',
    './style.css',
    './manifest.webmanifest',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/apple-touch-icon.png',
    './js/engine.js',
    './js/lib/three.min.js',
    './js/main.js',
    './js/player.js',
    './js/pet.js',
    './js/photos.js',
    './js/passport.js',
    './js/scenes/airport.js',
    './js/scenes/books.js',
    './js/scenes/album.js',
    './js/scenes/passport.js',
    './js/scenes/concert.js',
    './js/scenes/breakfast.js',
    './js/scenes/baking.js',
    './js/scenes/party.js',
    './js/scenes/memory.js',
    './js/scenes/drums.js',
    './js/scenes/brush.js',
    './js/scenes/egypt.js',
    './js/scenes/flight.js',
    './js/scenes/gallery.js',
    './js/scenes/hairbrush.js',
    './js/scenes/home.js',
    './js/scenes/hotel.js',
    './js/scenes/newyork.js',
    './js/scenes/grandparents.js',
    './js/scenes/hq.js',
    './js/scenes/pyramid.js',
    './js/scenes/labyrinth.js',
    './js/scenes/start.js',
    './js/scenes/street.js',
    './js/scenes/swim.js',
    './js/scenes/garden.js',
    './js/scenes/helsinki.js',
    './js/scenes/school.js',
    './js/scenes/drive.js',
    './js/scenes/thailand.js',
    './js/scenes/temple.js',
    './js/scenes/themepark.js',
    './js/scenes/wardrobe.js',
    './js/scenes/winter.js',
    './js/scenes/igloo.js',
    './js/sprites.js',
    './js/tvshow.js',
    './js/maskedsinger.js',
    './js/tvchannels.js',
    './js/world3d.js',
    './js/country3d.js',
    './js/scenes/australia.js',
    './js/scenes/japan.js',
    './js/scenes/belgium.js',
    './js/scenes/china.js',
    './js/scenes/france.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html')))
  );
});
