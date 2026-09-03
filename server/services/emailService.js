const { Resend } = require("resend");

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generic email sender using Resend API (works on Render Free!)
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const from = process.env.EMAIL_FROM || "noreply@warrantyvault.com";

  try {
    const response = await resend.emails.send({
      from,
      to,
      subject,
      html: html || text,
    });

    console.log(`✉️ Email sent successfully to ${to} (Message ID: ${response.id})`);
    return response;
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    throw error;
  }
};

/**
 * Generates an HTML email template for warranty expiration alerts.
 */
const getWarrantyEmailTemplate = ({ userName, productName, brand, warrantyEnd, daysRemaining, isExpired }) => {
  const brandDisplay = brand ? ` (${brand})` : "";
  const formattedDate = warrantyEnd
    ? new Date(warrantyEnd).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";

  if (isExpired) {
    return {
      subject: `🚨 Warranty Expired — ${productName}`,
      text: `Hello ${userName || "User"},\n\nYour warranty for ${productName}${brandDisplay} expired on ${formattedDate}.\n\nPlease check your WarrantyVault account for more details.\n\nBest regards,\nWarrantyVault Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 10px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #dc2626; margin: 0; font-size: 24px;">Warranty Expired</h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">WarrantyVault Notification</p>
          </div>
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <p style="margin: 0; color: #991b1b; font-size: 15px;">
              Hello <strong>${userName || "there"}</strong>, your warranty coverage for <strong>${productName}${brandDisplay}</strong> has expired.
            </p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Product:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #111827;">${productName}</td>
            </tr>
            ${brand ? `<tr><td style="padding: 8px 0; color: #6b7280;">Brand:</td><td style="padding: 8px 0; font-weight: bold; color: #111827;">${brand}</td></tr>` : ""}
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Expiration Date:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #dc2626;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Status:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #dc2626;">Expired</td>
            </tr>
          </table>
          <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
            Log in to your WarrantyVault dashboard anytime to view your receipts, documents, or register new products.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            Sent by WarrantyVault — Your Smart Warranty & Receipt Tracker
          </p>
        </div>
      `,
    };
  }

  const daysText = daysRemaining === 1 ? "1 day" : `${daysRemaining} days`;

  return {
    subject: `⚠️ Warranty Expiring in ${daysText} — ${productName}`,
    text: `Hello ${userName || "User"},\n\nYour warranty for ${productName}${brandDisplay} will expire in ${daysText} on ${formattedDate}.\n\nPlease check your WarrantyVault account for more details.\n\nBest regards,\nWarrantyVault Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 10px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #d97706; margin: 0; font-size: 24px;">Warranty Expiring Soon</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">WarrantyVault Reminder</p>
        </div>
        <div style="background-color: #fffbeb; border-left: 4px solid #d97706; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
          <p style="margin: 0; color: #92400e; font-size: 15px;">
            Hello <strong>${userName || "there"}</strong>, your warranty for <strong>${productName}${brandDisplay}</strong> expires in <strong>${daysText}</strong>.
          </p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Product:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #111827;">${productName}</td>
          </tr>
          ${brand ? `<tr><td style="padding: 8px 0; color: #6b7280;">Brand:</td><td style="padding: 8px 0; font-weight: bold; color: #111827;">${brand}</td></tr>` : ""}
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Warranty End:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #111827;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Remaining Time:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #d97706;">${daysText}</td>
          </tr>
        </table>
        <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
          If you need service or wish to extend your warranty, now is a great time to act before coverage ends.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Sent by WarrantyVault — Your Smart Warranty & Receipt Tracker
        </p>
      </div>
    `,
  };
};

/**
 * Test email sender
 */
const sendTestEmail = async (email) => {
  const template = getWarrantyEmailTemplate({
    userName: "Test User",
    productName: "Test Product",
    brand: "Test Brand",
    warrantyEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    daysRemaining: 7,
    isExpired: false,
  });

  await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  });
};

/**
 * Send warranty alert email
 */
const sendWarrantyAlert = async (user, product, daysRemaining) => {
  try {
    const template = getWarrantyEmailTemplate({
      userName: user.username,
      productName: product.name,
      brand: product.brand,
      warrantyEnd: product.warrantyEnd,
      daysRemaining,
      isExpired: daysRemaining <= 0,
    });

    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });

    console.log(`✉️ Warranty alert sent to ${user.email} for ${product.name}`);
  } catch (error) {
    console.error(`❌ Failed to send warranty alert to ${user.email}:`, error.message);
  }
};

module.exports = {
  sendEmail,
  sendTestEmail,
  sendWarrantyAlert,
  getWarrantyEmailTemplate,
};