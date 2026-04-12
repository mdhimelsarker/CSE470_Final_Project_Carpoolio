import express from "express";
import multer from "multer";
import path from "path";
import { getProfile, updateProfile, uploadAvatar, getPublicProfile } from "../controllers/profileController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

// Multer storage configuration for avatar uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/avatars");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

// File filter — only allow image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

const router = express.Router();

router.get("/me", protectRoute, getProfile);
router.put("/me", protectRoute, updateProfile);
router.post("/me/avatar", protectRoute, upload.single("avatar"), uploadAvatar);
router.get("/:userId", getPublicProfile);

export default router;
