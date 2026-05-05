import express from "express";
import {
    getAllRidesForAdmin,
    getRideAnalytics,
    deleteRideByAdmin,
} from "../controllers/adminRideController.js";
import { protectRoute, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, isAdmin, getAllRidesForAdmin);
router.get("/analytics", protectRoute, isAdmin, getRideAnalytics);
router.delete("/:rideId", protectRoute, isAdmin, deleteRideByAdmin);

export default router;