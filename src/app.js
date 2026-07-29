require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const passport = require("passport");

require("./config/passport");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

app.disable("x-powered-by");

app.use(helmet());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.json({
    name: "auth-system",
    status: "running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "auth-system",
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

module.exports = app;
