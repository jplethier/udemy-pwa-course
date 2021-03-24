importScripts('https://unpkg.com/idb@5.0.7/build/iife/index-min.js');
importScripts('/src/js/utility.js');

var CACHE_STATIC_NAME = 'static-v22';
var CACHE_DYNAMIC_NAME = 'dynamic-v4';
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
  '/offline.html',
  'https://unpkg.com/idb@5.0.7/build/iife/index-min.js',
  '/src/js/utility.js'
];
var POSTS_URL = 'https://pwa-gram-49437.firebaseio.com/posts.json';
var SEND_POST_URL = 'https://us-central1-pwa-gram-49437.cloudfunctions.net/storePostData'

function trimCache(cacheName, maxItems) {
  caches.open(cacheName)
    .then(function(cache) {
      return cache.keys()
        .then(function(keys) {
          if (keys.length > maxItems) {
            cache.delete(keys[0])
              .then(trimCache(cacheName, maxItems));
          }
        });
    })
};

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
  var cachePath;
  if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1
}

// Cache, then network strategy, used only for server requests, not for static files
self.addEventListener('fetch', function(event) {
  if (event.request.url.indexOf(POSTS_URL) > -1) {
    event.respondWith(
      fetch(event.request)
        .then(function(res) {
          res.clone().json()
            .then(function(data) {
              clearData('posts');
              for (var key in data) {
                if (!!data[key]) {
                  writeData('posts', data[key]);
                }
              }
            })
          return res;
        })
    )
  // using cache only strategy for static files
  } else if (isInArray(event.request.url, STATIC_FILES)) {
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
                    trimCache(CACHE_DYNAMIC_NAME, 10);
                    // response just can be used once, so it is important to use response.clone
                    cache.put(event.request.url, res.clone());
                    return res;
                  })
              })
              .catch(function(err) {
                if (event.request.headers.get('accept').includes('text/html')) {
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

self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-new-post') {
    event.waitUntil(
      readAllData('new-posts').then(function(data) {
        for (var post of data) {
          sendData(SEND_POST_URL, post).then(function(res) {
            if (res.ok) {
              deleteItemFromData('new-posts', post.id); // Isn't working correctly
            }
          }).catch(function(err) {
            console.log('Error while sendint data: ', err);
          });
        }
      })
    );
  }
});
