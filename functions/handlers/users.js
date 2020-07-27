const { db } = require('../util/admin');

const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignUpData, validateSignInData } = require("../util/validate");

exports.signUp = (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		userName: req.body.userName,
	};
	const {valid, errors} = validateSignUpData(newUser);

    if(!valid) {
        return res.status(400).json({errors});
    }
	

	let tokenId, userId;

	db.doc(`/users/${newUser.userName}`)
		.get()
		.then((doc) => {
			if (doc.exists) {
				return res
					.status(400)
					.json({ message: `${newUser.userName} already exists` });
			} else {
				return firebase
					.auth()
					.createUserWithEmailAndPassword(newUser.email, newUser.password);
			}
		})
		.then((data) => {
			userId = data.user.uid;
			return data.user.getIdToken();
		})
		.then((token) => {
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
			return res.status(200).json({ message: `New user ${userName} created sucessfully`,token: tokenId });
		})
		.catch((err) => {
			if (err.code === "auth/email-already-in-use") {
				return res.status(400).json({ errorMessage: "Email already in use" });
			} else {
				return res.status(500).json({ errorMessage: err.code });
			}
		});
};

exports.signIn = (req, res) => {
	const userCreditials = {
		email: req.body.email,
		password: req.body.password,
	};

    const { valid, errors } = validateSignInData(userCreditials);

	if (!valid) {
		return res.status(400).json({ errors });
	}

	firebase
		.auth()
		.signInWithEmailAndPassword(userCreditials.email, userCreditials.password)
		.then((data) => {
			return data.user.getIdToken();
		})
		.then((token) => {
			return res.status(200).json({ token });
		})
		.catch((error) => {
			if (error.code === "auth/wrong-password") {
				return res
					.status(400)
					.json({
						errorMessage: "email or password not matching, please try again",
					});
			}
			return res.status(500).json({ errorMessage: error.code });
		});
};