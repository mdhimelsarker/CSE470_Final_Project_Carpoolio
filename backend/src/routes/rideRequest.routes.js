import express from "express";
import { getMyRequests } from "../controllers/rideRequestController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/my", protectRoute, getMyRequests);

export default router;
