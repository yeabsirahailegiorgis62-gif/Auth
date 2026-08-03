const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth.middleware");
const favoriteController = require("../controllers/favorite.controller");

router.use(authenticate);

router.get("/user/favorites", (req, res, next) =>
  favoriteController.getUserFavorites(req, res, next)
);
router.post("/documents/:documentId/favorite", (req, res, next) =>
  favoriteController.addFavorite(req, res, next)
);
router.delete("/documents/:documentId/favorite", (req, res, next) =>
  favoriteController.removeFavorite(req, res, next)
);

module.exports = router;
