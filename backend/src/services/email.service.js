const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

const sendPasswordResetEmail = async (toEmail, resetToken, userName = 'Student') => {
  const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0F172A; margin-bottom: 16px;">KSLU Circle - Password Reset Request</h2>
      <p style="color: #334155;">Hello ${userName},</p>
      <p style="color: #334155;">We received a request to reset your password for your KSLU Circle academic account.</p>
      <div style="margin: 24px 0;">
        <a href="${resetLink}" style="background-color: #1E3A8A; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #64748B; font-size: 14px;">If you did not request this, please ignore this email. This link will expire in 1 hour.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94A3B8; font-size: 12px;">KSLU Circle – Your Academic World, All in One Circle.<br/>Independent peer-learning platform for Karnataka law students.</p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'KSLU Circle <noreply@kslucircle.org>',
        to: toEmail,
        subject: 'KSLU Circle - Reset Your Password',
        html
      });
      logger.info(`Password reset email sent to ${toEmail}`);
      return true;
    } catch (err) {
      logger.error('Failed to send reset email via SMTP:', err.message);
    }
  }

  // Fallback for local development
  logger.info(`[DEV MODE] Password reset link for ${toEmail}: ${resetLink}`);
  return true;
};

module.exports = {
  sendPasswordResetEmail
};
