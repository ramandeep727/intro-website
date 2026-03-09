const CACHE_NAME = "datesheet-cache-v1";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        "/datesheet/login.html",
        "/datesheet/index.html",
        "/datesheet/script.js",
        "/datesheet/style.css"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});