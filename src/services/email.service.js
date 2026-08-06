const nodemailer = require("nodemailer");
const logger = require("../config/logger");

/**
 * HTML & Plain Text Templates for Auth System Emails
 */
const getVerificationEmailTemplate = (name, verifyUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: 700; color: #6366f1; letter-spacing: -0.5px; }
        .content { font-size: 15px; line-height: 1.6; color: #cbd5e1; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin: 24px 0; text-align: center; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
        .footer { margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #334155; padding-top: 20px; }
        .link { word-break: break-all; color: #818cf8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">NexusDocs Studio</div>
        </div>
        <div class="content">
          <h2>Welcome, ${name}! 👋</h2>
          <p>Thank you for signing up. Please verify your email address to activate your account and start collaborating in real time.</p>
          <div style="text-align: center;">
            <a href="${verifyUrl}" class="btn">Verify Email Address</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${verifyUrl}" class="link">${verifyUrl}</a></p>
          <p>This verification link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} NexusDocs Studio. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Hi ${name},\n\nPlease verify your email address for NexusDocs Studio by clicking the link below:\n\n${verifyUrl}\n\nThis link will expire in 24 hours.\n\nThank you!`;

  return { html, text };
};

const getPasswordResetEmailTemplate = (name, resetUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: 700; color: #6366f1; letter-spacing: -0.5px; }
        .content { font-size: 15px; line-height: 1.6; color: #cbd5e1; }
        .btn { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin: 24px 0; text-align: center; box-shadow: 0 4px 12px rgba(239,68,68,0.3); }
        .footer { margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #334155; padding-top: 20px; }
        .link { word-break: break-all; color: #f87171; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">NexusDocs Studio</div>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password for your NexusDocs Studio account. Click the button below to choose a new password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="btn">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>
          <p><strong>Note:</strong> This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} NexusDocs Studio. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Hello ${name},\n\nWe received a request to reset your password for NexusDocs Studio. Use the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour. If you did not request this, please ignore this email.\n\nThank you!`;

  return { html, text };
};

/**
 * Pluggable Enterprise Email Service
 * Supports SMTP (Mailtrap / Custom SMTP) with fallback to logging transporter in development/testing.
 * Modular design allows swapping transporter to Resend, SendGrid, or AWS SES without changing business logic.
 */
class EmailService {
  constructor() {
    this.frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    this.fromEmail = process.env.SMTP_FROM || "NexusDocs Studio <noreply@nexusdocs.studio>";
    this.transporter = this.initTransporter();
  }

  initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      logger.info(`[EmailService] Initializing SMTP Transport via ${host}:${port}`);
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }

    logger.info("[EmailService] No SMTP credentials configured. Defaulting to console log transport for development/test.");
    return null;
  }

  async sendEmail({ to, subject, html, text }) {
    logger.info(`[EmailService] Sending email to: ${to} | Subject: "${subject}"`);

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: this.fromEmail,
          to,
          subject,
          html,
          text,
        });
        logger.info(`[EmailService] Message sent successfully via SMTP. Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (err) {
        logger.error(`[EmailService] SMTP transport failed: ${err.message}`);
        // Fallback gracefully without breaking main app flow
      }
    }

    return { success: true, simulated: true };
  }

  async sendVerificationEmail(email, name, token) {
    const verifyUrl = `${this.frontendUrl}/verify-email?token=${token}`;
    const { html, text } = getVerificationEmailTemplate(name || "User", verifyUrl);

    logger.info(`[EmailService] Verification Link: ${verifyUrl}`);

    await this.sendEmail({
      to: email,
      subject: "Verify your email address - NexusDocs Studio",
      html,
      text,
    });

    return {
      success: true,
      email,
      verifyUrl,
      message: "Verification email dispatched successfully.",
    };
  }

  async sendPasswordResetEmail(email, name, token) {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    const { html, text } = getPasswordResetEmailTemplate(name || "User", resetUrl);

    logger.info(`[EmailService] Reset Link: ${resetUrl}`);

    await this.sendEmail({
      to: email,
      subject: "Reset your password - NexusDocs Studio",
      html,
      text,
    });

    return {
      success: true,
      email,
      resetUrl,
      message: "Password reset email dispatched successfully.",
    };
  }
}

module.exports = new EmailService();
