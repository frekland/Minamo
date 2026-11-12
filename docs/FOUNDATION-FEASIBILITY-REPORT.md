# Minamo V2 — Foundation feasibility report

21 October 2026. **CONDITIONAL GO for the tested local foundation; hosted product suitability remains unproven.**

## Identity, source and release

New project: `appgprj_6ad8a4e85eb48191accd6e78976b47e3`. Requested name **Minamo V2** overrides the attachment's name. Deployed URL: https://minamo-v2.jscymru.chatgpt.site (native deployment status succeeded). Native access readback: custom audience, sole owner, no viewers, groups, editors or external visitors. One private test deployment is authorised; no existing Minamo deployment is targeted. [The release receipt](DEPLOYMENT-RECEIPT.md) records successful private deployment, exact source SHA, saved version and deployment identity.

**GitHub linkage BLOCKED:** new Site registration returned provider `cloudflare_artifact`, not a GitHub repository. Exposed GitHub operations can read/write existing repositories but cannot create a repository; no GitHub CLI is available. No new GitHub URL is claimed. Source, lockfile, migrations, tests and CI workflow are retained in this independent Site's native Git repository. A newly connected private GitHub repository remains a required acceptance dependency. No existing Minamo/cyber-learning repository is modified.

## Actual runtime

Official Sites-maintained Vinext starter, retaining the Sites Vite build integration and Worker entrypoint: vinext **1.0.0-beta.5**, React/React DOM/React Server DOM **19.2.6**, TypeScript **5.9.3**, Vite **8.0.13**, Wrangler **4.92.0**. Next **16.3.4** provides compatibility APIs; the app is **not running the conventional Next.js runtime**. Exact resolved dependencies are locked in `pnpm-lock.yaml`. Versions come from the maintained installed starter; a separate live registry vulnerability audit is not claimed.

Official guidance consulted: `openai/sites` README blob `59bdbe793d0d7a7a42530630dfe4f6400fa5829c`, create-sites README blob `adbe54f1e976414731d2b76367e0acb28672d77a`; Sites skill storage, identity, MCP and managed preview references. The create-sites CLI supports D1/R2/auth add-ons and declares hosting-managed resources. This task used the supplied maintained starter through the Sites setup helper.

## Check matrix

PASS is specific to its environment. Local results are never counted as hosted acceptance.

| Capability | Local/source result and evidence | Hosted acceptance |
|---|---|---|
| React / TypeScript | PASS: typecheck, client reference build; initial desktop preview rendered | NOT TESTED: hosted hydration/event handling |
| Request-time SSR | PASS: exact built Worker emits D1-backed note in initial HTML and different request receipts | PASS: two hosted HTTP 200 responses with distinct server receipts, using native service access |
| RSC | PASS: exact compiled Worker returns Flight `text/x-component` for RSC request; async server component reads D1 | PASS: hosted HTTP 200 Flight response with expected Investigation content |
| Server Actions | PASS: actual compiled reference `module#saveNote`, framework POST and Flight acknowledgement update D1; anonymous call rejected | NOT TESTED |
| Ordinary API mutation | PASS: actual handlers and exact Worker initialise; handler tests update/read back | NOT TESTED |
| Direct routes | PASS: exact Worker `/reading` returns Unicode and inline code; home and RSC route respond | PASS: direct hosted reading route HTTP 200 with Unicode and inline code; NOT TESTED: browser refresh, Back/Forward |
| Browser navigation | BLOCKED after initial desktop Home inspection: cloud browser URL-policy gate rejected observation following link activation | BLOCKED in this session |
| Identity enforcement | PASS locally: anonymous API read/write and action rejected; principal B cannot access principal A records | PASS: native sole-owner policy; hosted API 401 with service access/no visitor identity and 403 anonymously. NOT TESTED: signed-in record lifecycle |
| D1 persistence | PASS: actual local D1 create/read/modify/readback, invalid write, stale revision and concurrent CAS | NOT TESTED: hosted persistence, reload or cross-version persistence |
| R2 persistence | PASS: actual local R2 object create/read/modify/readback | NOT TESTED: hosted persistence or cross-version persistence |
| MCP discovery / invocation | PASS: local JSON-RPC discovery/list and actual read-only same-record invocation; anonymous record invocation rejected | BLOCKED: hosted service-authenticated discover/list/call received non-JSON 401; no authenticated MCP connection available |
| ChatGPT plugin end to end | NOT TESTED: advertised schema or provisioning is not tool invocation | NOT TESTED |
| Mobile / keyboard / overflow | NOT TESTED: responsive CSS authored; narrow viewport and keyboard acceptance unavailable after browser policy block | NOT TESTED |
| Build / typecheck | PASS: all three dynamic routes; client, SSR and RSC build stages; `tsc --noEmit` | Deployment result recorded separately |
| Automated tests | PASS: 19 checks, 0 failures across real handler/local binding and exact compiled Worker suites | NOT TESTED against live bindings |
| Production isolation | PASS: fresh project manifest, no copied production identity/resources/secrets, no production data operations; reference repo read-only | Native sole-owner policy confirmed; no existing Site modified |

