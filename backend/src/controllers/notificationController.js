import Notification from "../models/Notification.js";

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
export async function getMyNotifications(req, res) {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate("relatedRide", "origin destination departureTime")
            .sort({ createdAt: -1 });

        res.status(200).json({ notifications });
    } catch (error) {
        console.error("Error in getMyNotifications controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:notificationId/read
export async function markAsRead(req, res) {
    try {
        const notification = await Notification.findById(req.params.notificationId);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden - This is not your notification" });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({ message: "Notification marked as read", notification });
    } catch (error) {
        console.error("Error in markAsRead controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
export async function markAllRead(req, res) {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error in markAllRead controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// @desc    Delete a notification
// @route   DELETE /api/notifications/:notificationId
export async function deleteNotification(req, res) {
    try {
        const notification = await Notification.findById(req.params.notificationId);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden - This is not your notification" });
        }

        await notification.deleteOne();

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Error in deleteNotification controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}