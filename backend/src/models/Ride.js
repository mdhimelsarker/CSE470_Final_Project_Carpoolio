import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
    {
        pickupLocation: {
            type: String,
            required: true,
        },
        destination: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        availableSeats: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["Upcoming", "Full", "Completed", "Cancelled"],
            default: "Upcoming",
        },
    },
    { timestamps: true }
);

const Ride = mongoose.model("Ride", rideSchema);

export default Ride;