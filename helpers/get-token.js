const getToken = (bearerToken) => {
    let token = "";
    if(bearerToken) {
        token = bearerToken.split(" ")[1];
    }
    return token;
}

module.exports = getToken;