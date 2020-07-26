const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello World!");
});

exports.getFeeds = functions.https.onRequest((req,res) => {
   admin.firestore().collection('feeds').get().then((data) => {
       let feeds = [];
       data.forEach(doc => {
           feeds.push(doc.data());
       })
       return res.json(feeds) 
   }).catch((err) => console.log(err));    
})
