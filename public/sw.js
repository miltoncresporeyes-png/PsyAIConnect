/*
 * Service worker de PsyDoctor.
 * Regla de privacidad: NUNCA se guardan en caché respuestas de /api, páginas HTML
 * ni nada autenticado (son datos de salud). Solo recursos estáticos públicos y
 * la página sin conexión.
 */
const VERSION = 'v1'
const STATIC_CACHE = `psydoctor-static-${VERSION}`
const OFFLINE_URL = '/offline.html'
const PRECACHE = [OFFLINE_URL, '/icons/icon-192.png', '/icons/icon-512.png']
const STATIC_PREFIXES = ['/_next/static/', '/icons/', '/images/']

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((k) => k.startsWith('psydoctor-') && k !== STATIC_CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    )
})

self.addEventListener('fetch', (event) => {
    const request = event.request
    if (request.method !== 'GET') return
    const url = new URL(request.url)
    if (url.origin !== self.location.origin) return

    // Navegaciones: siempre red; si falla, página sin conexión (sin cachear HTML)
    if (request.mode === 'navigate') {
        event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)))
        return
    }

    // Solo estáticos públicos: cache primero
    if (STATIC_PREFIXES.some((p) => url.pathname.startsWith(p))) {
        event.respondWith(
            caches.match(request).then(
                (cached) =>
                    cached ||
                    fetch(request).then((response) => {
                        if (response.ok) {
                            const copy = response.clone()
                            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy))
                        }
                        return response
                    })
            )
        )
    }
    // Todo lo demás (incluye /api): sin intervención del service worker
})
