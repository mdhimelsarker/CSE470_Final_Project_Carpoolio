import Vehicle from "../models/Vehicle.js";

export async function addVehicle(req, res) {
    try {
        const { type, brand, plateNumber, seats } = req.body;

        const vehicle = new Vehicle({
            owner: req.user._id,
            type,
            brand,
            plateNumber,
            seats,
        });

        const savedVehicle = await vehicle.save();

        res.status(201).json({
            message: "Vehicle added successfully",
            vehicle: savedVehicle,
        });

    } catch (error) {
        console.error("Error in addVehicle Controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export async function getMyVehicles(req, res) {
    try {
        const vehicles = await Vehicle.find({ owner: req.user._id });

        res.status(200).json(vehicles);

    } catch (error) {
        console.error("Error in getMyVehicles Controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export async function updateVehicle(req, res) {
    try {
        const { type, brand, plateNumber, seats } = req.body;

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            req.params.vehicleId,
            { type, brand, plateNumber, seats },
            { new: true }
        );

        if (!updatedVehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        res.status(200).json(updatedVehicle);

    } catch (error) {
        console.error("Error in updateVehicle Controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export async function deleteVehicle(req, res) {
    try {
        const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.vehicleId);

        if (!deletedVehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        res.status(200).json({ message: "Vehicle deleted successfully" });

    } catch (error) {
        console.error("Error in deleteVehicle Controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}