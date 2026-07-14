const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  // Validate required environment variables
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USERNAME ||
    !process.env.SMTP_PASSWORD ||
    !process.env.SMTP_FROM_EMAIL
  ) {
    console.warn("⚠️ SMTP configuration is incomplete. Email notifications will be disabled.");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Email sending function with error handling
const sendEmail = async (to, subject, htmlContent, textContent = "") => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.warn(`⚠️ Email service not configured. Skipping email to: ${to}`);
      return { success: false, message: "Email service not configured", skipped: true };
    }

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "Wel Fragrance"}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]*>/g, ""), // Fallback: strip HTML tags
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return { success: false, message: error.message, error };
  }
};

// Non-blocking email sender (fire and forget, but log errors)
const sendEmailAsync = async (to, subject, htmlContent, textContent = "") => {
  // Send email in background without blocking the response
  try {
    await sendEmail(to, subject, htmlContent, textContent);
  } catch (error) {
    console.error(`❌ Background email sending failed for ${to}:`, error.message);
  }
};

// Verify SMTP connection (useful for debugging)
const verifyEmailConnection = async () => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.warn("⚠️ Email service not configured");
      return false;
    }

    await transporter.verify();
    console.log("✅ Email service connection verified successfully");
    return true;
  } catch (error) {
    console.error("❌ Email service connection failed:", error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendEmailAsync,
  verifyEmailConnection,
};
