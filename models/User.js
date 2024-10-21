const mongoose = require("../db/conn.js");
const { Schema } = mongoose;

const User = mongoose.model('Users', new Schema({
    name: {
        type: "String",
        required: true
    },
    email: {
        type: "String",
        required: true
    },
    password: {
        type: "String",
        required: true
    },
    bio:{
        type: "String"
    },
    profilePhoto:{
        type: "String"
    }
},
{timestamps: true}
))

module.exports = User;