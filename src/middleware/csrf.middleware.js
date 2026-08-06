const crypto = require("crypto");

const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Route to get a new CSRF token
const getCsrfToken = (req, res) => {
  const token = generateCsrfToken();
  res.cookie("csrfToken", token, {
    httpOnly: false, // Must be readable by JS to send in header
    secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ csrfToken: token });
};

// Middleware to verify CSRF token on mutating requests
const verifyCsrfToken = (req, res, next) => {
  // Skip CSRF check for GET, HEAD, OPTIONS
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const tokenFromHeader = req.headers["x-csrf-token"];
  const tokenFromCookie = req.cookies.csrfToken;

  if (!tokenFromHeader || !tokenFromCookie || tokenFromHeader !== tokenFromCookie) {
    return res.status(403).json({
      success: false,
      message: "Invalid or missing CSRF token",
    });
  }

  next();
};

module.exports = {
  getCsrfToken,
  verifyCsrfToken,
};
