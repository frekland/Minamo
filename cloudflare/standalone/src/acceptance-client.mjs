// Staging-only, non-public MCP client invoked through a Cloudflare Service Binding.
// This worker never stores, logs or returns Auth0 credentials or tokens.
const MCP_URL = "https://minamo-v2-staging.jlscott-uk.workers.dev/mcp";
const HEADERS = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
const INIT = { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "minamo-independent-acceptance-client", version: "1.0.0" } };

async function requestMcp(method, params, bearer, sessionId) {
  const headers = new Headers({ "Content-Type": "application/json", Accept: "application/json, text/event-stream" });
  if (bearer) headers.set("Authorization", bearer);
  if (sessionId) headers.set("Mcp-Session-Id", sessionId);
  try {
    const response = await fetch(MCP_URL, {
      method: "POST", headers, redirect: "manual", signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    const body = (await response.text()).slice(0, 60_000);
    const data = body.split(/\r?\n/).find(line => line.startsWith("data: "))?.slice(6) ??
      (body.trimStart().startsWith("{") ? body : null);
    let json = null;
    try { if (data) json = JSON.parse(data); } catch { /* fail closed */ }
    return { status: response.status, json, session: response.headers.get("Mcp-Session-Id") };
  } catch {
    return { status: 0, json: null, session: null };
  }
}

function toolText(response) {
  const content = response.json?.result?.content;
  return Array.isArray(content) && typeof content[0]?.text === "string" ? content[0].text : "";
}

export default {
  async fetch(request) {
    if (request.method !== "POST" || new URL(request.url).pathname !== "/run") {
      return Response.json({ error: "not_found" }, { status: 404, headers: HEADERS });
    }
    const bearer = request.headers.get("Authorization");
    if (!bearer || !/^Bearer [A-Za-z0-9._~-]+$/.test(bearer)) {
      return Response.json({ error: "missing_token" }, { status: 401, headers: HEADERS });
    }
    // No incoming URL, subject, owner, note identifier, or tool name is trusted.
    const init = await requestMcp("initialize", INIT, bearer);
    const initialized = init.status === 200 && init.json?.result?.serverInfo?.name === "Minamo Cloudflare Staging";
    const tools = initialized ? await requestMcp("tools/list", {}, bearer, init.session) : null;
    const toolNames = tools?.json?.result?.tools?.map(tool => tool.name) ?? [];
    const discovered = tools?.status === 200 && toolNames.includes("list_my_notes") &&
      toolNames.includes("get_lab_status") && toolNames.includes("read_sample_note");
    const own = discovered ? await requestMcp("tools/call", {
      name: "list_my_notes", arguments: {},
    }, bearer, init.session) : null;
    const sample = discovered ? await requestMcp("tools/call", {
      name: "read_sample_note", arguments: { id: "sample-note-001" },
    }, bearer, init.session) : null;
    const missing = await requestMcp("initialize", INIT, undefined);
    const parts = bearer.slice(7).split(".");
    if (parts.length === 3 && parts[2].length > 2) {
      parts[2] = (parts[2][0] === "A" ? "B" : "A") + parts[2].slice(1);
    }
    const forged = parts.length === 3 ? "Bearer " + parts.join(".") : "Bearer invalid-token";
    const invalid = await requestMcp("initialize", INIT, forged);
    return Response.json({
      separate_worker_client: true,
      external_http_mcp_initialize: initialized ? "pass" : "failed",
      external_http_tool_discovery: discovered ? "pass" : "failed",
      external_http_scoped_list: own?.status === 200 &&
        typeof toolText(own) === "string" && own.json?.result?.isError !== true ? "pass" : "failed",
      external_http_sample_read: sample?.status === 200 &&
        toolText(sample).includes("sample-note-001") && sample.json?.result?.isError !== true ? "pass" : "failed",
      external_http_missing_token_denial: missing.status === 401 ? "pass" : "failed",
      external_http_modified_signature_denial: invalid.status === 401 ? "pass" : "failed",
    }, { headers: HEADERS });
  },
};
