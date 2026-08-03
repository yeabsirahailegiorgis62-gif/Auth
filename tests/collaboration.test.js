const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");
const { io: ClientIO } = require("socket.io-client");

const app = require("../src/app");
const { initSocketServer } = require("../src/socket/socket.server");
const SOCKET_EVENTS = require("../src/socket/events");
const collaborationService = require("../src/socket/collaboration.service");

let server;
let baseUrl;
let socketUrl;
let user1Token;
let user2Token;
let doc1Id;
let doc2Id;

async function request(path, options = {}) {
  const { headers, ...restOptions } = options;
  const response = await fetch(`${baseUrl}${path}`, {
    ...restOptions,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  });

  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  return { status: response.status, body };
}

function createSocketClient(token) {
  return ClientIO(socketUrl, {
    auth: { token },
    transports: ["websocket"],
    reconnection: false,
  });
}

test.before(async () => {
  server = http.createServer(app);
  initSocketServer(server);

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
  socketUrl = `ws://127.0.0.1:${address.port}`;

  // Register & login User 1
  const email1 = `collab-user1-${Date.now()}@example.com`;
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Collab Owner 1",
      email: email1,
      password: "Password123!",
    }),
  });
  const login1 = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: email1,
      password: "Password123!",
    }),
  });
  user1Token = login1.body.accessToken;

  // Register & login User 2
  const email2 = `collab-user2-${Date.now()}@example.com`;
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Collab Owner 2",
      email: email2,
      password: "Password123!",
    }),
  });
  const login2 = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: email2,
      password: "Password123!",
    }),
  });
  user2Token = login2.body.accessToken;

  // User 1 creates Doc 1
  const doc1Res = await request("/api/documents", {
    method: "POST",
    headers: { authorization: `Bearer ${user1Token}` },
    body: JSON.stringify({ title: "Collab Doc 1", content: "Initial 1" }),
  });
  doc1Id = doc1Res.body.document.id;

  // User 2 creates Doc 2
  const doc2Res = await request("/api/documents", {
    method: "POST",
    headers: { authorization: `Bearer ${user2Token}` },
    body: JSON.stringify({ title: "Collab Doc 2", content: "Initial 2" }),
  });
  doc2Id = doc2Res.body.document.id;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("socket auth: unauthenticated connection is rejected", async () => {
  const socket = ClientIO(socketUrl, {
    transports: ["websocket"],
    reconnection: false,
  });

  await new Promise((resolve) => {
    socket.on("connect_error", (err) => {
      assert.match(err.message, /authentication/i);
      socket.disconnect();
      resolve();
    });
  });
});

test("socket auth: authenticated socket connects cleanly", async () => {
  const socket = createSocketClient(user1Token);

  await new Promise((resolve) => {
    socket.on("connect", () => {
      assert.ok(socket.connected);
      socket.disconnect();
      resolve();
    });
  });
});

test("socket room security: user 2 cannot join user 1's document room", async () => {
  const socket = createSocketClient(user2Token);

  await new Promise((resolve) => {
    socket.on("connect", () => {
      socket.emit(SOCKET_EVENTS.JOIN_DOCUMENT, { documentId: doc1Id });
    });

    socket.on(SOCKET_EVENTS.SOCKET_ERROR, (err) => {
      assert.match(err.message, /permission denied/i);
      socket.disconnect();
      resolve();
    });
  });
});

test("real-time document update broadcasting & debounced persistence", async () => {
  const client1 = createSocketClient(user1Token);
  const client2 = createSocketClient(user1Token); // Same user in second tab/session

  await new Promise((resolve) => {
    client1.on("connect", () => {
      client1.emit(SOCKET_EVENTS.JOIN_DOCUMENT, { documentId: doc1Id });
    });

    client2.on("connect", () => {
      client2.emit(SOCKET_EVENTS.JOIN_DOCUMENT, { documentId: doc1Id });
    });

    let joinsCount = 0;
    const checkJoins = () => {
      joinsCount++;
      if (joinsCount >= 2) {
        // Client 1 sends document update
        client1.emit(SOCKET_EVENTS.DOC_UPDATE, {
          documentId: doc1Id,
          content: { type: "doc", content: [{ type: "paragraph", text: "Live sync content!" }] },
        });
      }
    };

    client1.on(SOCKET_EVENTS.SYNC_STATE, checkJoins);
    client2.on(SOCKET_EVENTS.SYNC_STATE, checkJoins);

    client2.on(SOCKET_EVENTS.DOC_UPDATE, async (data) => {
      assert.equal(data.documentId, doc1Id);
      assert.match(JSON.stringify(data.content), /Live sync content!/);

      // Flush pending save for verification
      await collaborationService.flushPendingSave(doc1Id);

      // Verify DB was updated
      const getRes = await request(`/api/documents/${doc1Id}`, {
        headers: { authorization: `Bearer ${user1Token}` },
      });

      assert.match(getRes.body.document.content, /Live sync content!/);

      client1.disconnect();
      client2.disconnect();
      resolve();
    });
  });
});

test("room isolation: updates in doc 1 are not received by users in doc 2", async () => {
  const clientDoc1 = createSocketClient(user1Token);
  const clientDoc2 = createSocketClient(user2Token);

  let unexpectedReceived = false;

  await new Promise((resolve) => {
    clientDoc1.on("connect", () => {
      clientDoc1.emit(SOCKET_EVENTS.JOIN_DOCUMENT, { documentId: doc1Id });
    });

    clientDoc2.on("connect", () => {
      clientDoc2.emit(SOCKET_EVENTS.JOIN_DOCUMENT, { documentId: doc2Id });
    });

    clientDoc2.on(SOCKET_EVENTS.DOC_UPDATE, () => {
      unexpectedReceived = true;
    });

    clientDoc1.on(SOCKET_EVENTS.SYNC_STATE, () => {
      // Broadcast update in doc1
      clientDoc1.emit(SOCKET_EVENTS.DOC_UPDATE, {
        documentId: doc1Id,
        content: "Doc 1 update",
      });

      setTimeout(() => {
        assert.equal(unexpectedReceived, false);
        clientDoc1.disconnect();
        clientDoc2.disconnect();
        resolve();
      }, 300);
    });
  });
});
