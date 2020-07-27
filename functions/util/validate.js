const isEmpty = (string) => {
	if (string.trim() === "") {
		return true;
	}
	return false;
};
const isValidEmail = (email) => {
	const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (email.match(emailRegEx)) {
		return true;
	}
	return false;
};


exports.validateSignUpData = (data) => {
    let errors = {};
    if (isEmpty(data.email)) {
        errors.email = "must not be empty";
    } else if (!isValidEmail(data.email)) {
        errors.email = "must be valid";
    }

    if (isEmpty(data.password)) {
        errors.password = "must not be empty";
    }

    if (data.password !== data.confirmPassword) {
        errors.confirmPassword = "passwords must match";
    }

    if (isEmpty(data.userName)) {
        errors.userName = "must not be empty";
    }
        
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateSignInData = (data) => {
    let errors = {};

    if (isEmpty(data.email)) {
        errors.email = "must not be emapty";
    } else if (!isValidEmail(data.email)) {
        errors.email = "must be valid";
    }

    if (isEmpty(data.password)) {
        errors.password = "must not be empty";
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
}