const CACHE_NAME = 'hospital-form-dynamic-v1';
const BASE = 'https://karimhany1984.github.io/hospital-form/';

// Files that MUST be available offline immediately
const PRE_CACHE_ASSETS = [
    BASE + '1.html',
    BASE + 'manifest.json',
    BASE + 'icon.png'
];

// Install: Only cache the essentials
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(PRE_CACHE_ASSETS))
    );
    self.skipWaiting();
});

// Activate: Clean up old versions if you ever DO change the version name
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        ))
    );
    self.clients.claim();
});

// Fetch: Network First, then Cache
// This ensures they get the LATEST version if online, 
// but the app still works perfectly if they are offline.
self.addEventListener('fetch', e => {
    // Skip non-GET requests (like POSTs)
    if (e.request.method !== 'GET') return;

    e.respondWith(
        fetch(e.request)
            .then(networkResponse => {
                // If we have internet, clone the response and update the cache
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(e.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // If offline, look for the file in the cache
                return caches.match(e.request).then(cachedResponse => {
                    if (cachedResponse) return cachedResponse;

                    // If the specific page isn't found (like a broken link), 
                    // default to the main form form
                    if (e.request.mode === 'navigate') {
                        return caches.match(BASE + '1.html');
                    }
                });
            })
    );
});