const cron = require("node-cron");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
const {
  WARRANTY_REMINDER_DAYS,
  getWarrantyStatus,
} = require("../utils/warrantyIntelligence");
const { sendWarrantyAlert } = require("./emailService");

/**
 * Checks products in the database and sends warranty notifications if due.
 * If userId is provided, checks only that user's products. Otherwise checks all products.
 * Wrapped in try/catch to ensure server stability.
 */
const checkWarrantyExpirations = async (userId = null) => {
  console.log(
    `⏰ [Cron] Starting warranty expiration check ${
      userId ? `for user: ${userId}` : "(All Users)"
    }...`
  );

  try {
    const filter = userId ? { user: userId } : {};
    const products = await Product.find(filter).populate("user", "name email");
    console.log(`🔍 [Cron] Found ${products.length} products to check.`);

    let sentCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        if (!product.user || !product.user.email) {
          continue;
        }

        const { status, daysRemaining } = getWarrantyStatus(product);

        let notificationType = null;
        let reminderThreshold = null;

        // Check if matching an Expiring Soon threshold (30, 15, 7, 1 days)
        if (status === "Expiring Soon" && WARRANTY_REMINDER_DAYS.includes(daysRemaining)) {
          notificationType = "WARRANTY_EXPIRING";
          reminderThreshold = daysRemaining;
        } else if (status === "Expired" && daysRemaining === 0) {
          // Expired notification (0 days remaining)
          notificationType = "WARRANTY_EXPIRED";
          reminderThreshold = 0;
        }

        if (!notificationType) {
          continue;
        }

        // Check if this exact notification has already been sent
        const alreadySent = await Notification.findOne({
          product: product._id,
          type: notificationType,
          reminderDays: reminderThreshold,
        });

        if (alreadySent) {
          skippedCount++;
          continue;
        }

        console.log(
          `📬 [Cron] Sending ${notificationType} (${reminderThreshold} days) alert for '${product.name}' to ${product.user.email}`
        );

        // Send email alert
        await sendWarrantyAlert({
          to: product.user.email,
          userName: product.user.name,
          productName: product.name,
          brand: product.brand,
          warrantyEnd: product.warrantyEnd,
          daysRemaining: daysRemaining,
          isExpired: notificationType === "WARRANTY_EXPIRED",
        });

        // Record sent notification ONLY after successful email delivery
        await Notification.create({
          user: product.user._id,
          product: product._id,
          type: notificationType,
          reminderDays: reminderThreshold,
          sentAt: new Date(),
        });

        sentCount++;
      } catch (productError) {
        errorCount++;
        console.error(
          `❌ [Cron] Error processing notification for product ${product._id} (${product.name}):`,
          productError.message
        );
        // Continue processing remaining products without failing the cron
      }
    }

    console.log(
      `✅ [Cron] Warranty check completed: ${sentCount} sent, ${skippedCount} already notified, ${errorCount} errors.`
    );

    return {
      success: true,
      sentCount,
      skippedCount,
      errorCount,
      totalChecked: products.length,
    };
  } catch (globalError) {
    console.error("❌ [Cron] Critical error in warranty check process:", globalError);
    return {
      success: false,
      error: globalError.message,
    };
  }
};

/**
 * Initializes the daily cron job scheduler (Runs every day at 9:00 AM).
 */
const initWarrantyCron = () => {
  // Run once daily at 9:00 AM (server local time)
  cron.schedule("0 9 * * *", () => {
    console.log("⏰ Daily cron job triggered at 09:00 AM");
    checkWarrantyExpirations();
  });

  console.log("📅 Warranty Cron Scheduler initialized (Runs daily at 09:00 AM).");
};

module.exports = {
  initWarrantyCron,
  checkWarrantyExpirations,
};
