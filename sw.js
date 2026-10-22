// EX-ME service worker — เปิดแอปจากแคชทันที แล้วค่อยอัปเดตเบื้องหลัง
// แก้โค้ดเมื่อไหร่ ให้เปลี่ยนเลขเวอร์ชันตรงนี้ (v1 → v2) เพื่อให้มือถือรับของใหม่
const V = 'exme-v4';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png', './inter.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // API ไม่ผ่านแคช
  e.respondWith(
    caches.open(V).then(async cache => {
      const hit = await cache.match(req, { ignoreSearch: true });
      const net = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })
  );
});
