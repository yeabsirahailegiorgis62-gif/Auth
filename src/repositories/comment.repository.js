const prisma = require("../config/database");

class CommentRepository {
  async createThread({
    documentId,
    createdBy,
    selectedText = "",
    fromPos = null,
    toPos = null,
    content,
  }) {
    return prisma.commentThread.create({
      data: {
        documentId,
        createdBy,
        selectedText,
        fromPos: typeof fromPos === "number" ? fromPos : null,
        toPos: typeof toPos === "number" ? toPos : null,
        comments: {
          create: {
            authorId: createdBy,
            content,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resolver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: "asc",
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
        },
      },
    });
  }

  async findThreadsByDocument(documentId, { status = "all" } = {}) {
    const where = { documentId };
    if (status === "open") {
      where.resolved = false;
    } else if (status === "resolved") {
      where.resolved = true;
    }

    return prisma.commentThread.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resolver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: "asc",
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
        },
      },
    });
  }

  async findThreadById(threadId) {
    return prisma.commentThread.findUnique({
      where: { id: threadId },
      include: {
        document: {
          select: {
            id: true,
            ownerId: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resolver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: "asc",
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
        },
      },
    });
  }

  async findCommentById(commentId) {
    return prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        thread: {
          include: {
            document: {
              select: {
                id: true,
                ownerId: true,
              },
            },
            comments: {
              orderBy: {
                createdAt: "asc",
              },
              select: {
                id: true,
              },
            },
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

  async addReply({ threadId, authorId, content }) {
    return prisma.comment.create({
      data: {
        threadId,
        authorId,
        content,
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

  async updateComment(commentId, content) {
    return prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
        edited: true,
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

  async deleteComment(commentId) {
    const comment = await this.findCommentById(commentId);
    if (!comment) return null;

    // If it's the only comment in the thread, delete the entire thread
    if (comment.thread.comments.length <= 1) {
      await prisma.commentThread.delete({
        where: { id: comment.threadId },
      });
      return { deletedThreadId: comment.threadId };
    }

    // Otherwise, delete individual comment
    const deleted = await prisma.comment.delete({
      where: { id: commentId },
    });
    return { deletedCommentId: deleted.id, threadId: comment.threadId };
  }

  async updateThreadStatus(threadId, { resolved, resolvedById }) {
    return prisma.commentThread.update({
      where: { id: threadId },
      data: {
        resolved,
        resolvedById: resolved ? resolvedById : null,
        resolvedAt: resolved ? new Date() : null,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resolver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: "asc",
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
        },
      },
    });
  }
}

module.exports = new CommentRepository();
