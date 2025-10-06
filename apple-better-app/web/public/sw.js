// KeepSafe Service Worker - Production Grade with Offline Support
const CACHE_NAME = 'keepsafe-shell-v1';
const API_CACHE_NAME = 'keepsafe-api-v1';
const MAX_CACHED_ITEMS = 100;

// App shell assets to cache on install
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(APP_SHELL);
    }).then(() => {
      console.log('[ServiceWorker] Skip waiting');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// LRU cache management for items
async function maintainItemsCache() {
  const cache = await caches.open(API_CACHE_NAME);
  const keys = await cache.keys();
  
  // Find all /items responses
  const itemKeys = keys.filter(key => new URL(key.url).pathname === '/items');
  
  if (itemKeys.length > 1) {
    // Keep only the most recent /items cache entry
    const sortedKeys = itemKeys.sort((a, b) => {
      return b.url.localeCompare(a.url); // Simple timestamp-based sort
    });
    
    // Delete older entries
    for (let i = 1; i < sortedKeys.length; i++) {
      await cache.delete(sortedKeys[i]);
    }
  }
}

// Fetch event - Network first with offline fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests to /items
  if (url.pathname === '/items' && url.port === '8080') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            // Clone and cache the response
            const responseClone = response.clone();
            const cache = await caches.open(API_CACHE_NAME);
            await cache.put(request, responseClone);
            
            // Maintain LRU: keep only last 100 items
            await maintainItemsCache();
            
            console.log('[ServiceWorker] Cached /items response');
          }
          return response;
        })
        .catch(async () => {
          // Network failed: serve from cache (offline support)
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            console.log('[ServiceWorker] Serving /items from cache (offline)');
            return cachedResponse;
          }
          
          // No cache available
          return new Response(
            JSON.stringify({ error: 'Offline: no cached data available' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // Handle app shell and static assets - cache first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Not in cache: fetch from network
      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.ok && request.url.startsWith(self.location.origin)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Network failed and no cache
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[ServiceWorker] Loaded and ready');
