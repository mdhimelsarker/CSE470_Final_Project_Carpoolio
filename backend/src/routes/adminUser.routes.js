import express from "express";
import {
    getAllUsers,
    banUser,
    verifyUser,
    unbanUser
} from "../controllers/adminUserController.js";
import { protectRoute, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, isAdmin, getAllUsers);
router.patch("/:userId/ban", protectRoute, isAdmin, banUser);
router.patch("/:userId/verify", protectRoute, isAdmin, verifyUser);
router.patch("/:userId/unban", protectRoute, isAdmin, unbanUser);

export default router;