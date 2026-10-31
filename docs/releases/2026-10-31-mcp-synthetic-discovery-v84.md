# Sites V84 — ordinary MCP discovery excludes TEST ONLY records

Date: 2026-10-31 UTC  
Site: <https://minamo.jscymru.chatgpt.site/>  
Status: **deployed**; native Sites status `succeeded`, MCP enabled.

## Release identity

- Public source base: `frekland/Minamo` `7eb312a56dd79f15be73bf0e6ddcb8986174d384`.
- Separate native Sites source: `1e9f5c615eba4df9b9dad3a382c5a11f4d455f8a` → `638e5e733990e9dbb9f3c29f04e9db99288ec1cd`.
- Native source transfer: precisely `lib/catalogue.ts`, `lib/domain-handler.ts`, `lib/domain.ts`, and `lib/learning-work.ts`. The native `.openai/hosting.json`, access settings, storage bindings, branding, other files and all user data were preserved.
- Each transferred file was verified byte-identical between the reviewed public candidate and the final native Sites source:

  | Path | Git blob SHA |
  | --- | --- |
  | `lib/catalogue.ts` | `a6ab809246513a2a51f9244d745f970867d475e9` |
  | `lib/domain-handler.ts` | `e49f7f2ef3cf6c72c55c9220229bd5a6cbf75fa5` |
  | `lib/domain.ts` | `bbe304f735826c8220e18fb99a8559478dffb286` |
  | `lib/learning-work.ts` | `20152e29def80064b873c3c61232b8ce2c4e3c60` |
- Saved Sites version: **84**; deployment `appgdep_6ae5bcf05ad08191b2e298d506199423`.
- Matching packaged archive: `sha256:48d42cc4fa6b4952abe9e9eb275350c678563496e9e44834b41653af0651ff81` (27,791,360 bytes, 504 files).
- Production status: `succeeded` at `2026-10-31T10:03:40.058223Z`, with `has_mcp: true`.
- Audience remains the existing restricted `custom` audience, not a newly public Site.

## Behavior

- Ordinary MCP `get_minamo_workspace`, `query_minamo_records`, `query_minamo_library`, `get_minamo_relationship_candidates`, natural `get_minamo_learning_context(scope:"resume")`, and Home Favourites exclude synthetic records by default.
- Explicit owner-requested TEST ONLY acceptance can set `includeSynthetic:true` on those discovery tools (on learning context, with `scope:"resume"`). This includes natural-title discovery without supplying internal IDs.
- The SQL eligibility fence runs **before** page selection; a cursor cannot switch between ordinary and TEST ONLY scopes.
- Exact-record MCP reads, browser-selected synthetic handoffs, and the browser's ordinary owner-visible TEST ONLY Project, Library and Notes remain accessible. No synthetic content was deleted or reclassified.
- The tool schemas change, so the ChatGPT Minamo MCP plugin should be reinstalled/updated **after** V84 deployment. V84 is now live.

## Verification

- Public and native source: `pnpm run typecheck` passed.
- Native production build: `pnpm run build` passed.
- Complete built public regression suite: `node --test --test-concurrency=2 --test-reporter=dot tests/*.test.mjs` passed (exit code 0) after updating synthetic acceptance fixtures to use the explicit opt-in.
- New real D1/MCP regression test verifies default exclusion, explicit inclusion, pre-pagination filtering, cursor scope, exact synthetic handoffs, browser HTTP compatibility and Home Favourites.
- Focused existing MCP integration tests covering Projects, Library, Notes, Flags, synthetic manuscript, search evidence and language-scope continuation passed with explicit TEST ONLY opt-in.
- Cloud browser navigation to production after V84 showed the owner-only TEST ONLY Project banner and normal Home navigation intact. The deployment API confirmed the production version and MCP availability.
- After the owner reinstalled the Minamo plugin in ChatGPT, **live production MCP** read-only acceptance confirmed: ordinary workspace page 20/20 non-synthetic, ordinary activity 12/12 non-synthetic, explicit `includeSynthetic:true` workspace page 20/20 synthetic, ordinary `scope:"resume"` query `Mood-to-Music` returned `not-found`, and the exact same natural query with `includeSynthetic:true` resolved a single synthetic Journey/Project with a continuation. No records were changed by these checks.

## Manual ChatGPT acceptance

After reinstalling the Minamo MCP plugin, an intentionally explicit prompt can be:

> Use my Minamo MCP for a **TEST ONLY** synthetic acceptance check. Set `includeSynthetic:true` for the `scope:"resume"` discovery search and continue the Mood-to-Music Project. Do not treat the fixture as ordinary learning or claim that I completed its Steps.

For ordinary learning, omit `includeSynthetic`; do not turn this into a persistent plugin-wide setting. The existing browser “Continue with GPT” action can still hand over an exact synthetic record.
