const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendTestEmail } = require("../services/emailService");
const { checkWarrantyExpirations } = require("../services/warrantyCron");

/**
 * Sends a test email to the authenticated user.
 */
const sendUserTestEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const info = await sendTestEmail({
      to: user.email,
      userName: user.name,
    });

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${user.email}`,
      messageId: info.id,
    });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send test email",
    });
  }
};

/**
 * Manually triggers a warranty expiration check and notification dispatch.
 */
const triggerWarrantyCheck = async (req, res) => {
  try {
    const result = await checkWarrantyExpirations(req.user.id);
    res.status(200).json({
      success: true,
      message: "Warranty check completed",
      result,
    });
  } catch (error) {
    console.error("Trigger check error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to trigger warranty check",
    });
  }
};

/**
 * Retrieves notification history for the authenticated user.
 */
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate("product", "name brand category warrantyEnd")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load notifications",
    });
  }
};

module.exports = {
  sendUserTestEmail,
  triggerWarrantyCheck,
  getUserNotifications,
};
