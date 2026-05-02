import express from "express";
import {
    createReview,
    getReviewsForUser,
    getReviewById,
    updateReview,
    deleteReview,
    getMyReviews,
} from "../controllers/reviewController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a review (requires authentication)
router.post("/", protectRoute, createReview);

// Get reviews for a specific user (public)
router.get("/user/:userId", getReviewsForUser);

// Get reviews given by current user (requires authentication)
router.get("/my-reviews", protectRoute, getMyReviews);

// Get a specific review (public)
router.get("/:reviewId", getReviewById);

// Update a review (requires authentication)
router.put("/:reviewId", protectRoute, updateReview);

// Delete a review (requires authentication)
router.delete("/:reviewId", protectRoute, deleteReview);

export default router;
