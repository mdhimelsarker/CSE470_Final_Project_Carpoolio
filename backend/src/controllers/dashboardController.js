import Ride from "../models/Ride.js";
import RideRequest from "../models/RideRequest.js";
import Review from "../models/Review.js";
import User from "../models/User.js";

// @desc    Get data for passenger dashboard
// @route   GET /api/dashboard/passenger
export async function getPassengerDashboard(req, res) {
    try {
        const passengerId = req.user._id;

        // Get upcoming/accepted rides
        const upcomingRides = await RideRequest.find({
            passenger: passengerId,
            status: "accepted",
        })
            .populate({
                path: "ride",
                match: { status: { $in: ["open", "full"] } },
                populate: { path: "driver", select: "name avatar" },
            })
            .sort({ createdAt: -1 });

        // Get pending ride requests
        const pendingRequests = await RideRequest.find({
            passenger: passengerId,
            status: "pending",
        })
            .populate({
                path: "ride",
                select: "origin destination departureTime fare",
                populate: { path: "driver", select: "name avatar" },
            })
            .sort({ createdAt: -1 });

        // Get recent ride history (completed or cancelled)
        const rideHistory = await Ride.find({
            "passengers.user": passengerId,
            status: { $in: ["completed", "cancelled"] },
        })
            .populate("driver", "name avatar")
            .sort({ departureTime: -1 })
            .limit(10);

        res.status(200).json({
            upcomingRides: upcomingRides.filter((r) => r.ride), // Filter out null rides
            pendingRequests,
            rideHistory,
        });
    } catch (error) {
        console.error("Error in getPassengerDashboard controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Get data for driver dashboard
// @route   GET /api/dashboard/driver
export async function getDriverDashboard(req, res) {
    try {
        const driverId = req.user._id;

        // Get active rides (open, full, ongoing)
        const activeRides = await Ride.find({
            driver: driverId,
            status: { $in: ["open", "full", "ongoing"] },
        })
            .populate("vehicle", "make model")
            .sort({ departureTime: 1 });

        // Get ride requests for active rides
        const rideRequests = await RideRequest.find({
            ride: { $in: activeRides.map((r) => r._id) },
        })
            .populate("passenger", "name avatar email university phone")
            .populate("ride", "origin destination departureTime fare")
            .sort({ createdAt: -1 });

        // Get completed rides
        const completedRides = await Ride.find({
            driver: driverId,
            status: "completed",
        })
            .populate("vehicle", "make model")
            .sort({ departureTime: -1 })
            .limit(10);

        // Calculate driver statistics
        const totalRides = await Ride.countDocuments({
            driver: driverId,
            status: { $in: ["completed", "cancelled"] },
        });

        const completedRidesCount = await Ride.countDocuments({
            driver: driverId,
            status: "completed",
        });

        const cancelledRidesCount = await Ride.countDocuments({
            driver: driverId,
            status: "cancelled",
        });

        // Calculate total earnings
        const earningsData = await Ride.aggregate([
            {
                $match: {
                    driver: driverId,
                    status: "completed",
                },
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: "$fare" },
                    averageFare: { $avg: "$fare" },
                    totalRides: { $sum: 1 },
                },
            },
        ]);

        const totalEarnings =
            earningsData.length > 0 ? earningsData[0].totalEarnings : 0;
        const averageFare =
            earningsData.length > 0 ? earningsData[0].averageFare : 0;

        // Get driver's average rating
        const driver = await User.findById(driverId).select("avgRating");

        // Get recent reviews
        const recentReviews = await Review.find({ reviewee: driverId })
            .populate("reviewer", "name avatar")
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            statistics: {
                totalRides,
                completedRides: completedRidesCount,
                cancelledRides: cancelledRidesCount,
                totalEarnings: totalEarnings.toFixed(2),
                averageFare: averageFare.toFixed(2),
                avgRating: driver?.avgRating || 0,
            },
            activeRides,
            pendingRequests: rideRequests.filter((r) => r.status === "pending"),
            acceptedRequests: rideRequests.filter((r) => r.status === "accepted"),
            completedRides,
            recentReviews,
        });
    } catch (error) {
        console.error("Error in getDriverDashboard controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
