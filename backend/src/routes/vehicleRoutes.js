import { protectRoute } from "../middleware/auth.middleware.js";
import express from "express";
import {
    addVehicle,
    getMyVehicles,
    updateVehicle,
    deleteVehicle
} from "../controllers/vehicleController.js";

const router = express.Router();

router.post("/", protectRoute, addVehicle);
router.get("/my", protectRoute, getMyVehicles);
router.put("/:vehicleId", protectRoute, updateVehicle);
router.delete("/:vehicleId", protectRoute, deleteVehicle);

export default router;