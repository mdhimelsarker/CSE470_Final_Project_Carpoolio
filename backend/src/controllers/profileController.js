import User from "../models/User.js";

// @desc    Get current user's profile
// @route   GET /api/profile/me
export async function getProfile(req, res) {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                bio: user.bio,
                university: user.university,
                avatar: user.avatar,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Error in getProfile controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Update current user's profile
// @route   PUT /api/profile/me
export async function updateProfile(req, res) {
    try {
        const { name, phone, bio, university } = req.body;

        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (phone !== undefined) updateFields.phone = phone;
        if (bio !== undefined) updateFields.bio = bio;
        if (university !== undefined) updateFields.university = university;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateFields,
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                bio: updatedUser.bio,
                university: updatedUser.university,
                avatar: updatedUser.avatar,
                createdAt: updatedUser.createdAt,
            },
        });
    } catch (error) {
        console.error("Error in updateProfile controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Upload/update avatar for current user
// @route   POST /api/profile/me/avatar
export async function uploadAvatar(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const avatarPath = `/uploads/avatars/${req.file.filename}`;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: avatarPath },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Avatar uploaded successfully",
            avatar: updatedUser.avatar,
        });
    } catch (error) {
        console.error("Error in uploadAvatar controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Get public profile of another user
// @route   GET /api/profile/:userId
export async function getPublicProfile(req, res) {
    try {
        const user = await User.findById(req.params.userId).select(
            "name university bio avatar createdAt"
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                university: user.university,
                bio: user.bio,
                avatar: user.avatar,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Error in getPublicProfile controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
