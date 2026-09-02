const CACHE_NAME = 'cliofera-v6';
const APP_SHELL = [
  './',
  './index.html',
  './data.json',
  './extra-courses.json',
  './extra-courses-review.json',
  './literature.json',
  './literature-greece.json',
  './literature-review.json',
  './media.json',
  './timeline.json',
  './content.json',
  './content/year-1.json',
  './content/year-2.json',
  './content/year-3.json',
  './content/year-4.json',
  './content/extension-a.json',
  './content/extension-b.json',
  './content/extension-c1.json',
  './content/extension-c2.json',
  './content/greece-expansion.json',
  './manifest.webmanifest',
  './assets/styles.css',
  './assets/course-content.css',
  './assets/course-content-v2.css',
  './assets/brand.css',
  './assets/theme.css',
  './assets/media-timeline.css',
  './assets/app.js',
  './assets/theme.js',
  './assets/greece-enhancement.js',
  './assets/curriculum-review.js',
  './icons/cliofera-mark.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});
