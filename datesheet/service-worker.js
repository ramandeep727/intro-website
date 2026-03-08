self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("datesheet-cache").then(cache => {
      return cache.addAll([
        "/datesheet/login.html",
        "/datesheet/index.html"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});