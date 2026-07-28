const prisma = require("../config/database");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

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

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        device: req.headers["user-agent"] || "Unknown",
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Refresh Access Token
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.id,
        refreshTokenHash,
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

module.exports = {
  register,
  login,
  refreshAccessToken,
};
