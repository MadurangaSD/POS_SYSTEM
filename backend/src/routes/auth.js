const express = require("express");
const AuthController = require("../controllers/AuthController");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

router.post("/login", AuthController.login);
router.post("/logout", authMiddleware, AuthController.logout);
router.get("/me", authMiddleware, AuthController.getMe);

module.exports = router;
