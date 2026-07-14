// Email templates – redesigned with brand palette + light/dark mode support
// Brand: Wel Fragrance Collection

const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5000';
const dashboardBaseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:5173';
const logoUrl = process.env.EMAIL_LOGO_URL || `${baseUrl}/webLogo.webp`;

const getBrandStyles = () => `
  <style>
    /* Reset & Base */
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { margin: 0; padding: 0; background-color: #FAFAF9; font-family: 'Inter', Arial, Helvetica, sans-serif; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    /* Utility classes for fallback in clients that support <style> */
    .brand-text { color: #1C1C1C; }
    .brand-light-text { color: #6B6B6B; }
    .brand-accent { color: #C79F48; }
    .brand-bg-light { background-color: #FAFAF9; }
    .brand-bg-dark { background-color: #0B0B0C; }
    .brand-bg-charcoal { background-color: #1C1C1C; }
    .brand-border { border-color: #E5E5E5; }
    .button-primary { background-color: #C79F48; color: #0B0B0C; border-radius: 4px; display: inline-block; padding: 12px 24px; text-decoration: none; font-weight: 600; }

    /* Dark mode overrides */
    @media (prefers-color-scheme: dark) {
      body, .email-outer {
        background-color: #0B0B0C !important;
      }
      .email-container {
        background-color: #1C1C1C !important;
      }
      .email-header, .email-footer {
        background-color: #0B0B0C !important;
      }
      .email-body {
        background-color: #1C1C1C !important;
        color: #FAFAF9 !important;
      }
      .email-body p, .email-body h1, .email-body h2, .email-body h3, .email-body h4, .email-body span, .email-body li {
        color: #FAFAF9 !important;
      }
      .email-body .brand-light-text {
        color: #B0B0B0 !important;
      }
      .email-body a {
        color: #C79F48 !important;
      }
      .email-body .brand-accent, .email-body strong[style*="color:#C79F48"] {
        color: #C79F48 !important;
      }
      .detail-box {
        background-color: #2A2A2A !important;
      }
      .detail-box, .detail-box p, .detail-box span {
        color: #FAFAF9 !important;
      }
      .detail-box strong[style*="color:#C79F48"] {
        color: #C79F48 !important;
      }
      .btn-primary {
        background-color: #C79F48 !important;
        color: #0B0B0C !important;
      }
      .email-footer p, .email-footer a {
        color: #B0B0B0 !important;
      }
      .email-footer a {
        color: #C79F48 !important;
      }
    }
  </style>
`;

// Base layout wrapper – updated footer (no location, no unsubscribe)
const wrapInBrandLayout = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  ${getBrandStyles()}
</head>
<body style="margin:0; padding:0; background-color:#FAFAF9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-outer" style="background-color:#FAFAF9;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" class="email-container" style="max-width:600px; margin:0 auto; background-color:#FAFAF9; border-radius:8px; overflow:hidden;">
          <!-- Header -->
          <tr>
            <td class="email-header" style="background-color:#1C1C1C; padding: 30px 30px 20px; text-align:center;">
              <h1 style="color:#C79F48; font-family:'Playfair Display', Georgia, serif; font-size:24px; margin:0;">WEL FRAGRANCE COLLECTION</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td class="email-body" style="padding: 30px; background-color:#FAFAF9;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="email-footer" style="background-color:#1C1C1C; padding: 30px; text-align:center; color:#6B6B6B; font-size:12px; line-height:1.6;">
              <p style="margin:0; color:#FAFAF9; font-size:14px;">&copy; ${new Date().getFullYear()} Wel Fragrance Collection. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// --- Template functions (brand names changed to Wel Fragrance Collection) ---

// 1. Inquiry Confirmation (to sender)
const inquiryConfirmationTemplate = (firstName, lastName, inquiryId) => {
  const content = `
    <p style="font-family:'Inter', Arial, sans-serif; color:#1C1C1C; font-size:16px; line-height:1.6; margin:0 0 20px;">
      Dear <strong>${firstName} ${lastName}</strong>,
    </p>
    <p style="font-family:'Inter', Arial, sans-serif; color:#1C1C1C; font-size:16px; line-height:1.6; margin:0 0 20px;">
      Thank you for reaching out to Wel Fragrance Collection. Your inquiry has been received and is now being reviewed by our team.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="detail-box" style="margin: 20px 0; background-color:#FFFFFF; border-left:4px solid #C79F48;">
      <tr>
        <td style="padding: 16px 20px;">
          <p style="margin:0; font-family:'Inter', Arial, sans-serif; font-size:15px; color:#1C1C1C;">
            <strong style="color:#C79F48;">Inquiry ID:</strong> ${inquiryId}
          </p>
          <p style="margin:8px 0 0; font-family:'Inter', Arial, sans-serif; font-size:15px; color:#6B6B6B;" class="brand-light-text">
            We typically respond within 24–48 hours.
          </p>
        </td>
      </tr>
    </table>
    <p style="font-family:'Inter', Arial, sans-serif; color:#1C1C1C; font-size:16px; line-height:1.6; margin:0 0 20px;">
      If you have any urgent questions, simply reply to this email or visit our website.
    </p>
    <p style="font-family:'Inter', Arial, sans-serif; color:#1C1C1C; font-size:16px; line-height:1.6; margin:0;">
      Best regards,<br>
      <strong style="color:#C79F48;">The Wel Fragrance Collection Team</strong>
    </p>
  `;
  return wrapInBrandLayout(content);
};

