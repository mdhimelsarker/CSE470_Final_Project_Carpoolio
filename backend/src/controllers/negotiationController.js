import Ride from "../models/Ride.js";
import RideRequest from "../models/RideRequest.js";
import Negotiation from "../models/Negotiation.js";

function isParticipant(negotiation, userId) {
    return (
        negotiation.driver.toString() === userId.toString() ||
        negotiation.passenger.toString() === userId.toString()
    );
}

// @desc    Start negotiation for a ride request
// @route   POST /api/negotiations/start
export async function startNegotiation(req, res) {
    try {
        const { rideRequestId } = req.body;

        if (!rideRequestId) {
            return res.status(400).json({ message: "rideRequestId is required" });
        }

        const rideRequest = await RideRequest.findById(rideRequestId);
        if (!rideRequest) {
            return res.status(404).json({ message: "Ride request not found" });
        }

        const ride = await Ride.findById(rideRequest.ride);
        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        const userId = req.user._id.toString();
        const driverId = ride.driver.toString();
        const passengerId = rideRequest.passenger.toString();

        if (![driverId, passengerId].includes(userId)) {
            return res.status(403).json({ message: "Forbidden - You are not part of this ride request" });
        }

        if (!["pending", "accepted"].includes(rideRequest.status)) {
            return res.status(400).json({ message: "Negotiation is not available for this request status" });
        }

        const existing = await Negotiation.findOne({ rideRequest: rideRequestId });
        if (existing) {
            return res.status(200).json({
                message: "Negotiation already exists",
                negotiation: existing,
            });
        }

        const negotiation = await Negotiation.create({
            ride: ride._id,
            rideRequest: rideRequest._id,
            driver: ride.driver,
            passenger: rideRequest.passenger,
            messages: [],
        });

        res.status(201).json({
            message: "Negotiation started successfully",
            negotiation,
        });
    } catch (error) {
        console.error("Error in startNegotiation controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Send plain message in negotiation
// @route   POST /api/negotiations/:negotiationId/message
export async function sendMessage(req, res) {
    try {
        const { negotiationId } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Message text is required" });
        }

        const negotiation = await Negotiation.findById(negotiationId);
        if (!negotiation) {
            return res.status(404).json({ message: "Negotiation not found" });
        }

        if (!isParticipant(negotiation, req.user._id)) {
            return res.status(403).json({ message: "Forbidden - Not a negotiation participant" });
        }

        if (negotiation.status !== "active") {
            return res.status(400).json({ message: "Negotiation is not active" });
        }

        negotiation.messages.push({
            sender: req.user._id,
            type: "message",
            text: text.trim(),
        });

        await negotiation.save();

        res.status(200).json({
            message: "Message sent",
            negotiation,
        });
    } catch (error) {
        console.error("Error in sendMessage controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Propose fare in negotiation
// @route   POST /api/negotiations/:negotiationId/propose-fare
export async function proposeFare(req, res) {
    try {
        const { negotiationId } = req.params;
        const { fare, text } = req.body;

        if (fare === undefined || fare === null || Number(fare) <= 0) {
            return res.status(400).json({ message: "A valid fare amount is required" });
        }

        const negotiation = await Negotiation.findById(negotiationId);
        if (!negotiation) {
            return res.status(404).json({ message: "Negotiation not found" });
        }

        if (!isParticipant(negotiation, req.user._id)) {
            return res.status(403).json({ message: "Forbidden - Not a negotiation participant" });
        }

        if (negotiation.status !== "active") {
            return res.status(400).json({ message: "Negotiation is not active" });
        }

        negotiation.messages.push({
            sender: req.user._id,
            type: "proposal",
            proposedFare: Number(fare),
            text: text?.trim() || "",
        });

        await negotiation.save();

        res.status(200).json({
            message: "Fare proposed successfully",
            negotiation,
        });
    } catch (error) {
        console.error("Error in proposeFare controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Agree on fare and finalize negotiation
// @route   POST /api/negotiations/:negotiationId/agree-fare
export async function agreeFare(req, res) {
    try {
        const { negotiationId } = req.params;
        const { fare } = req.body;

        const negotiation = await Negotiation.findById(negotiationId);
        if (!negotiation) {
            return res.status(404).json({ message: "Negotiation not found" });
        }

        if (!isParticipant(negotiation, req.user._id)) {
            return res.status(403).json({ message: "Forbidden - Not a negotiation participant" });
        }

        if (negotiation.status !== "active") {
            return res.status(400).json({ message: "Negotiation is not active" });
        }

        let agreedFare = null;

        if (fare !== undefined && fare !== null) {
            if (Number(fare) <= 0) {
                return res.status(400).json({ message: "Agreed fare must be greater than 0" });
            }
            agreedFare = Number(fare);
        } else {
            for (let index = negotiation.messages.length - 1; index >= 0; index -= 1) {
                const msg = negotiation.messages[index];
                if (msg.type === "proposal" && msg.proposedFare) {
                    agreedFare = msg.proposedFare;
                    break;
                }
            }

            if (!agreedFare) {
                return res.status(400).json({ message: "No proposed fare found. Provide fare in request body." });
            }
        }

        negotiation.finalFare = agreedFare;
        negotiation.status = "agreed";
        negotiation.messages.push({
            sender: req.user._id,
            type: "agreement",
            proposedFare: agreedFare,
            text: "Fare agreed",
        });

        await negotiation.save();

        res.status(200).json({
            message: "Fare agreed successfully",
            negotiation,
        });
    } catch (error) {
        console.error("Error in agreeFare controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Get negotiation details/messages
// @route   GET /api/negotiations/:negotiationId
export async function getNegotiation(req, res) {
    try {
        const { negotiationId } = req.params;

        const negotiation = await Negotiation.findById(negotiationId)
            .populate("driver", "name email")
            .populate("passenger", "name email")
            .populate("ride", "origin destination departureTime availableSeats fare status")
            .populate("rideRequest", "status")
            .populate("messages.sender", "name email");

        if (!negotiation) {
            return res.status(404).json({ message: "Negotiation not found" });
        }

        if (!isParticipant(negotiation, req.user._id)) {
            return res.status(403).json({ message: "Forbidden - Not a negotiation participant" });
        }

        res.status(200).json({ negotiation });
    } catch (error) {
        console.error("Error in getNegotiation controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
