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
