const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.getNotifications = functions.https.onRequest((req,res) => {
   admin.firestore().collection('notifications').get().then((data) => {
       let notification_list = [];
       data.forEach(doc => {
           notification_list.push(doc.data());
       })
       return res.json(notification_list); 
   }).catch((err) => console.log(err));    
})

exports.addNotifications = functions.https.onRequest((req,res) => {
    if(req.method !== "POST") {
        return res.status(400).json({error: 'Method is invalid' })
    }
    const newNotification = {
        userName: req.body.userName,
        message: req.body.message,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
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
