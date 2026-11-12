# V70 A–D engineering evidence

Implementation: [PR #101](https://github.com/frekland/minamo-v2/pull/101). All 60 dispositions: [RESOLUTION-REPORT.md](RESOLUTION-REPORT.md). The owner assigned independent final whole-site UX acceptance and critique to Terra [PR #100](https://github.com/frekland/minamo-v2/pull/100); this is engineering qualification and targeted active browser smoke.

## Direct qualification

Node v24.22.1; pnpm 11.25.0. Dependencies installed from the supported cache (843 packages; zero downloads). No package, lockfile, workflow, database schema or production data changes. No GitHub Actions called, edited, waited on or rerun.

- `pnpm run typecheck`: exit 0 (`tsc --noEmit`).
- `pnpm run build`: exit 0; production Worker/assets emitted; `scienceIncluded:false`.
- Complete direct suite uses the package test command with explicit TAP: `node --test --test-reporter=tap --test-concurrency=2 tests/*.test.mjs`. Final run: **1,445 tests; 1,441 passed; 0 failed; 0 cancelled; 4 skipped; 0 todo**, exit 0, 348,527.81852ms (348.53 seconds), 1,023 top-level tests including nested cases. Log SHA-256: `e5df791e7f496b6543c2beb382e7be4049c27ab8d199670b55122d73858db77e`.
- Focused latest regression pass: 24/24, including native Reader scope, header selection, map defaults and Library presentation. Mounted client coverage: 2/2; durable recovery coverage: 2/2. These are subsets, not added to full-run totals.
- Exploratory pre-build run: 1,424 tests, 1,405 passed, 15 failed, 4 skipped. Failures included missing production build output, old presentation assertions and a concurrent bundling failure. A later complete run: 1,445 tests, 1,440 passed, 1 failed, 4 skipped. That run exposed a genuine Reader native-link scope regression; corrected and focused checks passed. Neither run is presented as release qualification. A subsequent full run was interrupted by the active-session restart before completion; no pass is claimed for that partial log.

Four expected optional-runtime skips: three banked scientific Python execution tests because the production scientific runtime is deliberately unstaged, and one native Rust starter compilation because Rust/Cargo is unavailable. No substitute language is counted as Rust evidence.

Security and regression coverage includes actual isolated D1/R2, owner/tenant and generation fences, source rights, exact editions/ranges, CAS, stale writes, pagination, command receipts, recovery, media and compiled production Worker boundaries. New lost-ack test commits activation, drops its response, reloads bounded operation metadata, reads the original receipt and verifies exactly one activation; displaced work remains in its pre-activation backup. New mounted React tests retain admitted Activity hints and Practice rows on 503, coalesce focus/visibility events, redact on authoritative 403, and keep proposal and Markdown retention independent.

## Targeted Work Cloud Browser

Actual Chrome Cloud Browser, authenticated owner session for genuine read-only baseline and deployed smoke. Local mutation work uses explicitly synthetic fixtures only. No physical handset, independent beta account or screen reader acceptance is claimed.

| Case | Active interaction / result before publication |
| --- | --- |
| S01 | Narrow Subject title/native href and Preview open/Close return tested. Local Project checkpoint proxy returns Unsupported isolated laboratory target; actual hosted Project/Step check is required after publication. |
| S02 | Synthetic Practice list → Activity, Task/Hints → reveal first hint, Chrome Ctrl+Tab away and Ctrl+Shift+Tab back: task and revealed hint retained. Practice remains selected, exact reading href retains bounded list context. No saved attempt or learner achievement. |
| S03 | Open Notes, explicit discard of untouched synthetic blank, hide/reopen existing synthetic Note, recent selection and inline title. No genuine writing changed. |
| S04 | Japanese selection, Computing and back retains Japanese; unified selector explicitly selects All learning and scoped navigation updates. |
| S05 | Genuine V70 Settings + Ctrl+K stacking reproduced. Candidate Settings + Ctrl+K leaves Settings as sole dialog; Escape closes with focus returned to Settings. |
| S06 | Settings Workspace → Data and recovery opens with Back up, Restore, Recover drafts and distinct backup terminology. No activation. Local proxy cannot list backups; real hosted list check required after publication. |
| S07 | Bounded Project return/native link code is regression-covered. Synthetic Project index/detail opened; its checkpoint proxy limitation is explicitly not counted as hosted acceptance. |
| S08 | 768px tablet, 390px mobile and 320px narrow-mobile CSS iframe layouts visually inspected. Header clipping corrected and retested: 320 iframe body width/scrollWidth both 305px (scrollbar excluded). Narrow Subject compact heading/description; Preview opens, close returns to Subject. This is CSS viewport evidence, not a physical mobile. |

Cloud Browser caught two introduced defects: reader native links losing a supplied scope without the workspace context, and narrow header clipping from a higher-specificity icon rule. Both underlying causes were corrected and regression-tested before qualification.

## Performance and integrity limits

Shared foreground subscription and same-target in-flight coalescing avoid duplicate effective reads for focus/visibility bursts; admitted UI remains visible during transient refresh. Request-count assertions and actual tab-return interaction support that claim. This is not a controlled p95 latency, audio-start or physical-device benchmark. Authenticated cold starts, content breadth and source-admission latency remain independent review subjects. No rights-sensitive admission cache was added speculatively.

Genuine owner Note and exact Project Step context are sampled read-only before/after publication, without copying their private contents to Git. This is a sampled integrity check, not a byte-for-byte export of the entire database. No migrations, owner namespace changes, genuine writes, checkpoints, attachment changes, recovery activation or genuine Trash purge are performed. Isolation/destructive fault coverage runs only in disposable local D1/R2 fixtures.

## Source and release receipt

Baseline GitHub main `9a00717e9c34944a4d03ccd5b9fc1985979d9123`; native `07a062b44c2df18a752af3d0de2b4ae02fd0e5ca`; shared tree `bfc770b1c305804243832947e23d03b3ddf7e599`. PR #92 commitments retained. Existing owner-private Site and access policy revision 1 preserved.

The implementation PR records final test totals, identical native/GitHub source tree, merged head, saved version/deployment identity, post-publication Cloud Browser observations and read-only integrity comparison. Read those receipts before beginning Terra acceptance. Until those receipts exist, this document does not assert a released or accepted candidate.

## V71 hosted verification and corrective follow-up

V71 published successfully from native `eeda0cee49a0cb64bb12977be0b41b0dba2d17bd`; GitHub merge `3f03172f58d9fc0c2fc7305505ca386ec5a81748`; identical tree `7ede65071569f92fd551bf81a4b17733931afdcd`. Deployment `appgdep_6ae127c11b588191b45c99dfdab415b5`, saved version `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_8153e0c292a081918ae7d051d1a6fbea`, env revision 6.

Actual owner Cloud Browser after publication confirmed:

- Reload shows the new combined header. Practice → genuine Activity keeps Practice active; Source files remains selected across Chrome tab away/back. No attempt saved, hint revealed or personal progress changed.
- Home terminal Note uses readable Terminal output summary. Genuine Project Step and its existing saved checkpoint load; Resources automatically admits Step-linked material; Article opens with Back to Step returning to the exact stage.
- Question shows Linked projects before guide. Browser Back/Forward preserves canonical route and return context.
- Settings + Ctrl+K leaves one dialog. Settings → Workspace → Data and recovery loads actual existing backup metadata. No creation, restore preparation, activation or purge.
- Existing terminal Note opens read-only, then Open in Notes truthfully exposes the browser's pre-existing revision-1 draft against current saved revision 2. It is retained, not replaced or discarded. Hide keeps it.
- Japanese Library and Projects show current Japanese content. Help → Use with GPT import starts Languages / Japanese; no Markdown import or save performed.

The real Project map failed ordinary and modified clicks. Cloud DOM inspection identified React Flow's actual wrapper inline `pointer-events: none` on deliberately nonselectable/non-draggable nodes. This had not been exposed by the synthetic Project proxy or href-only tests. The correction explicitly restores pointer events on node wrappers and marks anchors nodrag/nopan, preserving disabled dragging and native modifier-click behavior. A new test renders the actual React Flow component rather than merely testing href construction. Focused Project/recovery run: 16/16 passed. Final follow-up build/typecheck/full-suite and V72 hosted ordinary/native-new-tab retest are required and recorded in the corrective implementation PR receipt. V71 is not the final accepted candidate.

During the hosted Recovery check, residual older-backup labels and activation button wording were made consistent: backups remain backups, and activation requires an explicit reload. No recovery protocol, canonical wire name, file format, generation or data changes accompany this wording correction.

Follow-up qualification on the corrected source: `pnpm run typecheck` exit 0; `pnpm run build` exit 0 (`scienceIncluded:false`); complete direct TAP exit 0: **1,446 tests, 1,442 passed, 0 failed, 0 cancelled, 4 optional skips, 0 todo**, 1,024 top-level tests, 346,313.769623ms (346.31 seconds). Log SHA-256: `b195a2b70bac0cfa6b415960dddfd8cf1b90f79a0e14f9d1c7ab1044e07064f3`. The same four optional skips remain. Read-only genuine Note and exact Project Step context matched every returned field except the excluded clock `asOf` after V71; no changed fields. Access remained custom owner-only revision 1. Final post-correction receipt is linked from implementation PR #101.
