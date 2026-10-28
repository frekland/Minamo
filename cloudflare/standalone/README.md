# Minamo Cloudflare staging

Independent **synthetic-only** Cloudflare Worker and remote MCP staging application for Minamo. This is a separate runtime, not a deployment of the existing ChatGPT Site. It uses its own D1 database and contains no personal learning records, tokens, or account identities.

## What works

- Authenticated `/mcp` Streamable HTTP endpoint built with the supported MCP SDK v2 and Cloudflare Agents handler. Anonymous fictional examples remain available at `/mcp/demo`.
- Auth0 authorization-code login with PKCE, nonce and state validation, hashed server-side D1 sessions, secure cookies, same-origin logout and issuer/audience/scope/JWKS validation for MCP bearer tokens.
- A public read-only preview at `/`, JSON at `/api/samples`, and database health at `/health`.
- Two sample Notes persist in a dedicated D1 database. All queries are owner-scoped by a **server-owned constant**, never a request header or user-supplied owner key.
- The store also implements isolated create/update/CAS primitives for synthetic automated tests. **There is no anonymous or general-purpose write endpoint or mutating MCP tool.** A staging-only, authenticated and CSRF-protected `/__acceptance` page can create or delete exactly one synthetic fixture note belonging to the signed-in account.

This is an independent synthetic-only authentication milestone. It is not connected to the private Sites application and does not authorize a real learner account, data migration, production release, or public OpenAI plugin submission. Auth0 login is enabled only on the configured synthetic staging Worker; no production identity integration is enabled. Do not put real Minamo content into this database.

## Auth0 configuration and local setup

A dedicated Auth0 **Regular Web Application** and custom API are configured for staging. The API audience is `https://minamo-v2-staging.jlscott-uk.workers.dev/mcp`, with RS256 signing and the `notes:read` scope. The staging domain and public client ID are in `auth.env.example`. The callback and logout URLs in that file must also be listed in the Auth0 application's Allowed Callback URLs and Allowed Logout URLs. The configured Auth0 domain must be the tenant's HTTPS issuer host, without a scheme or path.

Copy `cloudflare/standalone/auth.env.example` to the ignored `cloudflare/standalone/.dev.vars` for local development. Use an HTTPS local callback if exercising the provider flow locally; plain localhost will fail closed. Keep the client secret out of the example file and Git. For a hosted staging test, configure `AUTH0_CLIENT_SECRET` through Cloudflare secret management. The Worker returns `auth_not_configured` until all required values are valid. Never use learner or production identities in this staging environment.

For synthetic local identities, create two disposable users in the test tenant. Add only synthetic records under their server-derived issuer-plus-subject owner keys; never accept owner keys from a browser or MCP tool. The code hashes `(issuer, sub)` before using it as the D1 owner key, so the web session and MCP access token for one identity resolve to the same tenant without using email.

The implementation does not deploy itself or set any Cloudflare secret. Web sessions expire after eight hours and local logout deletes the D1 session; MCP access tokens are not stored by Minamo and remain valid until their issuer expires them. Keep the API token lifetime short and grant only `notes:read`. Before a hosted test, configure the secret in Cloudflare, apply the new staging migration, then review and explicitly approve the staging deployment.

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

1. Configure `AUTH0_CLIENT_SECRET` in Cloudflare secret management; do not add it to Git or send it in chat.
2. Test web login/logout and authenticated MCP with two genuinely independent test identities. Verify cross-principal list/read denial and session expiry/revocation.
3. Reconcile the full Minamo V2 data/domain contract and export/recovery strategy. Do not copy live records or change the Sites audience until rehearsed and approved.
4. Add R2 only after file/attachment operations are ready and an independent bucket is provisioned.

This implementation belongs in the public `frekland/Minamo` source repository under `cloudflare/standalone/`. It does not connect to, modify or publish the separately hosted private application.


## Hosted two-account fixture checks

1. In isolated browser profiles, sign in as disposable account A and B at `/account`.
2. For each account, follow **Synthetic test fixture** to `/__acceptance` and choose **Create my fixture**. The route accepts no owner or note IDs, enforces the existing verified session and CSRF token, and writes only to `MINAMO_RUNTIME_MODE=synthetic-only` D1.
3. Copy the two displayed fixture IDs into a private test checklist. Confirm each account sees only its own note at `/account` and `/api/my-notes` and cannot obtain the other account's note through the protected MCP `read_my_note` tool once genuine tokens are available.
4. Visit `/__acceptance` as each identity and choose **Delete my fixture**. No real learner records are involved.

This fixture control verifies browser owner scoping; it does **not** itself mint or expose an MCP OAuth access token, prove a genuine MCP client connection, or replace the pending token tests. Keep the draft acceptance gates open until those are exercised.

## Genuine hosted MCP token probe

After creating A and B fixtures, visit `/auth/acceptance/mcp` once as each disposable identity. This uses the existing confidential Auth0 staging client and a distinct PKCE state to request `openid notes:read` with the exact staging `/mcp` audience. The callback validates the ID token and genuine API access token, then makes live MCP initialize/tool/read calls. It displays a bounded JSON pass/fail/not-tested receipt without storing or returning any bearer token. Normal `/auth/login` continues to request `openid` only.

