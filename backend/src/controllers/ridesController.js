import Ride from "../models/Ride.js";

// @desc    Create a new ride
// @route   POST /api/rides
export async function createRide(req, res) {
    try {
        const { origin, destination, departureTime, arrivalTime, availableSeats, fare, vehicle } = req.body;

        if (!origin || !destination || !departureTime || !availableSeats || !fare) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const ride = new Ride({
            driver: req.user._id,
            vehicle: vehicle || null,
            origin,
            destination,
            departureTime,
            arrivalTime: arrivalTime || null,
            availableSeats,
            fare,
        });

        const savedRide = await ride.save();

        res.status(201).json({
            message: "Ride created successfully",
            ride: savedRide,
        });
    } catch (error) {
        console.error("Error in createRide controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Update a ride
// @route   PUT /api/rides/:rideId
export async function updateRide(req, res) {
    try {
        const ride = await Ride.findById(req.params.rideId);

        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        // Only driver can edit
        if (ride.driver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden - You are not the driver of this ride" });
        }

        // Only editable when status is open
        if (ride.status !== "open") {
            return res.status(400).json({ message: "Ride can only be edited when status is open" });
        }

        const { origin, destination, departureTime, arrivalTime, availableSeats, fare, vehicle } = req.body;

        const updatedRide = await Ride.findByIdAndUpdate(
            req.params.rideId,
            { origin, destination, departureTime, arrivalTime, availableSeats, fare, vehicle },
            { new: true }
        );

        res.status(200).json({
            message: "Ride updated successfully",
            ride: updatedRide,
        });
    } catch (error) {
        console.error("Error in updateRide controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Cancel a ride
// @route   PATCH /api/rides/:rideId/cancel
export async function cancelRide(req, res) {
    try {
        const ride = await Ride.findById(req.params.rideId);

        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        // Only driver can cancel
        if (ride.driver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden - You are not the driver of this ride" });
        }

        // Can only cancel if open or full
        if (!["open", "full"].includes(ride.status)) {
            return res.status(400).json({ message: "Ride cannot be cancelled at this stage" });
        }

        ride.status = "cancelled";
        await ride.save();

        // Note: cascade to RideRequests and Notifications will be added in features 8-9

        res.status(200).json({ message: "Ride cancelled successfully", ride });
    } catch (error) {
        console.error("Error in cancelRide controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}