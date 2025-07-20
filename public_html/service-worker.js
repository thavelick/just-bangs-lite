const STATIC_CACHE_NAME = "just-bangs-static-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/search.js",
  "/main.js",
  "/style.css",
  "/manifest.json",
  "/icon.svg",
  "/service-worker.js",
];

async function installHandler() {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    await cache.addAll(STATIC_ASSETS);
    await self.skipWaiting();
  } catch (error) {
    console.error("Service Worker: Failed to cache static assets", error);
  }
}

async function activateHandler() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((cacheName) => {
      if (cacheName !== STATIC_CACHE_NAME) {
        return caches.delete(cacheName);
      }
    }),
  );
  await self.clients.claim();
}

self.addEventListener("install", (event) => {
  event.waitUntil(installHandler());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(activateHandler());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request);
    }),
  );
});
