const prisma = require("../config/database");

class FavoriteRepository {
  async add(userId, documentId) {
    return prisma.favorite.create({
      data: { userId, documentId },
    });
  }

  async remove(userId, documentId) {
    return prisma.favorite.deleteMany({
      where: { userId, documentId },
    });
  }

  async isFavorite(userId, documentId) {
    const fav = await prisma.favorite.findUnique({
      where: {
        userId_documentId: { userId, documentId },
      },
    });
    return !!fav;
  }

  async findByUserId(userId) {
    return prisma.favorite.findMany({
      where: { userId },
      include: {
        document: {
          include: {
            owner: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

module.exports = new FavoriteRepository();
