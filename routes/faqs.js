const express = require("express");
const router = express.Router();
const FAQ = require("../models/FAQ");
const { protect, adminOnly } = require("../middleware/auth");
const { logActivity } = require("../utils/audit");

// Public route to get all active FAQs
router.get("/public", async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: "Failed to load FAQs", error: error.message });
  }
});

// Admin route to get all FAQs
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: "Failed to load FAQs", error: error.message });
  }
});

// Admin route to create a new FAQ
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { question, answer, isActive, order } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: "Question and answer are required" });
    }

    const faq = await FAQ.create({
      question: question.trim(),
      answer: answer.trim(),
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    await logActivity({
      req,
      user: req.user,
      action: "Create",
      module: "FAQs",
      description: `Created new FAQ: ${question.substring(0, 30)}...`,
      resourceId: faq._id.toString(),
    });

    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ message: "Failed to create FAQ", error: error.message });
  }
});

// Admin route to update an FAQ
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    const allowedUpdates = ["question", "answer", "isActive", "order"];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        faq[field] = req.body[field];
      }
    });

    await faq.save();

    await logActivity({
      req,
      user: req.user,
      action: "Update",
      module: "FAQs",
      description: `Updated FAQ ${faq._id}`,
      resourceId: faq._id.toString(),
    });

    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: "Failed to update FAQ", error: error.message });
  }
});

// Admin route to delete an FAQ
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    await logActivity({
      req,
      user: req.user,
      action: "Delete",
      module: "FAQs",
      description: `Deleted FAQ ${req.params.id}`,
      resourceId: req.params.id,
    });

    res.json({ message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete FAQ", error: error.message });
  }
});

module.exports = router;
