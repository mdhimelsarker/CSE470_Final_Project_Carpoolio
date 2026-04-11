import Ride from "../models/Ride.js"

export async function getAllRides(req, res) {
    try{
        const rides = await Ride.find();
        res.status(200).json(rides);
    }   catch (error){
        console.error("Error in getAllRides Controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getRideByID(req, res) {
    try {
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        res.status(200).json(ride);

    } catch (error) {
        console.error("Error in getRideById Controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function createRide(req, res) {
    try {
        const { pickupLocation, destination, date, time, availableSeats } = req.body;

        const ride = new Ride({
            pickupLocation,
            destination,
            date,
            time,
            availableSeats
        });
        const savedRide = await ride.save();
        res.status(201).json({
            message: "Ride created successfully",
            ride: {
                id: savedRide._id,
                pickupLocation: savedRide.pickupLocation,
                destination: savedRide.destination,
                date: savedRide.date,
                time: savedRide.time,
                availableSeats: savedRide.availableSeats,
                status: savedRide.status
            }
        });

    } catch (error) {
        console.error("Error in createRide Controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateRide(req, res) {
    try {
        const { pickupLocation, destination, date, time, availableSeats, status } = req.body;

        const updatedRide = await Ride.findByIdAndUpdate(
            req.params.id,
            { pickupLocation, destination, date, time, availableSeats, status },
            { new: true }
        );

        if (!updatedRide) {
            return res.status(404).json({ message: "Ride not found" });
        }

        res.status(200).json(updatedRide);

    } catch (error) {
        console.error("Error in updateRide Controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteRide(req, res) {
    try {
        const deletedRide = await Ride.findByIdAndDelete(req.params.id);
        if (!deletedRide) {
            return res.status(404).json({ message: "Ride not found" });
        }
        res.status(200).json({ message: "Ride deleted successfully" });
    } catch (error) {
        console.error("Error in deleteRide Controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}