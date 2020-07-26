const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();

app.get('/notifications',(req,res) => {
    admin
			.firestore()
            .collection("notifications")
            .orderBy('createdAt', 'desc')
			.get()
			.then((data) => {
				let notification_list = [];
				data.forEach((doc) => {
					notification_list.push({
                        notificationId: doc.id,
                        ...doc.data()
                    });
				});
				return res.json(notification_list);
			})
			.catch((err) => console.log(err));
})

app.post('/notifications',(req,res) => {
    const newNotification = {
        userName: req.body.userName,
        message: req.body.message,
        createdAt: new Date().toISOString()
    }
    admin.firestore().collection('notifications').add(newNotification).then(doc => {
        console.log(`New Notification with ID ${doc.id} is created succesfully`)
        return res.json(
					`New Notification with ID ${doc.id} is created succesfully`
				);
    }).catch((err) => {
        res.status(500).json( {error: 'something went wrong' });
        console.log(err);
    })
})

//https://baseurl.com/api/<endpoint>

exports.api = functions.https.onRequest(app);
