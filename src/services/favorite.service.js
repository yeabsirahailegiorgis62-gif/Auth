const favoriteRepository = require("../repositories/favorite.repository");
const permissionService = require("./permission.service");

class FavoriteService {
  async addFavorite(userId, documentId) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.READ
    );
    const isFav = await favoriteRepository.isFavorite(userId, documentId);
    if (!isFav) {
      await favoriteRepository.add(userId, documentId);
    }
    return { isFavorite: true };
  }

  async removeFavorite(userId, documentId) {
    await favoriteRepository.remove(userId, documentId);
    return { isFavorite: false };
  }

  async getUserFavorites(userId) {
    const favorites = await favoriteRepository.findByUserId(userId);
    return favorites
      .filter((fav) => !fav.document.isArchived)
      .map((fav) => fav.document);
  }
}

module.exports = new FavoriteService();
