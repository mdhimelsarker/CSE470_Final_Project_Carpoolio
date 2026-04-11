import express from "express";
import { createRide, deleteRide, getAllRides, getRideByID, updateRide } from "../controllers/ridesController.js";

const router = express.Router();

router.get("/", getAllRides);
router.get("/:id", getRideByID);
router.post("/", createRide);
router.put("/:id", updateRide);
router.delete("/:id", deleteRide);

export default router;