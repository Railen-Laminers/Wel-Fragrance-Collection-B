const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");
const User = require("../models/User");

const getClientInfo = (req) => ({
  ipAddress:
    req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req?.ip ||
    req?.connection?.remoteAddress ||
    "",
  device: req?.headers?.["user-agent"] || "",
});

const logActivity = async ({ req, user, action, module, description, resourceId, metadata = {} }) => {
  try {
    const { ipAddress, device } = getClientInfo(req);
    const actorId = user?._id || user?.id || null;

    await AuditLog.create({
      user: actorId,
      action,
      module,
      description,
      resourceId: resourceId || "",
      ipAddress,
      device,
      metadata,
    });
  } catch (error) {
    console.error("Failed to create audit log", error.message);
  }
};

const createNotification = async ({ recipientUserIds, title, message, link = "/", type = "info" }) => {
  try {
    const recipients = Array.isArray(recipientUserIds) ? recipientUserIds : [recipientUserIds];
    const normalizedRecipients = recipients.filter(Boolean);

    if (!normalizedRecipients.length) {
      const admins = await User.find({ role: "admin" }).select("_id");
      normalizedRecipients.push(...admins.map((user) => user._id));
    }

    if (!normalizedRecipients.length) {
      return [];
    }

    const notifications = await Notification.insertMany(
      normalizedRecipients.map((recipient) => ({
        recipient,
        title,
        message,
        type,
        link,
      }))
    );

    return notifications;
  } catch (error) {
    console.error("Failed to create notification", error.message);
    return [];
  }
};

module.exports = { logActivity, createNotification, getClientInfo };
