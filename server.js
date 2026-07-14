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

const app = express();

// Allowed origins (includes your env variable for flexibility)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://wel-fragrance-collection.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean); // Removes any undefined values

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin} not allowed`)); // Explicit error
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true, // Keep this. Even though you use Authorization header, it's harmless and safe.
};

// Apply CORS globally
app.use(cors(corsOptions));

// Explicitly handle preflight requests (optional, but guarantees OPTIONS are caught)
app.options("*", cors(corsOptions));

// The rest of your middleware
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});