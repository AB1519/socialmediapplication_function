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

const isEmpty = (string) => {
    if(string.trim() === '') {
        return true;
    }
    return false;
}
const isValidEmail = (email) => {
	const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(emailRegEx)) {
        return true;
    }
    return false;
};

//sign-up route
app.post('/signup', (req,res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        userName: req.body.userName
    };
        //TODO: validate data
    let errors = {};
    
    if(isEmpty(newUser.email)){
        errors.email = "must not be empty"
    } else if(!isValidEmail(newUser.email)){
        errors.email = "must be valid"
    }

    if(isEmpty(newUser.password)) {
        errors.password = "must not be empty"
    }

    if(newUser.password !== newUser.confirmPassword) {
        errors.confirmPassword = "passwords must match"
    }

    if (isEmpty(newUser.userName)) {
        errors.userName = "must not be empty";
    }

    if(Object.keys(errors).length > 0) {
        return res.status(400).json({errors});
    }
    
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


//sign-in function

app.post('/signin', (req,res) => {
    const userCreditials = {
        email : req.body.email,
        password: req.body.password
    };

    let errors = {};

    if(isEmpty(userCreditials.email)) {
        errors.email = "must not be emapty";
    }else if(!isValidEmail(userCreditials.email)) {
        errors.email = "must be valid"
    }

    if (isEmpty(userCreditials.password)) {
        errors.password = "must not be empty";
    }

    if(Object.keys(errors).length > 0) {
        return res.status(400).json({errors});
    }

    firebase.auth().signInWithEmailAndPassword(userCreditials.email,userCreditials.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.status(200).json({token});
        })
        .catch((error) => {
            if (error.code === "auth/wrong-password") {
                return res.status(400).json({errorMessage: "email or password not matching, please try again"})
            }

            return res.status(500).json({ errorMessage: error.code });
        })
})

//https://baseurl.com/api/<endpoint>

exports.api = functions.https.onRequest(app);
