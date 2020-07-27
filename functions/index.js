const functions = require('firebase-functions');

const app = require('express')();

const FBAuth = require("./util/fbAuth");

const {
	getAllNotifications,
	postOneNotification,
} = require("./handlers/notifications");

const {signUp, signIn} =require('./handlers/users'); 

//notifications
app.get("/notifications", getAllNotifications);
app.post("/notifications", FBAuth, postOneNotification);

//user route
app.post("/signup", signUp);
app.post("/signin", signIn);

//https://baseurl.com/api/<endpoint>
exports.api = functions.https.onRequest(app);
