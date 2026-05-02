import Ride from "../models/Ride.js";
import RideRequest from "../models/RideRequest.js";

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
