const mongoose = require("../db/conn.js");
const { Schema } = mongoose;

const Post = mongoose.model('Posts', new Schema({
    image: {
        type: "String",
        required: true
    },
    title: {
        type: "String",
        required: true
    },
    likes: [
        {type: String}
    ],
    comments: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
          comment: String,
        }
    ],
    userId: {
        type: mongoose.ObjectId,
        required: true
    },
    userName: {
        type: "String",
        required: true
    },
},
{timestamps: true}
))

module.exports = Post;