# Minamo Sites V89 — source-first contextual learning release receipt

**1 November 2026. Production deployed. Integrated acceptance remains partial.**

## Production identity and rollback

- URL: <https://minamo.jscymru.chatgpt.site>
- Site: `appgprj_6ad8a4e85eb48191accd6e78976b47e3`
- Saved version: **V89**, `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_9a00865bf15481919b6e38edd6f8d3cc`
- Deployment: `appgdep_6ae78bcf6df88191ba65960897a23474`, **succeeded**, production URL confirmed by the Sites deployment status readback; MCP-ready (`has_mcp: true`), deployed environment revision 9.
- Native Sites `main` release commit: `d8cfcca8b1fbf0be646a69a1794dd6caeb649e25` (tree `c4f7c28cb2dbc6bd7d5010c8d683ef631c29135f`), fast-forward parent `ea255bce9a5d849e96c46383188af2a1cb21fd1c`.
- Previous known-good release, available for an explicitly authorised rollback: **V88**, saved version `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_29bbe4649b308191aa639764423b02b9`; deployment `appgdep_6ae673b53df48191b6e1a2131269392a`, native commit `ea255bce9a5d849e96c46383188af2a1cb21fd1c`. No rollback performed.
- Audience: existing **custom** policy revision **1** preserved; one external visitor invitation retained. No public/private-policy switch, invitation or environment variable edits. Native `.openai/hosting.json` retained D1 `DB`, R2 `BUCKET` and `mcp` capability.

## Candidate provenance and gates

- Draft GitHub PR **#78**, `docs/contextual-implementation-blueprint`, remains **draft and unmerged**. Public PR source head at reconciliation: `5e9199a5bb4b73dca5309c6d0c7ff42df8962e2d`, tree `29146f1cee4d820d0d1e7f1e45e2484cab91cc98` (local same-tree commit `45b2c56`).
- Public source candidate: `pnpm test` **1,556 total / 1,552 passed / 0 failed / 4 skipped**; typecheck, build and diff check passed.
- Native reconciliation against exact V88 parent: 42 code/test paths ported; 41 were byte-identical to the public candidate Git blobs, and `tests/gpt-context.test.mjs` had a narrow native-only fixture adaptation preserving its legacy-origin case. Public `AGENTS.md` and the public-only integrated implementation brief were not transplanted into the native Site. Native identity, recovery and hosting assets were preserved.
- Native release candidate: `pnpm install --frozen-lockfile --offline`, `pnpm run typecheck` and `pnpm run build` **passed**; `pnpm test` **1,555 total / 1,551 passed / 0 failed / 4 skipped** (553,016 ms). Existing vinext route-classification caveat and React test-renderer warnings remain; these passes alone do not certify real-browser journeys.
- Native build archive was constructed only from `.openai/hosting.json` and `dist`, including `dist/server/index.js` and `dist/client`. Local tar SHA-256: `72c8877bf5b4a83674900b021f219106e38318ecc1965a91541c17270a6f94a6` (28,057,600 bytes). Sites saved-version archive-storage descriptor: content hash `sha256:4a1a86a324eece5b7df2be62664c50e7e49a8f0ffadd5f7914fcb4a430bf4801` (28,037,120 bytes); record the distinct provider descriptor rather than claiming the two hashes are interchangeable.

## Cloud Browser read-only production observations

The live Site opened in the authenticated Cloud Browser and displayed Home, the source-first recorded-work list, and the pre-existing owner-only synthetic Mood-to-Music Project. No new synthetic records, Note edits, flags, saved Activities, fixture resets or other hosted learner-data mutations were performed.

- **E2 partial browser evidence:** In the synthetic Project, the first bounded read explicitly said no matching sources on that page and offered **Check more recorded sources**, with coverage marked partial. Following that read-only continuation revealed multiple separately dated newer Notes alongside the older saved Stage/Question checkpoint, including competing statements about v5, v6 and v7. The app did not report the historical checkpoint as present truth. The exact retained Note rendition `r-2584b431477f9fb74744fe14bc1426da612d4c1c4eb5a438a8b2bde0a16a8c62` opened with its linked Question, and **Back to Project** returned to the originating synthetic Project. This is a bounded smoke observation, **not a full E2 owner usefulness verdict**.
- **E4 partial browser evidence:** The Library search for `React` opened the synthetic `TEST ONLY · React labels: state, refresh and shared-device privacy` Article at retained rendition `r-97972601e2d497b264a0556307b08f41c37f1a19c3f7fcee7d285cf8afd9ec8f`, showing original-source/project return cues and Reader content; no linked Activity was observed for that particular Article. A separate existing Japanese N4 Article (`ms-a22a300dc10e78aeed9437f7eb3f5af439f1d786`, edition `r-b907a8994c7b1b050ab83a9cb912748bdb1a6167506124eaaa4024c3e255629c`) **did** surface a source-qualified `N4-16` Activity (`jlpt-jp-n4-16-reading-20261027`, edition `r-172873a8f035a25eaa890e3d78be329a32abc4089044e393e09fd7ecc3843753`). Browser navigation **Article → Activity → “Back to source edition” → exact Article** succeeded; the exact Article loaded again after browser reload, with retained rendition and origin encoded in the URL. Browser **Back** then reopened the Activity with the source-return control, and **Forward** navigated to the exact Article URL. This is **A → X → A only**, not a Note-save round-trip: **A → X → N → X → A, new-tab and dirty-editor persistence were not accepted**.
- **Still required:** E1 Note create/save/reopen without Project; E3 Cap/Plant return; E4 exact Article→Activity→Note→Article chain; E5 320/375px, keyboard/focus and independent assistive checks; E6 second principal, revocation and partial-cursor negatives; GPT selected-source conversational usefulness; production performance/latency and owner comparative task verdict. No hosted fixture modification or assumed learner consent is implied by deployment.

## Release boundary

The owner's later **“Changed my mind. Please deploy.”** superseded the earlier review-before-deploy hold; it did **not** supply a merge instruction, a comprehensive E1–E6 acceptance verdict or a hosted-data-mutation authorisation. Sol 6.1 High review can examine PR #78 against this precise native release. Keep the PR draft, preserve the production policy, and record new defects/acceptance outcomes separately before any further mutation.
