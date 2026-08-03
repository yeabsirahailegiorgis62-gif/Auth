const prisma = require("../config/database");

class RevisionRepository {
  async getNextVersionNumber(documentId) {
    const latestRevision = await prisma.revision.findFirst({
      where: { documentId },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    return latestRevision ? latestRevision.version + 1 : 1;
  }

  async createRevision({ documentId, authorId, content, version }) {
    const versionNumber =
      version || (await this.getNextVersionNumber(documentId));

    const serializedContent =
      typeof content === "object" ? JSON.stringify(content) : content;

    return prisma.revision.create({
      data: {
        documentId,
        authorId,
        content: serializedContent,
        version: versionNumber,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getRevisionsByDocument(documentId) {
    return prisma.revision.findMany({
      where: { documentId },
      orderBy: { version: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getRevisionById(revisionId) {
    return prisma.revision.findUnique({
      where: { id: revisionId },
      include: {
        document: {
          select: {
            id: true,
            ownerId: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}

module.exports = new RevisionRepository();
