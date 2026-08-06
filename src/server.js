require("dotenv").config();

const http = require("http");
const app = require("./app");
const logger = require("./config/logger");
const { initSocketServer } = require("./socket/socket.server");
const { yjsWebsocketServer } = require("./socket/yjs.server");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocketServer(server);

server.on("upgrade", (request, socket, head) => {
  // Pass to Yjs websocket handler if path matches /yjs
  if (request.url.startsWith('/yjs/')) {
    yjsWebsocketServer.handleUpgrade(request, socket, head, (ws) => {
      yjsWebsocketServer.emit('connection', ws, request);
    });
  }
  // Note: Socket.io handles its own upgrades natively because we passed `server` to it
});

server.listen(PORT, () => {
  logger.info(`Server and Socket.IO running on port ${PORT}`);
});

module.exports = server;
