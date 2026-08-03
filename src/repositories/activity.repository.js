const prisma = require("../config/database");

class ActivityRepository {
  async create(data) {
    return prisma.activityLog.create({
      data: {
        userId: data.userId,
        documentId: data.documentId || null,
        action: data.action,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
  }

  async findByUserId(userId, limit = 20) {
    return prisma.activityLog.findMany({
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
}

module.exports = new ActivityRepository();
