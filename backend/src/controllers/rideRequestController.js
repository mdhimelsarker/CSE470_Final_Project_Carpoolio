import Ride from "../models/Ride.js";
import RideRequest from "../models/RideRequest.js";
import Notification from "../models/Notification.js";

// @desc    Passenger sends request to join an open ride
// @route   POST /api/ride-requests/:rideId
export async function sendRequest(req, res) {
    try {
        const { rideId } = req.params;

        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        if (ride.driver.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "Driver cannot request own ride" });
        }

        if (ride.status !== "open") {
            return res.status(400).json({ message: "Only open rides can receive requests" });
        }

        if (ride.availableSeats <= 0) {
            return res.status(400).json({ message: "No available seats left" });
        }

        const existingRequest = await RideRequest.findOne({
            ride: rideId,
            passenger: req.user._id,
            status: { $in: ["pending", "accepted"] },
        });

        if (existingRequest) {
            return res.status(400).json({ message: "You already have an active request for this ride" });
        }

        const request = await RideRequest.create({
            ride: rideId,
            passenger: req.user._id,
        });

        await Notification.create({
            recipient: ride.driver,
            type: "ride_request",
            message: `${req.user.name} has requested to join your ride from ${ride.origin} to ${ride.destination}.`,
            relatedRide: rideId,
        });

        res.status(201).json({
            message: "Ride request sent successfully",
            request,
        });
    } catch (error) {
        console.error("Error in sendRequest controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Passenger cancels own ride request
// @route   PATCH /api/ride-requests/:requestId/cancel
export async function cancelRequest(req, res) {
    try {
        const { requestId } = req.params;

        const request = await RideRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Ride request not found" });
        }

        if (request.passenger.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden - You can only cancel your own request" });
        }

        if (!["pending", "accepted"].includes(request.status)) {
            return res.status(400).json({ message: "Request cannot be cancelled at this stage" });
        }

        if (request.status === "accepted") {
            const ride = await Ride.findById(request.ride);
            if (ride && ["open", "full"].includes(ride.status)) {
                ride.availableSeats += 1;
                if (ride.status === "full") {
                    ride.status = "open";
                }
                await ride.save();
            }
        }

        request.status = "cancelled";
        await request.save();

        res.status(200).json({
            message: "Ride request cancelled successfully",
            request,
        });
    } catch (error) {
        console.error("Error in cancelRequest controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Passenger views own ride requests
// @route   GET /api/ride-requests/me
export async function getMyRequests(req, res) {
    try {
        const requests = await RideRequest.find({ passenger: req.user._id })
            .populate({
                path: "ride",
                select: "driver origin destination departureTime arrivalTime availableSeats fare status",
                populate: {
                    path: "driver",
                    select: "name email",
                },
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ requests });
    } catch (error) {
        console.error("Error in getMyRequests controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Driver accepts/rejects a request
// @route   PATCH /api/ride-requests/:requestId/respond
export async function respondToRequest(req, res) {
    try {
        const { requestId } = req.params;
        const { action } = req.body;

        if (!["accept", "reject"].includes(action)) {
            return res.status(400).json({ message: "Action must be either 'accept' or 'reject'" });
        }

        const request = await RideRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Ride request not found" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({ message: "Only pending requests can be responded to" });
        }

        const ride = await Ride.findById(request.ride);
        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        if (ride.driver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden - You are not the driver of this ride" });
        }

        if (action === "accept") {
            if (ride.status !== "open") {
                return res.status(400).json({ message: "Only open rides can accept requests" });
            }

            if (ride.availableSeats <= 0) {
                ride.status = "full";
                await ride.save();
                return res.status(400).json({ message: "No available seats left" });
            }

            request.status = "accepted";
            ride.availableSeats -= 1;

            if (ride.availableSeats <= 0) {
                ride.availableSeats = 0;
                ride.status = "full";
            }

            await Promise.all([request.save(), ride.save()]);

            await Notification.create({
                recipient: request.passenger,
                type: "request_accepted",
                message: `Your request to join the ride from ${ride.origin} to ${ride.destination} has been accepted.`,
                relatedRide: ride._id,
            });

            return res.status(200).json({
                message: "Ride request accepted",
                request,
                ride,
            });
        }

        request.status = "rejected";
        await request.save();

        await Notification.create({
            recipient: request.passenger,
            type: "request_rejected",
            message: `Your request to join the ride from ${ride.origin} to ${ride.destination} has been rejected.`,
            relatedRide: ride._id,
        });

        return res.status(200).json({
            message: "Ride request rejected",
            request,
        });
    } catch (error) {
        console.error("Error in respondToRequest controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Driver views requests for own ride
// @route   GET /api/ride-requests/ride/:rideId
export async function getRequestsForRide(req, res) {
    try {
        const { rideId } = req.params;

        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        if (ride.driver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden - You are not the driver of this ride" });
        }

        const requests = await RideRequest.find({ ride: rideId })
            .populate("passenger", "name email phone university avatar")
            .sort({ createdAt: -1 });

        res.status(200).json({ requests });
    } catch (error) {
        console.error("Error in getRequestsForRide controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
