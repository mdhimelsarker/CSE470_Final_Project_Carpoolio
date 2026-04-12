import express from "express";
import { register, login, logout, getMe, refreshToken } from "../controllers/authController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protectRoute, getMe);
router.post("/refresh-token", refreshToken);

export default router;
