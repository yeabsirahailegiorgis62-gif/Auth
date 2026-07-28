const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Authentication API is running...");
});

module.exports = router;
