const documentRepository = require("../repositories/document.repository");
const permissionService = require("./permission.service");
const activityService = require("./activity.service");
const prisma = require("../config/database");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

class DocumentService {
  async createDocument(userId, { title, content }) {
    const serializedContent =
      typeof content === "object" ? JSON.stringify(content) : content || "";

    const document = await documentRepository.create({
      title: title && title.trim() ? title.trim() : "Untitled Document",
      content: serializedContent,
      ownerId: userId,
    });

    await activityService.logActivity(userId, document.id, "DOCUMENT_CREATED", {
      title: document.title,
    });

    return document;
  }

  async getUserDocuments(userId, { search, filter, limit }) {
    if (filter === "shared") {
      const shares = await prisma.documentShare.findMany({
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

      let documents = shares
        .filter((s) => !s.document.isArchived)
        .map((s) => ({
          ...s.document,
          userRole: s.role,
        }));

      if (search && search.trim()) {
        const query = search.trim().toLowerCase();
        documents = documents.filter((d) =>
          d.title.toLowerCase().includes(query)
        );
      }

      if (limit) {
        documents = documents.slice(0, parseInt(limit, 10));
      }

      return documents;
    }

    const owned = await documentRepository.findByOwner(userId, {
      search,
      filter,
      limit,
    });

    return owned.map((doc) => ({
      ...doc,
      userRole: "OWNER",
    }));
  }

  async getTrashDocuments(userId) {
    const trash = await documentRepository.findTrashByOwner(userId);
    return trash.map((doc) => ({
      ...doc,
      userRole: "OWNER",
    }));
  }

  async getDocumentById(userId, documentId) {
    const { document, role } = await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.READ
    );

    // Update last opened timestamp
    await documentRepository.touchLastOpened(documentId);

    return {
      ...document,
      userRole: role,
    };
  }

  async updateDocument(userId, documentId, { title, content }) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.EDIT
    );

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) {
      updateData.content =
        typeof content === "object" ? JSON.stringify(content) : content;
    }
    updateData.lastOpenedAt = new Date();

    const updatedDoc = await documentRepository.update(documentId, updateData);
    await activityService.logActivity(userId, documentId, "DOCUMENT_EDITED");
    return updatedDoc;
  }

  async trashDocument(userId, documentId) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.DELETE
    );

    const trashed = await documentRepository.update(documentId, {
      isArchived: true,
    });
    await activityService.logActivity(userId, documentId, "DOCUMENT_TRASHED");
    return { id: documentId, isArchived: true, message: "Moved to trash" };
  }

  async restoreDocument(userId, documentId) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.DELETE
    );

    const restored = await documentRepository.update(documentId, {
      isArchived: false,
    });
    await activityService.logActivity(userId, documentId, "DOCUMENT_RESTORED");
    return { id: documentId, isArchived: false, message: "Restored from trash" };
  }

  async deleteDocument(userId, documentId) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.DELETE
    );

    await documentRepository.delete(documentId);
    return { id: documentId, message: "Document deleted permanently" };
  }

  async duplicateDocument(userId, documentId) {
    const { document } = await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.READ
    );

    const duplicateTitle = `Copy of ${document.title}`;

    const newDoc = await documentRepository.create({
      title: duplicateTitle,
      content: document.content,
      ownerId: userId,
    });

    await activityService.logActivity(userId, newDoc.id, "DOCUMENT_CREATED", {
      duplicatedFrom: documentId,
    });

    return newDoc;
  }
}

module.exports = {
  documentService: new DocumentService(),
  AppError,
};
