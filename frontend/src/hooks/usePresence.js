import { useEffect, useState, useRef, useCallback } from "react";
import { useSocket } from "../context/SocketContext";

export function usePresence(documentId) {
  const { socket, isConnected } = useSocket();
  const [collaborators, setCollaborators] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [remoteSelections, setRemoteSelections] = useState({});
  const [typingUsers, setTypingUsers] = useState([]);
  const lastCursorEmitRef = useRef(0);

  useEffect(() => {
    if (!socket || !documentId || !isConnected) return;

    // Join presence room
    socket.emit("presence:join", { documentId }, (res) => {
      if (res?.success && res?.collaborators) {
        setCollaborators(res.collaborators);
      }
    });

    const handlePresenceUpdate = (data) => {
      if (data.documentId === documentId) {
        setCollaborators(data.collaborators || []);
      }
    };

    const handleCursorUpdate = (data) => {
      if (data.documentId === documentId) {
        setRemoteCursors((prev) => ({
          ...prev,
          [data.socketId]: {
            socketId: data.socketId,
            userId: data.userId,
            user: data.user,
            color: data.color,
            cursor: data.cursor,
            updatedAt: Date.now(),
          },
        }));
      }
    };

    const handleSelectionUpdate = (data) => {
      if (data.documentId === documentId) {
        setRemoteSelections((prev) => ({
          ...prev,
          [data.socketId]: {
            socketId: data.socketId,
            userId: data.userId,
            user: data.user,
            color: data.color,
            selection: data.selection,
            updatedAt: Date.now(),
          },
        }));
      }
    };

    const handleTypingStart = (data) => {
      if (data.documentId === documentId) {
        setTypingUsers((prev) => {
          if (!prev.some((u) => u.id === data.user?.id)) {
            return [...prev, data.user];
          }
          return prev;
        });
      }
    };

    const handleTypingStop = (data) => {
      if (data.documentId === documentId) {
        setTypingUsers((prev) => prev.filter((u) => u.id !== data.userId));
      }
    };

    const handlePresenceLeave = (data) => {
      if (data.documentId === documentId) {
        setRemoteCursors((prev) => {
          const next = { ...prev };
          delete next[data.socketId];
          return next;
        });
        setRemoteSelections((prev) => {
          const next = { ...prev };
          delete next[data.socketId];
          return next;
        });
        setTypingUsers((prev) => prev.filter((u) => u.id !== data.userId));
      }
    };

    socket.on("presence:update", handlePresenceUpdate);
    socket.on("cursor:update", handleCursorUpdate);
    socket.on("selection:update", handleSelectionUpdate);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    socket.on("presence:leave", handlePresenceLeave);

    return () => {
      socket.emit("presence:leave", { documentId });
      socket.off("presence:update", handlePresenceUpdate);
      socket.off("cursor:update", handleCursorUpdate);
      socket.off("selection:update", handleSelectionUpdate);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      socket.off("presence:leave", handlePresenceLeave);
    };
  }, [socket, documentId, isConnected]);

  // Throttled cursor position update emission (50ms)
  const updateCursor = useCallback(
    (cursorData) => {
      if (!socket || !isConnected || !documentId) return;

      const now = Date.now();
      if (now - lastCursorEmitRef.current > 50) {
        lastCursorEmitRef.current = now;
        socket.emit("cursor:update", {
          documentId,
          cursor: cursorData,
        });
      }
    },
    [socket, isConnected, documentId],
  );

  const updateSelection = useCallback(
    (selectionData) => {
      if (!socket || !isConnected || !documentId) return;
      socket.emit("selection:update", {
        documentId,
        selection: selectionData,
      });
    },
    [socket, isConnected, documentId],
  );

  const notifyTyping = useCallback(() => {
    if (!socket || !isConnected || !documentId) return;
    socket.emit("typing:start", { documentId });
  }, [socket, isConnected, documentId]);

  return {
    collaborators,
    remoteCursors: Object.values(remoteCursors),
    remoteSelections: Object.values(remoteSelections),
    typingUsers,
    updateCursor,
    updateSelection,
    notifyTyping,
  };
}
