import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        type: {
            type: String,
            enum: ["car", "microbus", "cng", "motorcycle"],
            required: true,
        },
        brand: {
            type: String,
            required: true,
        },
        plateNumber: {
            type: String,
            required: true,
            unique: true,
        },
        seats: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;