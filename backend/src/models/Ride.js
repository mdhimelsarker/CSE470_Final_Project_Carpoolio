import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
    {
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
        },
        origin: {
            type: String,
            required: true,
        },
        destination: {
            type: String,
            required: true,
        },
        departureTime: {
            type: Date,
            required: true,
        },
        arrivalTime: {
            type: Date,
        },
        availableSeats: {
            type: Number,
            required: true,
        },
        fare: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["open", "full", "ongoing", "completed", "cancelled"],
            default: "open",
        },
    },
    { timestamps: true }
);

const Ride = mongoose.model("Ride", rideSchema);

export default Ride;