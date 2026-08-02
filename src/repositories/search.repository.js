const prisma = require("../config/database");

class SearchRepository {
  async searchDocuments(userId, query, filter = "all") {
    if (!query || query.trim() === "") {
      return [];
    }

    const searchTerm = query.trim();

    const baseWhere = {
      isArchived: filter === "trash" ? true : false,
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { content: { contains: searchTerm, mode: "insensitive" } },
      ],
    };

    if (filter === "owned") {
      return prisma.document.findMany({
        where: {
          ...baseWhere,
          ownerId: userId,
        },
        include: {
          owner: { select: { id: true, name: true, email: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    if (filter === "shared") {
      return prisma.document.findMany({
        where: {
          ...baseWhere,
          shares: {
            some: { userId },
          },
        },
        include: {
          owner: { select: { id: true, name: true, email: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    // Default "all": owned OR shared
    return prisma.document.findMany({
      where: {
        ...baseWhere,
        OR: [
          {
            AND: [
              { ownerId: userId },
              {
                OR: [
                  { title: { contains: searchTerm, mode: "insensitive" } },
                  { content: { contains: searchTerm, mode: "insensitive" } },
                ],
              },
            ],
          },
          {
            AND: [
              { shares: { some: { userId } } },
              {
                OR: [
                  { title: { contains: searchTerm, mode: "insensitive" } },
                  { content: { contains: searchTerm, mode: "insensitive" } },
                ],
              },
            ],
          },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }
}

module.exports = new SearchRepository();
