const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth.middleware");
const activityController = require("../controllers/activity.controller");

router.use(authenticate);

router.get("/", (req, res, next) => activityController.getUserActivities(req, res, next));

module.exports = router;
