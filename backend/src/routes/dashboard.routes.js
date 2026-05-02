import express from "express";
import {
    getPassengerDashboard,
    getDriverDashboard,
} from "../controllers/dashboardController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get passenger dashboard (requires authentication)
router.get("/passenger", protectRoute, getPassengerDashboard);

// Get driver dashboard (requires authentication)
router.get("/driver", protectRoute, getDriverDashboard);

export default router;
