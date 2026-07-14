const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");
const { logActivity } = require("../utils/audit");

const serializeProduct = (product) => ({
  _id: product._id,
  name: product.name,
  notes: product.notes,
  price: product.price,
  image: product.image,
  tag: product.tag,
  featured: product.featured,
  gender: product.gender,
  story: product.story,
  type: product.type,
  isActive: product.isActive,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

router.get("/public", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products.map(serializeProduct));
  } catch (error) {
    res.status(500).json({ message: "Failed to load products", error: error.message });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, featured: true }).sort({ createdAt: -1 });
    res.json(products.map(serializeProduct));
  } catch (error) {
    res.status(500).json({ message: "Failed to load featured products", error: error.message });
  }
});

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products.map(serializeProduct));
  } catch (error) {
    res.status(500).json({ message: "Failed to load products", error: error.message });
  }
});

router.get("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(serializeProduct(product));
  } catch (error) {
    res.status(500).json({ message: "Failed to load product", error: error.message });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const payload = req.body || {};

    if (!payload.name) {
      return res.status(400).json({ message: "Product name is required" });
    }

    const product = await Product.create({
      name: payload.name.trim(),
      notes: payload.notes || "",
      price: Number(payload.price) || 0,
      image: payload.image || "",
      tag: payload.tag || "",
      featured: Boolean(payload.featured),
      gender: payload.gender || "Unisex",
      story: payload.story || "",
      type: Number(payload.type || 1),
      isActive: payload.isActive !== false,
    });

    await logActivity({
      req,
      user: req.user,
      action: "Create",
      module: "Products",
      description: `Created product ${product.name}`,
      resourceId: product._id.toString(),
    });

    res.status(201).json(serializeProduct(product));
  } catch (error) {
    res.status(500).json({ message: "Failed to create product", error: error.message });
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const allowedUpdates = ["name", "notes", "price", "image", "tag", "featured", "gender", "story", "type", "isActive"];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "type") {
          product[field] = Number(req.body[field]);
        } else if (field === "price") {
          product[field] = Number(req.body[field]);
        } else if (field === "featured" || field === "isActive") {
          product[field] = Boolean(req.body[field]);
        } else {
          product[field] = req.body[field];
        }
      }
    });

    await product.save();

    await logActivity({
      req,
      user: req.user,
      action: "Update",
      module: "Products",
      description: `Updated product ${product.name}`,
      resourceId: product._id.toString(),
    });

    res.json(serializeProduct(product));
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await logActivity({
      req,
      user: req.user,
      action: "Delete",
      module: "Products",
      description: `Deleted product ${product.name}`,
      resourceId: product._id.toString(),
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
});

module.exports = router;
