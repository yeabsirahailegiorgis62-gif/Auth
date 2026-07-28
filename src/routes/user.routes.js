const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");

router.get("/profile", authenticate, (req, res) => {
  res.json({
    message: "Protected profile route",
    user: req.user,
  });
});

module.exports = router;
