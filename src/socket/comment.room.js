const SOCKET_EVENTS = require("./events");
const commentService = require("../services/comment.service");

/**
 * Registers real-time comment event handlers for a connected socket client
 */
function registerCommentHandlers(io, socket) {
  // 1. Create Comment Thread
  socket.on(SOCKET_EVENTS.COMMENT_CREATE, async (data, callback) => {
    try {
      const { documentId, selectedText, fromPos, toPos, content } = data || {};
      const thread = await commentService.createThread(
        documentId,
        socket.user.id,
        { selectedText, fromPos, toPos, content }
      );

      const roomName = `document:${documentId}`;
      io.in(roomName).emit(SOCKET_EVENTS.COMMENT_CREATED, {
        documentId,
        thread,
      });

      if (typeof callback === "function") {
        callback({ success: true, thread });
      }
    } catch (error) {
      console.error(`[Comment Room] Create thread error: ${error.message}`);
      if (typeof callback === "function") {
        callback({ success: false, error: error.message });
      }
      socket.emit(SOCKET_EVENTS.SOCKET_ERROR, {
        message: error.message,
      });
    }
  });

  // 2. Reply to Thread
  socket.on(SOCKET_EVENTS.COMMENT_REPLY, async (data, callback) => {
    try {
      const { documentId, threadId, content } = data || {};
      const comment = await commentService.addReply(
        documentId,
        threadId,
        socket.user.id,
        content
      );

      const roomName = `document:${documentId}`;
      io.in(roomName).emit(SOCKET_EVENTS.COMMENT_REPLIED, {
        documentId,
        threadId,
        comment,
      });

      if (typeof callback === "function") {
        callback({ success: true, comment });
      }
    } catch (error) {
      console.error(`[Comment Room] Add reply error: ${error.message}`);
      if (typeof callback === "function") {
        callback({ success: false, error: error.message });
      }
      socket.emit(SOCKET_EVENTS.SOCKET_ERROR, {
        message: error.message,
      });
    }
  });

  // 3. Update Comment
  socket.on(SOCKET_EVENTS.COMMENT_UPDATE, async (data, callback) => {
    try {
      const { documentId, commentId, content } = data || {};
      const comment = await commentService.updateComment(
        documentId,
        commentId,
        socket.user.id,
        content
      );

      const roomName = `document:${documentId}`;
      io.in(roomName).emit(SOCKET_EVENTS.COMMENT_UPDATED, {
        documentId,
        commentId,
        comment,
      });

      if (typeof callback === "function") {
        callback({ success: true, comment });
      }
    } catch (error) {
      console.error(`[Comment Room] Update comment error: ${error.message}`);
      if (typeof callback === "function") {
        callback({ success: false, error: error.message });
      }
      socket.emit(SOCKET_EVENTS.SOCKET_ERROR, {
        message: error.message,
      });
    }
  });

  // 4. Delete Comment
  socket.on(SOCKET_EVENTS.COMMENT_DELETE, async (data, callback) => {
    try {
      const { documentId, commentId } = data || {};
      const result = await commentService.deleteComment(
        documentId,
        commentId,
        socket.user.id
      );

      const roomName = `document:${documentId}`;
      io.in(roomName).emit(SOCKET_EVENTS.COMMENT_DELETED, {
        documentId,
        commentId,
        ...result,
      });

      if (typeof callback === "function") {
        callback({ success: true, ...result });
      }
    } catch (error) {
      console.error(`[Comment Room] Delete comment error: ${error.message}`);
      if (typeof callback === "function") {
        callback({ success: false, error: error.message });
      }
      socket.emit(SOCKET_EVENTS.SOCKET_ERROR, {
        message: error.message,
      });
    }
  });

  // 5. Resolve Thread
  socket.on(SOCKET_EVENTS.THREAD_RESOLVE, async (data, callback) => {
    try {
      const { documentId, threadId } = data || {};
      const thread = await commentService.resolveThread(
        documentId,
        threadId,
        socket.user.id
      );

      const roomName = `document:${documentId}`;
      io.in(roomName).emit(SOCKET_EVENTS.THREAD_RESOLVED, {
        documentId,
        threadId,
        thread,
      });

      if (typeof callback === "function") {
        callback({ success: true, thread });
      }
    } catch (error) {
      console.error(`[Comment Room] Resolve thread error: ${error.message}`);
      if (typeof callback === "function") {
        callback({ success: false, error: error.message });
      }
      socket.emit(SOCKET_EVENTS.SOCKET_ERROR, {
        message: error.message,
      });
    }
  });

  // 6. Reopen Thread
  socket.on(SOCKET_EVENTS.THREAD_REOPEN, async (data, callback) => {
    try {
      const { documentId, threadId } = data || {};
      const thread = await commentService.reopenThread(
        documentId,
        threadId,
        socket.user.id
      );

      const roomName = `document:${documentId}`;
      io.in(roomName).emit(SOCKET_EVENTS.THREAD_REOPENED, {
        documentId,
        threadId,
        thread,
      });

      if (typeof callback === "function") {
        callback({ success: true, thread });
      }
    } catch (error) {
      console.error(`[Comment Room] Reopen thread error: ${error.message}`);
      if (typeof callback === "function") {
        callback({ success: false, error: error.message });
      }
      socket.emit(SOCKET_EVENTS.SOCKET_ERROR, {
        message: error.message,
      });
    }
  });
}

module.exports = {
  registerCommentHandlers,
};
