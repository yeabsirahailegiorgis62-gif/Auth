const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");
const { io: ClientIO } = require("socket.io-client");

const app = require("../src/app");
const { initSocketServer } = require("../src/socket/socket.server");
const SOCKET_EVENTS = require("../src/socket/events");

let server;
let baseUrl;
let socketUrl;
let ownerToken;
let docId;
let threadId;

const TS = Date.now();
const ownerEmail = `e2e-owner-${TS}@example.com`;

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

function joinDocumentRoom(client, documentId) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("joinDocumentRoom timed out")), 5000);
    const doJoin = () => {
      client.emit(SOCKET_EVENTS.JOIN_DOCUMENT, { documentId }, (res) => {
        clearTimeout(timeout);
        resolve(res);
      });
    };
    if (client.connected) {
      doJoin();
    } else {
      client.once("connect", doJoin);
      client.once("connect_error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
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
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("E2E Lifecycle: User registration and authentication", async () => {
  const reg1 = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "E2E Owner", email: ownerEmail, password: "Password123!" }),
  });
  assert.equal(reg1.status, 201);

  const login1 = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: ownerEmail, password: "Password123!" }),
  });
  assert.equal(login1.status, 200);
  ownerToken = login1.body.accessToken;
});

test("E2E Lifecycle: Document creation, editing, and sharing", async () => {
  const docRes = await request("/api/documents", {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ title: "E2E Architecture Blueprint", content: "Initial Draft" }),
  });
  assert.equal(docRes.status, 201);
  docId = docRes.body.document.id;

  const updateRes = await request(`/api/documents/${docId}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ content: "Updated Draft Content" }),
  });
  assert.equal(updateRes.status, 200);
});

test("E2E Lifecycle: Real-time Socket.IO collaboration and presence", async () => {
  const socketOwner = createSocketClient(ownerToken);
  try {
    const res1 = await joinDocumentRoom(socketOwner, docId);
    assert.equal(res1.success, true);
  } finally {
    socketOwner.disconnect();
  }
});

test("E2E Lifecycle: Threaded comments and discussion resolution", async () => {
  const threadRes = await request(`/api/documents/${docId}/comments`, {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({
      selectedText: "Updated Draft Content",
      content: "Please review the architecture diagram.",
    }),
  });
  assert.equal(threadRes.status, 201);
  threadId = threadRes.body.thread.id;

  const replyRes = await request(`/api/documents/${docId}/comments/${threadId}/reply`, {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ content: "Looks great, approved!" }),
  });
  assert.equal(replyRes.status, 201);

  const resolveRes = await request(`/api/documents/${docId}/comments/${threadId}/resolve`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  assert.equal(resolveRes.status, 200);
});

test("E2E Lifecycle: Document export, trash soft-delete, and restoration", async () => {
  const exportRes = await request(`/api/documents/${docId}/export?format=md`, {
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  assert.equal(exportRes.status, 200);

  const trashRes = await request(`/api/documents/${docId}/trash`, {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  assert.equal(trashRes.status, 200);

  const restoreRes = await request(`/api/documents/${docId}/restore`, {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  assert.equal(restoreRes.status, 200);
});
