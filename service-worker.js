const CACHE_NAME = 'daliya-clinic-v1.3';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './drugs.html',
  './drugs.css',
  './drugs.js',
  './manifest.json',
  'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js'
];

// Install event - cache all essential files
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('All resources cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests and Firebase Realtime Database requests
  if (event.request.method !== 'GET' || 
      event.request.url.includes('firebasedatabase.app') ||
      event.request.url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then(fetchResponse => {
            // Check if we received a valid response
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Clone the response
            const responseToCache = fetchResponse.clone();

            // Add to cache for future visits
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return fetchResponse;
          })
          .catch(error => {
            console.log('Fetch failed; returning offline page:', error);
            // If both cache and network fail, show a generic offline message
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
          });
      })
  );
});
