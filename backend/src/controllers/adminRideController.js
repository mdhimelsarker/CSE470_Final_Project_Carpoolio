import Ride from "../../models/Ride.js";
import User from "../../models/User.js";
import RideRequest from "../../models/RideRequest.js";

// @desc    Get all rides for admin with filtering and pagination
// @route   GET /api/admin/rides
export async function getAllRidesForAdmin(req, res) {
    try {
        const { page = 1, limit = 10, status, driverId, passengerId, sortBy = "departureTime", order = "desc" } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (driverId) filter.driver = driverId;
        if (passengerId) {
            const rideRequests = await RideRequest.find({ passenger: passengerId, status: "accepted" }).select("ride");
            const rideIds = rideRequests.map(r => r.ride);
            filter._id = { $in: rideIds };
        }

        const rides = await Ride.find(filter)
            .populate("driver", "name email")
            .populate("passengers.user", "name email")
            .sort({ [sortBy]: order })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Ride.countDocuments(filter);

        res.status(200).json({
            rides,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalRides: count,
        });
    } catch (error) {
        console.error("Error in getAllRidesForAdmin controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Get ride details for admin
// @route   GET /api/admin/rides/:rideId
export async function getRideDetailsForAdmin(req, res) {
    try {
        const ride = await Ride.findById(req.params.rideId)
            .populate("driver", "name email phone")
            .populate("passengers.user", "name email phone")
            .populate("vehicle");

        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        const requests = await RideRequest.find({ ride: ride._id }).populate("passenger", "name email");

        res.status(200).json({ ride, requests });
    } catch (error) {
        console.error("Error in getRideDetailsForAdmin controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Get ride analytics for admin
// @route   GET /api/admin/rides/analytics
export async function getRideAnalytics(req, res) {
    try {
        const totalRides = await Ride.countDocuments();
        const completedRides = await Ride.countDocuments({ status: "completed" });
        const cancelledRides = await Ride.countDocuments({ status: "cancelled" });
        const openRides = await Ride.countDocuments({ status: "open" });
        const totalUsers = await User.countDocuments();
        const totalDrivers = await User.countDocuments({ role: { $in: ["driver", "admin"] } }); // Assuming drivers can be admins too

        const totalRevenue = await Ride.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$fare" } } },
        ]);

        res.status(200).json({
            totalRides,
            completedRides,
            cancelledRides,
            openRides,
            totalUsers,
            totalDrivers,
            totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        });
    } catch (error) {
        console.error("Error in getRideAnalytics controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Delete a ride by admin
// @route   DELETE /api/admin/rides/:rideId
export async function deleteRideByAdmin(req, res) {
    try {
        const ride = await Ride.findById(req.params.rideId);

        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        await ride.remove();
        await RideRequest.deleteMany({ ride: req.params.rideId });

        res.status(200).json({ message: "Ride and associated requests deleted successfully" });
    } catch (error) {
        console.error("Error in deleteRideByAdmin controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
