import mongoose from "mongoose";

const negotiationMessageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["message", "proposal", "agreement"],
            default: "message",
        },
        text: {
            type: String,
            trim: true,
            default: "",
        },
        proposedFare: {
            type: Number,
        },
    },
    { _id: false, timestamps: true }
);

const negotiationSchema = new mongoose.Schema(
    {
        ride: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ride",
            required: true,
        },
        rideRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RideRequest",
            required: true,
            unique: true,
        },
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        passenger: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "agreed", "closed"],
            default: "active",
        },
        finalFare: {
            type: Number,
        },
        messages: [negotiationMessageSchema],
    },
    { timestamps: true }
);

const Negotiation = mongoose.model("Negotiation", negotiationSchema);

export default Negotiation;
