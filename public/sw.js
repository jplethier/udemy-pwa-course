var CACHE_STATIC_NAME = 'static-v9';
var CACHE_DYNAMIC_NAME = 'dynamic-v3';
var STATIC_FILES = [
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
  '/offline.html'
];

self.addEventListener('install', function(event) {
  // console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll(STATIC_FILES)
      })
  )
});

self.addEventListener('activate', function(event) {
  // console.log('[Service Worker] Activating service worker ...', event);
  event.waitUntil(
    caches.keys()
      .then(function(keysList) {
        return Promise.all(keysList.map(function(key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            // console.log('removing old cache: ', key);
            caches.delete(key);
          }
        }))
      })
  )
  return self.clients.claim();
});

function isInArray(string, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == string) { return true; }
  }

  return false;
}

// Cache, then network strategy, used only for server requests, not for static files
self.addEventListener('fetch', function(event) {
  var url = 'https://httpbin.org/get';

  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      fetch(event.request)
        .then(function(res) {
          return caches.open(CACHE_DYNAMIC_NAME)
            .then(function(cache) {
              // response just can be used once, so it is important to use response.clone
              cache.put(event.request.url, res.clone());
              return res;
            })
        })
    )
  // using cache only strategy for static files
  } else if (isInArray(request.event.url, STATIC_FILES)) {
    event.respondWith(
      caches.match(event.request)
    )
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // console.log('Cache response: ', response);
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(function(res) {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(function(cache) {
                    // response just can be used once, so it is important to use response.clone
                    cache.put(event.request.url, res.clone());
                    return res;
                  })
              })
              .catch(function(err) {
                if (event.request.url.indexOf('/help')) {
                  return caches.open(CACHE_STATIC_NAME)
                    .then(function(cache) {
                      return cache.match('/offline.html')
                    })
                }
              })
          }
        })
    )
  }
})
