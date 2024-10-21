const express = require("express");
const UserController = require("../controller/UserController");
const verifyToken = require("../helpers/verify-token");
const imageUpload = require("../helpers/image-upload");

const router = express.Router();

router.get("/", verifyToken, UserController.getUsers);

router.get("/:id", verifyToken, UserController.getUserById);

router.post("/create", UserController.createUser); // AUTH REGISTER

router.post("/login", UserController.loginUser); // AUTH LOGIN

router.put("/update/:id", verifyToken, imageUpload.single('profilePhoto'), UserController.updateUser)

router.delete("/delete/:id", verifyToken, UserController.deleteUser);

router.get("/me", verifyToken, UserController.checkCurrentUser);

module.exports = router;