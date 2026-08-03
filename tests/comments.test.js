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
let commenterToken;
let viewerToken;
let commenterUserId;
let docId;
let threadId;
let rootCommentId;

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
  const ownerEmail = `comment-owner-${Date.now()}@example.com`;
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Doc Owner", email: ownerEmail, password: "Password123!" }),
  });
  const login1 = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: ownerEmail, password: "Password123!" }),
  });
  ownerToken = login1.body.accessToken;

  // 2. Commenter User
  const commenterEmail = `commenter-${Date.now()}@example.com`;
  const reg2 = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Reviewer User", email: commenterEmail, password: "Password123!" }),
  });
  commenterUserId = reg2.body.user.id;
  const login2 = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: commenterEmail, password: "Password123!" }),
  });
  commenterToken = login2.body.accessToken;

  // 3. Viewer User
  const viewerEmail = `comment-viewer-${Date.now()}@example.com`;
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Viewer User", email: viewerEmail, password: "Password123!" }),
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
    body: JSON.stringify({ title: "Comment Test Doc", content: "Sample text for review" }),
  });
  docId = docRes.body.document.id;

  // Owner shares document with Commenter (role: COMMENTER) and Viewer (role: VIEWER)
  await request(`/api/documents/${docId}/share`, {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ email: commenterEmail, role: "COMMENTER" }),
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

test("comments REST: authorized COMMENTER creates thread with selection quote", async () => {
  const res = await request(`/api/documents/${docId}/comments`, {
    method: "POST",
    headers: { authorization: `Bearer ${commenterToken}` },
    body: JSON.stringify({
      selectedText: "Sample text",
      fromPos: 0,
      toPos: 11,
      content: "Initial review comment on sample text.",
    }),
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.thread.selectedText, "Sample text");
  assert.equal(res.body.thread.comments.length, 1);
  assert.equal(res.body.thread.comments[0].content, "Initial review comment on sample text.");

  threadId = res.body.thread.id;
  rootCommentId = res.body.thread.comments[0].id;
});

test("comments REST: VIEWER can read threads but cannot create thread or reply", async () => {
  // Read threads succeeds
  const getRes = await request(`/api/documents/${docId}/comments`, {
    headers: { authorization: `Bearer ${viewerToken}` },
  });
  assert.equal(getRes.status, 200);
  assert.equal(getRes.body.threads.length, 1);

  // Create thread fails with 403
  const createAttempt = await request(`/api/documents/${docId}/comments`, {
    method: "POST",
    headers: { authorization: `Bearer ${viewerToken}` },
    body: JSON.stringify({ content: "Viewer attempt" }),
  });
  assert.equal(createAttempt.status, 403);

  // Reply attempt fails with 403
  const replyAttempt = await request(`/api/documents/${docId}/comments/${threadId}/reply`, {
    method: "POST",
    headers: { authorization: `Bearer ${viewerToken}` },
    body: JSON.stringify({ content: "Viewer reply attempt" }),
  });
  assert.equal(replyAttempt.status, 403);
});

test("comments REST: adding replies to threaded discussion", async () => {
  const replyRes = await request(`/api/documents/${docId}/comments/${threadId}/reply`, {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ content: "Owner response to review." }),
  });

  assert.equal(replyRes.status, 201);
  assert.equal(replyRes.body.comment.content, "Owner response to review.");

  // Fetch thread list and verify 2 comments
  const threadsRes = await request(`/api/documents/${docId}/comments`, {
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  const targetThread = threadsRes.body.threads.find((t) => t.id === threadId);
  assert.equal(targetThread.comments.length, 2);
});

test("comments REST: edit own comment vs editing another user's comment", async () => {
  // Edit own comment succeeds
  const editRes = await request(`/api/documents/${docId}/comments/item/${rootCommentId}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${commenterToken}` },
    body: JSON.stringify({ content: "Edited review comment." }),
  });
  assert.equal(editRes.status, 200);
  assert.equal(editRes.body.comment.edited, true);

  // Edit another user's comment fails with 403
  const editOtherRes = await request(`/api/documents/${docId}/comments/item/${rootCommentId}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ content: "Unauthorized edit by owner" }),
  });
  assert.equal(editOtherRes.status, 403);
});

test("comments REST: resolve and reopen discussion thread", async () => {
  // Resolve thread
  const resolveRes = await request(`/api/documents/${docId}/comments/${threadId}/resolve`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${ownerToken}` },
  });

  assert.equal(resolveRes.status, 200);
  assert.equal(resolveRes.body.thread.resolved, true);

  // Reopen thread
  const reopenRes = await request(`/api/documents/${docId}/comments/${threadId}/reopen`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${commenterToken}` },
  });

  assert.equal(reopenRes.status, 200);
  assert.equal(reopenRes.body.thread.resolved, false);
});

test("comments Socket.IO: real-time live comment creation and reply broadcasting", async () => {
  const socketOwner = createSocketClient(ownerToken);
  const socketCommenter = createSocketClient(commenterToken);

  await joinDocumentRoom(socketOwner, docId);
  await joinDocumentRoom(socketCommenter, docId);

  await new Promise((resolve) => {
    socketOwner.on(SOCKET_EVENTS.COMMENT_CREATED, ({ documentId: dId, thread }) => {
      assert.equal(dId, docId);
      assert.equal(thread.selectedText, "Socket text");
      socketOwner.disconnect();
      socketCommenter.disconnect();
      resolve();
    });

    socketCommenter.emit(
      SOCKET_EVENTS.COMMENT_CREATE,
      {
        documentId: docId,
        selectedText: "Socket text",
        content: "Socket live comment",
      },
      (res) => {
        assert.equal(res.success, true);
      }
    );
  });
});
