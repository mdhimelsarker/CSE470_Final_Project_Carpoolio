import mongoose from "mongoose";

const savedRouteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
        origin: {
            type: String,
            required: true,
        },
        destination: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const SavedRoute = mongoose.model("SavedRoute", savedRouteSchema);

export default SavedRoute;