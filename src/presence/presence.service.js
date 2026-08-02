const presenceStore = require("./presence.store");
const documentRepository = require("../repositories/document.repository");

class PresenceService {
  async registerPresenceSession(documentId, socketId, user) {
    let role = "Collaborator";
    try {
      const document = await documentRepository.findById(documentId);
      if (document && document.ownerId === user.id) {
        role = "Owner";
      }
    } catch (err) {
      console.warn(`[Presence Service] Document lookup warning for doc ${documentId}:`, err.message);
    }

    return presenceStore.addSession(documentId, socketId, user, role);
  }

  removePresenceSession(documentId, socketId) {
    return presenceStore.removeSession(documentId, socketId);
  }

  removeSocketFromAll(socketId) {
    return presenceStore.removeSocketFromAllRooms(socketId);
  }

  updateCursor(documentId, socketId, cursorData) {
    return presenceStore.updateCursor(documentId, socketId, cursorData);
  }

  updateSelection(documentId, socketId, selectionData) {
    return presenceStore.updateSelection(documentId, socketId, selectionData);
  }

  setTyping(documentId, socketId, isTyping) {
    return presenceStore.setTyping(documentId, socketId, isTyping);
  }

  getPresenceState(documentId) {
    return presenceStore.getPresenceList(documentId);
  }
}

module.exports = new PresenceService();
