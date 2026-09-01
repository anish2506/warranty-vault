const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  sendUserTestEmail,
  triggerWarrantyCheck,
  getUserNotifications,
} = require("../controllers/notificationController");

const router = express.Router();

// Protected notification routes
router.post("/test-email", protect, sendUserTestEmail);
router.post("/trigger-check", protect, triggerWarrantyCheck);
router.get("/", protect, getUserNotifications);

module.exports = router;
