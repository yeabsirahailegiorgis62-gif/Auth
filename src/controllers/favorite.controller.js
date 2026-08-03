const favoriteService = require("../services/favorite.service");

class FavoriteController {
  async addFavorite(req, res, next) {
    try {
      const { documentId } = req.params;
      const result = await favoriteService.addFavorite(req.user.id, documentId);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFavorite(req, res, next) {
    try {
      const { documentId } = req.params;
      const result = await favoriteService.removeFavorite(req.user.id, documentId);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserFavorites(req, res, next) {
    try {
      const favorites = await favoriteService.getUserFavorites(req.user.id);
      res.status(200).json({
        success: true,
        favorites,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FavoriteController();
