const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

// Helpers
const getToken = require("./get-token");
const { UNAUTHORIZED } = require("./http-status-code");

const verifyToken = (req, res, next) => {

    if(!req.headers.authorization){
        return res.status(UNAUTHORIZED).json({"message": "Acesso Negado!"})
    }

    const bearerToken = req.headers.authorization;
    const token = getToken(bearerToken)

    try{
        const decodedToken = jwt.verify(token, jwtSecret)

        if(decodedToken){
	        req.user = decodedToken;
            return next();
        }
    } catch(e){
        return res.status(UNAUTHORIZED).json({"message": "Acesso Negado!"})
    }
}

module.exports = verifyToken;
