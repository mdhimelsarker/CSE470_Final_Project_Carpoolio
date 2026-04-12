import mongoose from "mongoose";

const rideRequestSchema = new mongoose.Schema(
    {
        ride: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ride",
            required: true,
        },
        passenger: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

rideRequestSchema.index({ ride: 1, passenger: 1 });

const RideRequest = mongoose.model("RideRequest", rideRequestSchema);

export default RideRequest;
