const express = require("express");
const router = express.Router();
const AuditLog = require("../models/AuditLog");
const { protect, adminOnly } = require("../middleware/auth");

const serializeAuditLog = (log) => ({
  _id: log._id,
  user: log.user
    ? {
        id: log.user._id,
        name: `${log.user.firstName || ""} ${log.user.lastName || ""}`.trim(),
        email: log.user.email,
        role: log.user.role,
      }
    : null,
  action: log.action,
  module: log.module,
  description: log.description,
  resourceId: log.resourceId,
  ipAddress: log.ipAddress,
  device: log.device,
  createdAt: log.createdAt,
  metadata: log.metadata || {},
});

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { search = "", action = "", module = "", user = "", dateFrom = "", dateTo = "", page = 1, limit = 15 } = req.query;

    const logs = await AuditLog.find()
      .populate("user", "firstName lastName email role")
      .sort({ createdAt: -1 });

    const filteredLogs = logs.filter((log) => {
      const normalizedSearch = search.toLowerCase();
      const userName = `${log.user?.firstName || ""} ${log.user?.lastName || ""}`.toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        [log.action, log.module, log.description, userName, log.user?.email || ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesAction = !action || log.action === action;
      const matchesModule = !module || log.module === module;
      const matchesUser = !user || userName.includes(user.toLowerCase()) || (log.user?.email || "").toLowerCase().includes(user.toLowerCase());

      const createdAt = log.createdAt ? new Date(log.createdAt) : null;
      const matchesDateFrom = !dateFrom || !createdAt || createdAt >= new Date(dateFrom);
      const matchesDateTo = !dateTo || !createdAt || createdAt <= new Date(dateTo);

      return matchesSearch && matchesAction && matchesModule && matchesUser && matchesDateFrom && matchesDateTo;
    });

    const total = filteredLogs.length;
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 15));
    const start = (pageNumber - 1) * pageSize;
    const pagedLogs = filteredLogs.slice(start, start + pageSize);

    res.json({
      logs: pagedLogs.map(serializeAuditLog),
      total,
      page: pageNumber,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load audit logs", error: error.message });
  }
});

router.delete("/clear", protect, adminOnly, async (req, res) => {
  try {
    await AuditLog.deleteMany({});
    res.json({ message: "All audit logs cleared" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear audit logs", error: error.message });
  }
});

module.exports = router;
