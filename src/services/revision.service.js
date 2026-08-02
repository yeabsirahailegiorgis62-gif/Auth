const revisionRepository = require("../repositories/revision.repository");
const documentRepository = require("../repositories/document.repository");
const permissionService = require("./permission.service");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

class RevisionService {
  async getTimeline(documentId, userId) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.READ
    );
    return revisionRepository.getRevisionsByDocument(documentId);
  }

  async getRevisionById(documentId, revisionId, userId) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.READ
    );

    const revision = await revisionRepository.getRevisionById(revisionId);
    if (!revision || revision.documentId !== documentId) {
      throw new AppError("Revision snapshot not found", 404);
    }
    return revision;
  }

  async createCheckpoint(documentId, userId) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.EDIT
    );

    const document = await documentRepository.findById(documentId);
    if (!document) {
      throw new AppError("Document not found", 404);
    }

    return revisionRepository.createRevision({
      documentId,
      authorId: userId,
      content: document.content,
    });
  }

  async restoreRevision(documentId, revisionId, userId) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.EDIT
    );

    const targetRevision = await revisionRepository.getRevisionById(revisionId);
    if (!targetRevision || targetRevision.documentId !== documentId) {
      throw new AppError("Target revision snapshot not found", 404);
    }

    // 1. Update Document content to target revision content
    const updatedDocument = await documentRepository.update(documentId, {
      content: targetRevision.content,
      lastOpenedAt: new Date(),
    });

    // 2. Create a NEW revision representing the restoration
    const newRevision = await revisionRepository.createRevision({
      documentId,
      authorId: userId,
      content: targetRevision.content,
    });

    return {
      document: updatedDocument,
      restoredFromVersion: targetRevision.version,
      newRevision,
    };
  }
}

module.exports = new RevisionService();
