import User from "../models/User.js";

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        res.status(200).json(users);

    } catch (error) {
        console.error("Error in getAllUsers:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Ban user
export const banUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.isBanned = true;

        await user.save();

        res.status(200).json({
            message: "User banned successfully",
            user,
        });

    } catch (error) {
        console.error("Error in banUser:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Unban user

export const unbanUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.isBanned = false;

        await user.save();

        res.status(200).json({
            message: "User unbanned successfully",
            user,
        });

    } catch (error) {
        console.error("Error in unbanUser:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Verify user
export const verifyUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.isVerified = true;

        await user.save();

        res.status(200).json({
            message: "User verified successfully",
            user,
        });

    } catch (error) {
        console.error("Error in verifyUser:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};