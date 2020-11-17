var dbPromise = idb.openDB('posts-store', 2, {
  upgrade(db, oldVersion, newVersion, transaction) {
    db.createObjectStore('posts', { keyPath: 'id' });
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
