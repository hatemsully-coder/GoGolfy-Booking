/* GoGolfy offline service worker.
   Strategy:
   - App shell / same-origin (index.html, etc.): NETWORK-FIRST so new deploys show immediately;
     falls back to cache when offline.
   - Map tiles, Leaflet, QR images: CACHE-FIRST (they don't change) so the map works offline
     after the first online view. */
var VERSION = 'gogolfy-v2';
var CORE = [
  './',
  './index.html',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return Promise.all(CORE.map(function (u) { return c.add(u).catch(function () {}); }));
  }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return k === VERSION ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (_) { return; }

  // Live/dynamic endpoints — always network, never cache.
  if (/ntfy\.sh|googleapis\.com|app\.n8n\.cloud|\/webhook\//.test(req.url)) return;

  var sameOrigin = url.origin === self.location.origin;
  var isTile = /arcgisonline\.com/.test(url.hostname) || (/\/tile\//.test(url.pathname));
  var isLeaflet = /unpkg\.com\/leaflet/.test(req.url);
  var isQr = /api\.qrserver\.com/.test(url.hostname);

  // Static map assets: cache-first (with lazy fill).
  if (isTile || isLeaflet || isQr) {
    e.respondWith(caches.open(VERSION).then(function (c) {
      return c.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) {
          if (res && (res.ok || res.type === 'opaque')) { try { c.put(req, res.clone()); } catch (_) {} }
          return res;
        });
      });
    }));
    return;
  }

  // App shell (same-origin): network-first, cache fallback when offline.
  if (sameOrigin) {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) { var clone = res.clone(); caches.open(VERSION).then(function (c) { try { c.put(req, clone); } catch (_) {} }); }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined);
        });
      })
    );
  }
});
