var functions = require("firebase-functions");
var admin = require("firebase-admin");
var cors = require("cors")({origin: true});
var webpush = require("web-push");
var Busboy = require("busboy");
var fs = require("fs");
var UUID = require("uuid-v4");
var path = require("path");
var os = require("os");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./serviceAccountKey.json");

var gcconfig = {
  projectId: "pwa-gram-49437",
  keyFilename: "serviceAccountKey.json"
}

var gcs = require("@google-cloud/storage")(gcconfig);

admin.initializeApp({
  databaseURL: "https://pwa-gram-49437.firebaseio.com/",
  credential: admin.credential.cert(serviceAccount),
});

function fileUrlFor(bucket, file, uuid) {
  return "https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid
}

exports.storePostData = functions.https.onRequest(function(request, response) {
  cors(request, response, function() {
    var uuid = UUID();

    var busboy = new Busboy({ headers: request.headers });
    // These objects will store the values (file + fields) extracted from busboy
    var upload;
    var fields = {};

    // This callback will be invoked for each file uploaded
    busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {
      var filepath = path.join(os.tmpdir(), filename);
      upload = { file: filepath, type: mimetype };
      file.pipe(fs.createWriteStream(filepath));
    });

    // This will invoked on every field detected
    busboy.on("field", function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      fields[fieldname] = val;
    });

    // This callback will be invoked after all uploaded files are saved.
    busboy.on("finish", function() {
      var bucket = gcs.bucket("pwa-gram-49437.appspot.com");
      bucket.upload(
        upload.file,
        {
          uploadType: "media",
          metadata: {
            metadata: {
              contentType: upload.type,
              firebaseStorageDownloadTokens: uuid
            }
          }
        },
        function(err, uploadedFile) {
          if (!err) {
            admin.database().ref("posts").push({
              id: fields.id,
              title: fields.title,
              location: fields.location,
              image: fileUrlFor(bucket, uploadedFile, uuid),
            }).then(function() {
              webpush.setVapidDetails("mailto:email@mail.com", "BLTJtFlXGiLUWqoiPwJev_7FaZyWa1ibzI091bhhht7N7Jt8P-c90Y7UePlG_jU3dx2Lykm1vxASWms00phV-oU",  "8cm1OafvE9yo-uZEjowqYPM0T3SPI6mEWnIc18pIeoY");
              return admin.database().ref("subscriptions").once("value")
            }).then(function(subscriptions) {
              subscriptions.forEach(function(sub) {
                var pushConfig = sub.val();

                webpush.sendNotification(pushConfig, JSON.stringify({
                  title: "New post",
                  content: fields.title,
                  image: fileUrlFor(bucket, uploadedFile, uuid),
                  openUrl: "/help",
                }))
                  .catch(function(err) {
                    console.log(err);
                  })
              })
              response.status(201).json({ message: "Data stored", id: fields.id });
            }).catch(function(err) {
              response.status(500).json({ error: error });
            })
          } else {
            console.log(err);
          }
        }
      );
    });

    busboy.end(request.rawBody);
  });
});
