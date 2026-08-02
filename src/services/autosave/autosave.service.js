const documentRepository = require("../../repositories/document.repository");
const revisionRepository = require("../../repositories/revision.repository");
const permissionService = require("../permission.service");

class AutosaveService {
  constructor() {
    this.pendingSaves = new Map(); // documentId -> { timer, content, userId, changeCount }
    this.DEBOUNCE_DELAY = 2000; // 2 seconds
    this.REVISION_CHANGE_THRESHOLD = 5; // Create new revision after 5 flushed saves
    this.flushedSaveCounts = new Map(); // documentId -> count
  }

  async processAutosave(documentId, userId, content) {
    await permissionService.assertPermission(
      documentId,
      userId,
      permissionService.PERMISSIONS.EDIT
    );

    const serializedContent =
      typeof content === "object" ? JSON.stringify(content) : content;

    // 1. Update Document content in database
    const updatedDocument = await documentRepository.update(documentId, {
      content: serializedContent,
      lastOpenedAt: new Date(),
    });

    // 2. Track save count and conditionally create revision snapshot
    const currentCount = (this.flushedSaveCounts.get(documentId) || 0) + 1;
    this.flushedSaveCounts.set(documentId, currentCount);

    let createdRevision = null;
    if (currentCount % this.REVISION_CHANGE_THRESHOLD === 1) {
      createdRevision = await revisionRepository.createRevision({
        documentId,
        authorId: userId,
        content: serializedContent,
      });
    }

    return {
      document: updatedDocument,
      revision: createdRevision,
    };
  }
}

module.exports = new AutosaveService();
