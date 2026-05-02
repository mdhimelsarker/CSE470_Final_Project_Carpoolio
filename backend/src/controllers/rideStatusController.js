import Ride from "../models/Ride.js";

export const startRide = async (req, res) => {
    try {
        const { rideId } = req.params;

        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({
                message: "Ride not found"
            });
        }

        if (ride.status !== "full") {
            return res.status(400).json({
                message: "Ride must be full before starting"
            });
        }

        ride.status = "ongoing";

        await ride.save();

        res.status(200).json({
            message: "Ride started successfully",
            ride
        });

    } catch (error) {
        console.error("Error in startRide:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Complete Ride
export const completeRide = async (req, res) => {
    try {
        const { rideId } = req.params;

        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        if (ride.status !== "ongoing") {
            return res.status(400).json({
                message: "Ride must be ongoing before completion",
            });
        }

        ride.status = "completed";
        await ride.save();

        res.status(200).json({
            message: "Ride completed successfully",
            ride,
        });

    } catch (error) {
        console.error("Error in completeRide:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Cancel Ride
export const cancelRide = async (req, res) => {
    try {
        const { rideId } = req.params;

        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({
                message: "Ride not found",
            });
        }

        ride.status = "cancelled";

        await ride.save();

        res.status(200).json({
            message: "Ride cancelled successfully",
            ride,
        });

    } catch (error) {
        console.error("Error in cancelRide:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};