/* Service worker: caches the portfolio so it can load from cache if the origin is slow or down */
const CACHE = 'portfolio-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || e.request.url.startsWith('chrome-extension')) return
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone()
        if (res.ok && (res.type === 'basic' || res.type === 'cors'))
          caches.open(CACHE).then((c) => c.put(e.request, clone))
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
