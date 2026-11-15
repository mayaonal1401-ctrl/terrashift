// TerraShift AI · çevrimdışı önbellek
const CACHE = "terrashift-v2";
const CORE = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // Canlı NASA verisi: her zaman ağdan (uygulama kendi önbelleğini zaten tutuyor)
  if (u.hostname.includes("power.larc.nasa.gov")) return;
  // Kütüphaneler, yazı tipleri, uydu görüntüleri: önce önbellek, yoksa ağ ve önbelleğe al
  if (u.origin !== location.origin) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return res; }).catch(() => r)));
    return;
  }
  // Uygulamanın kendi dosyaları: önce ağ (güncel kalsın), yoksa önbellek
  e.respondWith(fetch(e.request).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return res; }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
});
