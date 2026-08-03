import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "../context/SocketContext";

export function useDocumentCollaboration({
  documentId,
  onRemoteUpdate,
  onStateSync,
}) {
  const { socket, isConnected, connectionError } = useSocket();
  const [activeUsers, setActiveUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const isRemoteUpdateRef = useRef(false);

  useEffect(() => {
    if (!socket || !documentId) return;

    setConnectionStatus(isConnected ? "connected" : "reconnecting");

    // Join document room
    socket.emit("join-document", { documentId }, (response) => {
      if (response?.success) {
        console.log(`[Collab Hook] Joined room document:${documentId}`);
      }
    });

    // Event listeners
    const handleDocUpdate = (data) => {
      if (data.documentId === documentId) {
        console.log("[Collab Hook] Received remote update from", data.updatedBy?.email);
        isRemoteUpdateRef.current = true;
        onRemoteUpdate?.(data.content, data.updatedBy);
        setTimeout(() => {
          isRemoteUpdateRef.current = false;
        }, 100);
      }
    };

    const handleSyncState = (data) => {
      if (data.documentId === documentId) {
        console.log("[Collab Hook] Received initial state sync");
        onStateSync?.(data);
      }
    };

    const handleUserJoined = (data) => {
      console.log(`[Collab Hook] User joined room: ${data.user?.email}`);
      setActiveUsers((prev) => {
        if (!prev.some((u) => u.id === data.user?.id)) {
          return [...prev, data.user];
        }
        return prev;
      });
    };

    const handleUserLeft = (data) => {
      console.log(`[Collab Hook] User left room: ${data.user?.email}`);
      setActiveUsers((prev) => prev.filter((u) => u.id !== data.user?.id));
    };

    socket.on("doc-update", handleDocUpdate);
    socket.on("sync-state", handleSyncState);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.emit("leave-document", { documentId });
      socket.off("doc-update", handleDocUpdate);
      socket.off("sync-state", handleSyncState);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
    };
  }, [socket, isConnected, documentId, onRemoteUpdate, onStateSync]);

  useEffect(() => {
    if (!isConnected) {
      setConnectionStatus("reconnecting");
    } else {
      setConnectionStatus("connected");
    }
  }, [isConnected]);

  const emitUpdate = useCallback(
    (content) => {
      if (!socket || !isConnected || !documentId) return;

      // Do not broadcast back if the update originated from a remote peer
      if (isRemoteUpdateRef.current) return;

      socket.emit("doc-update", {
        documentId,
        content,
      });
    },
    [socket, isConnected, documentId],
  );

  return {
    emitUpdate,
    connectionStatus: connectionError ? "disconnected" : connectionStatus,
    activeUsers,
    isRemoteUpdateRef,
  };
}
