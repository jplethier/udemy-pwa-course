var functions = require("firebase-functions");
var admin = require("firebase-admin");
var cors = require("cors")({origin: true});
var webpush = require("web-push");

var serviceAccount = require("./serviceAccountKey.json");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

admin.initializeApp({
  databaseURL: "https://pwa-gram-49437.firebaseio.com/",
  credential: admin.credential.cert(serviceAccount),
});

exports.storePostData = functions.https.onRequest(function(request, response) {
  cors(request, response, function() {
    admin.database().ref("posts").push({
      id: request.body.id,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image
    }).then(function() {
      webpush.setVapidDetails("mailto:email@mail.com", "BLTJtFlXGiLUWqoiPwJev_7FaZyWa1ibzI091bhhht7N7Jt8P-c90Y7UePlG_jU3dx2Lykm1vxASWms00phV-oU",  "8cm1OafvE9yo-uZEjowqYPM0T3SPI6mEWnIc18pIeoY");
      return admin.database().ref("subscriptions").once("value")
    }).then(function(subscriptions) {
      subscriptions.forEach(function(sub) {
        // var pushConfig = {
        //   endpoint: sub.val().endpoint,
        //   keys: {
        //     auth: sub.val().keys.auth,
        //     p256dh: sub.val().keys.p256dh,
        //   }
        // }
        var pushConfig = sub.val();

        webpush.sendNotification(pushConfig, JSON.stringify({title: "New post", content: request.body.title, image: request.body.image}))
          .catch(function(err) {
            console.log(err);
          })
      })
      response.status(201).json({ message: "Data stored", id: request.body.id });
    }).catch(function(err) {
      response.status(500).json({ error: error });
    })
  })
});
