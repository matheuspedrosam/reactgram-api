const express = require("express");
const PostController = require("../controller/PostController.js");
const verifyToken = require("../helpers/verify-token");
const imageUpload = require("../helpers/image-upload");

const router = express.Router();

router.get("/", verifyToken, PostController.getPosts);

router.get("/my", verifyToken, PostController.getMyPosts);

router.get("/:id", verifyToken, PostController.getPostById);

router.post("/create", verifyToken, imageUpload.single('image'), PostController.createPost);

router.put("/update/:id", verifyToken, PostController.updatePost);

router.put("/like/:id", verifyToken, PostController.likePost);

router.put("/deslike/:id", verifyToken, PostController.deslikePost);

router.put("/comment/:id", verifyToken, PostController.commentPost);

router.delete("/delete/:id", verifyToken, PostController.deletePost);

module.exports = router;