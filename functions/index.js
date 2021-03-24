var functions = require("firebase-functions");
var admin = require("firebase-admin");
var cors = require("cors");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.storePostData = functions.https.onRequest(function(request, response) {
  functions.logger.info("Receiving request", { structuredData: true, body: request.body });
  cors(function(request, response) {
    admin.database().ref("posts").push({
      id: request.body.id,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image
    }).then(function() {
      response.status(201).json({ message: "Data stored", id: request.body.id });
    }).catch(function(err) {
      response.status(500).json({ error: error });
    })
  })
});
