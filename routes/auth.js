const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");
const { logActivity, createNotification } = require("../utils/audit");

const router = express.Router();

const serializeUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  middleInitial: user.middleInitial,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  businessName: user.businessName || "",
  emailAddresses: user.emailAddresses || [],
  contactNumbers: user.contactNumbers || [],
  instagramAccounts: user.instagramAccounts || [],
  facebookPages: user.facebookPages || [],
  businessLocations: user.businessLocations || [],
});

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "wel-fragrance-secret",
    { expiresIn: "7d" }
  );

const normalizeList = (value) => {
  if (!Array.isArray(value)) {
    return typeof value === "string"
      ? value
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
};

const normalizeString = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

router.post("/register", async (req, res) => {
  try {
    const { firstName, middleInitial, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Please provide firstName, lastName, email and password" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({
      firstName,
      middleInitial,
      lastName,
      email: normalizedEmail,
      password,
      role: role === "admin" ? "admin" : "customer",
    });

    await logActivity({
      req,
      user,
      action: "Create",
      module: "Users",
      description: `Registered a new customer account for ${user.firstName} ${user.lastName}`,
      resourceId: user._id.toString(),
      metadata: { role: user.role },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: serializeUser(user),
      token: signToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/register-admin", protect, adminOnly, async (req, res) => {
  try {
    const { firstName, middleInitial, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Please provide firstName, lastName, email and password" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({
      firstName,
      middleInitial,
      lastName,
      email: normalizedEmail,
      password,
      role: "admin",
    });

    await logActivity({
      req,
      user: req.user,
      action: "Create",
      module: "Users",
      description: `Created a new admin account for ${user.firstName} ${user.lastName}`,
      resourceId: user._id.toString(),
      metadata: { role: user.role },
    });

    res.status(201).json({
      message: "Admin registered successfully",
      user: serializeUser(user),
      token: signToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    await logActivity({
      req,
      user,
      action: "Login",
      module: "Auth",
      description: `${user.firstName} ${user.lastName} signed in`,
      resourceId: user._id.toString(),
      metadata: { role: user.role },
    });

    res.json({
      message: "Login successful",
      user: serializeUser(user),
      token: signToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ user: serializeUser(user) });
});

router.post("/logout", protect, async (req, res) => {
  try {
    await logActivity({
      req,
      user: req.user,
      action: "Logout",
      module: "Auth",
      description: `${req.user.firstName} ${req.user.lastName} signed out`,
      resourceId: req.user._id.toString(),
      metadata: { role: req.user.role },
    });

    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Failed to complete logout", error: error.message });
  }
});

router.get("/contact-info", async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" }).sort({ createdAt: 1 });

    if (!admin) {
      return res.json({
        businessName: "Wel Fragrance Collection",
        emailAddresses: ["wel.fragrancecollection@gmail.com"],
        contactNumbers: ["+1 7782219055"],
        instagramAccounts: ["@Wel_FragranceCollection"],
        facebookPages: [],
        businessLocations: ["Farcon Ville, San Cristobal, Calamba Laguna"],
      });
    }

    res.json({
      businessName: admin.businessName || "Wel Fragrance Collection",
      emailAddresses: admin.emailAddresses || ["wel.fragrancecollection@gmail.com"],
      contactNumbers: admin.contactNumbers || ["+1 7782219055"],
      instagramAccounts: admin.instagramAccounts || ["@Wel_FragranceCollection"],
      facebookPages: admin.facebookPages || [],
      businessLocations: admin.businessLocations || ["Farcon Ville, San Cristobal, Calamba Laguna"],
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load contact information", error: error.message });
  }
});

router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      firstName,
      middleInitial,
      lastName,
      email,
      businessName,
      emailAddresses,
      contactNumbers,
      instagramAccounts,
      facebookPages,
      businessLocations,
    } = req.body;

    const trimmedFirstName = normalizeString(firstName);
    const trimmedLastName = normalizeString(lastName);
    const trimmedEmail = normalizeString(email);

    if (firstName !== undefined && !trimmedFirstName) {
      return res.status(400).json({ message: "First name is required" });
    }

    if (lastName !== undefined && !trimmedLastName) {
      return res.status(400).json({ message: "Last name is required" });
    }

    if (email !== undefined) {
      if (!trimmedEmail) {
        return res.status(400).json({ message: "Email is required" });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail.toLowerCase())) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }

      const existingUser = await User.findOne({ email: trimmedEmail.toLowerCase(), _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }
    }

    if (firstName !== undefined) user.firstName = trimmedFirstName;
    if (middleInitial !== undefined) user.middleInitial = normalizeString(middleInitial);
    if (lastName !== undefined) user.lastName = trimmedLastName;

    if (email !== undefined) {
      user.email = trimmedEmail.toLowerCase();
    }

    if (user.role === "admin") {
      if (businessName !== undefined) user.businessName = normalizeString(businessName);
      if (emailAddresses !== undefined) user.emailAddresses = normalizeList(emailAddresses);
      if (contactNumbers !== undefined) user.contactNumbers = normalizeList(contactNumbers);
      if (instagramAccounts !== undefined) user.instagramAccounts = normalizeList(instagramAccounts);
      if (facebookPages !== undefined) user.facebookPages = normalizeList(facebookPages);
      if (businessLocations !== undefined) user.businessLocations = normalizeList(businessLocations);
    }

    await user.save();

    await logActivity({
      req,
      user,
      action: "Update",
      module: "Profile",
      description: `${user.firstName} ${user.lastName} updated profile information`,
      resourceId: user._id.toString(),
    });

    res.json({
      message: "Profile updated successfully",
      user: serializeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
});

router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword, userId } = req.body;
    const targetUserId = userId || req.user._id;

    if (String(targetUserId) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the account owner or an admin can change this password" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "New password and confirmation are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirmation must match" });
    }

    if (String(targetUserId) === String(req.user._id)) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }

      const isMatch = await targetUser.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
    }

    targetUser.password = newPassword;
    await targetUser.save();

    await logActivity({
      req,
      user: req.user,
      action: "Update",
      module: "Profile",
      description:
        req.user.role === "admin" && String(targetUser._id) !== String(req.user._id)
          ? `${req.user.firstName} ${req.user.lastName} changed the password for ${targetUser.firstName} ${targetUser.lastName}`
          : `${targetUser.firstName} ${targetUser.lastName} changed their password`,
      resourceId: targetUser._id.toString(),
    });

    await createNotification({
      recipientUserIds: [targetUser._id],
      title: "Password updated",
      message: "Your password was changed successfully.",
      link: "/profile",
      type: "warning",
    });

    res.json({ message: "Password updated successfully", user: serializeUser(targetUser) });
  } catch (error) {
    res.status(500).json({ message: "Failed to update password", error: error.message });
  }
});

module.exports = router;
