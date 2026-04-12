import express from "express";
import { createRide, updateRide, cancelRide } from "../controllers/ridesController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createRide);               // Feature 5
router.put("/:rideId", protectRoute, updateRide);         // Feature 6
router.patch("/:rideId/cancel", protectRoute, cancelRide); // Feature 7

export default router;