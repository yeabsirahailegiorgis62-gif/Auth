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
let viewerToken;
let user2Email;
let user2Id;
let docId;

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
  return new Promise((resolve) => {
    const doJoin = () => {
      client.emit(SOCKET_EVENTS.JOIN_DOCUMENT, { documentId }, (res) => resolve(res));
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

  // Register Owner
  const email1 = `share-owner-${Date.now()}@example.com`;
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Doc Owner", email: email1, password: "Password123!" }),
  });
  const login1 = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email1, password: "Password123!" }),
  });
  ownerToken = login1.body.accessToken;

  // Register User 2 (Collaborator)
  user2Email = `share-viewer-${Date.now()}@example.com`;
  const reg2 = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Doc Collaborator", email: user2Email, password: "Password123!" }),
  });
  user2Id = reg2.body.user.id;

  const login2 = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: user2Email, password: "Password123!" }),
  });
  viewerToken = login2.body.accessToken;

  // Owner creates Document
  const docRes = await request("/api/documents", {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ title: "RBAC Protected Doc", content: "Original Content" }),
  });
  docId = docRes.body.document.id;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("sharing: unshared user cannot access or read document", async () => {
  const getRes = await request(`/api/documents/${docId}`, {
    headers: { authorization: `Bearer ${viewerToken}` },
  });
  assert.equal(getRes.status, 403);
});

test("sharing: owner shares document with User 2 as VIEWER", async () => {
  const shareRes = await request(`/api/documents/${docId}/share`, {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ email: user2Email, role: "VIEWER" }),
  });

  assert.equal(shareRes.status, 201);
  assert.equal(shareRes.body.share.role, "VIEWER");

  // User 2 can now read document
  const getRes = await request(`/api/documents/${docId}`, {
    headers: { authorization: `Bearer ${viewerToken}` },
  });

  assert.equal(getRes.status, 200);
  assert.equal(getRes.body.document.userRole, "VIEWER");
});

test("RBAC enforcement: VIEWER role cannot edit via REST or WebSocket", async () => {
  // REST Edit attempt should fail with 403
  const patchRes = await request(`/api/documents/${docId}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${viewerToken}` },
    body: JSON.stringify({ content: "Unauthorized edit attempt" }),
  });
  assert.equal(patchRes.status, 403);

  // WebSocket Edit attempt should fail with SOCKET_ERROR
  const viewerSocket = createSocketClient(viewerToken);

  await new Promise((resolve) => {
    viewerSocket.on(SOCKET_EVENTS.SOCKET_ERROR, (err) => {
      assert.match(err.message, /permission denied/i);
      viewerSocket.disconnect();
      resolve();
    });

    joinDocumentRoom(viewerSocket, docId).then(() => {
      viewerSocket.emit(SOCKET_EVENTS.DOC_UPDATE, {
        documentId: docId,
        content: "Unauthorized socket edit",
      });
    });
  });
});

test("RBAC role upgrade: owner promotes VIEWER to EDITOR enabling edit access", async () => {
  const patchRoleRes = await request(`/api/documents/${docId}/collaborators/${user2Id}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ role: "EDITOR" }),
  });

  assert.equal(patchRoleRes.status, 200);
  assert.equal(patchRoleRes.body.share.role, "EDITOR");

  // User 2 can now edit document via REST
  const editRes = await request(`/api/documents/${docId}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${viewerToken}` },
    body: JSON.stringify({ content: "Authorized editor content" }),
  });

  assert.equal(editRes.status, 200);
});

test("collaborator removal: owner removes User 2 revoking all access", async () => {
  const deleteRes = await request(`/api/documents/${docId}/collaborators/${user2Id}`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${ownerToken}` },
  });

  assert.equal(deleteRes.status, 200);

  // User 2 should no longer be able to read document
  const getRes = await request(`/api/documents/${docId}`, {
    headers: { authorization: `Bearer ${viewerToken}` },
  });

  assert.equal(getRes.status, 403);
});

test("RBAC security: non-owner cannot share or delete document", async () => {
  const shareAttempt = await request(`/api/documents/${docId}/share`, {
    method: "POST",
    headers: { authorization: `Bearer ${viewerToken}` },
    body: JSON.stringify({ email: "random@example.com", role: "EDITOR" }),
  });
  assert.equal(shareAttempt.status, 403);

  const deleteAttempt = await request(`/api/documents/${docId}`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${viewerToken}` },
  });
  assert.equal(deleteAttempt.status, 403);
});
