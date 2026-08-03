const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");
const { io: ClientIO } = require("socket.io-client");

const app = require("../src/app");
const { initSocketServer } = require("../src/socket/socket.server");
const PRESENCE_EVENTS = require("../src/presence/presence.events");

let server;
let baseUrl;
let socketUrl;
let user1Token;
let user2Token;
let doc1Id;

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

function joinPresenceRoom(client, documentId) {
  return new Promise((resolve) => {
    const doJoin = () => {
      client.emit(PRESENCE_EVENTS.PRESENCE_JOIN, { documentId }, (res) => resolve(res));
    };
    if (client.connected) {
      doJoin();
    } else {
      client.on("connect", doJoin);
    }
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

  // Register User 1
  const email1 = `presence-user1-${Date.now()}@example.com`;
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Presence Owner 1",
      email: email1,
      password: "Password123!",
    }),
  });
  const login1 = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email1, password: "Password123!" }),
  });
  user1Token = login1.body.accessToken;

  // Register User 2
  const email2 = `presence-user2-${Date.now()}@example.com`;
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Presence Collaborator 2",
      email: email2,
      password: "Password123!",
    }),
  });
  const login2 = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email2, password: "Password123!" }),
  });
  user2Token = login2.body.accessToken;

  // User 1 creates Doc 1
  const doc1Res = await request("/api/documents", {
    method: "POST",
    headers: { authorization: `Bearer ${user1Token}` },
    body: JSON.stringify({ title: "Presence Doc 1", content: "Presence Content" }),
  });
  doc1Id = doc1Res.body.document.id;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("presence: joining presence room assigns role and brand color", async () => {
  const client1 = createSocketClient(user1Token);
  const res = await joinPresenceRoom(client1, doc1Id);

  assert.equal(res.success, true);
  assert.equal(res.session.role, "Owner");
  assert.ok(res.session.color);
  assert.equal(res.collaborators.length, 1);
  client1.disconnect();
});

test("presence: live cursor movement broadcasting", async () => {
  const client1 = createSocketClient(user1Token);
  const client2 = createSocketClient(user2Token);

  await joinPresenceRoom(client1, doc1Id);
  await joinPresenceRoom(client2, doc1Id);

  await new Promise((resolve) => {
    client2.on(PRESENCE_EVENTS.CURSOR_UPDATE, (data) => {
      assert.equal(data.documentId, doc1Id);
      assert.equal(data.cursor.x, 120);
      assert.equal(data.cursor.y, 350);
      client1.disconnect();
      client2.disconnect();
      resolve();
    });

    client1.emit(PRESENCE_EVENTS.CURSOR_UPDATE, {
      documentId: doc1Id,
      cursor: { x: 120, y: 350 },
    });
  });
});

test("presence: typing indicators start and stop", async () => {
  const client1 = createSocketClient(user1Token);
  const client2 = createSocketClient(user2Token);

  await joinPresenceRoom(client1, doc1Id);
  await joinPresenceRoom(client2, doc1Id);

  await new Promise((resolve) => {
    let startReceived = false;

    client2.on(PRESENCE_EVENTS.TYPING_START, (data) => {
      assert.equal(data.documentId, doc1Id);
      startReceived = true;
      client1.emit(PRESENCE_EVENTS.TYPING_STOP, { documentId: doc1Id });
    });

    client2.on(PRESENCE_EVENTS.TYPING_STOP, (data) => {
      assert.equal(data.documentId, doc1Id);
      assert.equal(startReceived, true);
      client1.disconnect();
      client2.disconnect();
      resolve();
    });

    client1.emit(PRESENCE_EVENTS.TYPING_START, { documentId: doc1Id });
  });
});

test("presence: disconnect cleans up user session cleanly", async () => {
  const client1 = createSocketClient(user1Token);
  const client2 = createSocketClient(user2Token);

  await joinPresenceRoom(client1, doc1Id);
  await joinPresenceRoom(client2, doc1Id);

  await new Promise((resolve) => {
    client2.on(PRESENCE_EVENTS.PRESENCE_LEAVE, (data) => {
      assert.equal(data.documentId, doc1Id);
      client2.disconnect();
      resolve();
    });

    client1.disconnect();
  });
});
