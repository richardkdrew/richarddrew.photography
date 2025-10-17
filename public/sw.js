/**
 * Service Worker for Richard Drew Photography Portfolio
 * Provides basic caching and offline functionality for PWA compliance
 */

const CACHE_NAME = 'richard-drew-photography-v2'
const CACHE_URLS = [
  '/',
  '/about.html',
  '/404.html',
  '/manifest.json',
  '/gallery-data.json',
  '/src/styles/design-system.css',
  '/src/styles/fonts.css',
  '/fonts/BebasNeue-Regular.ttf',
  '/images/branding/icon-192.png',
  '/images/branding/icon-512.png',
  '/images/branding/apple-touch-icon.png',
  '/images/branding/favicon.ico'
]

// Install event - cache essential resources
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...')

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching essential resources')
        return cache.addAll(CACHE_URLS)
      })
      .then(() => {
        console.log('[SW] Installation complete')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('[SW] Installation failed:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('[SW] Activation complete')
        return self.clients.claim()
      })
      .catch(error => {
        console.error('[SW] Activation failed:', error)
      })
  )
})

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Skip navigation requests to avoid Safari redirect errors
  // Let the browser handle page navigation naturally
  if (event.request.mode === 'navigate') {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', event.request.url)
          return cachedResponse
        }

        console.log('[SW] Fetching from network:', event.request.url)
        return fetch(event.request)
          .then(response => {
            // Don't cache failed responses
            if (!response.ok) {
              return response
            }

            // Clone response for caching
            const responseClone = response.clone()

            // Cache successful responses for future use
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseClone)
              })
              .catch(error => {
                console.warn('[SW] Failed to cache response:', error)
              })

            return response
          })
          .catch(error => {
            console.error('[SW] Network fetch failed:', error)

            // Return offline fallback for HTML pages
            if (event.request.destination === 'document') {
              return new Response(
                `<!DOCTYPE html>
                <html>
                <head>
                  <title>Offline - Richard Drew Photography</title>
                  <style>
                    body { font-family: sans-serif; text-align: center; padding: 2rem; }
                    h1 { color: #2C2C2C; }
                  </style>
                </head>
                <body>
                  <h1>You're offline</h1>
                  <p>This page isn't available offline. Please check your connection.</p>
                </body>
                </html>`,
                {
                  headers: { 'Content-Type': 'text/html' }
                }
              )
            }

            throw error
          })
      })
      .catch(error => {
        console.error('[SW] Request handling failed:', error)
        throw error
      })
  )
})