import SavedRoute from "../models/SavedRoute.js";

export async function saveRoute(req, res) {
    try {
        const { label, origin, destination } = req.body;

        const route = new SavedRoute({
            user: req.user._id,
            label,
            origin,
            destination,
        });

        const savedRoute = await route.save();

        res.status(201).json({
            message: "Route saved successfully",
            route: savedRoute,
        });

    } catch (error) {
        console.error("Error in saveRoute:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMySavedRoutes(req, res) {
    try {
        const routes = await SavedRoute.find({
            user: req.user._id,
        });

        res.status(200).json(routes);

    } catch (error) {
        console.error("Error in getMySavedRoutes:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteSavedRoute(req, res) {
    try {
        const { routeId } = req.params;

        const deleted = await SavedRoute.findByIdAndDelete(routeId);

        if (!deleted) {
            return res.status(404).json({ message: "Route not found" });
        }

        res.status(200).json({
            message: "Route deleted successfully",
        });

    } catch (error) {
        console.error("Error in deleteSavedRoute:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}