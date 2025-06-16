const CACHE_NAME = 'kmweb-cache-v1';
const urlsToCache = [
  '/',
  '/static/style.css',
  '/static/manifest.json',
  '/static/icon.png'
  // Adicione aqui outros arquivos essenciais se desejar
];

// Instala o service worker e faz cache dos arquivos essenciais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Ativa o novo service worker e remove caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Intercepta requisições e serve do cache se possível, senão busca e armazena no cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Se já está no cache, retorna
      if (response) {
        return response;
      }
      // Se não está, busca na rede e armazena no cache para uso futuro
      return fetch(event.request).then(networkResponse => {
        // Só faz cache de requisições GET e de sucesso
        if (
          event.request.method === 'GET' &&
          networkResponse &&
          networkResponse.status === 200 &&
          (event.request.url.includes('/static/') || event.request.url === location.origin + '/')
        ) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Opcional: retornar uma página offline personalizada se desejar
        // return caches.match('/offline.html');
      });
    })
  );
});