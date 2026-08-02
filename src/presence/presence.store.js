const COLOR_PALETTE = [
  "#4F46E5", // Indigo
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F97316", // Orange
];

function getUserColor(userId) {
  const num = typeof userId === "number" ? userId : String(userId).length;
  const index = Math.abs(num) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}

class PresenceStore {
  constructor() {
    // Map<documentId, Map<socketId, sessionObj>>
    this.rooms = new Map();
  }

  getRoomMap(documentId) {
    if (!this.rooms.has(documentId)) {
      this.rooms.set(documentId, new Map());
    }
    return this.rooms.get(documentId);
  }

  addSession(documentId, socketId, user, role = "Collaborator") {
    const roomMap = this.getRoomMap(documentId);
    const color = getUserColor(user.id);

    const session = {
      socketId,
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email?.split("@")[0] || "Collaborator",
      },
      role,
      color,
      cursor: null,
      selection: null,
      isTyping: false,
      lastActive: new Date().toISOString(),
    };

    roomMap.set(socketId, session);
    return session;
  }

  removeSession(documentId, socketId) {
    if (!this.rooms.has(documentId)) return null;
    const roomMap = this.rooms.get(documentId);
    const removed = roomMap.get(socketId);
    roomMap.delete(socketId);

    if (roomMap.size === 0) {
      this.rooms.delete(documentId);
    }
    return removed;
  }

  removeSocketFromAllRooms(socketId) {
    const removedSessions = [];
    for (const [documentId, roomMap] of this.rooms.entries()) {
      if (roomMap.has(socketId)) {
        const session = roomMap.get(socketId);
        roomMap.delete(socketId);
        removedSessions.push({ documentId, session });

        if (roomMap.size === 0) {
          this.rooms.delete(documentId);
        }
      }
    }
    return removedSessions;
  }

  updateCursor(documentId, socketId, cursor) {
    const roomMap = this.getRoomMap(documentId);
    const session = roomMap.get(socketId);
    if (session) {
      session.cursor = cursor;
      session.lastActive = new Date().toISOString();
      return session;
    }
    return null;
  }

  updateSelection(documentId, socketId, selection) {
    const roomMap = this.getRoomMap(documentId);
    const session = roomMap.get(socketId);
    if (session) {
      session.selection = selection;
      session.lastActive = new Date().toISOString();
      return session;
    }
    return null;
  }

  setTyping(documentId, socketId, isTyping) {
    const roomMap = this.getRoomMap(documentId);
    const session = roomMap.get(socketId);
    if (session) {
      session.isTyping = isTyping;
      session.lastActive = new Date().toISOString();
      return session;
    }
    return null;
  }

  getPresenceList(documentId) {
    if (!this.rooms.has(documentId)) return [];
    const roomMap = this.rooms.get(documentId);
    return Array.from(roomMap.values());
  }
}

module.exports = new PresenceStore();
