const bcrypt = require("bcrypt");
const crypto = require("crypto");
const prisma = require("../config/database");
const logger = require("../config/logger");
const emailService = require("./email.service");
const sessionService = require("./session.service");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Enterprise Authentication Service
 * Clean architecture layer encapsulating core authentication workflows.
 */
class AuthService {
  /**
   * Register a new user with secure verification token hash
   */
  async registerUser({ name, email, password, forceVerification, metadata }) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error = new Error("Email already exists");
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Generate secure verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = hashToken(verificationToken);
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

    const shouldAutoVerify =
      forceVerification === true
        ? false
        : process.env.NODE_ENV === "test" ||
          process.env.SKIP_EMAIL_VERIFICATION === "true" ||
          process.env.NODE_ENV !== "production";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        isVerified: shouldAutoVerify,
        verificationTokenHash: shouldAutoVerify ? null : verificationTokenHash,
        verificationTokenExpiresAt: shouldAutoVerify ? null : verificationTokenExpiresAt,
      },
    });

    if (!shouldAutoVerify) {
      await emailService.sendVerificationEmail(user.email, user.name, verificationToken);
    }

    let tokens = null;
    if (user.isVerified) {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      await sessionService.createSession(user.id, refreshToken, metadata);
      tokens = { accessToken, refreshToken };
    }

    return {
      user,
      tokens,
      verificationToken: shouldAutoVerify ? undefined : verificationToken,
      requiresVerification: !user.isVerified,
    };
  }

  /**
   * Login user with verification check & account lockout guard
   */
  async loginUser({ email, password, metadata }) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const now = new Date();
    if (user.lockedUntil && new Date(user.lockedUntil) > now) {
      const remainingSeconds = Math.ceil((new Date(user.lockedUntil) - now) / 1000);
      const error = new Error("Too many failed login attempts. Please try again in 5 minutes.");
      error.statusCode = 429;
      error.remainingSeconds = remainingSeconds;
      throw error;
    }

    if (user.lockedUntil && new Date(user.lockedUntil) <= now) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lockedUntil: null, failedLoginAttempts: 0 },
      });
    }

    if (!user.passwordHash) {
      const error = new Error("Account uses OAuth sign-in. Please log in with Google.");
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const updatedAttempts = (user.failedLoginAttempts || 0) + 1;
      const isLockedNow = updatedAttempts >= 3;
      const lockUntilDate = isLockedNow ? new Date(Date.now() + 5 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: updatedAttempts,
          lockedUntil: lockUntilDate,
        },
      });

      if (isLockedNow) {
        const error = new Error("Too many failed login attempts. Please try again in 5 minutes.");
        error.statusCode = 429;
        throw error;
      }

      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    // Reset failed login attempts on successful credentials
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    // Block login for unverified accounts
    if (!user.isVerified) {
      const error = new Error("Please verify your email address before logging in.");
      error.statusCode = 403;
      error.requiresVerification = true;
      error.email = user.email;
      throw error;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await sessionService.createSession(user.id, refreshToken, metadata);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify single-use email token
   */
  async verifyEmailToken(token) {
    const tokenHash = hashToken(token);

    const user = await prisma.user.findFirst({
      where: {
        verificationTokenHash: tokenHash,
        verificationTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      const error = new Error("Invalid or expired verification token");
      error.statusCode = 400;
      throw error;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationTokenHash: null,
        verificationTokenExpiresAt: null,
      },
    });

    return updatedUser;
  }

  /**
   * Resend verification email
   */
  async resendVerification(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success message to prevent user enumeration
      return { message: "If an account exists with this email, a verification link has been sent." };
    }

    if (user.isVerified) {
      return { message: "Account is already verified. You can log in immediately." };
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = hashToken(verificationToken);
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationTokenHash,
        verificationTokenExpiresAt,
      },
    });

    await emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    return {
      message: "Verification email sent successfully.",
      verificationToken,
    };
  }

  /**
   * Request password reset token
   */
  async requestPasswordReset(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { message: "If an account exists with this email, a password reset link has been sent." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetTokenHash = hashToken(resetToken);
    const passwordResetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 Hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash,
        passwordResetTokenExpiresAt,
      },
    });

    await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    return {
      message: "Password reset instructions sent to your email address.",
      resetToken,
    };
  }

  /**
   * Reset user password using token
   */
  async resetUserPassword(token, newPassword) {
    const tokenHash = hashToken(token);

    const user = await prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      const error = new Error("Invalid or expired password reset token");
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetTokenHash: null,
        passwordResetTokenExpiresAt: null,
        lockedUntil: null,
        failedLoginAttempts: 0,
      },
    });

    // Invalidate all active sessions on password reset for security
    await sessionService.revokeAllUserSessions(user.id);

    return { message: "Password updated successfully. Please log in with your new password." };
  }
}

module.exports = new AuthService();
