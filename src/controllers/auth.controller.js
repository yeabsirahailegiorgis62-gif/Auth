const prisma = require("../config/database");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

const getRefreshTokenHash = (refreshToken) =>
  crypto.createHash("sha256").update(refreshToken).digest("hex");

const getClientMetadata = (req) => ({
  device: req.get("user-agent") || "Unknown",
  ipAddress: req.ip || req.socket?.remoteAddress || "Unknown",
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

const createSessionForUser = async (user, req) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const refreshTokenHash = getRefreshTokenHash(refreshToken);
  const metadata = getClientMetadata(req);

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash,
      device: metadata.device,
      ipAddress: metadata.ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
};

// Register User
const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password } = validatedData;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    const { accessToken, refreshToken } = await createSessionForUser(user, req);
    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      message: "User created successfully",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      const message = error.issues?.[0]?.message || "Invalid input";
      return res.status(400).json({
        message,
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const now = new Date();
    if (user.lockedUntil && new Date(user.lockedUntil) > now) {
      const remainingSeconds = Math.ceil(
        (new Date(user.lockedUntil) - now) / 1000,
      );
      return res.status(429).json({
        message:
          "Too many failed login attempts. Please try again in 5 minutes.",
        remainingSeconds,
      });
    }

    if (user.lockedUntil && new Date(user.lockedUntil) <= now) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lockedUntil: null,
          failedLoginAttempts: 0,
        },
      });
    }

    if (!user.passwordHash) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      const nextFailedAttempts = (user.failedLoginAttempts || 0) + 1;

      if (nextFailedAttempts >= 3) {
        const lockedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil,
          },
        });

        const remainingSeconds = Math.ceil((lockedUntil - now) / 1000);
        return res.status(429).json({
          message:
            "Too many failed login attempts. Please try again in 5 minutes.",
          remainingSeconds,
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: nextFailedAttempts,
        },
      });

      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    const tokens = await createSessionForUser(user, req);

    setRefreshTokenCookie(res, tokens.refreshToken);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      ...tokens,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      const message = error.issues?.[0]?.message || "Invalid input";
      return res.status(400).json({
        message,
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// Google OAuth callback
const googleAuthCallback = async (req, res) => {
  try {
    if (!req.user) {
      throw new Error("Google authentication failed");
    }

    const tokens = await createSessionForUser(req.user, req);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = new URL(`${frontendUrl}/auth/google/callback`);

    redirectUrl.searchParams.set("accessToken", tokens.accessToken);
    redirectUrl.searchParams.set("refreshToken", tokens.refreshToken);

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    const frontendLoginUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=google_auth_failed`;
    return res.redirect(frontendLoginUrl);
  }
};

// Refresh Access Token
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const refreshTokenHash = getRefreshTokenHash(refreshToken);

    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.id,
        refreshTokenHash,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const accessToken = generateAccessToken(user);

    res.json({
      accessToken,
    });
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
};

// Logout current session
const logout = async (req, res) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token required",
      });
    }

    const refreshTokenHash = getRefreshTokenHash(refreshToken);

    await prisma.session.deleteMany({
      where: {
        refreshTokenHash,
      },
    });

    clearRefreshTokenCookie(res);

    res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Logout all devices
const logoutAll = async (req, res) => {
  try {
    await prisma.session.deleteMany({
      where: {
        userId: req.user.id,
      },
    });

    clearRefreshTokenCookie(res);

    res.json({
      message: "Logged out from all devices",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  googleAuthCallback,
  refreshAccessToken,
  logout,
  logoutAll,
};
