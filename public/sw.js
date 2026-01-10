// Service Worker for CalculatorHub PWA
// Provides offline caching with stale-while-revalidate strategy

const CACHE_NAME = 'calculatorhub-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/calculators',
    '/about',
    '/blog',
    '/contact',
    '/manifest.json',
    '/calculator.png',
];

// Calculator pages to cache for offline use
const CALCULATOR_PAGES = [
    '/calculators/mortgage',
    '/calculators/compound-interest',
    '/calculators/investment',
    '/calculators/401k',
    '/calculators/house-affordability',
    '/calculators/auto-loan',
    '/calculators/savings',
    '/calculators/debt-payoff',
    '/calculators/retirement',
    '/calculators/loan',
];

// Install event - cache static assets
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('[ServiceWorker] Caching static assets');
            return cache.addAll([...STATIC_ASSETS, ...CALCULATOR_PAGES]);
        })
    );
    // Activate immediately
    self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(function (cacheName) { return cacheName !== CACHE_NAME; })
                    .map(function (cacheName) { return caches.delete(cacheName); })
            );
        })
    );
    // Take control of all pages immediately
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function (event) {
    var request = event.request;
    var url = new URL(request.url);

    // Only handle same-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip API routes and Next.js internals
    if (url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/_next/') ||
        url.pathname.includes('__nextjs')) {
        return;
    }

    event.respondWith(
        caches.match(request).then(function (cachedResponse) {
            // Return cached response if available
            if (cachedResponse) {
                // Fetch in background to update cache
                event.waitUntil(
                    fetch(request).then(function (response) {
                        if (response.ok) {
                            caches.open(CACHE_NAME).then(function (cache) {
                                cache.put(request, response.clone());
                            });
                        }
                    }).catch(function () {
                        // Ignore network errors during background update
                    })
                );
                return cachedResponse;
            }

            // No cache, try network
            return fetch(request)
                .then(function (response) {
                    // Cache successful responses for calculator pages
                    if (response.ok && url.pathname.startsWith('/calculators')) {
                        var responseClone = response.clone();
                        caches.open(CACHE_NAME).then(function (cache) {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(function () {
                    // Network failed, return offline page for navigation requests
                    if (request.mode === 'navigate') {
                        return caches.match('/') || new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable',
                        });
                    }
                    return new Response('Network error', {
                        status: 503,
                        statusText: 'Service Unavailable',
                    });
                });
        })
    );
});

// Handle push notifications (for future use)
self.addEventListener('push', function (event) {
    var data = event.data ? event.data.json() : {};
    var title = data.title || 'CalculatorHub';
    var options = {
        body: data.body || 'New financial insights available!',
        icon: '/calculator.png',
        badge: '/calculator.png',
        tag: 'calculatorhub-notification',
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        self.clients.openWindow('/')
    );
});
