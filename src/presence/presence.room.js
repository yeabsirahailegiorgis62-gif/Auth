const PRESENCE_EVENTS = require("./presence.events");
const presenceService = require("./presence.service");

function registerPresenceHandlers(io, socket) {
  const typingTimers = new Map(); // documentId -> setTimeout handle

  socket.on(PRESENCE_EVENTS.PRESENCE_JOIN, async (data, callback) => {
    try {
      const documentId = typeof data === "string" ? data : data?.documentId;
      if (!documentId) return;

      const roomName = `document:${documentId}`;
      socket.join(roomName);

      const session = await presenceService.registerPresenceSession(
        documentId,
        socket.id,
        socket.user,
      );

      console.log(
        `[Presence Room] User ${socket.user.email} registered presence in ${roomName} as ${session.role}`,
      );

      const collaborators = presenceService.getPresenceState(documentId);

      // Broadcast updated presence list to entire room including the joining socket
      io.in(roomName).emit(PRESENCE_EVENTS.PRESENCE_UPDATE, {
        documentId,
        collaborators,
      });

      if (typeof callback === "function") {
        callback({ success: true, session, collaborators });
      }
    } catch (error) {
      console.error("[Presence Join Error]:", error);
    }
  });

  socket.on(PRESENCE_EVENTS.CURSOR_UPDATE, (data) => {
    try {
      const { documentId, cursor } = data || {};
      if (!documentId || !cursor) return;

      const roomName = `document:${documentId}`;
      const updatedSession = presenceService.updateCursor(
        documentId,
        socket.id,
        cursor,
      );

      if (updatedSession) {
        socket.to(roomName).emit(PRESENCE_EVENTS.CURSOR_UPDATE, {
          documentId,
          socketId: socket.id,
          userId: socket.user.id,
          user: updatedSession.user,
          color: updatedSession.color,
          cursor,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("[Presence Cursor Update Error]:", error);
    }
  });

  socket.on(PRESENCE_EVENTS.SELECTION_UPDATE, (data) => {
    try {
      const { documentId, selection } = data || {};
      if (!documentId || !selection) return;

      const roomName = `document:${documentId}`;
      const updatedSession = presenceService.updateSelection(
        documentId,
        socket.id,
        selection,
      );

      if (updatedSession) {
        socket.to(roomName).emit(PRESENCE_EVENTS.SELECTION_UPDATE, {
          documentId,
          socketId: socket.id,
          userId: socket.user.id,
          user: updatedSession.user,
          color: updatedSession.color,
          selection,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("[Presence Selection Update Error]:", error);
    }
  });

  socket.on(PRESENCE_EVENTS.TYPING_START, (data) => {
    try {
      const documentId = typeof data === "string" ? data : data?.documentId;
      if (!documentId) return;

      const roomName = `document:${documentId}`;
      presenceService.setTyping(documentId, socket.id, true);

      socket.to(roomName).emit(PRESENCE_EVENTS.TYPING_START, {
        documentId,
        socketId: socket.id,
        userId: socket.user.id,
        user: socket.user,
      });

      // Clear existing auto-stop timer if any
      const timerKey = `${documentId}:${socket.id}`;
      if (typingTimers.has(timerKey)) {
        clearTimeout(typingTimers.get(timerKey));
      }

      // Auto stop typing status after 2.5 seconds of inactivity
      const autoStopTimer = setTimeout(() => {
        presenceService.setTyping(documentId, socket.id, false);
        socket.to(roomName).emit(PRESENCE_EVENTS.TYPING_STOP, {
          documentId,
          socketId: socket.id,
          userId: socket.user.id,
        });
        typingTimers.delete(timerKey);
      }, 2500);

      typingTimers.set(timerKey, autoStopTimer);
    } catch (error) {
      console.error("[Presence Typing Start Error]:", error);
    }
  });

  socket.on(PRESENCE_EVENTS.TYPING_STOP, (data) => {
    try {
      const documentId = typeof data === "string" ? data : data?.documentId;
      if (!documentId) return;

      const roomName = `document:${documentId}`;
      const timerKey = `${documentId}:${socket.id}`;

      if (typingTimers.has(timerKey)) {
        clearTimeout(typingTimers.get(timerKey));
        typingTimers.delete(timerKey);
      }

      presenceService.setTyping(documentId, socket.id, false);

      socket.to(roomName).emit(PRESENCE_EVENTS.TYPING_STOP, {
        documentId,
        socketId: socket.id,
        userId: socket.user.id,
      });
    } catch (error) {
      console.error("[Presence Typing Stop Error]:", error);
    }
  });

  socket.on(PRESENCE_EVENTS.PRESENCE_LEAVE, (data) => {
    const documentId = typeof data === "string" ? data : data?.documentId;
    if (!documentId) return;

    const roomName = `document:${documentId}`;
    const removedSession = presenceService.removePresenceSession(
      documentId,
      socket.id,
    );

    if (removedSession) {
      const collaborators = presenceService.getPresenceState(documentId);
      socket.to(roomName).emit(PRESENCE_EVENTS.PRESENCE_LEAVE, {
        documentId,
        socketId: socket.id,
        userId: socket.user.id,
        user: socket.user,
      });

      io.in(roomName).emit(PRESENCE_EVENTS.PRESENCE_UPDATE, {
        documentId,
        collaborators,
      });
    }
  });

  socket.on("disconnect", () => {
    // Clean up presence across all rooms socket was in
    const removedRooms = presenceService.removeSocketFromAll(socket.id);

    removedRooms.forEach(({ documentId, session }) => {
      const roomName = `document:${documentId}`;
      const collaborators = presenceService.getPresenceState(documentId);

      socket.to(roomName).emit(PRESENCE_EVENTS.PRESENCE_LEAVE, {
        documentId,
        socketId: socket.id,
        userId: session?.userId,
        user: session?.user,
      });

      io.in(roomName).emit(PRESENCE_EVENTS.PRESENCE_UPDATE, {
        documentId,
        collaborators,
      });
    });
  });
}

module.exports = registerPresenceHandlers;
