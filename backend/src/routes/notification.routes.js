import express from "express";
import { getMyNotifications, markAsRead, markAllRead, deleteNotification } from "../controllers/notificationController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getMyNotifications);
router.patch("/read-all", protectRoute, markAllRead);
router.patch("/:notificationId/read", protectRoute, markAsRead);
router.delete("/:notificationId", protectRoute, deleteNotification);

export default router;