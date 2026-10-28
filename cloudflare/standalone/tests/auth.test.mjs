import assert from "node:assert/strict";
import { createHash, createSign, generateKeyPairSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { AuthError, endSession, logoutCsrfToken, authConfigured, finishLogin, logoutLocally, ownerKeyForPrincipal, sessionPrincipal, startLogin, verifyMcpBearer } from "../src/auth.ts";
import { createNote, listNotes, readNote } from "../src/store.ts";

const issuer = "https://minamo-test.eu.auth0.com/";
const audience = "https://minamo-v2-staging.jlscott-uk.workers.dev/mcp";
const env = {
  AUTH0_DOMAIN: "minamo-test.eu.auth0.com",
  AUTH0_CLIENT_ID: "public-test-client-id",
  AUTH0_CLIENT_SECRET: "server-secret-for-tests-only",
  AUTH0_MCP_AUDIENCE: audience,
  AUTH0_CALLBACK_URL: "https://minamo-v2-staging.jlscott-uk.workers.dev/auth/callback",
  AUTH0_LOGOUT_RETURN_URL: "https://minamo-v2-staging.jlscott-uk.workers.dev/account",
};

function database() {
  const sqlite = new DatabaseSync(":memory:");
  for (const migration of ["0001_init.sql", "0002_auth.sql"]) {
    sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
  }
  return {
    close: () => sqlite.close(),
    prepare(query) {
      const statement = sqlite.prepare(query);
      return {
        bind(...params) {
          return {
            async all() { return { results: statement.all(...params) }; },
            async first() { return statement.get(...params) ?? null; },
            async run() { return { meta: { changes: statement.run(...params).changes } }; },
          };
        },
      };
    },
  };
}

function sessionToken() { return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url"); }
function tokenHash(token) { return createHash("sha256").update(token).digest("hex"); }

function tokenFor(privateKey, claims, kid = "test-key") {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const head = encode({ alg: "RS256", typ: "JWT", kid });
  const body = encode(claims);
  const signer = createSign("RSA-SHA256");
  signer.update(`${head}.${body}`);
  signer.end();
  return `${head}.${body}.${signer.sign(privateKey).toString("base64url")}`;
}

test("OIDC auth fails closed until real configuration is supplied", () => {
  assert.equal(authConfigured({ ...env, AUTH0_DOMAIN: "your-tenant.eu.auth0.com", AUTH0_CLIENT_ID: "replace-me" }), false);
  assert.equal(authConfigured(env), true);
});

test("issuer and subject form a stable, provider-qualified tenant key", async () => {
  const first = await ownerKeyForPrincipal(issuer, "auth0|synthetic-user-a");
  assert.equal(first, await ownerKeyForPrincipal(issuer, "auth0|synthetic-user-a"));
  assert.notEqual(first, await ownerKeyForPrincipal(issuer, "auth0|synthetic-user-b"));
  assert.notEqual(first, await ownerKeyForPrincipal("https://other.eu.auth0.com/", "auth0|synthetic-user-a"));
  assert.match(first, /^oidc:[a-f0-9]{64}$/);
});

test("web session identity is server-derived and tenant reads stay isolated", async (context) => {
  const db = database();
  context.after(() => db.close());
  const ownerA = await ownerKeyForPrincipal(issuer, "auth0|synthetic-user-a");
  const ownerB = await ownerKeyForPrincipal(issuer, "auth0|synthetic-user-b");
  const note = await createNote(db, ownerA, { title: "Synthetic A", body: "Private to test identity A." });
  assert.equal((await readNote(db, ownerB, note.id)), null);
  assert.deepEqual(await listNotes(db, ownerB), []);

  const session = sessionToken();
  await db.prepare("INSERT INTO web_sessions (session_hash, issuer, subject, expires_at) VALUES (?, ?, ?, ?)")
    .bind(tokenHash(session), issuer, "auth0|synthetic-user-a", Math.floor(Date.now() / 1000) + 300).run();
  const request = new Request(`${env.AUTH0_CALLBACK_URL}/../account`, { headers: { Cookie: `__Host-minamo-session=${session}` } });
  const principal = await sessionPrincipal({ ...env, DB: db }, request);
  assert.equal(principal.ownerKey, ownerA);

  const expiredToken = sessionToken();
  await db.prepare("INSERT INTO web_sessions (session_hash, issuer, subject, expires_at) VALUES (?, ?, ?, ?)")
    .bind(tokenHash(expiredToken), issuer, "auth0|synthetic-user-a", Math.floor(Date.now() / 1000) - 1).run();
  const expired = await sessionPrincipal({ ...env, DB: db }, new Request("https://minamo-v2-staging.jlscott-uk.workers.dev/account", {
    headers: { Cookie: `__Host-minamo-session=${expiredToken}` },
  }));
  assert.equal(expired, null);
  assert.equal(await db.prepare("SELECT 1 AS found FROM web_sessions WHERE session_hash = ?").bind(tokenHash(expiredToken)).first(), null);
});

test("logout rejects cross-site requests and revokes the server-side session", async (context) => {
  const db = database();
  context.after(() => db.close());
  const session = sessionToken();
  await db.prepare("INSERT INTO web_sessions (session_hash, issuer, subject, expires_at) VALUES (?, ?, ?, ?)")
    .bind(tokenHash(session), issuer, "auth0|synthetic-user-a", Math.floor(Date.now() / 1000) + 300).run();
  const authEnv = { ...env, DB: db };
  const url = "https://minamo-v2-staging.jlscott-uk.workers.dev/auth/logout";
  const cookieHeader = `__Host-minamo-session=${session}`;
  const attack = await logoutLocally(authEnv, new Request(url, {
    method: "POST", headers: { Origin: "https://evil.example", Cookie: cookieHeader },
  }));
  assert.equal(attack.status, 403);
  assert.ok(await db.prepare("SELECT 1 AS found FROM web_sessions WHERE session_hash = ?").bind(tokenHash(session)).first());

  const logout = await logoutLocally(authEnv, new Request(url, {
    method: "POST", headers: { Origin: new URL(env.AUTH0_CALLBACK_URL).origin, Cookie: cookieHeader },
  }));
  assert.equal(logout.status, 303);
  assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);
  assert.equal(await db.prepare("SELECT 1 AS found FROM web_sessions WHERE session_hash = ?").bind(tokenHash(session)).first(), null);
});

test("web login uses state, nonce, PKCE and consumes the callback transaction once", async (context) => {
  const db = database();
  context.after(() => db.close());
  const authEnv = { ...env, DB: db };
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const jwk = { ...publicKey.export({ format: "jwk" }), kid: "login-key", use: "sig", alg: "RS256" };
  const originalFetch = globalThis.fetch;
  let authorize;
  globalThis.fetch = async (input, init) => {
    assert.equal(init?.redirect, "manual");
    const url = String(input);
    if (url.endsWith("/.well-known/openid-configuration")) {
      return Response.json({
        issuer,
        authorization_endpoint: "https://minamo-test.eu.auth0.com/authorize",
        token_endpoint: "https://minamo-test.eu.auth0.com/oauth/token",
        jwks_uri: "https://minamo-test.eu.auth0.com/.well-known/jwks.json",
      });
    }
    if (url.endsWith("/.well-known/jwks.json")) return Response.json({ keys: [jwk] });
    if (url.endsWith("/oauth/token")) {
      const form = new URLSearchParams(init.body);
      assert.equal(form.get("grant_type"), "authorization_code");
      assert.equal(form.get("redirect_uri"), env.AUTH0_CALLBACK_URL);
      assert.equal(form.get("client_secret"), env.AUTH0_CLIENT_SECRET);
      const challenge = createHash("sha256").update(form.get("code_verifier")).digest("base64url");
      assert.equal(challenge, authorize.searchParams.get("code_challenge"));
      assert.equal(authorize.searchParams.get("code_challenge_method"), "S256");
      const now = Math.floor(Date.now() / 1000);
      const idToken = tokenFor(privateKey, {
        iss: issuer,
        sub: "auth0|synthetic-login-user",
        aud: env.AUTH0_CLIENT_ID,
        exp: now + 300,
        iat: now,
        nonce: authorize.searchParams.get("nonce"),
      }, "login-key");
      return Response.json({ access_token: "synthetic-test-only", id_token: idToken, token_type: "Bearer" });
    }
    throw new Error(`Unexpected URL ${url}`);
  };
  context.after(() => { globalThis.fetch = originalFetch; });

  const login = await startLogin(authEnv, new Request("https://minamo-v2-staging.jlscott-uk.workers.dev/auth/login"));
  assert.equal(login.status, 302);
  authorize = new URL(login.headers.get("location"));
  assert.equal(authorize.searchParams.get("response_type"), "code");
  assert.equal(authorize.searchParams.get("client_id"), env.AUTH0_CLIENT_ID);
  assert.equal(authorize.searchParams.has("audience"), false);
  const loginCookie = login.headers.get("set-cookie").split(";")[0];
  const callbackUrl = `${env.AUTH0_CALLBACK_URL}?code=one-time-code&state=${encodeURIComponent(authorize.searchParams.get("state"))}`;
  await assert.rejects(finishLogin(authEnv, new Request(callbackUrl, { headers: { Cookie: "__Host-minamo-login=wrong-state" } })),
    (error) => error instanceof AuthError && error.code === "invalid_login_transaction");
  const callback = await finishLogin(authEnv, new Request(callbackUrl, { headers: { Cookie: loginCookie } }));
  assert.equal(callback.status, 303);
  assert.equal(callback.headers.get("location"), "/account");
  const sessionCookie = callback.headers.getSetCookie().find((value) => value.startsWith("__Host-minamo-session="));
  assert.match(sessionCookie, /HttpOnly/);
  assert.match(sessionCookie, /SameSite=Lax/);
  const cookiePair = sessionCookie.split(";")[0];
  const principal = await sessionPrincipal(authEnv, new Request("https://minamo-v2-staging.jlscott-uk.workers.dev/account", { headers: { Cookie: cookiePair } }));
  assert.equal(principal.subject, "auth0|synthetic-login-user");
  await assert.rejects(finishLogin(authEnv, new Request(callbackUrl, { headers: { Cookie: loginCookie } })),
    (error) => error instanceof AuthError && error.code === "invalid_login_transaction");
});

test("MCP bearer validation checks signature, issuer, audience, expiry and scope", async (context) => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const jwk = { ...publicKey.export({ format: "jwk" }), kid: "test-key", use: "sig", alg: "RS256" };
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init) => {
    assert.equal(init?.redirect, "manual");
    const url = String(input);
    if (url.endsWith("/.well-known/openid-configuration")) {
      return Response.json({
        issuer,
        authorization_endpoint: "https://minamo-test.eu.auth0.com/authorize",
        token_endpoint: "https://minamo-test.eu.auth0.com/oauth/token",
        jwks_uri: "https://minamo-test.eu.auth0.com/.well-known/jwks.json",
      });
    }
    if (url.endsWith("/.well-known/jwks.json")) return Response.json({ keys: [jwk] });
    throw new Error(`Unexpected URL ${url}`);
  };

  const now = Math.floor(Date.now() / 1000);
  const base = { iss: issuer, sub: "auth0|synthetic-user-a", aud: audience, exp: now + 300, iat: now, scope: "notes:read" };
  const requestFor = (claims) => new Request("https://minamo-v2-staging.jlscott-uk.workers.dev/mcp", {
    headers: { Authorization: `Bearer ${tokenFor(privateKey, claims)}`, "X-User-Id": "auth0|synthetic-user-b" },
  });

  const principal = await verifyMcpBearer(env, requestFor(base));
  assert.equal(principal.issuer, issuer);
  assert.equal(principal.subject, base.sub);
  assert.equal(principal.ownerKey, await ownerKeyForPrincipal(issuer, base.sub));
  assert.notEqual(principal.ownerKey, await ownerKeyForPrincipal(issuer, "auth0|synthetic-user-b"));
  const principalB = await verifyMcpBearer(env, requestFor({ ...base, sub: "auth0|synthetic-user-b" }));
  assert.notEqual(principal.ownerKey, principalB.ownerKey);

  await assert.rejects(verifyMcpBearer(env, requestFor({ ...base, aud: "https://wrong.example/mcp" })),
    (error) => error instanceof AuthError && error.code === "invalid_token");
  await assert.rejects(verifyMcpBearer(env, requestFor({ ...base, iss: "https://wrong.eu.auth0.com/" })),
    (error) => error instanceof AuthError && error.code === "invalid_token");
  await assert.rejects(verifyMcpBearer(env, requestFor({ ...base, exp: now - 1 })),
    (error) => error instanceof AuthError && error.code === "invalid_token");
  await assert.rejects(verifyMcpBearer(env, requestFor({ ...base, nbf: now + 120 })),
    (error) => error instanceof AuthError && error.code === "invalid_token");
  await assert.rejects(verifyMcpBearer(env, requestFor({ ...base, scope: "openid" })),
    (error) => error instanceof AuthError && error.code === "insufficient_scope");
  const otherKey = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey;
  const forged = new Request("https://minamo-v2-staging.jlscott-uk.workers.dev/mcp", {
    headers: { Authorization: `Bearer ${tokenFor(otherKey, base)}` },
  });
  await assert.rejects(verifyMcpBearer(env, forged),
    (error) => error instanceof AuthError && error.code === "invalid_token");
  await assert.rejects(verifyMcpBearer(env, new Request("https://minamo-v2-staging.jlscott-uk.workers.dev/mcp")),
    (error) => error instanceof AuthError && error.code === "missing_bearer_token");
  await assert.rejects(verifyMcpBearer(env, new Request("https://minamo-v2-staging.jlscott-uk.workers.dev/mcp", {
    headers: { "X-User-Id": "auth0|synthetic-user-a" },
  })), (error) => error instanceof AuthError && error.code === "missing_bearer_token");
});

