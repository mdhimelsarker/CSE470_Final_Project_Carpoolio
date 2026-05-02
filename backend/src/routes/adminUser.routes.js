import express from "express";


import {
    getAllUsers,
    banUser,
    verifyUser,
    unbanUser
} from "../controllers/adminUserController.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getAllUsers);

router.patch("/:userId/ban", protectRoute, banUser);

router.patch("/:userId/verify", protectRoute, verifyUser);

router.patch("/:userId/unban", unbanUser);

export default router;