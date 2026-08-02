const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth.middleware");
const notificationController = require("../controllers/notification.controller");

router.use(authenticate);

router.get("/", (req, res, next) =>
  notificationController.getUserNotifications(req, res, next)
);
router.patch("/:id/read", (req, res, next) =>
  notificationController.markAsRead(req, res, next)
);
router.post("/read-all", (req, res, next) =>
  notificationController.markAllAsRead(req, res, next)
);

module.exports = router;
