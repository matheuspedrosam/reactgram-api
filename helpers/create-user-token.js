const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const createUserToken = async (user) => {

	const token = jwt.sign({
		name: user.name,
		id: user._id
	}, jwtSecret)

	return token;
}

module.exports = createUserToken;