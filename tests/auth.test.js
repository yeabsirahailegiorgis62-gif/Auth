const test = require("node:test");
const assert = require("node:assert/strict");

const app = require("../src/app");

let server;
let baseUrl;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "content-type": "application/json" },
    ...options,
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
  baseUrl = `http://127.0.0.1:${address.port}/api/auth`;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("logout rejects missing refresh token with 400", async () => {
  const response = await request("/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });

  assert.equal(response.status, 400);
  assert.match(String(response.body?.message || ""), /refresh token required/i);
});

test("register/login/refresh flow completes successfully", async () => {
  const email = `node-test-${Date.now()}@example.com`;

  const registerResponse = await request("/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Node Test User",
      email,
      password: "Secret123!",
    }),
  });

  assert.equal(registerResponse.status, 201);

  const loginResponse = await request("/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: "Secret123!",
    }),
  });

  assert.equal(loginResponse.status, 200);
  assert.ok(loginResponse.body?.accessToken);
  assert.ok(loginResponse.body?.refreshToken);

  const refreshResponse = await request("/refresh", {
    method: "POST",
    body: JSON.stringify({
      refreshToken: loginResponse.body.refreshToken,
    }),
  });

  assert.equal(refreshResponse.status, 200);
  assert.ok(refreshResponse.body?.accessToken);
});

test("weak passwords are rejected by the backend", async () => {
  const response = await request("/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Weak Password User",
      email: `weak-${Date.now()}@example.com`,
      password: "weakpass",
    }),
  });

  assert.equal(response.status, 400);
  assert.match(String(response.body?.message || ""), /at least 8 characters/i);
});

test("repeated bad logins lock the account", async () => {
  const email = `lockout-${Date.now()}@example.com`;

  const registerResponse = await request("/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Lockout User",
      email,
      password: "Secret123!",
    }),
  });

  assert.equal(registerResponse.status, 201);

  const firstAttempt = await request("/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: "WrongPass1!",
    }),
  });

  assert.equal(firstAttempt.status, 401);

  const secondAttempt = await request("/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: "WrongPass2!",
    }),
  });

  assert.equal(secondAttempt.status, 401);

  const thirdAttempt = await request("/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: "WrongPass3!",
    }),
  });

  assert.equal(thirdAttempt.status, 429);
  assert.match(String(thirdAttempt.body?.message || ""), /too many failed login attempts/i);
});

test("google auth entrypoint redirects to Google when configured", async () => {
  const response = await fetch(`${baseUrl}/google`, {
    redirect: "manual",
  });

  assert.equal(response.status, 302);
  assert.match(
    response.headers.get("location") || "",
    /accounts\.google\.com|google\.com/i,
  );
});

test("forgot password and reset password flow completes successfully", async () => {
  const email = `reset-${Date.now()}@example.com`;

  await request("/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Reset User",
      email,
      password: "OldPassword1!",
    }),
  });

  const forgotRes = await request("/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  assert.equal(forgotRes.status, 200);
  const resetToken = forgotRes.body?.resetToken;
  assert.ok(resetToken);

  const resetRes = await request("/reset-password", {
    method: "POST",
    body: JSON.stringify({
      token: resetToken,
      newPassword: "NewPassword123!",
    }),
  });

  assert.equal(resetRes.status, 200);

  const loginRes = await request("/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: "NewPassword123!",
    }),
  });

  assert.equal(loginRes.status, 200);
  assert.ok(loginRes.body?.accessToken);
});

test("unverified user login is blocked until verified via token", async () => {
  const email = `unverified-${Date.now()}@example.com`;

  const registerRes = await request("/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Unverified User",
      email,
      password: "Secret123!",
      forceVerification: true,
    }),
  });

  assert.equal(registerRes.status, 201);
  assert.equal(registerRes.body?.requiresVerification, true);
  const verificationToken = registerRes.body?.verificationToken;
  assert.ok(verificationToken);

  const blockedLoginRes = await request("/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: "Secret123!",
    }),
  });

  assert.equal(blockedLoginRes.status, 403);
  assert.equal(blockedLoginRes.body?.requiresVerification, true);

  const verifyRes = await request("/verify-email", {
    method: "POST",
    body: JSON.stringify({ token: verificationToken }),
  });

  assert.equal(verifyRes.status, 200);

  const successLoginRes = await request("/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: "Secret123!",
    }),
  });

  assert.equal(successLoginRes.status, 200);
  assert.ok(successLoginRes.body?.accessToken);
});

