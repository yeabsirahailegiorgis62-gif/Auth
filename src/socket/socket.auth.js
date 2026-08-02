const jwt = require("jsonwebtoken");

function socketAuthMiddleware(socket, next) {
  try {
    let token = socket.handshake.auth?.token;

    if (!token && socket.handshake.headers?.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      const err = new Error("Authentication error: Token required");
      err.data = { code: "UNAUTHORIZED" };
      return next(err);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = {
      id: decoded.id,
      email: decoded.email,
    };

    console.log(`[Socket Auth] Authenticated user ${socket.user.email} (${socket.user.id})`);
    next();
  } catch (error) {
    console.error(`[Socket Auth] Rejected socket connection: ${error.message}`);
    const err = new Error("Authentication error: Invalid or expired token");
    err.data = { code: "UNAUTHORIZED" };
    return next(err);
  }
}

module.exports = socketAuthMiddleware;
