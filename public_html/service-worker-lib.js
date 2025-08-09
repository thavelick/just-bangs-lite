const STATIC_CACHE_NAME = "just-bangs-static-v11";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./search.js",
  "./main.js",
  "./style.css",
  "./manifest.json",
  "./icon.svg",
  "./service-worker.js",
  "./service-worker-lib.js",
];

async function installHandler(caches, self) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    await cache.addAll(STATIC_ASSETS);
    await self.skipWaiting();
  } catch (error) {
    console.error("Service Worker: Failed to cache static assets", error);
  }
}

async function activateHandler(caches, self) {
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

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    installHandler,
    activateHandler,
    STATIC_CACHE_NAME,
    STATIC_ASSETS,
  };
}