// 2. Inquiry Admin Notification
const inquiryAdminNotificationTemplate = (firstName, lastName, email, facebookLink, message, inquiryId) => {
  const content = `
    <p style="font-family:'Inter', Arial, sans-serif; color:#1C1C1C; font-size:16px; line-height:1.6; margin:0 0 20px;">
      A new inquiry has been submitted and is awaiting your review.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="detail-box" style="margin: 20px 0; background-color:#FFFFFF; border-left:4px solid #C79F48;">
      <tr>
        <td style="padding: 16px 20px;">
          <p style="margin:0 0 6px; font-family:'Inter', Arial, sans-serif; font-size:15px; color:#1C1C1C;">
            <strong style="color:#C79F48;">Name:</strong> ${firstName} ${lastName}
          </p>
          <p style="margin:0 0 6px; font-family:'Inter', Arial, sans-serif; font-size:15px; color:#1C1C1C;">
            <strong style="color:#C79F48;">Email:</strong> <a href="mailto:${email}" style="color:#1C1C1C;">${email}</a>
          </p>
          ${facebookLink ? `<p style="margin:0 0 6px; font-family:'Inter', Arial, sans-serif; font-size:15px; color:#1C1C1C;"><strong style="color:#C79F48;">Facebook:</strong> <a href="${facebookLink}" style="color:#1C1C1C;">${facebookLink}</a></p>` : ''}
          <p style="margin:0; font-family:'Inter', Arial, sans-serif; font-size:15px; color:#1C1C1C;">
            <strong style="color:#C79F48;">Inquiry ID:</strong> ${inquiryId}
          </p>
        </td>
      </tr>
    </table>
    <h3 style="font-family:'Playfair Display', Georgia, serif; color:#1C1C1C; font-size:18px; margin:20px 0 10px;">Message:</h3>
    <p style="font-family:'Inter', Arial, sans-serif; color:#1C1C1C; font-size:16px; line-height:1.6; margin:0 0 20px;">
      ${message.replace(/\n/g, '<br>')}
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 25px 0 0;">
      <tr>
        <td align="center" class="btn-primary" style="border-radius:4px; background-color:#C79F48;">
          <a href="${dashboardBaseUrl}/admin/inquiries/${inquiryId}" style="font-family:'Inter', Arial, sans-serif; font-size:16px; font-weight:600; color:#0B0B0C; text-decoration:none; display:inline-block; padding:12px 30px;">Review in Dashboard</a>
        </td>
      </tr>
    </table>
  `;
  return wrapInBrandLayout(content);
};

// 3. Testimonial Confirmation (to sender)
const testimonialConfirmationTemplate = (firstName, lastName, testimonialId) => {
  const content = `
    <p style="font-family:'Inter', Arial, sans-serif; color:#1C1C1C; font-size:16px; line-height:1.6; margin:0 0 20px;">
      Dear <strong>${firstName} ${lastName}</strong>,
    </p>
    <p style="font-family:'Inter', Arial, sans-serif; color:#1C1C1C; font-size:16px; line-height:1.6; margin:0 0 20px;">
      Thank you for sharing your experience with Wel Fragrance Collection. Your testimonial means the world to us and to future customers.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="detail-box" style="margin: 20px 0; background-color:#FFFFFF; border-left:4px solid #C79F48;">
      <tr>
        <td style="padding: 16px 20px;">
          <p style="margin:0; font-family:'Inter', Arial, sans-serif; font-size:15px; color:#1C1C1C;">
            <strong style="color:#C79F48;">Testimonial ID:</strong> ${testimonialId}
          </p>
          <p style="margin:8px 0 0; font-family:'Inter', Arial, sans-serif; font-size:15px; color:#6B6B6B;" class="brand-light-text">
            It is currently under review. Once approved, it will be featured on our website.
          </p>
        </td>
      </tr>
    </table>
    <p style="font-family:'Inter', Arial, sans-serif; color:#1C1C1C; font-size:16px; line-height:1.6; margin:0;">
      We'll notify you as soon as the review is complete.<br>
      Best regards,<br>
      <strong style="color:#C79F48;">The Wel Fragrance Collection Team</strong>
    </p>
  `;
  return wrapInBrandLayout(content);
};

