const express = require("express");
const passport = require("passport");
const { isGoogleConfigured, getGoogleConfig } = require("../config/passport");

const router = express.Router();

const {
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
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");

if (isGoogleConfigured()) {
  const { googleCallbackUrl } = getGoogleConfig();

  /**
   * @openapi
   * /api/auth/google:
   *   get:
   *     summary: Initiate Google OAuth 2.0 Login
   *     tags: [Authentication]
   *     responses:
   *       302:
   *         description: Redirect to Google Sign-In page
   */
  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    }),
  );

  /**
   * @openapi
   * /api/auth/google/callback:
   *   get:
   *     summary: Google OAuth 2.0 Callback
   *     tags: [Authentication]
   *     responses:
   *       302:
   *         description: Redirect to Frontend with JWT tokens
   */
  router.get(
    "/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=google_auth_failed`,
    }),
    googleAuthCallback,
  );
} else {
  router.get("/google", (req, res) => {
    res.status(503).json({
      message:
        "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
    });
  });

  router.get("/google/callback", (req, res) => {
    res.status(503).json({
      message: "Google OAuth is not configured.",
    });
  });
}

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Email already exists or invalid input
 */
router.post("/register", register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: User Login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful with JWT Access and Refresh tokens
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email verification required
 *       429:
 *         description: Account locked due to failed attempts
 */
router.post("/login", login);

/**
 * @openapi
 * /api/auth/verify-email:
 *   get:
 *     summary: Verify user email using token (GET)
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *   post:
 *     summary: Verify user email using token (POST)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 */
router.get("/verify-email", verifyEmail);
router.post("/verify-email", verifyEmail);

/**
 * @openapi
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification email dispatched
 */
router.post("/resend-verification", resendVerification);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset instructions sent
 */
router.post("/forgot-password", forgotPassword);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
router.post("/reset-password", resetPassword);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT Access Token using Refresh Token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: New Access Token generated
 *       401:
 *         description: Invalid or expired Refresh Token
 */
router.post("/refresh", refreshAccessToken);

/**
 * @openapi
 * /api/auth/sessions:
 *   get:
 *     summary: Get active device sessions for current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of active device sessions
 */
router.get("/sessions", authMiddleware, getSessions);

/**
 * @openapi
 * /api/auth/sessions/{id}:
 *   delete:
 *     summary: Revoke individual device session
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Session revoked
 */
router.delete("/sessions/:id", authMiddleware, revokeSession);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout current session
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", logout);

/**
 * @openapi
 * /api/auth/logout-all:
 *   post:
 *     summary: Logout from all active device sessions
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All active sessions revoked
 */
router.post("/logout-all", authMiddleware, logoutAll);

module.exports = router;
