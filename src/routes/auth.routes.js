const express = require("express");
const passport = require("passport");
const { isGoogleConfigured, getGoogleConfig } = require("../config/passport");

const router = express.Router();

const {
  register,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  googleAuthCallback,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");

if (isGoogleConfigured()) {
  const { googleCallbackUrl } = getGoogleConfig();

  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    }),
  );

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

router.post("/register", register);

router.post("/login", login);

router.post("/refresh", refreshAccessToken);

router.post("/logout", logout);

router.post("/logout-all", authMiddleware, logoutAll);

module.exports = router;
