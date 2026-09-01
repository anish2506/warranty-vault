const nodemailer = require("nodemailer");

/**
 * Creates and configures Nodemailer transporter using environment variables.
 */
const createTransporter = () => {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";
  const pass = process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.trim() : "";
  const secure = process.env.EMAIL_SECURE === "true" || port === 465;

  if (!user || !pass || user === "your_email@gmail.com") {
    console.warn("⚠️ Email service: EMAIL_USER or EMAIL_PASSWORD not configured in server/.env");
  }

  // If using Gmail, Nodemailer has built-in service presets for high reliability
  if (host.includes("gmail") || user.endsWith("@gmail.com")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
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
 * Generic email sender.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const from = process.env.EMAIL_FROM || `"WarrantyVault" <${process.env.EMAIL_USER || "no-reply@warrantyvault.com"}>`;
  const transporter = createTransporter();

  const mailOptions = {
    from,
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✉️ Email sent successfully to ${to} (Message ID: ${info.messageId})`);
  return info;
};

/**
 * Sends a warranty alert email to a user.
 */
const sendWarrantyAlert = async ({ to, userName, productName, brand, warrantyEnd, daysRemaining, isExpired }) => {
  const template = getWarrantyEmailTemplate({
    userName,
    productName,
    brand,
    warrantyEnd,
    daysRemaining,
    isExpired,
  });

  return await sendEmail({
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
};

/**
 * Sends a test email to verify SMTP configuration.
 */
const sendTestEmail = async ({ to, userName }) => {
  return await sendEmail({
    to,
    subject: "✅ WarrantyVault — Test Email Notification",
    text: `Hello ${userName || "User"},\n\nThis is a test notification from WarrantyVault to verify that your email configuration is working properly.\n\nBest regards,\nWarrantyVault Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color: #2563eb; margin-top: 0;">✅ Email Configuration Active</h2>
        <p style="color: #374151; font-size: 15px;">
          Hello <strong>${userName || "there"}</strong>,
        </p>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
          This test email confirms that your WarrantyVault email alert system is connected and working successfully!
        </p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          WarrantyVault Email Service
        </p>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendWarrantyAlert,
  sendTestEmail,
  getWarrantyEmailTemplate,
};
