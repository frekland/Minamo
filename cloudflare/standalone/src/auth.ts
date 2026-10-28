const SESSION_COOKIE = "__Host-minamo-session";
const LOGIN_COOKIE = "__Host-minamo-login";
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const LOGIN_TTL_SECONDS = 10 * 60;
const REQUIRED_MCP_SCOPE = "notes:read";

declare global {
  interface Env {
    AUTH0_DOMAIN?: string;
    AUTH0_CLIENT_ID?: string;
    AUTH0_CLIENT_SECRET?: string;
    AUTH0_MCP_AUDIENCE?: string;
    AUTH0_CALLBACK_URL?: string;
    AUTH0_LOGOUT_RETURN_URL?: string;
  }
}

export class AuthError extends Error {
  readonly status: 401 | 503;
  readonly code: string;
  constructor(status: 401 | 503, code: string) {
    super(code);
    this.name = "AuthError";
    this.status = status;
    this.code = code;
  }
}

export interface Principal {
  issuer: string;
  subject: string;
  ownerKey: string;
}

interface Discovery {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  end_session_endpoint?: string;
}

interface JwtClaims {
  iss?: unknown;
  sub?: unknown;
  aud?: unknown;
  exp?: unknown;
  nbf?: unknown;
  iat?: unknown;
  nonce?: unknown;
  azp?: unknown;
  scope?: unknown;
  scp?: unknown;
}

function normalizedDomain(env: Env): URL {
  const raw = env.AUTH0_DOMAIN?.trim();
  if (!raw || raw.includes("/") || raw.includes("@")) throw new AuthError(503, "auth_not_configured");
  let url: URL;
  try { url = new URL(`https://${raw}`); } catch { throw new AuthError(503, "auth_not_configured"); }
  if (url.protocol !== "https:" || url.hostname !== raw.toLowerCase() || url.port || url.username || url.password) {
    throw new AuthError(503, "auth_not_configured");
  }
  return url;
}

export function authConfigured(env: Env): boolean {
  try {
    normalizedDomain(env);
    const callback = new URL(env.AUTH0_CALLBACK_URL ?? "");
    const logout = new URL(env.AUTH0_LOGOUT_RETURN_URL ?? "");
    const audience = new URL(env.AUTH0_MCP_AUDIENCE ?? "");
    const placeholders = [env.AUTH0_DOMAIN, env.AUTH0_CLIENT_ID, env.AUTH0_CLIENT_SECRET, env.AUTH0_MCP_AUDIENCE,
      env.AUTH0_CALLBACK_URL, env.AUTH0_LOGOUT_RETURN_URL].some((value) => !value || /your-tenant|replace-with|placeholder/i.test(value));
    return Boolean(!placeholders && env.AUTH0_CLIENT_ID?.trim() && env.AUTH0_CLIENT_SECRET?.trim() &&
      callback.protocol === "https:" && !callback.username && !callback.password && !callback.search && !callback.hash &&
      logout.protocol === "https:" && !logout.username && !logout.password && !logout.search && !logout.hash &&
      audience.protocol === "https:" && !audience.username && !audience.password && !audience.search && !audience.hash &&
      callback.pathname === "/auth/callback" && callback.origin === logout.origin);
  } catch { return false; }
}

function requireConfiguration(env: Env): { domain: URL; clientId: string; clientSecret: string; callback: string; audience: string; logoutReturn: string } {
  if (!authConfigured(env)) throw new AuthError(503, "auth_not_configured");
  return {
    domain: normalizedDomain(env),
    clientId: env.AUTH0_CLIENT_ID!,
    clientSecret: env.AUTH0_CLIENT_SECRET!,
    callback: env.AUTH0_CALLBACK_URL!,
    audience: env.AUTH0_MCP_AUDIENCE!,
    logoutReturn: env.AUTH0_LOGOUT_RETURN_URL!,
  };
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function decodeBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function decodeJsonPart<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T;
}

function randomToken(bytes = 32): string {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return encodeBase64Url(value);
}

