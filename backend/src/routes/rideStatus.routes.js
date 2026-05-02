import express from "express";
import {
    startRide,
    completeRide,
    cancelRide,
} from "../controllers/rideStatusController.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Start ride
router.patch("/:rideId/start", protectRoute, startRide);

// Complete ride
router.patch("/:rideId/complete", protectRoute, completeRide);

// Cancel ride
router.patch("/:rideId/cancel", protectRoute, cancelRide);

export default router;