If Auth0 denies the API audience or scope, check whether the staging client is authorised for `notes:read`. Do not weaken the Worker validator or assume a successful browser-only login establishes MCP OAuth. A hosted internal probe is useful evidence but does **not** replace a separate compatible external MCP client connection before final publication acceptance.

## Hosted acceptance evidence — 28 October 2026

The independent staging Worker is deployed at `https://minamo-v2-staging.jlscott-uk.workers.dev` using version `ab294111-b578-4b62-84f1-b95fede2e9a8` at 100% staging traffic. The prior version `89fcf44e-4654-4641-acb3-bb0e4696485b` remains available for rollback. The Auth0 client secret and D1 bindings were inherited unchanged.

The `global_fetch_strictly_public` compatibility flag is set **only for staging**. It routes the Worker acceptance callback's fetch to the public `/mcp` endpoint through Cloudflare's normal front door, avoiding same-zone Worker fetch restrictions. The harness does not emit or persist the OAuth bearer token.

| Test | Hosted result |
| --- | --- |
| Disposable account A and B sign-in | Pass (secure browser login) |
| Independently owned A/B synthetic fixtures | Pass (different deterministic owner-key IDs) |
| Web account list and `/api/my-notes` isolation | Pass (each account shows only its own fixture) |
| Genuine Auth0 MCP access token validation, account A and B | Pass (scoped JWT verified with tenant keys) |
| Public `/mcp` JSON-RPC initialize and tools/list, A and B | Pass |
| Read own fixture through authenticated MCP, A and B | Pass |
| Read other fixture by exact ID through MCP, A → B and B → A | Pass (both respond `record_unavailable`) |
| Local/provider logout and session-protected API after logout | Pass (signed-out state, anonymous API returns 401) |
| Account A's note persists after B switch and back | Pass |
| Missing, malformed, wrong-scheme MCP authorization | Pass (live HTTP 401) |
| Anonymous fixture creation and account reads | Pass (live HTTP 401) |
| Issuer, audience, expiry, signature and missing scope rejection | Passed synthetic signed-JWT unit tests; not separately exercised with rejected genuine hosted JWTs |
| Separate third-party MCP client OAuth discovery/connection | **Pending**; callback is a server-side MCP client probe, not a third-party consumer |
| Refresh token rotation/long-running session expiration | **Pending**; logout and expired local session checks passed, but token expiry was not awaited in the hosted browser |

After bilateral verification, both disposable fixture notes were removed by exact ID from the dedicated staging D1; a read-back confirmed zero remaining acceptance fixtures. They can be recreated through the authenticated page for later tests. No actual learning content, raw passwords, bearer tokens, or client secrets were recorded in repository artifacts. Keep staging acceptance and any public submission separate from a production migration or owner sign-off.

## Separate MCP client and refresh-token continuation — 28 October 2026

Two staging-only Workers are now involved:

- `minamo-v2-staging` serves Auth0 callbacks and the protected `/mcp` resource; it has a service binding `MCP_ACCEPTANCE_CLIENT`.
- `minamo-mcp-acceptance-client` is a **different Worker**, configured in `wrangler.acceptance-client.jsonc`. Its public workers.dev route and preview URLs are **disabled** (verified with the Cloudflare API). Only the parent Worker calls its internal `/run` handler via the service binding.

The separate client receives a validated, real Auth0 API bearer transiently via the private binding and independently calls the **public** `/mcp` HTTP route. In the hosted browser acceptance callback, all six independent client checks passed: MCP initialize, tools/list, owner-scoped note listing, synthetic sample-note read, missing-bearer rejection and tampered-signature rejection. The code fixes the MCP target URL and accepts no caller-supplied tenant identifier. Neither Worker displays or persists the bearer; no tokens or secrets were committed. This is a genuine separate runtime process and remote MCP transport check, but **the existing confidential staging app still performs the OAuth code exchange**. It is not equivalent to independently registering and authorising a third-party OAuth app.

For reproduction, deploy the client first with `npx wrangler deploy --config wrangler.acceptance-client.jsonc`, confirm `workers_dev=false`/disabled preview routes, and deploy the primary Worker with its `MCP_ACCEPTANCE_CLIENT` service binding. On a disposable signed-in staging identity, visit `/auth/acceptance/mcp` for the external-client receipt, or `/auth/acceptance/refresh` for the optional refresh receipt. The latter sends `offline_access` along with `openid notes:read`. It exchanges any returned refresh token **once, entirely in memory**, validates the renewed access token, and reruns the independent MCP client probe. There is no refresh-token persistence and no deliberate reuse/replay of a rotating token.

**Observed refresh outcome:** Auth0 issued a valid scoped access token, but **did not issue a refresh token**. Receipt: `refresh_token_issued=not_issued`; refresh exchange, renewed-token verification and renewed independent-client connection were `not_tested`. An Auth0 Dashboard check could not proceed because the cloud browser was held at the site's security-verification screen. A staging tenant administrator must check both the custom MCP API's **Allow Offline Access** setting and the Regular Web Application's **Refresh Token** grant, then deliberately decide whether to enable long-lived access. Do not change either setting on a production API. After an authorised staging-only change, rerun the one-shot acceptance route with a disposable account. The live natural expiration of an actual Auth0 token remains unobserved; unit tests cover expiry rejection, not wall-clock expiration.
