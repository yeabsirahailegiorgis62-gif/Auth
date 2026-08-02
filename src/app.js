require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const passport = require("passport");

require("./config/passport");

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl) or matching FRONTEND_URL
      if (!origin || origin === allowedOrigin) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const documentRoutes = require("./routes/document.routes");
const commentRoutes = require("./routes/comment.routes");
const revisionRoutes = require("./routes/revision.routes");
const searchRoutes = require("./routes/search.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const activityRoutes = require("./routes/activity.routes");
const notificationRoutes = require("./routes/notification.routes");
const exportImportRoutes = require("./routes/exportImport.routes");

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
app.use("/api/search", searchRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", favoriteRoutes);
app.use("/api", exportImportRoutes);
app.use("/api/documents/:documentId/comments", commentRoutes);
app.use("/api/documents/:documentId/revisions", revisionRoutes);
app.use("/api/documents", documentRoutes);

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
  if (err.name === "ZodError") {
    const message = err.issues?.[0]?.message || "Invalid input data";
    return res.status(400).json({
      success: false,
      message,
      errors: err.issues,
    });
  }

  if (err.name === "AppError") {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }

  console.error("Unhandled Error:", err);

  const statusCode = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
  });
});

module.exports = app;
