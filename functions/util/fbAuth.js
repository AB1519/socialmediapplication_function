const {admin,db} = require('./admin');

module.exports = (req, res, next) => {
	let idtoken;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer ")
	) {
		idtoken = req.headers.authorization.split("Bearer ")[1];
	} else {
		return res.status(401).json({ errorMessage: "Unauthorized" });
	}

	//verifying if the token is issued by our app
	admin
		.auth()
		.verifyIdToken(idtoken)
		.then((decodedToken) => {
			req.user = decodedToken;
			console.log(decodedToken);
			return db
				.collection("users")
				.where("userId", "==", req.user.uid)
				.limit(1)
				.get();
		})
		.then((data) => {
			req.user.userName = data.docs[0].data().userName;
			return next();
		})
		.catch((error) => {
			console.log('errow while verifying token',error)
			if (error.code === "auth/argument-error") {
				return res.status(403).json({ errorMessage: "JWT token is invalid" });
			}
		});
};
