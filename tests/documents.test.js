const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");

let server;
let baseUrl;
let user1Token;
let user2Token;

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
  server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;

  // Register & login User 1
  const email1 = `doc-user1-${Date.now()}@example.com`;
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Doc Owner 1",
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
  const email2 = `doc-user2-${Date.now()}@example.com`;
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Doc Owner 2",
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
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("unauthenticated requests to /api/documents return 401", async () => {
  const res = await request("/api/documents");
  assert.equal(res.status, 401);
});

test("document lifecycle: create, read, update, duplicate, and delete", async () => {
  // 1. Create document
  const createRes = await request("/api/documents", {
    method: "POST",
    headers: { authorization: `Bearer ${user1Token}` },
    body: JSON.stringify({
      title: "Quarterly Roadmap",
      content: "# Q3 Roadmap\n- Feature A\n- Feature B",
    }),
  });

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.document.title, "Quarterly Roadmap");
  const docId = createRes.body.document.id;
  assert.ok(docId);

  // 2. Fetch documents list
  const listRes = await request("/api/documents", {
    headers: { authorization: `Bearer ${user1Token}` },
  });
  assert.equal(listRes.status, 200);
  assert.ok(listRes.body.documents.some((d) => d.id === docId));

  // 3. Fetch single document
  const getRes = await request(`/api/documents/${docId}`, {
    headers: { authorization: `Bearer ${user1Token}` },
  });
  assert.equal(getRes.status, 200);
  assert.equal(getRes.body.document.title, "Quarterly Roadmap");

  // 4. Update / Rename document & rich text TipTap JSON content
  const tipTapJson = {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Q3 Strategy Roadmap" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Formatted content in TipTap JSON format." }],
      },
    ],
  };

  const updateRes = await request(`/api/documents/${docId}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${user1Token}` },
    body: JSON.stringify({
      title: "Q3 Strategy Roadmap",
      content: tipTapJson,
    }),
  });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.document.title, "Q3 Strategy Roadmap");
  assert.match(updateRes.body.document.content, /Q3 Strategy Roadmap/);

  // 5. Duplicate document
  const dupRes = await request(`/api/documents/${docId}/duplicate`, {
    method: "POST",
    headers: { authorization: `Bearer ${user1Token}` },
  });
  assert.equal(dupRes.status, 201);
  assert.equal(dupRes.body.document.title, "Copy of Q3 Strategy Roadmap");
  const dupDocId = dupRes.body.document.id;

  // 6. Delete duplicated document
  const delRes = await request(`/api/documents/${dupDocId}`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${user1Token}` },
  });
  assert.equal(delRes.status, 200);
});

test("security: user 2 cannot update or delete user 1's document", async () => {
  // User 1 creates a document
  const createRes = await request("/api/documents", {
    method: "POST",
    headers: { authorization: `Bearer ${user1Token}` },
    body: JSON.stringify({
      title: "Private Spec",
      content: "Confidential data",
    }),
  });
  const docId = createRes.body.document.id;

  // User 2 attempts to get document (not shared) -> 403
  const getRes = await request(`/api/documents/${docId}`, {
    headers: { authorization: `Bearer ${user2Token}` },
  });
  assert.equal(getRes.status, 403);

  // User 2 attempts to rename -> 403
  const updateRes = await request(`/api/documents/${docId}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${user2Token}` },
    body: JSON.stringify({ title: "Hacked Title" }),
  });
  assert.equal(updateRes.status, 403);

  // User 2 attempts to delete -> 403
  const deleteRes = await request(`/api/documents/${docId}`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${user2Token}` },
  });
  assert.equal(deleteRes.status, 403);
});

test("document search filters by title", async () => {
  await request("/api/documents", {
    method: "POST",
    headers: { authorization: `Bearer ${user1Token}` },
    body: JSON.stringify({ title: "Alpha Release Notes" }),
  });
  await request("/api/documents", {
    method: "POST",
    headers: { authorization: `Bearer ${user1Token}` },
    body: JSON.stringify({ title: "Beta Testing Guide" }),
  });

  const searchRes = await request("/api/documents?search=Alpha", {
    headers: { authorization: `Bearer ${user1Token}` },
  });

  assert.equal(searchRes.status, 200);
  assert.ok(searchRes.body.documents.every((d) => d.title.toLowerCase().includes("alpha")));
});
