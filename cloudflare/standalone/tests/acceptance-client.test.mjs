import assert from "node:assert/strict";
import { test } from "node:test";
import client from "../src/acceptance-client.mjs";

function sse(value) {
  return new Response("event: message\ndata: " + JSON.stringify(value) + "\n\n", {
    status: 200, headers: { "Content-Type": "text/event-stream" },
  });
}

test("separate MCP client uses genuine bearer only on fixed staging endpoint, and reports status without leaking it", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const bearer = "Bearer synthetic.header.signature";
  const calls = [];
  globalThis.fetch = async (input, options) => {
    assert.equal(String(input), "https://minamo-v2-staging.jlscott-uk.workers.dev/mcp");
    const sent = new Headers(options.headers).get("Authorization");
    calls.push(sent);
    if (sent !== bearer) return Response.json({ error: sent ? "invalid_token" : "missing_bearer_token" }, { status: 401 });
    const payload = JSON.parse(options.body);
    switch (payload.method) {
      case "initialize":
        return sse({ jsonrpc: "2.0", id: 1, result: { serverInfo: { name: "Minamo Cloudflare Staging" } } });
      case "tools/list":
        return sse({ jsonrpc: "2.0", id: 1, result: { tools: [
          { name: "list_my_notes" }, { name: "get_lab_status" }, { name: "read_sample_note" },
        ] } });
      case "tools/call":
        return sse({ jsonrpc: "2.0", id: 1, result: { content: [{
          type: "text", text: payload.params.name === "read_sample_note" ?
            JSON.stringify({ id: "sample-note-001" }) : "[]",
        }] } });
      default: throw new Error("Unexpected method: " + payload.method);
    }
  };
  const response = await client.fetch(new Request("https://acceptance-client.internal/run", {
    method: "POST", headers: { Authorization: bearer },
  }));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.separate_worker_client, true);
  for (const field of [
    "external_http_mcp_initialize", "external_http_tool_discovery", "external_http_scoped_list",
    "external_http_sample_read", "external_http_missing_token_denial", "external_http_modified_signature_denial",
  ]) assert.equal(data[field], "pass", field);
  assert.ok(calls.some(value => value === null));
  assert.ok(calls.some(value => value !== bearer && value !== null));
  assert.doesNotMatch(JSON.stringify(data), /synthetic\.header\.signature/);
});

test("acceptance client refuses uncredentialed caller and non-run paths", async () => {
  const unauth = await client.fetch(new Request("https://acceptance-client.internal/run", { method: "POST" }));
  assert.equal(unauth.status, 401);
  const notFound = await client.fetch(new Request("https://acceptance-client.internal/other", { method: "POST" }));
  assert.equal(notFound.status, 404);
});
