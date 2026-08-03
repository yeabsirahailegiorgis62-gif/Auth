const express = require("express");
const router = express.Router({ mergeParams: true });
const authenticate = require("../middleware/auth.middleware");
const revisionController = require("../controllers/revision.controller");

router.use(authenticate);

router.get("/", (req, res, next) => revisionController.getTimeline(req, res, next));
router.post("/snapshot", (req, res, next) =>
  revisionController.createCheckpoint(req, res, next)
);
router.get("/:revisionId", (req, res, next) =>
  revisionController.getRevisionById(req, res, next)
);
router.post("/:revisionId/restore", (req, res, next) =>
  revisionController.restoreRevision(req, res, next)
);

module.exports = router;
