# Combined release-readiness decision

**Disposition: locally verified dormant engineering candidate; no release is authorised or performed.** The original PR41 integrated browser-access gap is closed in this run. This document distinguishes the implemented candidate from production and from remaining environment/device gates.

## Exact source

| Item | Exact identity |
| --- | --- |
| Frozen PR41 input | GitHub `db33d9dbf0bf20cf2b174edc11a20c261f5bed0a`; common tree `f2bcd06bdcc9885e6e26a299e10f1bd8e9b9c51d` |
| Final runtime, local | `a2c78d8332d330efaaad3f14fa1565292827ce87` |
| Final runtime, GitHub | `c337084feffdb6667994fe7f9b102d1b506c7b2d` |
| Exact common runtime tree | `d6490bae4bb31aca4dc218a3c242c7661bfa7465` |
| Local-only native-history rehearsal | `e82746ff6c3511d3156c37ae6ccfcfc0285f4f89`, same common runtime tree |
| Unchanged GitHub main | `c40ebcc9a27bd2538ecf5b117a3eeba7f1229d1c` |
| Sites state re-read before publication of the draft | Existing V27; access revision 1; no save/deploy/access change |

The final PR head may add these reports/screenshots after the immutable runtime checkpoint. [SOURCE-MANIFEST.json](SOURCE-MANIFEST.json) hashes all 493 runtime/build/test inputs. The PR body records the final report/source correspondence. PR41's branch was read, never edited; it was re-read unchanged at the end.

## Verified locally

- TypeScript and ordinary production build pass.
- Full final Node suite: **1,001 total, 1,000 pass, 0 fail, 1 existing absent-Cargo-toolchain skip**, 0 cancelled. Real scientific regressions ran using locally staged pinned assets. [Machine summary](evidence/VALIDATION-SUMMARY.json).
- The production-compiled Worker returns 404 for both laboratory pages and their synthetic proxy; requests create zero lab records. Default-off Activity writes remain unavailable. Feature flags and source/rights/hint projection are preserved.
- Actual Chromium Activity, Atlas, retained editions, Notes, keyboard, nine responsive widths, three restricted-context trials and multi-adapter teardown have passed within [VISUAL-ACCEPTANCE.md](VISUAL-ACCEPTANCE.md)'s precise scope.
- The native-history rehearsal was local only; its exact tree equals the tested GitHub/runtime tree. A normal build on that source is also recorded. No credential was saved in source, and no native push, version save or deployment occurred.
- Default app eager closure grows by **739 gzip bytes (0.211%)** versus exact PR41 under the documented manifest method. Heavy Activity/Atlas/science/GPU/canvas modules stay outside that closure. Ordinary package reports `scienceIncluded:false`.
- Three fresh restricted-context agents completed a zero-frontend-code composition, banked bytes activation and a scaffolded finite-view module registration. Initial failures produced concrete Pro fixes and successful reruns; no literal Light speed/cost benchmark is claimed.

## Gates before any later production release

1. Owner reviews the substantive visual alternatives and explicitly authorises merge/native source publication/private deployment. This commission explicitly forbids them.
2. Re-read current main, PR41, native source head and Site access before reconciliation; preserve the sole V2 project and owner-private audience. Review any intervening changes. GitHub merge is not native Site deployment.
3. Use supported Sites source preparation and exact tree/expected-head guards. Build/package the matching source and preserve archive identity. Retain the existing current-rights projection in rollback.
4. Verify authenticated hosted owner identity, synthetic Activity/Attempt/Note/source/Trash/recovery and cleanup after an authorised release. Local isolated identity does not prove hosted authentication.
5. Verify the actual newly installed production MCP catalogue in a fresh conversation. Server source does not refresh an installed client. No reinstall or reconnect was performed or requested in this draft-only task.
6. Complete Pixel 8a touch/native selection/IME, TalkBack where available, real zoom/high-contrast and audio/device lifecycle checks. Chromium iframe geometry is not a physical phone certification.
7. Run and review the **37 prepared Playwright/ARIA/axe cases** with the pinned Chromium in a supported local environment, then approve deterministic baselines. The current environment lacks that executable; the runner reports NOT RUN before app assertions. Actual browser acceptance is separately recorded, not substituted for an automated pixel-diff pass.
8. Keep tldraw production licence/host/privacy and optional scientific/GPU/browser-enforcement lanes gated as in PR41. No paid service, arbitrary executable runtime, microphone/file-system permission or production canvas store was introduced.

## Rollback and continuity

Prefer this combined binary with Activity/Atlas disabled: it retains source revocation, hint redaction, current owner/generation fences and exact recipe projection. Do not put an older unaware binary over new nested Activity records without a reviewed compatibility projection or owner-approved verified restore. Never restore over genuine learner work merely for testing.

Notes remain under the existing writer/receipts; layout/selection preferences are device-local presentation state. An Activity authoring or pane change never becomes a learning checkpoint. Reopening an unattempted renderer does not execute project code. The new view IDs select only trusted prebuilt code after server admission and explicit user activation; omitted IDs retain existing rendering.

## Remote CI qualification

After draft PR43 was created, GitHub Actions runs [40227989205](https://github.com/frekland/minamo-v2/actions/runs/40227989205) and [40227986257](https://github.com/frekland/minamo-v2/actions/runs/40227986257) reported failure. The verify job121273406115 completed in approximately2seconds, exposed **zero steps** and runnerId0; log retrieval returned404BlobNotFound. The cause is unestablished. No GitHub CI success, billing explanation or application failure diagnosis is claimed. This resembles the pre-existing PR41 evidence limitation but is recorded independently for this candidate. [Exact receipt](evidence/CI-STATUS.json). The fully executed local build/1,000-pass suite remains separate evidence. Real provider logs/annotations and a normal CI result are an additional release gate; no billing or permission change was made.
