const SOCKET_EVENTS = require("./events");
const collaborationService = require("./collaboration.service");
const permissionService = require("../services/permission.service");

function registerDocumentRoomHandlers(io, socket) {
  const activeRooms = new Set();

  socket.on(SOCKET_EVENTS.JOIN_DOCUMENT, async (data, callback) => {
    try {
      const documentId = typeof data === "string" ? data : data?.documentId;

      if (!documentId) {
        return socket.emit(SOCKET_EVENTS.SOCKET_ERROR, {
          message: "Document ID is required",
        });
      }

      const accessCheck = await collaborationService.validateRoomAccess(
        socket.user.id,
        documentId,
      );

      if (!accessCheck.allowed) {
        console.warn(
          `[Room Guard] User ${socket.user.id} denied access to doc ${documentId}: ${accessCheck.reason}`,
        );
        if (typeof callback === "function") {
          callback({ success: false, error: accessCheck.reason });
        }
        return socket.emit(SOCKET_EVENTS.SOCKET_ERROR, {
          message: accessCheck.reason,
          documentId,
        });
      }

      const roomName = `document:${documentId}`;
      socket.join(roomName);
      activeRooms.add(roomName);

      console.log(
        `[Socket Room] User ${socket.user.email} (${socket.user.id}) joined ${roomName}`,
      );

      // Notify other room members
      socket.to(roomName).emit(SOCKET_EVENTS.USER_JOINED, {
        user: socket.user,
        documentId,
        timestamp: new Date().toISOString(),
      });

      // Send initial state sync to joining client
      socket.emit(SOCKET_EVENTS.SYNC_STATE, {
        documentId,
        content: accessCheck.document.content,
        title: accessCheck.document.title,
        updatedAt: accessCheck.document.updatedAt,
      });

      if (typeof callback === "function") {
        callback({ success: true, room: roomName });
      }
    } catch (error) {
      console.error("[Socket Room Join Error]:", error);
      socket.emit(SOCKET_EVENTS.SOCKET_ERROR, {
        message: "Failed to join document room",
      });
    }
  });

  socket.on(SOCKET_EVENTS.DOC_UPDATE, async (data) => {
    try {
      const { documentId, content } = data || {};

      if (!documentId || content === undefined) {
        return;
      }

      const roomName = `document:${documentId}`;

      // Verify socket is actually in room before allowing update
      if (!socket.rooms.has(roomName)) {
        return socket.emit(SOCKET_EVENTS.SOCKET_ERROR, {
          message: "You must join document room before sending updates",
          documentId,
        });
      }

      // Check centralized permission engine for EDIT permission
      const canEdit = await permissionService.hasPermission(
        documentId,
        socket.user.id,
        permissionService.PERMISSIONS.EDIT,
      );

      if (!canEdit) {
        console.warn(
          `[Socket Guard] User ${socket.user.id} attempted unauthorized edit on doc ${documentId}`,
        );
        return socket.emit(SOCKET_EVENTS.SOCKET_ERROR, {
          message: "Permission denied: Edit permission required",
          documentId,
        });
      }

      // Broadcast update payload to all other clients in room
      socket.to(roomName).emit(SOCKET_EVENTS.DOC_UPDATE, {
        documentId,
        content,
        updatedBy: socket.user,
        timestamp: new Date().toISOString(),
      });

      // Schedule debounced save to PostgreSQL database
      collaborationService.scheduleDebouncedSave(
        documentId,
        content,
        socket.user.id,
      );
    } catch (error) {
      console.error("[Socket Doc Update Error]:", error);
    }
  });

  socket.on(SOCKET_EVENTS.LEAVE_DOCUMENT, (data) => {
    const documentId = typeof data === "string" ? data : data?.documentId;
    if (!documentId) return;

    const roomName = `document:${documentId}`;
    if (socket.rooms.has(roomName)) {
      socket.leave(roomName);
      activeRooms.delete(roomName);

      socket.to(roomName).emit(SOCKET_EVENTS.USER_LEFT, {
        user: socket.user,
        documentId,
        timestamp: new Date().toISOString(),
      });

      console.log(`[Socket Room] User ${socket.user.id} left ${roomName}`);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(
      `[Socket Disconnect] User ${socket.user?.email || "unknown"} disconnected (${reason})`,
    );

    activeRooms.forEach((roomName) => {
      socket.to(roomName).emit(SOCKET_EVENTS.USER_LEFT, {
        user: socket.user,
        reason,
        timestamp: new Date().toISOString(),
      });
    });

    activeRooms.clear();
  });
}

module.exports = registerDocumentRoomHandlers;
