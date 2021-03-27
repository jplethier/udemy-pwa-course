var dbPromise = idb.openDB('posts-store', 2, {
  upgrade(db, oldVersion, newVersion, transaction) {
    db.createObjectStore('posts', { keyPath: 'id' });
    db.createObjectStore('new-posts', { keyPath: 'id' });
  }
});

function writeData(store, data) {
  return dbPromise
    .then(function(db) {
      return db.put(store, data)
    })
}

function readAllData(store) {
  return dbPromise
    .then(function(db) {
      return db.getAll(store)
        .then(function(data) {
          return data;
        })
    })
}

function clearData(store) {
  return dbPromise
    .then(function(db) {
      return db.clear(store)
        .then(function(data) {
          console.log(data);
          return data;
        });
    })
}

function deleteItemFromData(store, itemId) {
  return dbPromise
    .then(function(db) {
      return db.delete(store, itemId)
    })
}

function sendData(url, data) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data)
  })
}

function urlBase64toUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function getApplicationServerKey() {
  return urlBase64toUint8Array('BLTJtFlXGiLUWqoiPwJev_7FaZyWa1ibzI091bhhht7N7Jt8P-c90Y7UePlG_jU3dx2Lykm1vxASWms00phV-oU');
}
