const { db } = require('../util/admin');

exports.getAllNotifications = (req, res) => {
	db.collection("notifications")
		.orderBy("createdAt", "desc")
		.get()
		.then((data) => {
			let notification_list = [];
			data.forEach((doc) => {
				notification_list.push({
					notificationId: doc.id,
					...doc.data(),
				});
			});
			return res.json(notification_list);
		})
		.catch((error) => {
			return res.status(500).json({ errorMessage: err.code });
		});
};


exports.postOneNotification = (req, res) => {
	const newNotification = {
		userName: req.user.userName,
		message: req.body.message,
		createdAt: new Date().toISOString(),
	};
	db.collection("notifications")
		.add(newNotification)
		.then((doc) => {
			console.log(`New Notification with ID ${doc.id} is created succesfully`);
			return res.json(
				`New Notification with ID ${doc.id} is created succesfully`
			);
		})
		.catch((err) => {
			res.status(500).json({ error: "something went wrong" });
			console.log(err);
		});
};