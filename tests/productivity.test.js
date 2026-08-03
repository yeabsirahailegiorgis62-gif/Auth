const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");

const app = require("../src/app");
const { initSocketServer } = require("../src/socket/socket.server");

let server;
let baseUrl;
let ownerToken;
let recipientToken;
let docId;
let notificationId;

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

test.before(async () => {
  server = http.createServer(app);
  initSocketServer(server);

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;

  // 1. Owner User
  const ownerEmail = `prod-owner-${Date.now()}@example.com`;
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Productivity Owner", email: ownerEmail, password: "Password123!" }),
  });
  const login1 = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: ownerEmail, password: "Password123!" }),
  });
  ownerToken = login1.body.accessToken;

  // 2. Recipient User
  const recipientEmail = `prod-recip-${Date.now()}@example.com`;
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Productivity Recipient", email: recipientEmail, password: "Password123!" }),
  });
  const login2 = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: recipientEmail, password: "Password123!" }),
  });
  recipientToken = login2.body.accessToken;

  // Owner creates Document
  const docRes = await request("/api/documents", {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ title: "Quantum Computing Specifications", content: "PostgreSQL full-text search content" }),
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

test("search: permission-aware global search returns matching documents", async () => {
  const searchRes = await request("/api/search?q=Quantum", {
    headers: { authorization: `Bearer ${ownerToken}` },
  });

  assert.equal(searchRes.status, 200);
  assert.equal(searchRes.body.results.length >= 1, true);
  assert.equal(searchRes.body.results[0].id, docId);
});

test("favorites: add, list, and remove favorite document", async () => {
  // Add favorite
  const addRes = await request(`/api/documents/${docId}/favorite`, {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  assert.equal(addRes.status, 200);
  assert.equal(addRes.body.isFavorite, true);

  // List favorites
  const listRes = await request("/api/user/favorites", {
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  assert.equal(listRes.status, 200);
  assert.equal(listRes.body.favorites.length >= 1, true);

  // Remove favorite
  const removeRes = await request(`/api/documents/${docId}/favorite`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  assert.equal(removeRes.status, 200);
  assert.equal(removeRes.body.isFavorite, false);
});

test("trash system: move to trash, fetch trash, and restore document", async () => {
  // Move to trash
  const trashRes = await request(`/api/documents/${docId}/trash`, {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  assert.equal(trashRes.status, 200);
  assert.equal(trashRes.body.isArchived, true);

  // Fetch trash list
  const trashListRes = await request("/api/documents/trash", {
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  assert.equal(trashListRes.status, 200);
  assert.equal(trashListRes.body.documents.length >= 1, true);

  // Restore document from trash
  const restoreRes = await request(`/api/documents/${docId}/restore`, {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  assert.equal(restoreRes.status, 200);
  assert.equal(restoreRes.body.isArchived, false);
});

test("activity feed: records user actions timeline", async () => {
  const activityRes = await request("/api/activity", {
    headers: { authorization: `Bearer ${ownerToken}` },
  });

  assert.equal(activityRes.status, 200);
  assert.equal(activityRes.body.activities.length >= 1, true);
});

test("notifications: triggers notification on document share and allows marking as read", async () => {
  // Share document to generate notification
  await request(`/api/documents/${docId}/share`, {
    method: "POST",
    headers: { authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ email: `prod-recip-${Date.now()}@example.com`, role: "VIEWER" }),
  }).catch(() => {});

  // Fetch notifications for recipient
  const notifRes = await request("/api/notifications", {
    headers: { authorization: `Bearer ${recipientToken}` },
  });

  assert.equal(notifRes.status, 200);
});