// 4. Testimonial Admin Notification
const testimonialAdminNotificationTemplate = (firstName, lastName, email, rating, message, testimonialId) => {
  const stars = '⭐'.repeat(rating);
  const content = `
    <p style="font-family:'Inter', Arial, sans-serif; color:#1C1C1C; font-size:16px; line-height:1.6; margin:0 0 20px;">
      A new testimonial awaits your approval.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="detail-box" style="margin: 20px 0; background-color:#FFFFFF; border-left:4px solid #C79F48;">
      <tr>
        <td style="padding: 16px 20px;">
          <p style="margin:0 0 6px; font-family:'Inter', Arial, sans-serif; font-size:15px; color:#1C1C1C;">
            <strong style="color:#C79F48;">Name:</strong> ${firstName} ${lastName}
          </p>
          <p style="margin:0 0 6px; font-family:'Inter', Arial, sans-serif; font-size:15px; color:#1C1C1C;">
            <strong style="color:#C79F48;">Email:</strong> <a href="mailto:${email}" style="color:#1C1C1C;">${email}</a>
          </p>
          <p style="margin:0 0 6px; font-family:'Inter', Arial, sans-serif; font-size:15px; color:#1C1C1C;">
            <strong style="color:#C79F48;">Rating:</strong> ${stars} (${rating}/5)
          </p>
          <p style="margin:0; font-family:'Inter', Arial, sans-serif; font-size:15px; color:#1C1C1C;">
            <strong style="color:#C79F48;">ID:</strong> ${testimonialId}
          </p>
        </td>
      </tr>
    </table>
    <h3 style="font-family:'Playfair Display', Georgia, serif; color:#1C1C1C; font-size:18px; margin:20px 0 10px;">Message:</h3>
    <p style="font-family:'Inter', Arial, sans-serif; color:#1C1C1C; font-size:16px; line-height:1.6; margin:0 0 20px;">
      ${message.replace(/\n/g, '<br>')}
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 25px 0 0;">
      <tr>
        <td align="center" class="btn-primary" style="border-radius:4px; background-color:#C79F48;">
          <a href="${dashboardBaseUrl}/admin/testimonials/${testimonialId}" style="font-family:'Inter', Arial, sans-serif; font-size:16px; font-weight:600; color:#0B0B0C; text-decoration:none; display:inline-block; padding:12px 30px;">Review in Dashboard</a>
        </td>
      </tr>
    </table>
  `;
  return wrapInBrandLayout(content);
};

// 5. Testimonial Status Update (to sender)
const testimonialStatusUpdateTemplate = (firstName, lastName, status) => {
  const statusConfig = {
    Approved: {
      title: 'Your Testimonial Has Been Approved!',
      message: "Congratulations! Your testimonial is now live on our website. Thank you for helping others discover Wel Fragrance Collection.",
      badgeBg: '#28a745',
      emoji: '🎉',
    },
    Rejected: {
      title: 'Testimonial Review Update',
      message: "Thank you for your testimonial. We appreciate your feedback, but we're unable to feature it at this time. We value your understanding.",
      badgeBg: '#dc3545',
      emoji: '',
    },
    Pending: {
      title: 'Testimonial Received',
      message: 'Your testimonial is still under review. We will let you know once a decision has been made.',
      badgeBg: '#ffc107',
      emoji: '',
    },
  };
  const { title, message, badgeBg, emoji } = statusConfig[status] || statusConfig.Pending;

  const content = `
    <p style="font-family:'Inter', Arial, sans-serif; color:#1C1C1C; font-size:16px; line-height:1.6; margin:0 0 20px;">
      Dear <strong>${firstName} ${lastName}</strong>,
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 20px auto;">
      <tr>
        <td style="background-color:${badgeBg}; border-radius:20px; padding:8px 20px; text-align:center;">
          <span style="color:#FFFFFF; font-family:'Inter', Arial, sans-serif; font-weight:600; font-size:14px;">${status} ${emoji}</span>
        </td>
      </tr>
    </table>
    <h2 style="font-family:'Playfair Display', Georgia, serif; color:#1C1C1C; font-size:22px; margin:20px 0 10px; text-align:center;">${title}</h2>
    <p style="font-family:'Inter', Arial, sans-serif; color:#1C1C1C; font-size:16px; line-height:1.6; margin:0 0 20px;">
      ${message}
    </p>
    <p style="font-family:'Inter', Arial, sans-serif; color:#1C1C1C; font-size:16px; line-height:1.6; margin:0;">
      Best regards,<br>
      <strong style="color:#C79F48;">The Wel Fragrance Collection Team</strong>
    </p>
  `;
  return wrapInBrandLayout(content);
};

module.exports = {
  inquiryConfirmationTemplate,
  inquiryAdminNotificationTemplate,
  testimonialConfirmationTemplate,
  testimonialAdminNotificationTemplate,
  testimonialStatusUpdateTemplate,
};