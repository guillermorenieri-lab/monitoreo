// Guarda la app en el celular para que abra sin señal.
// Al abrir, responde con lo guardado y busca la versión nueva por detrás:
// los cambios subidos a GitHub se ven la siguiente vez que se abre la app.
const CACHE = 'monitoreo-v2';
const ARCHIVOS = [
  './', 'index.html', 'config.js', 'manifest.webmanifest',
  'vendor/leaflet.js', 'vendor/leaflet.css', 'vendor/fonts.css',
  'vendor/images/layers.png', 'vendor/images/layers-2x.png',
  'fonts/barlow-400.woff2', 'fonts/barlow-500.woff2', 'fonts/barlow-600.woff2', 'fonts/barlow-700.woff2',
  'fonts/barlow-sc-500.woff2', 'fonts/barlow-sc-600.woff2', 'fonts/barlow-sc-700.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const clave = req.mode === 'navigate' ? 'index.html' : req;
  e.respondWith(caches.open(CACHE).then(async c => {
    const guardado = await c.match(clave, { ignoreSearch: req.mode === 'navigate' });
    const red = fetch(req, { cache: 'no-cache' }).then(res => {
      if (res.ok) c.put(clave, res.clone());
      return res;
    });
    if (guardado) { e.waitUntil(red.catch(() => {})); return guardado; }
    return red;
  }));
});