async function sha256(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

async function hashHex(value: string): Promise<string> {
  return [...await sha256(value)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function ownerKeyForPrincipal(issuer: string, subject: string): Promise<string> {
  if (!issuer.startsWith("https://") || !subject || subject.length > 255) throw new TypeError("Invalid principal");
  return `oidc:${await hashHex(`${issuer}\n${subject}`)}`;
}

function parseCookies(request: Request): Map<string, string> {
  const values = new Map<string, string>();
  for (const part of (request.headers.get("Cookie") ?? "").split(";")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!values.has(name)) values.set(name, value);
  }
  return values;
}

function cookie(name: string, value: string, maxAge: number): string {
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Lax`;
}

function expiredCookie(name: string): string {
  return cookie(name, "", 0);
}

export async function logoutCsrfToken(request: Request): Promise<string | null> {
  const token = parseCookies(request).get(SESSION_COOKIE);
  if (!token || !/^[A-Za-z0-9_-]{32,64}$/.test(token)) return null;
  return hashHex(`logout:${token}`);
}

function sameOrigin(request: Request, env: Env): boolean {
  try {
    const expected = new URL(env.AUTH0_CALLBACK_URL ?? "").origin;
    if (new URL(request.url).origin !== expected) return false;
    // Trust the browser-generated Fetch Metadata signal when available. A
    // same-origin form may carry a proxy-rewritten Origin value.
    if (request.headers.get("Sec-Fetch-Site") === "same-origin") return true;
    return request.headers.get("Origin") === expected;
  } catch { return false; }
}

async function discovery(env: Env): Promise<Discovery> {
  const config = requireConfiguration(env);
  let response: Response;
  try { response = await fetch(new URL(".well-known/openid-configuration", config.domain), { signal: AbortSignal.timeout(10_000), redirect: "manual" }); }
  catch { throw new AuthError(503, "identity_provider_unavailable"); }
  if (!response.ok) throw new AuthError(503, "identity_provider_unavailable");
  const document = await response.json() as Discovery;
  const expectedIssuer = `${config.domain.origin}/`;
  if (document.issuer !== expectedIssuer || !providerEndpoint(document.authorization_endpoint, config.domain.origin) ||
      !providerEndpoint(document.token_endpoint, config.domain.origin) || !providerEndpoint(document.jwks_uri, config.domain.origin)) {
    throw new AuthError(503, "identity_provider_metadata_invalid");
  }
  return document;
}

function safeHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try { const parsed = new URL(value); return parsed.protocol === "https:" && !parsed.username && !parsed.password; }
  catch { return false; }
}

function providerEndpoint(value: unknown, origin: string): value is string {
  if (!safeHttpsUrl(value)) return false;
  return new URL(value).origin === origin;
}

async function readVerifiedJwt(env: Env, token: string): Promise<{ claims: JwtClaims; discovery: Discovery }> {
  const config = requireConfiguration(env);
  const parts = token.split(".");
  if (parts.length !== 3 || token.length > 16_384) throw new AuthError(401, "invalid_token");
  const [headerPart, claimsPart, signaturePart] = parts as [string, string, string];
  let header: { alg?: unknown; kid?: unknown; typ?: unknown; crit?: unknown };
  let claims: JwtClaims;
  try { header = decodeJsonPart(headerPart); claims = decodeJsonPart(claimsPart); }
  catch { throw new AuthError(401, "invalid_token"); }
  if (header.alg !== "RS256" || typeof header.kid !== "string" || !header.kid || header.crit !== undefined ||
      (header.typ !== undefined && header.typ !== "JWT")) throw new AuthError(401, "invalid_token");

  const metadata = await discovery(env);
  let jwksResponse: Response;
  try { jwksResponse = await fetch(metadata.jwks_uri, { signal: AbortSignal.timeout(10_000), redirect: "manual" }); }
  catch { throw new AuthError(503, "identity_provider_unavailable"); }
  if (!jwksResponse.ok) throw new AuthError(503, "identity_provider_unavailable");
  const jwks = await jwksResponse.json() as { keys?: JsonWebKey[] };
  const jwk = jwks.keys?.find((key) => (key as JsonWebKey & { kid?: string; alg?: string; use?: string }).kid === header.kid &&
    key.kty === "RSA" && (!((key as JsonWebKey & { alg?: string }).alg) || (key as JsonWebKey & { alg?: string }).alg === "RS256") &&
    (!((key as JsonWebKey & { use?: string }).use) || (key as JsonWebKey & { use?: string }).use === "sig"));
  if (!jwk) throw new AuthError(401, "invalid_token");
  let signatureValid = false;
  try {
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const signature = decodeBase64Url(signaturePart).buffer as ArrayBuffer;
    const signedData = new TextEncoder().encode(`${headerPart}.${claimsPart}`).buffer as ArrayBuffer;
    signatureValid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, signedData);
  } catch { throw new AuthError(401, "invalid_token"); }
  const now = Math.floor(Date.now() / 1000);
  if (!signatureValid || claims.iss !== metadata.issuer || typeof claims.sub !== "string" || !claims.sub || claims.sub.length > 255 ||
      typeof claims.exp !== "number" || claims.exp <= now || (claims.nbf !== undefined && (typeof claims.nbf !== "number" || claims.nbf > now + 60)) ||
      (claims.iat !== undefined && (typeof claims.iat !== "number" || claims.iat > now + 60))) throw new AuthError(401, "invalid_token");
  return { claims, discovery: metadata };
}

function audienceIncludes(claim: unknown, expected: string): boolean {
  return claim === expected || (Array.isArray(claim) && claim.includes(expected));
}

export async function verifyMcpBearer(env: Env, request: Request): Promise<Principal> {
  const authorization = request.headers.get("Authorization") ?? "";
  const match = /^Bearer ([A-Za-z0-9._~-]+)$/i.exec(authorization);
  if (!match) throw new AuthError(401, "missing_bearer_token");
  const { claims } = await readVerifiedJwt(env, match[1]!);
  const config = requireConfiguration(env);
  const authorizedParty = claims.azp;
  if (!audienceIncludes(claims.aud, config.audience) ||
      (Array.isArray(claims.aud) && claims.aud.length > 1 && authorizedParty !== config.clientId)) {
    throw new AuthError(401, "invalid_token");
  }
  const scopes = typeof claims.scope === "string" ? claims.scope.split(/\s+/) : Array.isArray(claims.scp) ? claims.scp : [];
  if (!scopes.includes(REQUIRED_MCP_SCOPE)) throw new AuthError(401, "insufficient_scope");
  return { issuer: claims.iss as string, subject: claims.sub as string, ownerKey: await ownerKeyForPrincipal(claims.iss as string, claims.sub as string) };
}

export async function sessionPrincipal(env: Env, request: Request): Promise<Principal | null> {
  if (!authConfigured(env)) return null;
  const token = parseCookies(request).get(SESSION_COOKIE);
  if (!token || !/^[A-Za-z0-9_-]{32,64}$/.test(token)) return null;
  const session = await env.DB.prepare(
    "SELECT issuer, subject, expires_at FROM web_sessions WHERE session_hash = ?",
  ).bind(await hashHex(token)).first<{ issuer: string; subject: string; expires_at: number }>();
  const now = Math.floor(Date.now() / 1000);
  if (!session || session.expires_at <= now || session.issuer !== `${normalizedDomain(env).origin}/`) {
    if (session) await env.DB.prepare("DELETE FROM web_sessions WHERE session_hash = ?").bind(await hashHex(token)).run();
    return null;
  }
  return { issuer: session.issuer, subject: session.subject, ownerKey: await ownerKeyForPrincipal(session.issuer, session.subject) };
}

export function mcpUnauthorized(env: Env, request: Request, code = "missing_bearer_token"): Response {
  const metadata = `${new URL(request.url).origin}/.well-known/oauth-protected-resource/mcp`;
  const challengeError = code === "missing_bearer_token" ? "" : `, error="${code === "insufficient_scope" ? "insufficient_scope" : "invalid_token"}"`;
  return Response.json({ error: code }, {
    status: code === "insufficient_scope" ? 403 : 401,
    headers: {
      ...securityHeaders,
      "WWW-Authenticate": `Bearer resource_metadata="${metadata}", scope="${REQUIRED_MCP_SCOPE}"${challengeError}`,
    },
  });
}

export function protectedResourceMetadata(env: Env, request: Request): Response {
  if (!authConfigured(env)) return Response.json({ error: "auth_not_configured" }, { status: 503, headers: securityHeaders });
  const config = requireConfiguration(env);
  return Response.json({
    resource: config.audience,
    authorization_servers: [`${config.domain.origin}/`],
    scopes_supported: [REQUIRED_MCP_SCOPE],
    bearer_methods_supported: ["header"],
  }, { headers: { ...securityHeaders, "Content-Type": "application/json; charset=utf-8" } });
}

export async function startLogin(env: Env, request: Request): Promise<Response> {
  const config = requireConfiguration(env);
  if (request.method !== "GET") return Response.json({ error: "method_not_allowed" }, { status: 405, headers: securityHeaders });
  const metadata = await discovery(env);
  const state = randomToken();
  const nonce = randomToken();
  const verifier = randomToken(48);
  const challenge = encodeBase64Url(await sha256(verifier));
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare("DELETE FROM auth_transactions WHERE expires_at <= ?").bind(now).run();
  await env.DB.prepare("DELETE FROM web_sessions WHERE expires_at <= ?").bind(now).run();
  await env.DB.prepare("INSERT INTO auth_transactions (state_hash, nonce, verifier, expires_at) VALUES (?, ?, ?, ?)")
    .bind(await hashHex(state), nonce, verifier, now + LOGIN_TTL_SECONDS).run();
  const authorize = new URL(metadata.authorization_endpoint);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", config.clientId);
  authorize.searchParams.set("redirect_uri", config.callback);
  authorize.searchParams.set("scope", "openid");
  // This browser flow establishes a web session from the ID token only. The MCP
  // resource audience belongs on MCP access-token requests, not this OIDC flow;
  // requesting it here unnecessarily requires an API grant.
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("nonce", nonce);
  authorize.searchParams.set("code_challenge", challenge);
  authorize.searchParams.set("code_challenge_method", "S256");
  return new Response(null, { status: 302, headers: { ...securityHeaders, Location: authorize.toString(), "Set-Cookie": cookie(LOGIN_COOKIE, state, LOGIN_TTL_SECONDS) } });
}

export async function finishLogin(env: Env, request: Request): Promise<Response> {
  const config = requireConfiguration(env);
  if (request.method !== "GET") return Response.json({ error: "method_not_allowed" }, { status: 405, headers: securityHeaders });
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const providerError = url.searchParams.get("error");
  const loginCookie = parseCookies(request).get(LOGIN_COOKIE);
  if (providerError) {
    if (!state || !loginCookie || state !== loginCookie) throw new AuthError(401, "invalid_login_transaction");
    const transaction = await env.DB.prepare(
      "DELETE FROM auth_transactions WHERE state_hash = ? AND expires_at > ? RETURNING state_hash",
    ).bind(await hashHex(state), Math.floor(Date.now() / 1000)).first<{ state_hash: string }>();
    if (!transaction) throw new AuthError(401, "invalid_login_transaction");
    throw new AuthError(401, providerError === "access_denied" ? "login_denied" : "identity_provider_error");
  }
  if (!state || !code || code.length > 4096 || !loginCookie || state !== loginCookie) throw new AuthError(401, "invalid_login_transaction");
  const transaction = await env.DB.prepare(
    "DELETE FROM auth_transactions WHERE state_hash = ? AND expires_at > ? RETURNING nonce, verifier",
  ).bind(await hashHex(state), Math.floor(Date.now() / 1000)).first<{ nonce: string; verifier: string }>();
  if (!transaction) throw new AuthError(401, "invalid_login_transaction");

  const metadata = await discovery(env);
  let tokenResponse: Response;
  try {
    tokenResponse = await fetch(metadata.token_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
      redirect: "manual",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.callback,
        code_verifier: transaction.verifier,
      }),
    });
  } catch { throw new AuthError(503, "identity_provider_unavailable"); }
  if (!tokenResponse.ok) throw new AuthError(401, "login_exchange_failed");
  const tokens = await tokenResponse.json() as { id_token?: unknown };
  if (typeof tokens.id_token !== "string") throw new AuthError(401, "login_exchange_failed");
  const { claims } = await readVerifiedJwt(env, tokens.id_token);
  if (claims.iss !== metadata.issuer || !audienceIncludes(claims.aud, config.clientId) || claims.nonce !== transaction.nonce ||
      (Array.isArray(claims.aud) && claims.aud.length > 1 && claims.azp !== config.clientId)) {
    throw new AuthError(401, "invalid_id_token");
  }

  const oldToken = parseCookies(request).get(SESSION_COOKIE);
  if (oldToken) await env.DB.prepare("DELETE FROM web_sessions WHERE session_hash = ?").bind(await hashHex(oldToken)).run();
  const sessionToken = randomToken();
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  await env.DB.prepare("INSERT INTO web_sessions (session_hash, issuer, subject, expires_at) VALUES (?, ?, ?, ?)")
    .bind(await hashHex(sessionToken), claims.iss, claims.sub, expires).run();
  const headers = new Headers(securityHeaders);
  headers.append("Set-Cookie", cookie(SESSION_COOKIE, sessionToken, SESSION_TTL_SECONDS));
  headers.append("Set-Cookie", expiredCookie(LOGIN_COOKIE));
  headers.set("Location", "/account");
  return new Response(null, { status: 303, headers });
}

export async function endSession(env: Env, request: Request): Promise<Response> {
  const config = requireConfiguration(env);
  if (request.method !== "POST") return Response.json({ error: "method_not_allowed" }, { status: 405, headers: securityHeaders });
  const token = parseCookies(request).get(SESSION_COOKIE);
  if (!token || !/^[A-Za-z0-9_-]{32,64}$/.test(token)) {
    return Response.json({ error: "unauthenticated" }, { status: 401, headers: securityHeaders });
  }
  let submittedCsrf: FormDataEntryValue | null = null;
  try { submittedCsrf = (await request.formData()).get("csrf_token"); } catch { /* reject malformed form data below */ }
  const expectedCsrf = await hashHex(`logout:${token}`);
  const csrfValid = typeof submittedCsrf === "string" && submittedCsrf === expectedCsrf;
  if (!sameOrigin(request, env) && !csrfValid) {
    return Response.json({ error: "origin_denied" }, { status: 403, headers: securityHeaders });
  }
  if (!csrfValid) return Response.json({ error: "csrf_denied" }, { status: 403, headers: securityHeaders });
  await env.DB.prepare("DELETE FROM web_sessions WHERE session_hash = ?").bind(await hashHex(token)).run();
  const logout = new URL("/v2/logout", config.domain);
  logout.searchParams.set("client_id", config.clientId);
  logout.searchParams.set("returnTo", config.logoutReturn);
  const headers = new Headers(securityHeaders);
  headers.append("Set-Cookie", expiredCookie(SESSION_COOKIE));
  headers.set("Location", logout.toString());
  return new Response(null, { status: 303, headers });
}

export async function logoutLocally(env: Env, request: Request): Promise<Response> {
  if (request.method !== "POST") return Response.json({ error: "method_not_allowed" }, { status: 405, headers: securityHeaders });
  if (!sameOrigin(request, env)) return Response.json({ error: "origin_denied" }, { status: 403, headers: securityHeaders });
  const token = parseCookies(request).get(SESSION_COOKIE);
  if (token && /^[A-Za-z0-9_-]{32,64}$/.test(token)) {
    await env.DB.prepare("DELETE FROM web_sessions WHERE session_hash = ?").bind(await hashHex(token)).run();
  }
  return new Response(null, { status: 303, headers: { ...securityHeaders, Location: "/account", "Set-Cookie": expiredCookie(SESSION_COOKIE) } });
}

export async function sessionResponse(env: Env, request: Request): Promise<Response> {
  if (request.method !== "GET") return Response.json({ error: "method_not_allowed" }, { status: 405, headers: securityHeaders });
  const principal = await sessionPrincipal(env, request);
  if (!principal) return Response.json({ authenticated: false }, { headers: securityHeaders });
  return Response.json({ authenticated: true }, { headers: securityHeaders });
}

export const securityHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

