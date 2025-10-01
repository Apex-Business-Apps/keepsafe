// KeepSafe Service Worker
const CACHE_NAME = 'keepsafe-v1';
const API_CACHE_NAME = 'keepsafe-api-v1';

// Cache static assets
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - network first for API, cache first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests (network first, cache fallback)
  // Check if request is to API server (different origin with port 8080)
  const isApiRequest = url.pathname.startsWith('/api/') || 
                       (url.hostname === 'localhost' && url.port === '8080') ||
                       url.pathname === '/health' ||
                       url.pathname === '/items' ||
                       url.pathname.startsWith('/items/');
  
  if (isApiRequest) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET requests for items
          if (request.method === 'GET' && url.pathname === '/items') {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if network fails
          if (request.method === 'GET') {
            return caches.match(request);
          }
          // For non-GET requests, return a custom offline response
          return new Response(
            JSON.stringify({ error: 'Offline - please try again when connected' }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }
  
  // Handle static assets (cache first, network fallback)
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then((response) => {
            // Cache successful responses for static assets
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          });
      })
  );
});

// Handle background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-items') {
    event.waitUntil(syncItems());
  }
});

async function syncItems() {
  // Future: Handle offline item creation/updates
  console.log('Service Worker: Syncing items...');
}

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received');
  
  const options = {
    body: 'You have new recall alerts!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'recall-alert',
    actions: [
      {
        action: 'view',
        title: 'View Items'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('KeepSafe Alert', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
