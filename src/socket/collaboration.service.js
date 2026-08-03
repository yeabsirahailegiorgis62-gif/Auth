const documentRepository = require("../repositories/document.repository");
const logger = require("../config/logger");

class CollaborationService {
  constructor() {
    this.pendingSaves = new Map(); // documentId -> { timer, content, userId }
    this.DEBOUNCE_DELAY = 1500; // 1.5 seconds
  }

  async validateRoomAccess(userId, documentId) {
    const document = await documentRepository.findById(documentId);

    if (!document) {
      return { allowed: false, reason: "Document not found" };
    }

    const isOwner = document.ownerId === userId;
    const isShared = document.shares?.some((share) => share.userId === userId);

    if (!isOwner && !isShared) {
      return { allowed: false, reason: "Permission denied" };
    }

    return { allowed: true, document };
  }

  scheduleDebouncedSave(documentId, content, userId) {
    if (this.pendingSaves.has(documentId)) {
      clearTimeout(this.pendingSaves.get(documentId).timer);
    }

    const timer = setTimeout(async () => {
      try {
        const serializedContent =
          typeof content === "object" ? JSON.stringify(content) : content;

        await documentRepository.update(documentId, {
          content: serializedContent,
          lastOpenedAt: new Date(),
        });
        logger.info(`[Collab Service] Debounced save flushed to DB for doc ${documentId}`);
      } catch (error) {
        logger.error(`[Collab Service] Failed to save doc ${documentId}:`, error);
      } finally {
        this.pendingSaves.delete(documentId);
      }
    }, this.DEBOUNCE_DELAY);

    this.pendingSaves.set(documentId, { timer, content, userId });
  }

  async flushPendingSave(documentId) {
    if (this.pendingSaves.has(documentId)) {
      const pending = this.pendingSaves.get(documentId);
      clearTimeout(pending.timer);
      this.pendingSaves.delete(documentId);

      const serializedContent =
        typeof pending.content === "object"
          ? JSON.stringify(pending.content)
          : pending.content;

      await documentRepository.update(documentId, {
        content: serializedContent,
        lastOpenedAt: new Date(),
      });
      logger.info(`[Collab Service] Immediately flushed doc ${documentId}`);
    }
  }
}

module.exports = new CollaborationService();
