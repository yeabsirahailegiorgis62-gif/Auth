// Real-time Collaboration Socket Event Definitions
const SOCKET_EVENTS = {
  // Client -> Server & Server -> Client Room Management
  JOIN_DOCUMENT: "join-document",
  LEAVE_DOCUMENT: "leave-document",
  USER_JOINED: "user-joined",
  USER_LEFT: "user-left",

  // State Synchronization Events
  DOC_UPDATE: "doc-update",
  SYNC_STATE: "sync-state",

  // Error Handling
  SOCKET_ERROR: "socket-error",

  // Real-Time Comments Events (Client -> Server)
  COMMENT_CREATE: "comment:create",
  COMMENT_REPLY: "comment:reply",
  COMMENT_UPDATE: "comment:update",
  COMMENT_DELETE: "comment:delete",
  THREAD_RESOLVE: "thread:resolve",
  THREAD_REOPEN: "thread:reopen",

  // Real-Time Comments Broadcast Events (Server -> Client)
  COMMENT_CREATED: "comment:created",
  COMMENT_REPLIED: "comment:replied",
  COMMENT_UPDATED: "comment:updated",
  COMMENT_DELETED: "comment:deleted",
  THREAD_RESOLVED: "thread:resolved",
  // Revision & Version History Events
  REVISION_RESTORED: "revision:restored",
};

module.exports = SOCKET_EVENTS;
