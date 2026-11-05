# PR #83 — V110 tldraw URL-validation crash repair

Date: 4 November 2026. **Deployed successfully. Physical Android photo → save → reload still pending owner acceptance.** Supersedes the V109 instruction to treat the photo as simply needing re-import; V109 had a confirmed new crash after a successful JPEG compatibility conversion.

## Owner evidence on V109

At approximately 13:31 UTC, after importing the same phone image, the status showed **“Camera JPEG converted locally for drawing compatibility. Save drawing to retain it.”** This indicates the bounded JPEG conversion/staging path progressed past its previous HTTP 400 failure. tldraw then displayed its fatal “Something went wrong” dialog and a stack trace:

`ValidationError: At asset(type = image).props.src: Expected a valid url, got "minamo-image:image-[redacted]" (invalid protocol)`

The dialog offered **Reset data**, which would delete the editor's unsaved work; owner explicitly advised **not to reset**. No production data reset, access change or image-data deletion occurred in this repair.

## Root cause and exact fix

The V109 `TLAssetStore.upload` returned `src: 'minamo-image:' + admitted.assetId`, but tldraw 5.5.2 validates `TLImageAsset.props.src` using `@tldraw/validate`'s `T.srcUrl`, which rejects this custom protocol. This causes tldraw's store `put` to throw before the drawing can be saved, even though image staging may have succeeded.

- `lib/drawing-document.ts`: use the **officially permitted `asset:` protocol** for canonical private image references of the form `asset:minamo-image:image-[64 lowercase hex]`. Use exact parsing of this format for server image-attachment extraction; reject arbitrary remote URLs and malformed or appended identities. Normalize exact historical `minamo-image:` markers from retained drafts/snapshots into the new form on read, **without mutating the input**.
- `app/project-drawing.tsx`: return the new canonical reference from the upload handler and resolve only that form to the existing in-memory Blob preview or generation-scoped private `/api/assets/:id` route. Other persistence, CAS, image eligibility and cleanup rules remain unchanged.
- `tests/pr83-drawing-attribution.test.mjs`: directly load **the installed tldraw 5.5.2 `T.srcUrl` validator** and prove it accepts the new reference and rejects the former one; assert exact owner-private image-ID extraction, remote/forged URL rejection and legacy snapshot normalization.

A temporary, non-routable HTTPS reference was considered but **not used**: tldraw already supports `asset:` natively. No new network origin, external request or public image storage was introduced.

## Release identity and checks

- Existing Site: https://minamo.jscymru.chatgpt.site, Sites **V110** deployed with success.
- Native Sites Git commit: `405f852e6e3bf825fe15e49e7d33f1d5a7e6100d`; direct descendant of live V109 `5b1e57e9cf6710750fdf7bfd05e9da01bb670daf`.
- Public PR #83 branch: `design/v100-plus-flexible-projects-artifacts-test-runs-20261103`. The three shared source/test paths matched V109 native blob SHAs before editing; mirrored commits end at `351fc3b9a0178842cb8214e8f509bea0bdc88161`.
- Focused tests: **23 passed, 0 failed**, including actual Miniflare D1/R2 image lifecycle and the installed tldraw URL validator. `pnpm typecheck`, `pnpm build`, `git diff --check` passed. Full regression suite omitted per the fast Sites release workflow. Existing non-blocking build chunk-size warnings remain.
- Custom Sites access/policy, Note data, preserved Project records, runtime bindings, draft PR state and TEST fixtures **unchanged**. No database migration, reset, merge, rollback or personal image storage in Git.

## Remaining acceptance and safe owner retry

**No claim of complete end-to-end image functionality yet.** Only a real authenticated Android import/save/reload demonstrates the repair.

1. In the current fatal tldraw dialog, **do not use Reset data**. Tap **Refresh page** (or reload the Site). The last complete server-saved drawing should remain; any unsaved material is inherently at risk from the prior fatal error.
2. Import the same photo again. It may require the local JPEG compatibility conversion, as already observed on V109. There must be no `invalid protocol` crash; verify the actual photo is visible on the canvas.
3. Save drawing, then reload the page and verify the image remains. Make a small additional change and save/reload again.
4. If any issue persists, record the exact on-screen error/time and whether the image appeared and Save became enabled. Do not reset tldraw's device data. Inspect new sanitized worker status evidence before another change.

Unrelated Pygbag graphical acceptance and staged-image draft-preview continuity after reload remain unverified under V108/V109 handovers. Keep PR #83 **draft/unmerged**.
