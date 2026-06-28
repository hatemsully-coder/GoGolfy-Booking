/* GoGolfy offline service worker — caches the app, Leaflet, and satellite tiles
   so the map and booking work offline after the first online visit. */
var VERSION = 'gogolfy-v1';
var CORE = [
  './',
  './index.html',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(VERSION).then(function (c) {
    // allSettled: a single failed asset must not abort the whole install
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

  // Always go to network for live/dynamic endpoints — never cache these.
  if (/ntfy\.sh|googleapis\.com|app\.n8n\.cloud|\/webhook\//.test(req.url)) return;

  var sameOrigin = url.origin === self.location.origin;
  var isTile = /arcgisonline\.com/.test(url.hostname) || (/\/tile\//.test(url.pathname));
  var isLeaflet = /unpkg\.com\/leaflet/.test(req.url);
  var isQr = /api\.qrserver\.com/.test(url.hostname);
  if (!(sameOrigin || isTile || isLeaflet || isQr)) return;

  // Cache-first (with background refresh) for the app shell, Leaflet, tiles, and QR images.
  e.respondWith(caches.open(VERSION).then(function (c) {
    return c.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) { try { c.put(req, res.clone()); } catch (_) {} }
        return res;
      }).catch(function () { return hit; });
      // Serve cached immediately if present; fall back to network; final fallback = app shell for navigations.
      return hit || net.then(function (r) { return r || (req.mode === 'navigate' ? c.match('./index.html') : undefined); });
    });
  }));
});
