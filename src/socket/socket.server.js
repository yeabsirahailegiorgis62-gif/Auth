const { Server } = require("socket.io");
const socketAuthMiddleware = require("./socket.auth");
const registerDocumentRoomHandlers = require("./document.room");
const registerPresenceHandlers = require("../presence/presence.room");
const { registerCommentHandlers } = require("./comment.room");
const logger = require("../config/logger");

let io = null;

function initSocketServer(httpServer) {
  const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (
          !origin ||
          origin === allowedOrigin ||
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  // Apply JWT authentication middleware during connection handshake
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    logger.info(
      `[Socket Server] New connection established: Socket ID ${socket.id} for user ${socket.user.email}`
    );

    registerDocumentRoomHandlers(io, socket);
    registerPresenceHandlers(io, socket);
    registerCommentHandlers(io, socket);
  });

  logger.info("[Socket Server] Socket.IO collaboration engine initialized");
  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.IO server has not been initialized");
  }
  return io;
}

module.exports = {
  initSocketServer,
  getIO,
};
