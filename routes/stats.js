const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Testimonial = require("../models/Testimonial");
const Inquiry = require("../models/Inquiry");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/admin/stats
// Returns total counts for products, testimonials, and inquiries
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const [productsCount, testimonialsCount, inquiriesCount] = await Promise.all([
      Product.countDocuments(),
      Testimonial.countDocuments(),
      Inquiry.countDocuments(),
    ]);

    res.json({
      totalProducts: productsCount,
      totalTestimonials: testimonialsCount,
      totalInquiries: inquiriesCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load stats", error: error.message });
  }
});

module.exports = router;
