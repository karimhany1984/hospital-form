// 1. Simply update this string whenever you make changes to 1.html
const CACHE_NAME = 'cache-V1';

const BASE = 'https://karimhany1984.github.io/hospital-form/';
const FILES_TO_CACHE = [
    BASE + '1.html',
    BASE + 'manifest.json',
    BASE + 'icon.png'
];

// Install Event: Creates the new cache
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching new assets');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Event: THE KEY STEP
// This automatically deletes any old caches that don't match the current CACHE_NAME
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(oldCache => {
                    if (oldCache !== CACHE_NAME) {
                        console.log('Clearing old cache:', oldCache);
                        return caches.delete(oldCache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event: Serve from cache, fallback to network
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request).catch(() => {
                // Specifically return the main HTML if offline and page not found
                return caches.match(BASE + '1.html');
            });
        })
    );
});