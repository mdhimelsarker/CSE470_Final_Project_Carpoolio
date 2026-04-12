import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";

import {
    saveRoute,
    getMySavedRoutes,
    deleteSavedRoute
} from "../controllers/savedRouteController.js";

const router = express.Router();

router.post("/", protectRoute, saveRoute);
router.get("/", protectRoute, getMySavedRoutes);
router.delete("/:routeId", protectRoute, deleteSavedRoute);

export default router;