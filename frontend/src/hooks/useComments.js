import { useState, useEffect, useCallback } from "react";
import * as commentService from "../services/commentService";

export function useComments(documentId, socket) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("open"); // 'open' | 'resolved' | 'all'

  // Fetch threads initially via REST
  const fetchThreads = useCallback(async () => {
    if (!documentId) return;
    try {
      setLoading(true);
      const data = await commentService.getThreads(documentId, { status: filterStatus });
      setThreads(data.threads || []);
    } catch (err) {
      console.error("Failed to fetch comment threads:", err);
    } finally {
      setLoading(false);
    }
  }, [documentId, filterStatus]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Real-time socket event listeners
  useEffect(() => {
    if (!socket || !documentId) return;

    const handleCreated = ({ documentId: docId, thread }) => {
      if (docId !== documentId) return;
      setThreads((prev) => {
        if (prev.some((t) => t.id === thread.id)) return prev;
        return [thread, ...prev];
      });
    };

    const handleReplied = ({ documentId: docId, threadId, comment }) => {
      if (docId !== documentId) return;
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t;
          if (t.comments.some((c) => c.id === comment.id)) return t;
          return {
            ...t,
            comments: [...t.comments, comment],
          };
        })
      );
    };

    const handleUpdated = ({ documentId: docId, commentId, comment }) => {
      if (docId !== documentId) return;
      setThreads((prev) =>
        prev.map((t) => ({
          ...t,
          comments: t.comments.map((c) => (c.id === commentId ? comment : c)),
        }))
      );
    };

    const handleDeleted = ({ documentId: docId, commentId, threadId, deletedThreadId }) => {
      if (docId !== documentId) return;
      if (deletedThreadId) {
        setThreads((prev) => prev.filter((t) => t.id !== deletedThreadId));
        if (activeThreadId === deletedThreadId) setActiveThreadId(null);
      } else if (threadId && commentId) {
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id !== threadId) return t;
            return {
              ...t,
              comments: t.comments.filter((c) => c.id !== commentId),
            };
          })
        );
      }
    };

    const handleResolved = ({ documentId: docId, threadId, thread }) => {
      if (docId !== documentId) return;
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, ...thread } : t))
      );
    };

    const handleReopened = ({ documentId: docId, threadId, thread }) => {
      if (docId !== documentId) return;
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, ...thread } : t))
      );
    };

    socket.on("comment:created", handleCreated);
    socket.on("comment:replied", handleReplied);
    socket.on("comment:updated", handleUpdated);
    socket.on("comment:deleted", handleDeleted);
    socket.on("thread:resolved", handleResolved);
    socket.on("thread:reopened", handleReopened);

    return () => {
      socket.off("comment:created", handleCreated);
      socket.off("comment:replied", handleReplied);
      socket.off("comment:updated", handleUpdated);
      socket.off("comment:deleted", handleDeleted);
      socket.off("thread:resolved", handleResolved);
      socket.off("thread:reopened", handleReopened);
    };
  }, [socket, documentId, activeThreadId]);

  // Actions
  const createThread = async (data) => {
    if (socket && socket.connected) {
      return new Promise((resolve, reject) => {
        socket.emit("comment:create", { documentId, ...data }, (res) => {
          if (res?.success) resolve(res.thread);
          else reject(new Error(res?.error || "Failed to create thread"));
        });
      });
    }
    const res = await commentService.createThread(documentId, data);
    setThreads((prev) => [res.thread, ...prev]);
    return res.thread;
  };

  const addReply = async (threadId, content) => {
    if (socket && socket.connected) {
      return new Promise((resolve, reject) => {
        socket.emit("comment:reply", { documentId, threadId, content }, (res) => {
          if (res?.success) resolve(res.comment);
          else reject(new Error(res?.error || "Failed to add reply"));
        });
      });
    }
    const res = await commentService.addReply(documentId, threadId, content);
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, comments: [...t.comments, res.comment] } : t
      )
    );
    return res.comment;
  };

  const updateComment = async (commentId, content) => {
    if (socket && socket.connected) {
      return new Promise((resolve, reject) => {
        socket.emit("comment:update", { documentId, commentId, content }, (res) => {
          if (res?.success) resolve(res.comment);
          else reject(new Error(res?.error || "Failed to update comment"));
        });
      });
    }
    const res = await commentService.updateComment(documentId, commentId, content);
    fetchThreads();
    return res.comment;
  };

  const deleteComment = async (commentId) => {
    if (socket && socket.connected) {
      return new Promise((resolve, reject) => {
        socket.emit("comment:delete", { documentId, commentId }, (res) => {
          if (res?.success) resolve(res);
          else reject(new Error(res?.error || "Failed to delete comment"));
        });
      });
    }
    const res = await commentService.deleteComment(documentId, commentId);
    fetchThreads();
    return res;
  };

  const resolveThread = async (threadId) => {
    if (socket && socket.connected) {
      return new Promise((resolve, reject) => {
        socket.emit("thread:resolve", { documentId, threadId }, (res) => {
          if (res?.success) resolve(res.thread);
          else reject(new Error(res?.error || "Failed to resolve thread"));
        });
      });
    }
    const res = await commentService.resolveThread(documentId, threadId);
    fetchThreads();
    return res.thread;
  };

  const reopenThread = async (threadId) => {
    if (socket && socket.connected) {
      return new Promise((resolve, reject) => {
        socket.emit("thread:reopen", { documentId, threadId }, (res) => {
          if (res?.success) resolve(res.thread);
          else reject(new Error(res?.error || "Failed to reopen thread"));
        });
      });
    }
    const res = await commentService.reopenThread(documentId, threadId);
    fetchThreads();
    return res.thread;
  };

  return {
    threads,
    loading,
    activeThreadId,
    setActiveThreadId,
    filterStatus,
    setFilterStatus,
    fetchThreads,
    createThread,
    addReply,
    updateComment,
    deleteComment,
    resolveThread,
    reopenThread,
  };
}
