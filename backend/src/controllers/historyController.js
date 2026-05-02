import Ride from "../models/Ride.js";

// Get ride history for logged-in user
export const getRideHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const rides = await Ride.find({
            $and: [
                {
                    $or: [
                        { driver: userId },
                        { passengers: userId }
                    ]
                },
                {
                    status: {
                        $in: ["completed", "cancelled"]
                    }
                }
            ]
        });

        res.status(200).json(rides);

    } catch (error) {
        console.error("Error in getRideHistory:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};