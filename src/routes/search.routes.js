const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth.middleware");
const searchController = require("../controllers/search.controller");

router.use(authenticate);

router.get("/", (req, res, next) => searchController.search(req, res, next));

module.exports = router;
