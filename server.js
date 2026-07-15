const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const testimonialRoutes = require("./routes/testimonials");
const inquiryRoutes = require("./routes/inquiries");
const productRoutes = require("./routes/products");
const statsRoutes = require("./routes/stats");
const notificationRoutes = require("./routes/notifications");
const auditLogsRoutes = require("./routes/auditLogs");

// **Optional**: you can also add DNS fix here, but it's already in emailService.js.
// If you want to be absolutely sure, you can also add it here:
// const dns = require('dns');
// dns.setDefaultResultOrder('ipv4first');

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://wel-fragrance-collection.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin} not allowed`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
};

// This ONE middleware handles CORS for ALL routes, including OPTIONS
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

connectDB();

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Wel Fragrance API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin/stats", statsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/audit-logs", auditLogsRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Optional: verify email connection on startup
const { verifyEmailConnection } = require("./services/emailService");
verifyEmailConnection()
  .then(ok => {
    if (ok) console.log("✅ SMTP ready for production");
    else console.warn("⚠️ SMTP is not available – check your environment variables");
  })
  .catch(err => console.error("SMTP verification error:", err.message));