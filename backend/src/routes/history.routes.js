import express from "express";
import { getRideHistory } from "../controllers/historyController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get ride history
router.get("/my-rides", protectRoute, getRideHistory);

export default router;