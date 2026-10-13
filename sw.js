// 一度開いたら、電波が悪くても再生できるように取っておく（2026-10-13）。ページと pub.json は新しい版を先に、つながらなければ取っておいたもの
const C = "ac-v2";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(["./", "pub.json", "countries-110m.json", "icon-192.png"])).catch(() => {})); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url); if (/goatcounter\.com$|^gc\.zgo\.at$/.test(u.hostname)) return;
  const net = () => fetch(r).then(res => { if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); } return res; });
  const fresh = u.origin === location.origin && (r.mode === "navigate" || u.pathname.endsWith("/") || u.pathname.endsWith(".html") || u.pathname.endsWith("pub.json"));
  e.respondWith(fresh ? net().catch(() => caches.match(r, { ignoreSearch: true }).then(c => c || caches.match("./")))
                      : caches.match(r).then(c => c || net()));
});
