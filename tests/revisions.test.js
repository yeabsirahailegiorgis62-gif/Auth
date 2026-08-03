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
let editorToken;
let viewerToken;
let docId;
let initialRevisionId;
let initialVersion;

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

  // 1. Owner
  const ownerEmail = `rev-owner-${Date.now()}@example.com`;
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Doc Owner", email: ownerEmail, password: "Password123!" }),
  });
  const login1 = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: ownerEmail, password: "Password123!" }),
  });
  ownerToken = login1.body.accessToken;

  // 2. Editor User
  const editorEmail = `rev-editor-${Date.now()}@example.com`;
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Doc Editor", email: editorEmail, password: "Password123!" }),
  });
  const login2 = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: editorEmail, password: "Password123!" }),
  });
  editorToken = login2.body.accessToken;

  // 3. Viewer User
  const viewerEmail = `rev-viewer-${Date.now()}@example.com`;
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Doc Viewer", email: viewerEmail, password: "Password123!" }),
  });
  const login3 = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: viewerEmail, password: "Password123!" }),
  });
  viewerToken = login3.body.accessToken;

  // Owner creates Document
  const docRes = await request("/api/documents", {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ title: "Revision Test Document", content: "Version 1 Initial Content" }),
  });
  docId = docRes.body.document.id;

  // Owner shares document with Editor and Viewer
  await request(`/api/documents/${docId}/share`, {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ email: editorEmail, role: "EDITOR" }),
  });

  await request(`/api/documents/${docId}/share`, {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ email: viewerEmail, role: "VIEWER" }),
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("revisions REST: create manual checkpoint snapshot", async () => {
  const snapshotRes = await request(`/api/documents/${docId}/revisions/snapshot`, {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
  });

  assert.equal(snapshotRes.status, 201);
  assert.equal(snapshotRes.body.revision.content, "Version 1 Initial Content");
  initialRevisionId = snapshotRes.body.revision.id;
  initialVersion = snapshotRes.body.revision.version;
});

test("revisions REST: fetch revision timeline for document", async () => {
  const timelineRes = await request(`/api/documents/${docId}/revisions`, {
    headers: { authorization: `Bearer ${editorToken}` },
  });

  assert.equal(timelineRes.status, 200);
  assert.equal(timelineRes.body.revisions.length >= 1, true);
});

test("revisions REST: VIEWER role cannot create checkpoint or restore version", async () => {
  const snapshotAttempt = await request(`/api/documents/${docId}/revisions/snapshot`, {
    method: "POST",
    headers: { authorization: `Bearer ${viewerToken}` },
  });
  assert.equal(snapshotAttempt.status, 403);

  const restoreAttempt = await request(
    `/api/documents/${docId}/revisions/${initialRevisionId}/restore`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${viewerToken}` },
    }
  );
  assert.equal(restoreAttempt.status, 403);
});

test("revisions REST & Socket: restore previous version creates new revision and broadcasts live event", async () => {
  // 1. Editor modifies document to Version 2 content
  await request(`/api/documents/${docId}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${editorToken}` },
    body: JSON.stringify({ content: "Version 2 Modified Content" }),
  });

  // Create checkpoint for Version 2
  const v2Snapshot = await request(`/api/documents/${docId}/revisions/snapshot`, {
    method: "POST",
    headers: { authorization: `Bearer ${editorToken}` },
  });
  assert.equal(v2Snapshot.status, 201);

  // 2. Connect socket clients to test real-time restoration broadcast
  const socketOwner = createSocketClient(ownerToken);
  const socketEditor = createSocketClient(editorToken);

  await joinDocumentRoom(socketOwner, docId);
  await joinDocumentRoom(socketEditor, docId);

  await new Promise((resolve) => {
    socketEditor.on(SOCKET_EVENTS.REVISION_RESTORED, (data) => {
      assert.equal(data.documentId, docId);
      assert.equal(data.restoredFromVersion, initialVersion);
      assert.equal(data.document.content, "Version 1 Initial Content");

      socketOwner.disconnect();
      socketEditor.disconnect();
      resolve();
    });

    // 3. Restore initial version via REST
    request(`/api/documents/${docId}/revisions/${initialRevisionId}/restore`, {
      method: "POST",
      headers: { authorization: `Bearer ${ownerToken}` },
    }).then((restoreRes) => {
      assert.equal(restoreRes.status, 200);
      assert.equal(restoreRes.body.document.content, "Version 1 Initial Content");
      assert.equal(restoreRes.body.newRevision.version > initialVersion, true);
    });
  });
});
