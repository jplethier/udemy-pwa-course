self.addEventListener('install', function(event) {
  // console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open('static')
      .then(function(cache) {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll([
          '/',
          '/index.html',
          '/src/js/app.js',
          '/src/js/feed.js',
          '/src/js/material.min.js',
          '/src/css/app.css',
          '/src/css/feed.css',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
        ])
      })
  )
});

self.addEventListener('activate', function(event) {
  // console.log('[Service Worker] Activating service worker ...', event);
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  console.log('[Service Worker] Fetching something ...', event);
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        console.log('Cache response: ', response);
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function(res) {
              return caches.open('dynamic')
                .then(function(cache) {
                  // response just can be used once, so it is important to use response.clone
                  cache.put(event.request.url, res.clone());
                  return res;
                })
            });
        }
      })
  );
});
