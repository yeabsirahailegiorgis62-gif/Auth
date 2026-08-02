const express = require("express");
const router = express.Router({ mergeParams: true });
const authenticate = require("../middleware/auth.middleware");
const commentController = require("../controllers/comment.controller");

router.use(authenticate);

router.get("/", (req, res, next) => commentController.getThreads(req, res, next));
router.post("/", (req, res, next) => commentController.createThread(req, res, next));

router.post("/:threadId/reply", (req, res, next) =>
  commentController.addReply(req, res, next)
);
router.patch("/:threadId/resolve", (req, res, next) =>
  commentController.resolveThread(req, res, next)
);
router.patch("/:threadId/reopen", (req, res, next) =>
  commentController.reopenThread(req, res, next)
);

router.patch("/item/:commentId", (req, res, next) =>
  commentController.updateComment(req, res, next)
);
router.delete("/item/:commentId", (req, res, next) =>
  commentController.deleteComment(req, res, next)
);

module.exports = router;
