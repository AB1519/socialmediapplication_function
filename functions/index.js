const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const firebaseConfig = {
	apiKey: "AIzaSyDRIl07gZ089aSdIqautqQvt7QS-39S-Uw",
	authDomain: "socialmediaapp-dc944.firebaseapp.com",
	databaseURL: "https://socialmediaapp-dc944.firebaseio.com",
	projectId: "socialmediaapp-dc944",
	storageBucket: "socialmediaapp-dc944.appspot.com",
	messagingSenderId: "365392224269",
	appId: "1:365392224269:web:0f7f954666520eb1757544",
	measurementId: "G-YDLTHEC7JG",
}; 

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get('/notifications',(req,res) => {
    db
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
   db.collection('notifications').add(newNotification).then(doc => {
        console.log(`New Notification with ID ${doc.id} is created succesfully`)
        return res.json(
					`New Notification with ID ${doc.id} is created succesfully`
				);
    }).catch((err) => {
        res.status(500).json( {error: 'something went wrong' });
        console.log(err);
    })
})


//sign-up route
app.post('/signup', (req,res) => {
    const newUser = {
			email: req.body.email,
			password: req.body.password,
			confirmPassword: req.body.confirmPassword,
			userName: req.body.userName
        };
        //TODO: validate data

        let tokenId,userId;

        db.doc(`/users/${newUser.userName}`).get()
            .then(doc => {
                if(doc.exists) {
                    return res.status(400).json({message: `${newUser.userName} already exists`})
                }else{
                  return   firebase
                            .auth()
                            .createUserWithEmailAndPassword(
                                newUser.email,
                                newUser.password
                            );
                }
            })
            .then(data => {
                userId = data.user.uid;
                return data.user.getIdToken()
            })
            .then(token => {
                tokenId = token;
                const newUserCreditials = {
                    userName: newUser.userName,
                    userId: userId,
                    emailId: newUser.email,
                    createdAt: new Date().toISOString(),
                };
                return db.doc(`/users/${newUser.userName}`).set(newUserCreditials);
            })
            .then(() => {
                return res.status(200).json({token: tokenId})
            })
            .catch((err) => {
                if(err.code === "auth/email-already-in-use") {
                    return res.status(400).json({ errorMessage: "Email already in use"})
                }else{
                    return res.status(500).json({errorMessage: err.code})
                }       
            })
})

//https://baseurl.com/api/<endpoint>

exports.api = functions.https.onRequest(app);
