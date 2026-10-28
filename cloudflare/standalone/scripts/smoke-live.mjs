import assert from "node:assert/strict";

const base = (process.env.MINAMO_STAGING_URL ?? "https://minamo-v2-staging.jlscott-uk.workers.dev").replace(/\/$/, "");
const timeoutMs = 20000;

async function get(path) {
  return fetch(`${base}${path}`, { signal: AbortSignal.timeout(timeoutMs), redirect: "error" });
}

async function mcp(method, params = {}) {
  const response = await fetch(`${base}/mcp`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "error",
  });
  assert.equal(response.status, 200, `${method} HTTP status`);
  const raw = await response.text();
  const contentType = response.headers.get("content-type") ?? "";
  const json = contentType.includes("text/event-stream")
    ? raw.split(/\r?\n/).find((line) => line.startsWith("data: "))?.slice(6)
    : raw;
  assert.ok(json, `${method} JSON-RPC response body`);
  const payload = JSON.parse(json);
  assert.equal(payload.jsonrpc, "2.0");
  return payload;
}

async function main() {
  const home = await get("/");
  assert.equal(home.status, 200);
  assert.match(await home.text(), /Staging live/);

  const health = await get("/health");
  assert.equal(health.status, 200);
  const state = await health.json();
  assert.equal(state.status, "ok");
  assert.equal(state.data, "synthetic-only");
  assert.equal(state.storage, "d1");

  const samples = await (await get("/api/samples?owner_key=fixture-a")).json();
  assert.equal(samples.length, 2);
  assert.equal(samples.every((note) => note.id.startsWith("sample-note-")), true);
  assert.equal(await get("/samples/fixture-note-001").then((r) => r.status), 404);
  const write = await fetch(`${base}/api/samples`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ owner_key: "fixture-a", title: "Unallowed" }),
    signal: AbortSignal.timeout(timeoutMs), redirect: "error",
  });
  assert.equal(write.status, 405);

  const initialized = await mcp("initialize", {
    protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "minamo-smoke", version: "0.1.0" },
  });
  assert.equal(initialized.result.serverInfo.name, "Minamo Cloudflare Staging");

  const listed = await mcp("tools/list");
  const names = listed.result.tools.map((tool) => tool.name).sort();
  assert.deepEqual(names, ["get_lab_status", "list_sample_notes", "read_sample_note"]);
  assert.equal(listed.result.tools.every((tool) => tool.annotations?.readOnlyHint === true), true);

  const read = await mcp("tools/call", { name: "read_sample_note", arguments: { id: "sample-note-001" } });
  const note = JSON.parse(read.result.content[0].text);
  assert.equal(note.id, "sample-note-001");

  const denied = await mcp("tools/call", { name: "read_sample_note", arguments: { id: "fixture-note-001" } });
  assert.equal(denied.result.isError, true);

  console.log(JSON.stringify({ endpoint: base, result: "pass", tests: ["homepage", "health", "D1 samples", "owner-query denial", "public-write denial", "MCP initialize", "MCP tools", "MCP read", "invalid-id denial"] }, null, 2));
}

main().catch((error) => {
  console.error("Live staging smoke failed:", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
