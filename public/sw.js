// Minimal service worker — exists mainly to satisfy PWA installability
// (Chrome/Android require a registered SW with a fetch handler for the
// install prompt). Network-first, falling back to cache for repeat GETs;
// no full offline app shell — this app is inherently data-driven (bookings,
// admin panel), so aggressive offline caching would risk showing stale
// availability/pricing rather than a real benefit.
const CACHE_NAME = "laseria-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
