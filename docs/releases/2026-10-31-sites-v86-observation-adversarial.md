# Sites V86 — adversarial observed-MCP acceptance hardening

**Released 31 October 2026** to the existing [Minamo Site](https://minamo.jscymru.chatgpt.site). This is an application-source release and an automated local acceptance expansion, not a new hosted Flag activation or a complete host transcript.

## Provenance and published scope

| Boundary | Verified evidence |
| --- | --- |
| Public implementation | [PR #47](https://github.com/frekland/Minamo/pull/47), squash merge `d4b9268b8e4680e121e8fd32c53779b725973bde` |
| Previous native source | V85 `ec9a02fff7d6f766b08e74280622e419d6b17507` |
| Deployed native source | V86 `f5c604062f7a6829f3121424d6223a8424615523`, fast-forward on the existing Sites Git branch |
| Saved/published version | V86, deployment succeeded, MCP enabled, runtime environment revision 9 |
| Local compressed archive | SHA-256 `725ae8a5d49d22ca193345e79e4599a2c6337927304112e50393f0b91aa8780c` |
| Sites stored archive | Provider-reported `sha256:be630708a6c102db9ae1a46dcf0528e4c58011c7bcf45634e082069cd1cc22a2`, 506 files, 27,873,280 bytes |
| Rollback | Previously saved V85 and its native SHA above remain available |

The local compressed-file digest and the provider's stored-archive digest are **different**. They identify different reported representations, not a verified byte-for-byte equality; neither proves all currently executing Worker bytes. Deployment provenance is Git SHA → bounded native source → local build/archive → provider saved version → successful publication receipt.

## Bounded port manifest

These five files match the reviewed public PR's blobs exactly. SHA-256 values identify the transferred native source bytes; no other native files were changed.

| File | SHA-256 |
| --- | --- |
| `lib/test-observation.ts` | `4233a9cd8c4843ae6a05d773f5cecee965b9158f9c788627d4943a4a010cae43` |
| `scripts/ci-focused-tests.mjs` | `92f91939d7f60f588bd7d320f80fce72bf961d251ca249de74ecf6fd28648af9` |
| `tests/ci-focused-tests.test.mjs` | `dd3d6d8cb8301d94c4aa7ce6df9520f59cee9f504ae570c23b7ceda062e78739` |
| `tests/test-observation-adversarial.test.mjs` | `63670b48f3c3e174f404cce5c1311d07f637905e0f762f45240c3ed2a46f7ce5` |
| `docs/acceptance/2026-10-31-observation-adversarial-matrix.md` | `249d1b1b4836534f83e76ddde31bc3c07b393d4b91987cf4bf552c24e7b0507f` |

Native-only hosting/identity configuration, D1/R2/MCP bindings, branding and unrelated application changes were preserved. No migration, fixture advance/reset, authored-record mutation or access-policy edit was made. The Site still reports custom access policy revision 1 and two existing allowed entries.

## Tests and actual deployment readback

- Public exact candidate: `pnpm run typecheck` and `pnpm run build` passed; full suite **1,481 passed, 4 skipped, 0 failed**. After the final source-order optimization, focused selector/CI tests passed **8/8**.
- Native exact release tree: typecheck and build passed; focused basic/adversarial observation tests passed **7/7**; full suite **1,480 passed, 4 skipped, 0 failed**. Public/native total differs due to retained Site-specific test differences, not failed tests.
- Isolated actual Miniflare D1/R2 cases tested current-epoch eligibility, exclusion of ordinary targets and spoofed synthetic operation IDs, opaque synthetic Flag readback, successful/failed operation receipt observation, injected trace INSERT failure, quota at 600 under concurrent calls, bounded paging, concurrent observer revision CAS, retry replay and payload mismatch, and a storage-content canary. Details: [acceptance matrix](../acceptance/2026-10-31-observation-adversarial-matrix.md).
- Site saved V86 from exact pushed native SHA and returned a successful production deployment at the existing URL with MCP enabled and environment revision 9.
- Connected owner-only `manage_minamo_test_observation` read-only `list` returned the retained epoch-3 run with **status paused, revision 1, generation `legacy@0`, fixture `mood-to-music/3`**, the new private-owner-key retention wording, and `coverage.hostComplete:false`, `coverage.bestEffort:true`. No observer was armed or sealed.
- Connected canonical readback after deployment returned the prior synthetic Article at revision 1 and its test Flag target at revision 2, **inactive**. The deactivation tombstone/history remains retained; no new test Flag was created.
- Signed-in cloud browser reloaded the V86 synthetic Project Step 4 and displayed the guide, linked Question, stage navigation and recent work after loading. This proves rendering/navigation only, not learner improvement.

## Evidence layers and remaining limits

1. The historical GPT-submitted transcript is **model-reported**, not a host audit.
2. The bounded observation list is **server-received** MCP metadata for qualifying synthetic-scoped calls, with tool name, timestamp, outcome/error and elapsed server milliseconds. It is best effort and does not include missed host-side requests.
3. Before/after state diffs are **canonical D1 revision/identity metadata** and do not establish causal authorship by revision alone.

Read-only live D1 inspection sampled all 10 stored observed-call rows and the one observation-run row from the preceding V85 acceptance; no prompt/body/credential-shaped columns or values appeared in those sampled event rows. The six large state JSON cells were **truncated by the viewer**, so independent full physical-byte privacy verification is not claimed. Private D1 rows retain owner-scoping keys for isolation; the returned observation events exclude them. No ordinary Notes or actual learner content was published.

Still unverified: complete ChatGPT host-level interception, real production D1 failure injection and loss accounting, independent full physical-byte and all-path privacy audit, real learner outcome comparison, and cryptographic attestation of the precise executing runtime bytes. Host completeness requires a separately consented host/API trace provider; learner improvement requires task-based human evaluation; neither can be inferred from event counts.

**Recommended next gate:** establish a consented, separate host-side runner whose submitted-call ledger can be reconciled against server-received IDs and canonical diffs, with declared missing-call reasons, while preserving TEST-ONLY data boundaries. Then independently audit D1 bytes and provider runtime attestation, and run a learner-facing comparison study. Related [Issue #17](https://github.com/frekland/Minamo/issues/17).
