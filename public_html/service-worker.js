importScripts("service-worker-lib.js");

self.addEventListener("install", (event) => {
  event.waitUntil(installHandler(caches, self));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(activateHandler(caches, self));
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
