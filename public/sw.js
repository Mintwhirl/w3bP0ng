// W3BP0NG Service Worker
// Advanced caching and performance optimization

const CACHE_NAME = 'w3bp0ng-v1';
const STATIC_CACHE = 'w3bp0ng-static-v1';
const RUNTIME_CACHE = 'w3bp0ng-runtime-v1';

// Assets to cache aggressively
const STATIC_ASSETS = [
  '/',
  '/w3bP0ng/',
  '/w3bP0ng/index.html',
  '/w3bP0ng/manifest.json'
];

// CDN asset patterns
const CDN_PATTERNS = [
  /\.css$/,
  /\.js$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.gif$/,
  /\.webp$/,
  /\.svg$/,
  /\.ico$/,
  /\.mp3$/,
  /\.wav$/,
  /\.ogg$/,
  /\.mp4$/,
  /\.webm$/
];

// Cache configuration
const CACHE_CONFIG = {
  static: {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    maxEntries: 100,
    strategy: 'cacheFirst'
  },
  cdn: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 200,
    strategy: 'staleWhileRevalidate'
  },
  api: {
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 50,
    strategy: 'networkFirst'
  }
};

// ══════════════════════════════════════════════════════════
// CACHE MANAGEMENT
// ════════════════════════════════════════════════════════

async function openCache(cacheName) {
  return await caches.open(cacheName);
}

async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name =>
    name !== CACHE_NAME &&
    name !== STATIC_CACHE &&
    name !== RUNTIME_CACHE
  );

  await Promise.all(
    oldCaches.map(name => caches.delete(name))
  );
}

async function trimCache(cache, maxSize = CACHE_CONFIG.cdn.maxEntries) {
  const keys = await cache.keys();
  if (keys.length <= maxSize) return;

  const entries = await Promise.all(
    keys.map(async (key) => {
      const response = await cache.match(key);
      return {
        key,
        timestamp: response?.headers?.get('date') ? Date.parse(response.headers.get('date')) : 0,
        size: response?.headers?.get('content-length') ? parseInt(response.headers.get('content-length')) : 0
      };
    })
  );

  // Sort by timestamp (oldest first) and remove excess
  entries.sort((a, b) => a.timestamp - b.timestamp);
  const keysToDelete = entries.slice(maxSize).map(entry => entry.key);

  await Promise.all(
    keysToDelete.map(key => cache.delete(key))
  );
}

// ════════════════════════════════════════════════════════
// NETWORK STRATEGIES
// ════════════════════════════════════════════════════════

async function cacheFirst(request, cacheConfig = CACHE_CONFIG.static) {
  const cache = await openCache(RUNTIME_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    // Update cache age in headers
    const response = cached.clone();
    response.headers.set('sw-cache-hit', 'true');
    response.headers.set('sw-cache-age', Math.floor((Date.now() - new Date(cached.headers.get('date')).getTime()) / 1000));
    return response;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      responseToCache.headers.set('date', new Date().toUTCString());

      await cache.put(request, responseToCache);
      await trimCache(cache);
    }

    return networkResponse;
  } catch (error) {
    console.warn('Network request failed:', error);
    return cached || new Response('Network error', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await openCache(RUNTIME_CACHE);
  const cached = await cache.match(request);

  // If cached, serve it and revalidate in background
  if (cached) {
    const response = cached.clone();
    response.headers.set('sw-cache-hit', 'true');

    // Revalidate in background
    fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        const responseToCache = networkResponse.clone();
        responseToCache.headers.set('date', new Date().toUTCString());
        cache.put(request, responseToCache);
      }
    }).catch(error => {
      console.warn('Background revalidation failed:', error);
    });

    return response;
  }

  // If not cached, fetch from network
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      responseToCache.headers.set('date', new Date().toUTCString());
      await cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    console.warn('Network request failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await openCache(RUNTIME_CACHE);
      const responseToCache = networkResponse.clone();
      responseToCache.headers.set('date', new Date().toUTCString());
      await cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    console.warn('Network request failed, trying cache:', error);

    const cache = await openCache(RUNTIME_CACHE);
    const cached = await cache.match(request);

    if (cached) {
      const response = cached.clone();
      response.headers.set('sw-cache-fallback', 'true');
      return response;
    }

    return new Response('Network error and no cache available', { status: 503 });
  }
}

// ════════════════════════════════════════════════════════
// REQUEST HANDLING
// ════════════════════════════════════════════════════════

function isStaticAsset(url) {
  return STATIC_ASSETS.includes(url.pathname) ||
         url.pathname.endsWith('.html') ||
         url.pathname.endsWith('.json');
}

function isCDNAsset(url) {
  return CDN_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function getCacheStrategy(url) {
  if (isStaticAsset(url)) {
    return CACHE_CONFIG.static.strategy;
  }

  if (isCDNAsset(url)) {
    return CACHE_CONFIG.cdn.strategy;
  }

  return CACHE_CONFIG.api.strategy;
}

async function handleRequest(event) {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and external resources
  if (request.method !== 'GET' ||
      url.origin !== self.location.origin) {
    return fetch(request);
  }

  const strategy = getCacheStrategy(url);

  switch (strategy) {
    case 'cacheFirst':
      return cacheFirst(request, CACHE_CONFIG.static);

    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request);

    case 'networkFirst':
      return networkFirst(request);

    default:
      return fetch(request);
  }
}

// ════════════════════════════════════════════════════════
// SERVICE WORKER LIFECYCLE
// ════════════════════════════════════════════════════════

self.addEventListener('install', (event) => {
  console.log('🚀 W3BP0NG Service Worker installing...');

  event.waitUntil(
    Promise.all([
      // Pre-cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_ASSETS);
      }),

      // Clean old caches
      cleanOldCaches()
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('🔄 W3BP0NG Service Worker activating...');

  event.waitUntil(
    Promise.all([
      cleanOldCaches(),
      clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activated successfully');
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ════════════════════════════════════════════════════════
// CACHE STATISTICS
// ══════════════════════════════════════════════════════

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_CACHE_STATS') {
    getCacheStats().then(stats => {
      event.ports[0].postMessage(stats);
    });
  }
});

async function getCacheStats() {
  const cache = await openCache(RUNTIME_CACHE);
  const keys = await cache.keys();
  const requests = await Promise.all(
    keys.map(async (key) => {
      const response = await cache.match(key);
      return {
        url: key.url,
        cached: !!response,
        size: response?.headers?.get('content-length') || 0,
        timestamp: response?.headers?.get('date') ? new Date(response.headers.get('date')).getTime() : 0
      };
    })
  );

  return {
    totalEntries: keys.length,
    totalSize: requests.reduce((sum, req) => sum + req.size, 0),
    oldestEntry: requests.reduce((oldest, req) => req.timestamp < oldest.timestamp ? req : oldest, { timestamp: Date.now() }),
    newestEntry: requests.reduce((newest, req) => req.timestamp > newest.timestamp ? req : newest, { timestamp: 0 }),
    strategy: getCacheStrategy(new URL(self.location.href))
  };
}