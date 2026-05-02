import express from "express";
import { createRide, updateRide, cancelRide, getAllRides, getRideById } from "../controllers/ridesController.js";
import { sendRequest, cancelRequest, respondToRequest, getRequestsForRide } from "../controllers/rideRequestController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllRides);
router.get("/:rideId", getRideById);
router.post("/", protectRoute, createRide);
router.put("/:rideId", protectRoute, updateRide);
router.patch("/:rideId/cancel", protectRoute, cancelRide);

router.post("/:rideId/requests", protectRoute, sendRequest);
router.patch("/:rideId/requests/:requestId/cancel", protectRoute, cancelRequest);
router.get("/:rideId/requests", protectRoute, getRequestsForRide);
router.patch("/:rideId/requests/:requestId/respond", protectRoute, respondToRequest);

export default router;