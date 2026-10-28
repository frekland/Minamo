# Minamo Cloudflare staging

Independent **synthetic-only** Cloudflare Worker and remote MCP staging application for Minamo. This is a separate runtime, not a deployment of the existing ChatGPT Site. It uses its own D1 database and contains no personal learning records, tokens, or account identities.

## What works

- Read-only `/mcp` Streamable HTTP endpoint built with the supported MCP SDK v2 and Cloudflare Agents handler.
- A public read-only preview at `/`, JSON at `/api/samples`, and database health at `/health`.
- Two sample Notes persist in a dedicated D1 database. All queries are owner-scoped by a **server-owned constant**, never a request header or user-supplied owner key.
- The store also implements isolated create/update/CAS primitives for synthetic automated tests. **There is no public write endpoint or mutating MCP tool.**

This is an infrastructure milestone only. There is no production learner authentication, migration, or public OpenAI plugin acceptance yet. Do not put real Minamo content into this database until an identity/security review and migration rehearsal pass.

## Local checks

```sh
npm ci
npm run types
npm run typecheck
npm test
npm run build
```

Run `npm run smoke:live` for a bounded end-to-end check of the *deployed staging URL*. It checks HTTP, D1 sample reads, MCP negotiation/list/call and explicit write/foreign-record denial without modifying data. Override `MINAMO_STAGING_URL` to test another deliberately synthetic deployment.

For a disposable local D1 and Worker, run `npm run dev`. To apply the schema to the dedicated staging database, use `npx wrangler d1 migrations apply minamo-v2-cf-staging --remote`, then deploy with `npm run deploy`. The config deliberately has no GitHub auto-deploy or production bindings.

## Next security gates

1. Implement a standards-compatible OAuth authorization server and verify signed, audience-bound identity at the Worker boundary. Never trust `X-User-Id` or a caller-provided owner identifier.
2. Test cross-principal list/read/write/update, cursors, media, recovery and revocation using two genuinely independent sessions.
3. Reconcile the full Minamo V2 data/domain contract and export/recovery strategy. Do not copy live records or change the Sites audience until rehearsed and approved.
4. Add R2 only after file/attachment operations are ready and an independent bucket is provisioned.

This implementation belongs in the public `frekland/Minamo` source repository under `cloudflare/standalone/`. It does not connect to, modify or publish the separately hosted private application.
