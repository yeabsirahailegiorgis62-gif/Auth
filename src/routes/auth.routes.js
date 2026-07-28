const express = require("express");

const router = express.Router();

const {
  register,
  login,
  refreshAccessToken,
} = require("../controllers/auth.controller");

router.post("/register", register);

router.post("/login", login);

router.post("/refresh", refreshAccessToken);

module.exports = router;
