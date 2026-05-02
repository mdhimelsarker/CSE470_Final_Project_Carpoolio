import Review from "../models/Review.js";
import User from "../models/User.js";
import Ride from "../models/Ride.js";

// @desc    Create a new review
// @route   POST /api/reviews
export async function createReview(req, res) {
    try {
        const { revieweeId, rideId, rating, comment } = req.body;

        // Validation
        if (!revieweeId || !rideId || !rating) {
            return res.status(400).json({
                message: "revieweeId, rideId, and rating are required",
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5",
            });
        }

        // Check if reviewer and reviewee are different
        if (req.user._id.toString() === revieweeId) {
            return res.status(400).json({
                message: "Cannot review yourself",
            });
        }

        // Check if ride exists
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        // Check if reviewee exists
        const reviewee = await User.findById(revieweeId);
        if (!reviewee) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if a review already exists for this combination
        const existingReview = await Review.findOne({
            reviewer: req.user._id,
            reviewee: revieweeId,
            ride: rideId,
        });

        if (existingReview) {
            return res.status(400).json({
                message: "You have already reviewed this user for this ride",
            });
        }

        // Create the review
        const review = new Review({
            reviewer: req.user._id,
            reviewee: revieweeId,
            ride: rideId,
            rating,
            comment: comment || "",
        });

        const savedReview = await review.save();
        await savedReview.populate("reviewer", "name avatar");
        await savedReview.populate("reviewee", "name avatar");

        // Update user's average rating
        await updateUserAverageRating(revieweeId);

        res.status(201).json({
            message: "Review created successfully",
            review: savedReview,
        });
    } catch (error) {
        console.error("Error in createReview controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Get all reviews for a specific user
// @route   GET /api/reviews/user/:userId
export async function getReviewsForUser(req, res) {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const skip = (page - 1) * limit;

        const reviews = await Review.find({ reviewee: userId })
            .populate("reviewer", "name avatar email university")
            .populate("ride", "origin destination departureTime")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalReviews = await Review.countDocuments({ reviewee: userId });

        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                avatar: user.avatar,
                avgRating: user.avgRating || 0,
            },
            reviews,
            pagination: {
                totalReviews,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalReviews / limit),
            },
        });
    } catch (error) {
        console.error("Error in getReviewsForUser controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Get a single review by ID
// @route   GET /api/reviews/:reviewId
export async function getReviewById(req, res) {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId)
            .populate("reviewer", "name avatar email university")
            .populate("reviewee", "name avatar email university")
            .populate("ride", "origin destination departureTime arrivalTime fare");

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.status(200).json({
            review,
        });
    } catch (error) {
        console.error("Error in getReviewById controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
export async function updateReview(req, res) {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Only the reviewer can update the review
        if (review.reviewer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Forbidden - You are not the reviewer of this review",
            });
        }

        // Validate rating if provided
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    message: "Rating must be between 1 and 5",
                });
            }
            review.rating = rating;
        }

        if (comment !== undefined) {
            review.comment = comment;
        }

        const updatedReview = await review.save();
        await updatedReview.populate("reviewer", "name avatar");
        await updatedReview.populate("reviewee", "name avatar");

        // Recalculate user's average rating
        await updateUserAverageRating(review.reviewee);

        res.status(200).json({
            message: "Review updated successfully",
            review: updatedReview,
        });
    } catch (error) {
        console.error("Error in updateReview controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
export async function deleteReview(req, res) {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Only the reviewer or admin can delete the review
        if (
            review.reviewer.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "Forbidden - You do not have permission to delete this review",
            });
        }

        const revieweeId = review.reviewee;
        await Review.findByIdAndDelete(reviewId);

        // Recalculate user's average rating
        await updateUserAverageRating(revieweeId);

        res.status(200).json({
            message: "Review deleted successfully",
        });
    } catch (error) {
        console.error("Error in deleteReview controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Get reviews given by current user
// @route   GET /api/reviews/my-reviews
export async function getMyReviews(req, res) {
    try {
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        const reviews = await Review.find({ reviewer: req.user._id })
            .populate("reviewee", "name avatar email university")
            .populate("ride", "origin destination departureTime")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalReviews = await Review.countDocuments({
            reviewer: req.user._id,
        });

        res.status(200).json({
            reviews,
            pagination: {
                totalReviews,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalReviews / limit),
            },
        });
    } catch (error) {
        console.error("Error in getMyReviews controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Helper function to calculate and update user's average rating
async function updateUserAverageRating(userId) {
    try {
        const reviews = await Review.find({ reviewee: userId });

        if (reviews.length === 0) {
            await User.findByIdAndUpdate(userId, { avgRating: 0 });
            return;
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = (totalRating / reviews.length).toFixed(2);

        await User.findByIdAndUpdate(userId, { avgRating: parseFloat(avgRating) });
    } catch (error) {
        console.error("Error updating user average rating:", error);
    }
}
