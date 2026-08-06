const prisma = require("../config/database");

class DocumentRepository {
  async create(data) {
    return prisma.document.create({
      data: {
        title: data.title || "Untitled Document",
        content: data.content || "",
        ownerId: data.ownerId,
        folderId: data.folderId,
        workspaceId: data.workspaceId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findById(id) {
    return prisma.document.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findByOwner(ownerId, { search, filter, limit = 50, folderId, tagId }) {
    const where = {
      ownerId,
      isArchived: false,
    };

    if (folderId !== undefined) {
      where.folderId = folderId;
    }

    if (tagId !== undefined) {
      where.tags = {
        some: { tagId },
      };
    }

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    let orderBy = { updatedAt: "desc" };
    if (filter === "recent") {
      orderBy = { lastOpenedAt: "desc" };
    }

    return prisma.document.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async update(id, data) {
    return prisma.document.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async touchLastOpened(id) {
    return prisma.document.update({
      where: { id },
      data: {
        lastOpenedAt: new Date(),
      },
    });
  }

  async findTrashByOwner(ownerId) {
    return prisma.document.findMany({
      where: {
        ownerId,
        isArchived: true,
      },
      orderBy: { updatedAt: "desc" },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findSharedWithUser(userId) {
    return prisma.document.findMany({
      where: {
        isArchived: false,
        shares: {
          some: { userId },
        },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shares: {
          where: { userId },
          select: { role: true },
        },
      },
    });
  }

  async delete(id) {
    return prisma.document.delete({
      where: { id },
    });
  }
}

module.exports = new DocumentRepository();
