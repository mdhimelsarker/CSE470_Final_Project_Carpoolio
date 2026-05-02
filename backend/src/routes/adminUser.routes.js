import express from "express";

import {
    getAllUsers,
    banUser,
    verifyUser,
} from "../controllers/adminUserController.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getAllUsers);

router.patch("/:userId/ban", protectRoute, banUser);

router.patch("/:userId/verify", protectRoute, verifyUser);

export default router;