test("provider logout validates tickets, revokes sessions and remains idempotent", async (context) => {
  const db = database();
  context.after(() => db.close());
  const authEnv = { ...env, DB: db };
  const token = sessionToken();
  const cookie = `__Host-minamo-session=${token}`;
  const url = "https://minamo-v2-staging.jlscott-uk.workers.dev/auth/logout/provider";
  const csrf = await logoutCsrfToken(authEnv, new Request(url, { headers: { Cookie: cookie } }));
  await db.prepare("INSERT INTO web_sessions (session_hash, issuer, subject, expires_at) VALUES (?, ?, ?, ?)")
    .bind(tokenHash(token), issuer, "auth0|synthetic-user-a", Math.floor(Date.now() / 1000) + 300).run();
  const post = (ticket, headers = {}) => new Request(url, {
    method: "POST", headers, body: new URLSearchParams({ csrf_token: ticket }),
  });
  assert.equal((await endSession(authEnv, post("forged", { Origin: "https://evil.example" }))).status, 403);
  assert.equal((await endSession(authEnv, post(csrf, { Cookie: `__Host-minamo-session=${sessionToken()}` }))).status, 403);
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await endSession(authEnv, post(csrf));
    assert.equal(response.status, 303);
    const target = new URL(response.headers.get("Location"));
    assert.equal(target.origin, new URL(issuer).origin);
    assert.equal(target.pathname, "/v2/logout");
    assert.equal(target.searchParams.get("client_id"), env.AUTH0_CLIENT_ID);
    assert.equal(target.searchParams.get("returnTo"), env.AUTH0_LOGOUT_RETURN_URL);
    assert.match(response.headers.get("Set-Cookie"), /Max-Age=0/);
    assert.equal(await db.prepare("SELECT 1 AS found FROM web_sessions WHERE session_hash = ?").bind(tokenHash(token)).first(), null);
  }
});

test("hosted MCP acceptance login requests the scoped resource without changing ordinary login", async (context) => {
  const db = database();
  context.after(() => db.close());
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init) => {
    assert.equal(init?.redirect, "manual");
    assert.equal(String(input), issuer + ".well-known/openid-configuration");
    return Response.json({
      issuer,
      authorization_endpoint: issuer + "authorize",
      token_endpoint: issuer + "oauth/token",
      jwks_uri: issuer + ".well-known/jwks.json",
    });
  };
  const request = new Request("https://minamo-v2-staging.jlscott-uk.workers.dev/auth/acceptance/mcp");
  const response = await startLogin({ ...env, DB: db }, request);
  assert.equal(response.status, 302);
  const authorize = new URL(response.headers.get("Location"));
  assert.equal(authorize.searchParams.get("audience"), audience);
  assert.deepEqual(authorize.searchParams.get("scope").split(" "), ["openid", "notes:read"]);
  assert.ok(authorize.searchParams.get("state").startsWith("m_"));
  assert.equal(authorize.searchParams.get("code_challenge_method"), "S256");
});
