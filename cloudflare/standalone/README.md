# Minamo Cloudflare staging

Independent **synthetic-only** Cloudflare Worker and remote MCP staging application for Minamo. This is a separate runtime, not a deployment of the existing ChatGPT Site. It uses its own D1 database and contains no personal learning records, tokens, or account identities.

## What works

- Authenticated `/mcp` Streamable HTTP endpoint built with the supported MCP SDK v2 and Cloudflare Agents handler. Anonymous fictional examples remain available at `/mcp/demo`.
- Auth0 authorization-code login with PKCE, nonce and state validation, hashed server-side D1 sessions, secure cookies, same-origin logout and issuer/audience/scope/JWKS validation for MCP bearer tokens.
- A public read-only preview at `/`, JSON at `/api/samples`, and database health at `/health`.
- Two sample Notes persist in a dedicated D1 database. All queries are owner-scoped by a **server-owned constant**, never a request header or user-supplied owner key.
- The store also implements isolated create/update/CAS primitives for synthetic automated tests. **There is no public write endpoint or mutating MCP tool.**

This is an independent synthetic-only authentication milestone. It is not connected to the private Sites application and does not authorize a real learner account, data migration, production release, or public OpenAI plugin submission. Auth0 remains disabled until the placeholder configuration is replaced. Do not put real Minamo content into this database.

## Auth0 placeholders and local setup

Create an Auth0 **Regular Web Application** and a custom API for a dedicated test tenant. The OAuth API audience must equal `AUTH0_MCP_AUDIENCE`; enable RS256 signing and grant the `notes:read` scope. Use the callback and logout URLs shown in `auth.env.example`. The configured Auth0 domain must be the tenant's HTTPS issuer host, without a scheme or path.

Copy `cloudflare/standalone/auth.env.example` to the ignored `cloudflare/standalone/.dev.vars` for local development and replace the public values. Use an HTTPS local callback if exercising the provider flow locally; plain localhost will fail closed. Keep the client secret out of the example file and Git. For a later hosted staging test, configure `AUTH0_CLIENT_SECRET` through Cloudflare secret management. The Worker returns `auth_not_configured` until all required values are valid. Never use learner or production identities in this staging environment.

For synthetic local identities, create two disposable users in the test tenant. Add only synthetic records under their server-derived issuer-plus-subject owner keys; never accept owner keys from a browser or MCP tool. The code hashes `(issuer, sub)` before using it as the D1 owner key, so the web session and MCP access token for one identity resolve to the same tenant without using email.

The implementation does not deploy itself or set any Cloudflare secret. Web sessions expire after eight hours and local logout deletes the D1 session; MCP access tokens are not stored by Minamo and remain valid until their issuer expires them. Keep the API token lifetime short and grant only `notes:read`. Before a hosted test, configure the exact callback/logout URLs and secret in Cloudflare, apply the new staging migration, then review and explicitly approve the staging deployment.

## Local checks

```sh
npm ci
npm run types
npm run typecheck
npm test
npm run build
```

Run `npm test` for local store and JWT validation checks. Run `npm run smoke:live` for a bounded end-to-end check of the *deployed staging URL*. It checks HTTP, D1 sample reads, anonymous demo MCP negotiation/list/call and explicit write/foreign-record denial without modifying data. Override `MINAMO_STAGING_URL` to test another deliberately synthetic deployment.

For a disposable local D1 and Worker, run `npm run dev`. To apply the schema to the dedicated staging database, use `npx wrangler d1 migrations apply minamo-v2-cf-staging --remote`, then deploy with `npm run deploy`. The config deliberately has no GitHub auto-deploy or production bindings.

## Next security gates

1. Configure the placeholders using a dedicated Auth0 test tenant and verify the exact redirect/resource settings.
2. Test web login/logout and authenticated MCP with two genuinely independent test identities. Verify cross-principal list/read denial and session expiry/revocation.
3. Reconcile the full Minamo V2 data/domain contract and export/recovery strategy. Do not copy live records or change the Sites audience until rehearsed and approved.
4. Add R2 only after file/attachment operations are ready and an independent bucket is provisioned.

This implementation belongs in the public `frekland/Minamo` source repository under `cloudflare/standalone/`. It does not connect to, modify or publish the separately hosted private application.

