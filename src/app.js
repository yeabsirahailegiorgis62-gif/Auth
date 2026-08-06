require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const passport = require("passport");

require("./config/passport");
const setupSwagger = require("./config/swagger");
const logger = require("./config/logger");
const prisma = require("./config/database");

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === allowedOrigin ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
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
const workspaceRoutes = require("./routes/workspace.routes");
const folderRoutes = require("./routes/folder.routes");
const tagRoutes = require("./routes/tag.routes");

app.disable("x-powered-by");

app.use(helmet());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

// Setup Swagger API Documentation at /api/docs
setupSwagger(app);

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
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/workspaces/:workspaceId/folders", folderRoutes);
app.use("/api/workspaces/:workspaceId/tags", tagRoutes);

app.get("/", (req, res) => {
  res.json({
    name: "collaborative-document-platform",
    status: "running",
    docs: "/api/docs",
  });
});

app.get("/health", async (req, res) => {
  let dbStatus = "connected";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = "disconnected";
  }

  const memory = process.memoryUsage();
  const isHealthy = dbStatus === "connected";

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "healthy" : "unhealthy",
    uptime: Math.floor(process.uptime()),
    database: dbStatus,
    memory: {
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
    },
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
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

  logger.error("Unhandled Error:", err);

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
