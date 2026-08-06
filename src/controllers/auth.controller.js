const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const authService = require("../services/auth.service");
const sessionService = require("../services/session.service");
const prisma = require("../config/database");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validators/auth.validator");

const getRefreshTokenHash = (refreshToken) =>
  crypto.createHash("sha256").update(refreshToken).digest("hex");

const getClientMetadata = (req) => ({
  device: req.get("user-agent") || "Unknown Device",
  ipAddress: req.ip || req.socket?.remoteAddress || "Unknown IP",
});

const getRefreshTokenFromRequest = (req) =>
  req.body?.refreshToken || req.cookies?.refreshToken || null;

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
  });
};

/**
 * Controller: Register User
 */
const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const metadata = getClientMetadata(req);

    const result = await authService.registerUser({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      forceVerification: req.body.forceVerification,
      metadata,
    });

    if (result.tokens?.refreshToken) {
      setRefreshTokenCookie(res, result.tokens.refreshToken);
    }

    res.status(201).json({
      message: result.user.isVerified
        ? "User created successfully"
        : "Registration successful. Please verify your email address before logging in.",
      accessToken: result.tokens?.accessToken || null,
      refreshToken: result.tokens?.refreshToken || null,
      verificationToken: result.verificationToken,
      requiresVerification: result.requiresVerification,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        avatarUrl: result.user.avatarUrl,
        bio: result.user.bio,
        isVerified: result.user.isVerified,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      const message = error.issues?.[0]?.message || "Invalid input";
      return res.status(400).json({ message });
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

/**
 * Controller: Login User
 */
const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const metadata = getClientMetadata(req);

    const result = await authService.loginUser({
      email: validatedData.email,
      password: validatedData.password,
      metadata,
    });

    setRefreshTokenCookie(res, result.refreshToken);

    res.json({
      message: "Login successful",
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        avatarUrl: result.user.avatarUrl,
        bio: result.user.bio,
        isVerified: result.user.isVerified,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      const message = error.issues?.[0]?.message || "Invalid input";
      return res.status(400).json({ message });
    }
    const statusCode = error.statusCode || 500;
    const response = { message: error.message };
    if (error.remainingSeconds) response.remainingSeconds = error.remainingSeconds;
    if (error.requiresVerification) response.requiresVerification = error.requiresVerification;
    if (error.email) response.email = error.email;
    res.status(statusCode).json(response);
  }
};

/**
 * Controller: Verify Email
 */
const verifyEmail = async (req, res) => {
  try {
    const token = req.query?.token || req.body?.token;
    const validatedData = verifyEmailSchema.parse({ token });

    const user = await authService.verifyEmailToken(validatedData.token);

    res.json({
      message: "Email verified successfully! You can now log in.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      const message = error.issues?.[0]?.message || "Verification token is required";
      return res.status(400).json({ message });
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

/**
 * Controller: Resend Verification Email
 */
const resendVerification = async (req, res) => {
  try {
    const validatedData = resendVerificationSchema.parse(req.body);
    const result = await authService.resendVerification(validatedData.email);

    res.json(result);
  } catch (error) {
    if (error.name === "ZodError") {
      const message = error.issues?.[0]?.message || "Invalid input";
      return res.status(400).json({ message });
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

/**
 * Controller: Forgot Password
 */
const forgotPassword = async (req, res) => {
  try {
    const validatedData = forgotPasswordSchema.parse(req.body);
    const result = await authService.requestPasswordReset(validatedData.email);

    res.json(result);
  } catch (error) {
    if (error.name === "ZodError") {
      const message = error.issues?.[0]?.message || "Invalid input";
      return res.status(400).json({ message });
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

/**
 * Controller: Reset Password
 */
const resetPassword = async (req, res) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const result = await authService.resetUserPassword(
      validatedData.token,
      validatedData.newPassword,
    );

    clearRefreshTokenCookie(res);
    res.json(result);
  } catch (error) {
    if (error.name === "ZodError") {
      const message = error.issues?.[0]?.message || "Invalid input";
      return res.status(400).json({ message });
    }
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

/**
 * Controller: Refresh Access Token
 */
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || "super-secret-refresh-key",
      );
    } catch (err) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const refreshTokenHash = getRefreshTokenHash(refreshToken);
    const session = await sessionService.findSessionByTokenHash(refreshTokenHash);

    if (!session) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: "Session expired or revoked" });
    }

    const user = session.user;
    if (!user) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: "User not found" });
    }

    await sessionService.revokeSessionByTokenHash(refreshTokenHash);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const metadata = getClientMetadata(req);

    await sessionService.createSession(user.id, newRefreshToken, metadata);
    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller: Get Active User Sessions
 */
const getSessions = async (req, res) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);
    const currentRefreshTokenHash = refreshToken ? getRefreshTokenHash(refreshToken) : null;

    const sessions = await sessionService.getUserSessions(req.user.id, currentRefreshTokenHash);

    res.json({
      sessions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller: Revoke Specific Session
 */
const revokeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await sessionService.revokeSessionById(req.user.id, id);

    if (!success) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json({ message: "Session revoked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller: Logout Current Session
 */
const logout = async (req, res) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required for logout" });
    }

    const refreshTokenHash = getRefreshTokenHash(refreshToken);
    await sessionService.revokeSessionByTokenHash(refreshTokenHash);

    clearRefreshTokenCookie(res);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    clearRefreshTokenCookie(res);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller: Logout All Sessions
 */
const logoutAll = async (req, res) => {
  try {
    await sessionService.revokeAllUserSessions(req.user.id);
    clearRefreshTokenCookie(res);
    res.json({ message: "All sessions logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller: Google OAuth Callback
 */
const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=google_auth_failed`,
      );
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const metadata = getClientMetadata(req);

    await sessionService.createSession(user.id, refreshToken, metadata);
    setRefreshTokenCookie(res, refreshToken);

    const redirectUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/auth/google/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;

    res.redirect(redirectUrl);
  } catch (error) {
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=google_auth_failed`,
    );
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  getSessions,
  revokeSession,
  logout,
  logoutAll,
  googleAuthCallback,
};
