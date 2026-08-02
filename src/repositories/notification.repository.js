const prisma = require("../config/database");

class NotificationRepository {
  async create(data) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        documentId: data.documentId || null,
        type: data.type,
        message: data.message,
      },
    });
  }

  async findByUserId(userId, limit = 20) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        document: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async markAsRead(id, userId) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}

module.exports = new NotificationRepository();
