import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";
import { listNotes, readNote, PUBLIC_DEMO_OWNER, type Note } from "./store";
import {
  AuthError, authConfigured, endSession, finishLogin, logoutLocally, mcpUnauthorized,
  protectedResourceMetadata, securityHeaders, sessionPrincipal, sessionResponse, logoutCsrfToken,
  startLogin, verifyMcpBearer,
} from "./auth";

const PUBLIC_SAMPLE_IDS = ["sample-note-001", "sample-note-002"] as const;

function publicNote(note: Note) {
  return { id: note.id, title: note.title, body: note.body, revision: note.revision };
}

function toolResult(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value) }] };
}

function createServer(env: Env, ownerKey?: string) {
  const server = new McpServer({ name: "Minamo Cloudflare Staging", version: "0.1.0" });
  const readOnly = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  };

  server.registerTool(
    "get_lab_status",
    {
      description: "Check the independently hosted Minamo staging server and D1 database. This laboratory contains only synthetic data.",
      inputSchema: {},
      annotations: readOnly,
    },
    async () => {
      await env.DB.prepare("SELECT 1 AS ready").first();
      return toolResult({ service: "minamo-v2-staging", status: "ok", data: "synthetic-only", storage: "d1" });
    },
  );

  if (ownerKey) {
    server.registerTool(
      "list_my_notes",
      {
        description: "List notes belonging to the authenticated account. Identity is verified by the Minamo server; owner identifiers are never accepted from tool input.",
        inputSchema: {},
        annotations: readOnly,
      },
      async () => toolResult((await listNotes(env.DB, ownerKey, 50)).map(publicNote)),
    );
    server.registerTool(
      "read_my_note",
      {
        description: "Read one note belonging to the authenticated account. The server derives ownership from the verified token, not from tool input.",
        inputSchema: { id: z.string().min(1).max(128).regex(/^[a-zA-Z0-9:_-]+$/) },
        annotations: readOnly,
      },
      async ({ id }) => {
        const note = await readNote(env.DB, ownerKey, id);
        return note ? toolResult(publicNote(note)) : { isError: true, ...toolResult({ error: "record_unavailable" }) };
      },
    );
  }

  server.registerTool(
    "list_sample_notes",
    {
      description: "List the two public synthetic Minamo sample notes stored in independent Cloudflare D1. Never accesses learner workspaces.",
      inputSchema: {},
      annotations: readOnly,
    },
    async () => {
      const notes = await listNotes(env.DB, PUBLIC_DEMO_OWNER, 10);
      return toolResult(notes.filter((n) => PUBLIC_SAMPLE_IDS.includes(n.id as typeof PUBLIC_SAMPLE_IDS[number]))
        .map((n) => ({ id: n.id, title: n.title, revision: n.revision })));
    },
  );

  server.registerTool(
    "read_sample_note",
    {
      description: "Read one fixed synthetic example note by ID from Cloudflare D1. No personal learner data or arbitrary owner IDs.",
      inputSchema: { id: z.enum(PUBLIC_SAMPLE_IDS) },
      annotations: readOnly,
    },
    async ({ id }) => {
      const note = await readNote(env.DB, PUBLIC_DEMO_OWNER, id);
      return note ? toolResult(publicNote(note)) : { isError: true, ...toolResult({ error: "record_unavailable" }) };
    },
  );

  return server;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
}

