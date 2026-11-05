# Public-source reconciliation with native Sites V116

**Status: open source-maintenance work, not a production release.** Recorded 5 November 2026. This document is an inventory and transfer boundary, not permission to copy the entire protected Site repository or claim parity.

## Verified identities

| Surface | Identity at inspection | Meaning |
| --- | --- | --- |
| Owner-private Site | V116, native source `fc93ce4bbcffa4298097b8c7fe50fae75555d072` | Previously verified live deployment; re-check before changing Site |
| Protected native checkout | `d32f713585a9bf320a9ca75457b4f01996893c47` | V116 descendant with subsequent policy/docs commits; **not** public GitHub history |
| Public `main` | `d3a9108a0fa8c9fb9481efa559860b54c7780586` | Shared source at audit; docs and CI current, application code older |

The native and public commit hashes are intentionally not interchangeable. The separate native checkout contains Site-specific hosting configuration and protected content that must never be bulk-synchronised to the public repository.

## Read-only app-source comparison

Comparison was by relative path under public `main` versus the native checkout, using `diff -qr` (counts of reported differing files and native-only entries; **not** a source-integrity or content-rights audit):

| Directory | Existing paths with different content | Entries only in native checkout | Public-only entries |
| --- | ---: | ---: | ---: |
| `app/` | 26 | 17 | 0 |
| `lib/` | 29 | 22 | 0 |
| `db/` | 0 | 0 | 0 |
| `scripts/` | 2 | 1 | 0 |
| `tests/` | 25 | 29 | 1 |
| `public/` | 4 | 3 | 0 |

Counts include nested-directory summary entries rather than a complete file-level manifest. In particular, **do not interpret the 39 native-only `app`/`lib` entries as all safe for public release**: some are experimental or intentionally native-specific.

Examples of deployed capabilities missing from public `main` include `app/project-language.tsx`, `app/project-speech.tsx`, `app/project-drawing.tsx`, `app/project-canvas.tsx`, `lib/language-speech.ts`, `lib/language-speech-browser.ts`, `lib/drawing-document.ts` and `lib/project-drawing-collab.ts`. Existing shared modules such as `app/workspace.tsx`, `app/project-sections.tsx`, `lib/project-context.ts` and `lib/project-composition.ts` also differ. The draft [Project/drawing PR #83](https://github.com/frekland/Minamo/pull/83) contains related source work; [language PR #85](https://github.com/frekland/Minamo/pull/85) currently documents language/TTS work but does not itself carry all native implementation files.

## Safe promotion path

1. **Protect the live baseline.** Re-check native source/version and audience/bindings; no direct Site publication is part of repository housekeeping. Do not reset data or overwrite native files from the older public checkout.
2. **Map ownership and provenance.** For each intended shared file, identify its public baseline/PR ancestry and native V116 counterpart, dependencies, licences, assets and tests. Exclude `.openai/`, Site deployment/configuration secrets, private records, owner data, native-only benchmarks and protected assets.
3. **Port in coherent slices** to reviewable public branches, starting with the Project/composition foundation and then drawing and language/TTS dependencies. Keep incomplete prototypes and historical contextual/Study screens out of the active learner UI unless explicitly agreed. Reconcile overlapping PR #83/#85 work instead of blindly merging stale diffs.
4. **Verify narrowly.** Typecheck/build and focused changed-path tests, including any affected owner/CAS/recovery/asset/rights invariants. Do not launch `pnpm test` or the full browser suite without an explicit owner request.
5. **Only after review,** align public source and the actual native release manifest. Public merge does not deploy Sites; changes to the protected Site require their own authorisation and saved-version verification. Record any deliberate differences instead of falsely declaring byte-for-byte parity.

## Other boundaries

- Source reconciliation does **not** close open feature PRs, resolve the owner’s language-device acceptance, or approve the separate visual redesign.
- No authentication, database, MCP permissions, recovery or Site access-policy change is implied.
- The independent Cloudflare staging implementation is a separate target, not an alternate identity for the private Site.
- Preserve old branches with unique evidence or unmerged code until their ancestry/ownership is verified. Avoid mass branch deletion solely because a branch is old.
