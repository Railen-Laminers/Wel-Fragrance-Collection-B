const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

const serializeNotification = (notification) => ({
  _id: notification._id,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  link: notification.link,
  read: notification.read,
  createdAt: notification.createdAt,
});

router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

    res.json({
      notifications: notifications.map(serializeNotification),
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load notifications", error: error.message });
  }
});

router.patch("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.json(serializeNotification(notification));
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification", error: error.message });
  }
});

router.patch("/mark-all-read", protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });

    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notifications", error: error.message });
  }
});

router.delete("/clear", protect, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear notifications", error: error.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove notification", error: error.message });
  }
});

module.exports = router;
