# PR #83 — V109 Android JPEG import repair and safe drawing preview

Date: 4 November 2026. **Status: deployed; Android photo re-test required.** Draft PR #83 stays open/unmerged. This checkpoint supersedes V108 only for the bounded tldraw upload behaviour; all other V108 findings remain as recorded.

## Evidence and failure

The owner tried to import a photo in Chrome 156 on Android at approximately 11:41 UTC. The photo appeared transiently, then tldraw showed an upload-failed toast and an empty grey selected image. The page also showed **“Drawing draft could not be retained locally”** despite no proof of a storage-quota failure. The owner supplied a screenshot. Production worker telemetry independently confirmed an authenticated **POST /api/assets/stage** carrying a **351,131-byte image/jpeg** received **HTTP 400**. The response body and exact admission error code were *not* available in worker logs. Do not attribute the exact cause to a camera/Ultra HDR encoding as fact. The original JPEG bytes were not supplied for inspection.

Code inspection found two further deterministic problems:

1. The document listener wrapped both `drawingDocument()` validation and `localStorage.setItem()` inside one catch, misreporting an unresolved/failed image asset as a local-storage failure.
2. The tldraw asset resolver used the private `/api/assets/:id` read path even for newly staged images. That path intentionally denies images until an eligible parent record successfully attaches them, leaving a drawing with no live preview.

## Bounded change

- `lib/asset-client.ts`: stage errors now preserve HTTP status and server error code in `ImageStageError`, while retaining their human error messages.
- `lib/drawing-image-upload.ts` (new): for **JPEG only**, after an explicit **400 / invalid_image** rejection, decode in the browser and make an ordinary JPEG drawing copy (maximum 4096px side, 16MP, quality .9), then retry with a *new* upload identity. The original is never claimed to be preserved by the drawing fallback; other image uploads are unchanged. Auth, generation, storage, network and quota errors are *never* silently retried through this conversion.
- `app/project-drawing.tsx`: on admitted import, retain an in-memory Blob URL to display **staged-but-not-yet-attached** image bytes in the active canvas; revoke these URLs on unmount. Canonical saved asset references remain owner-scoped `minamo-image:image-...`. Show upload/compatibility status, disable **Save drawing** while imports are pending or the document contains an unresolved asset, and distinguish validation failures from actual local draft write failures. No saved Notes/drawings were mutated in this fix.
- `tests/pr83-drawing-attribution.test.mjs`: ensure admitted asset references remain canonical and JPEG fallback cannot activate for other MIME, auth, quota, generation, storage, network or MIME mismatch failures.

## Exact provenance and verification

- Public PR branch: `design/v100-plus-flexible-projects-artifacts-test-runs-20261103`; latest shared-source change commit `d6929b294d9a140866109ef62bf6e3e0aa83f663`. Files mirrored: `app/project-drawing.tsx`, `lib/asset-client.ts`, new `lib/drawing-image-upload.ts`, and `tests/pr83-drawing-attribution.test.mjs`. Each modified original blob matched the V108 native pre-edit blob before the patch.
- Native Sites source: `5b1e57e9cf6710750fdf7bfd05e9da01bb670daf`, pushed to the exact existing Site source branch.
- Sites saved and deployed **V109**, success to https://minamo.jscymru.chatgpt.site; existing **custom** access policy unchanged and no auth/storage/database reset.
- Focused `tests/assets.test.mjs`: **17 pass, 0 fail** (Miniflare D1/R2 private image lifecycle). `tests/pr83-drawing-attribution.test.mjs`: **5 pass, 0 fail** (after a Node TS-loader compatibility correction). Final `pnpm typecheck`, `pnpm build`, and `git diff --check` passed. The build has pre-existing non-blocking chunk-size warnings. Full regression suite omitted under the fast Sites workflow.

## Outstanding genuine acceptance and safe manual retry

The original Android JPEG was not provided, and no owner photo has been re-imported after V109. **Do not claim the user-visible problem has passed until the owner confirms or a true live import/save/reload demonstrates it.**

1. In the already-open drawing, **do not save the blank grey image**. Select and delete that failed placeholder. Leave previously saved drawing content intact.
2. Refresh the Site to load V109. Reopen the test Project drawing, import the **same** JPEG, confirm a real image preview (not a grey tile), and look for either “Image uploaded” or “Camera JPEG converted locally” in the drawing status.
3. Save drawing only after the preview and Save button are ready; reload and confirm image persists; edit another shape/text and save/reload again.
4. On any failure, collect **exact visible status/toast wording** and approximate time. Inspect current worker logs for sanitized POST status/code evidence, but do not put actual private request headers, cookies, user identifiers or image bytes in Git. Do not weaken private image read eligibility.
5. Draft recovery after a reload **before attaching staged images** remains a separate image-preview continuity limitation: in-memory Blob URLs cannot survive reload, although a valid canonical draft may still be saveable during staging TTL. Investigate separately if real use demands it.
6. Pygbag actual graphical package admission and other outstanding interactive gates from V108 remain **unverified**. No TEST fixture cleanup, rollback, merge, access changes or broader product redesign is authorized by this fix.

## Post-deployment smoke and diagnosis correction

- Sites `get_site` after V109 confirmed **live version 109**, **custom** access mode and original access-policy revision **1**.
- Authenticated Cloud Browser opened Home, Projects, the six-layout synthetic Project and the existing family simulation Project successfully. The test Project rendered the retained sections and the “Hide furigana” control. This was a **read-only live route/render smoke**, not an image-upload test; no stored Project or Note was changed.
- A follow-up hypothesis that upload IDs could fail because `clientId()` generates hyphenated UUIDs was **disproved**: the server regex explicitly permits a trailing-class hyphen, and existing Miniflare tests already confirm hyphenated upload IDs succeed. No change or deployment was made for that discarded hypothesis. The observed 400 remains unclassified until its response code or original phone photo is available.
