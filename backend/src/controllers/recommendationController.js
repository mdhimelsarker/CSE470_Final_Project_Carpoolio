import Ride from "../models/Ride.js";
import RideRequest from "../models/RideRequest.js";
import SavedRoute from "../models/SavedRoute.js";

const escapeRegExp = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const buildRouteKey = (origin, destination) => {
    return `${origin.trim().toLowerCase()}||${destination.trim().toLowerCase()}`;
};

export async function getRecommendedRides(req, res) {
    try {
        const userId = req.user._id;

        const savedRoutes = await SavedRoute.find({ user: userId }).select("origin destination");

        const acceptedRequests = await RideRequest.find({
            passenger: userId,
            status: "accepted",
        }).populate({
            path: "ride",
            select: "origin destination status driver departureTime arrivalTime availableSeats fare",
        });

        const routeScores = new Map();
        const addRouteScore = (origin, destination, weight) => {
            if (!origin || !destination) return;
            const key = buildRouteKey(origin, destination);
            const current = routeScores.get(key) || 0;
            routeScores.set(key, current + weight);
        };

        savedRoutes.forEach((route) => {
            addRouteScore(route.origin, route.destination, 3);
        });

        acceptedRequests.forEach((request) => {
            if (request.ride) {
                addRouteScore(request.ride.origin, request.ride.destination, 2);
            }
        });

        const preferredRoutes = Array.from(routeScores.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([key]) => {
                const [origin, destination] = key.split("||");
                return { origin, destination };
            });

        const exactMatches = preferredRoutes.map((route) => ({
            origin: new RegExp(`^${escapeRegExp(route.origin)}$`, "i"),
            destination: new RegExp(`^${escapeRegExp(route.destination)}$`, "i"),
        }));

        const originValues = [...new Set(preferredRoutes.map((route) => route.origin))];
        const destinationValues = [...new Set(preferredRoutes.map((route) => route.destination))];

        let rides = [];

        if (exactMatches.length > 0) {
            rides = await Ride.find({
                status: "open",
                driver: { $ne: userId },
                $or: exactMatches,
            })
                .populate("driver", "name email avgRating")
                .populate("vehicle");
        }

        if (rides.length === 0) {
            const fallbackFilter = { status: "open", driver: { $ne: userId } };
            const orConditions = [];

            if (originValues.length > 0) {
                orConditions.push({ origin: { $in: originValues.map((origin) => new RegExp(`^${escapeRegExp(origin)}$`, "i")) } });
            }
            if (destinationValues.length > 0) {
                orConditions.push({ destination: { $in: destinationValues.map((destination) => new RegExp(`^${escapeRegExp(destination)}$`, "i")) } });
            }

            if (orConditions.length > 0) {
                fallbackFilter.$or = orConditions;
            }

            rides = await Ride.find(fallbackFilter)
                .populate("driver", "name email avgRating")
                .populate("vehicle")
                .sort({ departureTime: 1 })
                .limit(20);
        }

        const scoreRide = (ride) => {
            const routeKey = buildRouteKey(ride.origin, ride.destination);
            let score = routeScores.get(routeKey) || 0;
            if (originValues.some((origin) => origin.toLowerCase() === ride.origin.toLowerCase())) score += 1;
            if (destinationValues.some((destination) => destination.toLowerCase() === ride.destination.toLowerCase())) score += 1;
            return score;
        };

        rides = rides
            .map((ride) => ({ ride, score: scoreRide(ride) }))
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return new Date(a.ride.departureTime) - new Date(b.ride.departureTime);
            })
            .map((item) => item.ride);

        res.status(200).json(rides);
    } catch (error) {
        console.error("Error in getRecommendedRides:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
