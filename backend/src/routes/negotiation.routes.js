import express from "express";
import {
    startNegotiation,
    sendMessage,
    proposeFare,
    agreeFare,
    getNegotiation,
} from "../controllers/negotiationController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/start", protectRoute, startNegotiation);
router.post("/:negotiationId/message", protectRoute, sendMessage);
router.post("/:negotiationId/propose-fare", protectRoute, proposeFare);
router.post("/:negotiationId/agree-fare", protectRoute, agreeFare);
router.get("/:negotiationId", protectRoute, getNegotiation);

export default router;