Evidence: `tests/integration.test.mjs` and `tests/built-worker.test.mjs`. First suite runs actual application handlers with Miniflare D1/R2, not storage mocks. Second loads all exact compiled Worker modules using Wrangler's configuration and tests the real framework, including action transport. Test identity headers are fixtures at the local dispatch boundary. They do not prove that hosted Sites injects identity correctly. Tests are local and create no hosted records.

Earlier harness failures were corrected: explicit module enumeration was needed for dynamic imports; framework actions require matching actual runtime origin and the full `module#export` reference, rather than a module hash alone. The application authentication/CSRF controls were not relaxed to make tests pass.

## Security and isolation

All lab records are uniquely scoped under synthetic experiment ID `synthetic-foundation-20261021-8a64` and server-provided Site-scoped identity. Reads use principal predicates, mutations use the same owner predicate and revision guard. API and action errors retain the browser draft. Only an explicit authenticated initialise command creates records; SSR, GET and the UI-only control do not write. D1 schema migrations are separate from seeds. R2 uses a private per-principal synthetic key and is read through an authenticated endpoint.

The new project's `DB`/`BUCKET` logical bindings cause Sites to provision independent resources. No old project manifest, DB ID, bucket credentials, genuine content or existing MCP credential was copied. Hosted resources must still be exercised before reporting operational persistence. Service access alone supplies no user identity and therefore cannot operate on user-owned lab records. MCP discovery describes public capability metadata behind the platform access boundary; record invocation requires authenticated identity. The tool is read-only and has no production authoring powers.

Private publication relies on verified native sole-owner policy plus tested application authentication/isolation controls. That is enough for this bounded synthetic private experiment; it is not a claim of complete hosted acceptance. No public sharing, extra services, production migration or second test publication is authorised by this work.

## Consequences

Retain the thin server-owned data layer, common API/MCP reads, explicit mutations, acknowledged saves and CAS. Vinext's real RSC/action support is demonstrated locally, making a client-only fallback unnecessary at this point. Its beta compatibility layer and hosted proxy/auth/action-origin behaviour require hosted acceptance before a full architecture commitment. The prototype does not implement production Minamo's operation recovery, source rights, revision history, editorial authority or rich passage model.

Read-only reference sources: existing `STATUS.md` (V58 cursor), `AGENTS.md`, `app/AGENTS.md`, owner issue #47, PR #48, engineering contract index and `docs/contracts/02-authority-discovery-commands.md`, selected `app/worker.mjs`. These support discoverable controls, persistent context, server authority, clear activity attribution and honest evidence classes. They are reference constraints, not copied implementation or data.

## Recommendation and next commission

**CONDITIONAL GO** for further foundation evaluation. Do not infer readiness for a rebuild from local successes. Remaining acceptance: connect new private GitHub source; exercise hosted signed-in create/edit/save/reload, Server Action separately from API, D1/R2 readback, hosted MCP discovery/invocation and genuine ChatGPT tool call; complete desktop/narrow viewport navigation, keyboard and console checks. No second deployment is needed merely to claim cross-version storage; that test remains NOT TESTED under the one-deployment limit.

After those checks, separately commission experience architecture and application contracts for a React-based Minamo redesign. Reconcile universal capture and direct-link context with source rights, revision/recovery guarantees and a shared web/MCP permission model before implementation. This task stops at the foundation; it does not start that redesign.