function page(notes: Note[], selected?: Note): string {
  const items = notes.filter((n) => PUBLIC_SAMPLE_IDS.includes(n.id as typeof PUBLIC_SAMPLE_IDS[number]));
  const cards = items.map((n) => `<a class="note" href="/samples/${encodeURIComponent(n.id)}"><span class="note-title">${escapeHtml(n.title)}</span><span class="note-detail">Sample note · revision ${n.revision}</span></a>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Minamo · Cloudflare staging</title><style>
    :root{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#15314b;background:#f3f7fb}
    *{box-sizing:border-box}body{margin:0;min-height:100vh}.shell{max-width:860px;margin:0 auto;padding:clamp(24px,7vw,76px) 20px}
    .mark{font-size:15px;letter-spacing:.04em;font-weight:750;color:#2267aa}.eyebrow{font-size:12px;font-weight:750;letter-spacing:.12em;text-transform:uppercase;color:#53728b;margin-top:45px}
    h1{font-size:clamp(32px,6vw,55px);letter-spacing:-.045em;line-height:1.08;margin:12px 0 18px;font-weight:760;max-width:750px}
    .intro{color:#49637a;font-size:17px;line-height:1.65;max-width:670px}.status{display:inline-flex;gap:8px;align-items:center;background:#e0f4e9;color:#176a43;border:1px solid #b6e4c8;border-radius:100px;padding:8px 12px;font-size:13px;font-weight:700}
    .dot{width:8px;height:8px;background:#27a36b;border-radius:50%}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-top:28px}
    .note{display:block;background:white;border:1px solid #d6e2ed;border-radius:16px;padding:22px;text-decoration:none;color:inherit;transition:border-color .15s,transform .15s;min-height:122px}
    .note:hover,.note:focus-visible{border-color:#2e7ac0;transform:translateY(-2px)}.note-title{display:block;font-weight:730;font-size:17px;line-height:1.35}.note-detail{display:block;color:#688096;font-size:13px;margin-top:13px}
    .detail{background:white;border:1px solid #d6e2ed;border-radius:16px;padding:25px;margin-top:20px;white-space:pre-wrap;line-height:1.7}
    .detail h2{font-size:22px;margin:0 0 14px;white-space:normal}.actions{display:flex;gap:14px;margin-top:28px;flex-wrap:wrap}
    .actions a{font-weight:650;color:#1764a8;text-underline-offset:3px}.foot{margin-top:58px;color:#657f95;font-size:13px;line-height:1.6;border-top:1px solid #d8e4ef;padding-top:18px}
    @media(prefers-reduced-motion:reduce){.note{transition:none}.note:hover{transform:none}}
  </style></head><body><main class="shell"><div class="mark">水面 &nbsp; MINAMO</div><p class="eyebrow">Independent Cloudflare deployment</p><div class="status"><span class="dot"></span> Staging live · synthetic data only</div><h1>Learning, with a clearer surface.</h1><p class="intro">This is Minamo's new Cloudflare laboratory. Its own Worker, remote MCP server and D1 database are running independently of the existing private ChatGPT Site. For now, everything below is a fictional example.</p>
    <p class="eyebrow">D1-backed sample notes</p>${selected ? `<section class="detail"><h2>${escapeHtml(selected.title)}</h2>${escapeHtml(selected.body)}</section>` : ""}<div class="grid">${cards}</div>
    <nav class="actions" aria-label="Demo links"><a href="/">Overview</a><a href="/api/samples">JSON examples</a><a href="/health">Health check</a><a href="/account">Test account</a></nav>
    <p class="foot">The authenticated remote MCP endpoint is <code>/mcp</code>; fictional sample tools remain available at <code>/mcp/demo</code>. Login is enabled only after the dedicated Auth0 staging placeholders are configured. The existing private Minamo remains untouched.</p></main></body></html>`;
}

function accountPage(notes: Note[], authenticated: boolean, csrfToken?: string): string {
  const cards = notes.map((note) => `<li><strong>${escapeHtml(note.title)}</strong><p>${escapeHtml(note.body)}</p></li>`).join("");
  const content = authenticated
    ? `<p class="status">Signed in · synthetic staging identity</p><ul>${cards || "<li>No notes in this test account yet.</li>"}</ul><p><a href="/__acceptance">Synthetic test fixture</a></p><form method="post" action="/auth/logout/provider"><input type="hidden" name="csrf_token" value="${escapeHtml(csrfToken ?? "")}"><button type="submit">Sign out</button></form>`
    : `<p>This protected area is for synthetic staging identities. Sign in with the configured Auth0 test application to view notes owned by that account.</p><a class="button" href="/auth/login">Sign in</a>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Minamo · Test account</title><style>
    :root{font-family:ui-sans-serif,system-ui,sans-serif;color:#15314b;background:#f3f7fb}*{box-sizing:border-box}body{margin:0}.shell{max-width:760px;margin:0 auto;padding:clamp(24px,7vw,70px) 20px}a{color:#1764a8}h1{font-size:clamp(30px,5vw,44px);letter-spacing:-.04em}.status{display:inline-block;color:#176a43;background:#e0f4e9;border:1px solid #b6e4c8;border-radius:20px;padding:8px 12px}li{list-style:none;background:#fff;border:1px solid #d6e2ed;border-radius:14px;padding:18px;margin:12px 0}li p{white-space:pre-wrap;line-height:1.6}.button,button{display:inline-block;border:0;border-radius:8px;background:#1764a8;color:#fff;padding:11px 16px;font:inherit;text-decoration:none;cursor:pointer}.foot{margin-top:40px;color:#657f95;font-size:13px}
    </style></head><body><main class="shell"><p><a href="/">水面 · MINAMO</a></p><h1>Test account</h1>${content}<p class="foot">Synthetic-only Cloudflare staging. This account is separate from the private Minamo Site.</p></main></body></html>`;
}

const baseHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: baseHeaders });
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const path = new URL(request.url).pathname;
    const authEnv = env as Env;
    try {
      if (path === "/.well-known/oauth-protected-resource/mcp") {
        return protectedResourceMetadata(authEnv, request);
      }
      if (path === "/auth/login") return await startLogin(authEnv, request);
      if (path === "/auth/acceptance/mcp") return await startLogin(authEnv, request);
      if (path === "/auth/callback") return await finishLogin(authEnv, request);
      if (path === "/auth/logout") return await logoutLocally(authEnv, request);
      if (path === "/auth/logout/provider") return await endSession(authEnv, request);
      if (path === "/auth/session") return await sessionResponse(authEnv, request);
      if (path === "/mcp") {
        if (!authConfigured(authEnv)) return Response.json({ error: "auth_not_configured" }, { status: 503, headers: securityHeaders });
        let principal;
        try { principal = await verifyMcpBearer(authEnv, request); }
        catch (error) {
          if (error instanceof AuthError && error.status === 401) return mcpUnauthorized(authEnv, request, error.code);
          throw error;
        }
        return await createMcpHandler(() => createServer(env, principal.ownerKey))(request, env, ctx);
      }
      if (path === "/mcp/demo") {
        return await createMcpHandler(() => createServer(env), { route: "/mcp/demo" })(request, env, ctx);
      }

      if (path === "/__acceptance") {
        // Synthetic-only fixture controls. No caller-supplied owner or note ID.
        if (env.MINAMO_RUNTIME_MODE !== "synthetic-only") return json({ error: "not_found" }, 404);
        const principal = await sessionPrincipal(authEnv, request);
        if (!principal) return json({ error: "unauthenticated" }, 401);
        const fixtureId = "acceptance-" + principal.ownerKey.slice(5, 21);
        const csrf = await logoutCsrfToken(authEnv, request);
        if (!csrf) return json({ error: "unauthenticated" }, 401);
        if (request.method === "POST") {
          const origin = request.headers.get("Origin");
          if (origin && origin !== new URL(request.url).origin) {
            return json({ error: "origin_denied" }, 403);
          }
          let form: FormData;
          try { form = await request.formData(); }
          catch { return json({ error: "invalid_form" }, 400); }
          if (form.get("csrf_token") !== csrf) return json({ error: "csrf_denied" }, 403);
          const action = form.get("action");
          if (action === "create") {
            await env.DB.prepare(
              "INSERT OR IGNORE INTO notes (owner_key, id, title, body) VALUES (?, ?, ?, ?)",
            ).bind(principal.ownerKey, fixtureId, "Synthetic account fixture " + fixtureId.slice(-8),
              "Disposable staging-only note for account isolation checks. No learner content.").run();
          } else if (action === "delete") {
            await env.DB.prepare("DELETE FROM notes WHERE owner_key = ? AND id = ?")
              .bind(principal.ownerKey, fixtureId).run();
          } else {
            return json({ error: "invalid_action" }, 400);
          }
          return new Response(null, { status: 303, headers: { ...securityHeaders, Location: "/__acceptance" } });
        }
        if (request.method !== "GET" && request.method !== "HEAD") return json({ error: "method_not_allowed" }, 405);
        const fixture = await readNote(env.DB, principal.ownerKey, fixtureId);
        const html = "<!doctype html><html lang=\"en\"><meta charset=\"utf-8\"><title>Staging fixture controls</title>" +
          "<main><h1>Synthetic account fixture</h1><p>Staging only. One owner-scoped test note per signed-in identity.</p>" +
          "<p>Fixture ID: <code>" + escapeHtml(fixtureId) + "</code></p>" +
          "<p>Status: " + (fixture ? "created" : "not created") + "</p>" +
          "<form method=\"post\" action=\"/__acceptance\"><input type=\"hidden\" name=\"csrf_token\" value=\"" + escapeHtml(csrf) + "\">" +
          "<button name=\"action\" value=\"create\">Create my fixture</button> " +
          "<button name=\"action\" value=\"delete\">Delete my fixture</button></form>" +
          "<p><a href=\"/auth/acceptance/mcp\">Check genuine MCP token and owner scope</a></p>" +
          "<p><a href=\"/account\">Back to account</a></p></main></html>";
        return new Response(request.method === "HEAD" ? null : html, {
          headers: { ...securityHeaders, "Content-Type": "text/html; charset=utf-8",
            "Content-Security-Policy": "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'" },
        });
      }
      if (request.method !== "GET" && request.method !== "HEAD") {
        return json({ error: "method_not_allowed" }, 405);
      }
      if (path === "/health") {
        const ready = await env.DB.prepare("SELECT 1 AS ready").first<{ ready: number }>();
        return json({ service: "minamo-v2-staging", status: ready?.ready === 1 ? "ok" : "not_ready", data: "synthetic-only", mcp: "/mcp", storage: "d1" }, ready?.ready === 1 ? 200 : 503);
      }
      if (path === "/api/samples") {
        const notes = await listNotes(env.DB, PUBLIC_DEMO_OWNER, 10);
        return json(notes.filter((n) => PUBLIC_SAMPLE_IDS.includes(n.id as typeof PUBLIC_SAMPLE_IDS[number])).map(publicNote));
      }
      if (path === "/api/my-notes") {
        const principal = await sessionPrincipal(authEnv, request);
        if (!principal) return Response.json({ error: "unauthenticated" }, { status: 401, headers: securityHeaders });
        const notes = await listNotes(env.DB, principal.ownerKey, 50);
        return Response.json(notes.map(publicNote), { headers: securityHeaders });
      }
      if (path === "/account") {
        const principal = await sessionPrincipal(authEnv, request);
        if (!principal && !authConfigured(authEnv)) {
          return new Response("<!doctype html><title>Authentication setup required</title><p>Auth0 staging placeholders are not configured yet. See cloudflare/standalone/README.md.</p>", {
            status: 503, headers: { ...securityHeaders, "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": "default-src 'none'; base-uri 'none'; frame-ancestors 'none'" },
          });
        }
        const notes = principal ? await listNotes(env.DB, principal.ownerKey, 50) : [];
        const csrfToken = principal ? await logoutCsrfToken(authEnv, request) : null;
        return new Response(request.method === "HEAD" ? null : accountPage(notes, Boolean(principal), csrfToken ?? undefined), {
          headers: { ...securityHeaders, "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": `default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'self' ${new URL("https://" + authEnv.AUTH0_DOMAIN!).origin}` },
        });
      }
      if (path === "/" || path.startsWith("/samples/")) {
        let selected: Note | undefined;
        if (path.startsWith("/samples/")) {
          const id = path.slice("/samples/".length);
          if (!PUBLIC_SAMPLE_IDS.includes(id as typeof PUBLIC_SAMPLE_IDS[number])) return json({ error: "not_found" }, 404);
          selected = await readNote(env.DB, PUBLIC_DEMO_OWNER, id) ?? undefined;
          if (!selected) return json({ error: "not_found" }, 404);
        }
        const notes = await listNotes(env.DB, PUBLIC_DEMO_OWNER, 10);
        return new Response(request.method === "HEAD" ? null : page(notes, selected), {
          status: 200,
          headers: {
            ...baseHeaders,
            "Content-Type": "text/html; charset=utf-8",
            "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
          },
        });
      }
      return json({ error: "not_found" }, 404);
    } catch (error) {
      if (error instanceof AuthError) {
        return Response.json({ error: error.code }, { status: error.status, headers: securityHeaders });
      }
      // No raw request bodies, auth headers or learner content in log lines.
      console.error(JSON.stringify({ event: "staging_request_failure", path, detail: error instanceof Error ? error.name : "unknown" }));
      return json({ error: "staging_unavailable" }, 503);
    }
  },
} satisfies ExportedHandler<Env>;

