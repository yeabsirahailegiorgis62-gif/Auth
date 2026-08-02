require("dotenv").config();

const http = require("http");
const app = require("./app");
const { initSocketServer } = require("./socket/socket.server");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server and Socket.IO running on port ${PORT}`);
});

module.exports = server;
