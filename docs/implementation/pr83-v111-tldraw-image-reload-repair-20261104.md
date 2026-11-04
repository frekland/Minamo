# PR #83 — V111 tldraw saved-image reload repair (4 November 2026)

## Deployment and authoritative identity

- **Live:** Minamo V111 at https://minamo.jscymru.chatgpt.site/
- **Sites project:** `appgprj_6ad8a4e85eb48191accd6e78976b47e3`
- **Native deployed source:** `b45aa19a2acc17e7ae915581ea83de0ffbd668a9`
- **Saved version:** `appgprj_6ad8a4e85eb48191accd6e78976b47e3~appgver_45ed8c68f6848191984165a5e2af45c0` (V111)
- **Deployment:** `appgdep_6aeb4059ed4c8191a45da84f971f1886`, status **succeeded**.
- Existing **custom Sites access** preserved. No migration, image deletion, reset, cleanup, merge or change to owner-scoped permissions.

## Owner-reported failure and confirmed cause

After V110, an Android image rendered on tldraw and **Save drawing** acknowledged it, but refresh reloaded the canvas with a grey image rectangle. The owner's screenshot and the 4 November production logs corroborate successful staging/command, and a private image GET returned HTTP 200 after the reload. No personal picture, asset identity or content is copied into this public repository.

The defect was server-side *snapshot filtration*, not missing image bytes. `lib/media.ts:readMedia` still derived a drawing image ID using `String(record.props.src).slice(13)`, based on historical `minamo-image:` references. V110 upgraded these to tldraw-valid `asset:minamo-image:` URLs. Slicing at 13 produced a malformed lookup, so the loader removed the otherwise permitted asset record and set the corresponding shape's `assetId` to `null`. This generated a persistent grey placeholder while the original snapshot and image were retained.

**V111 fix:** Use the canonical `drawingAssetId()` parser for normalized drawing URLs in `readMedia`. Retain permitted image records and their shape relationships, while continuing to redact genuinely missing/revoked images. It also remains compatible with exact historical marker migration already implemented by `drawingDocument`.

## Verification (synthetic and local unless otherwise noted)

- Added Miniflare/D1/R2 regression in `tests/pr83-interactive.test.mjs`: stage synthetic PNG, commit Note containing image + drawing media, assert image GET 200 and round-trip snapshot preserves asset and shape reference; assert another principal cannot read the private drawing; revoke image and verify the read-back redacts the asset/shape relationship.
- 39 relevant tests passed (PR83 image/interactive, image-domain, media-reader, media-domain and security-media suites), zero failed.
- `tsc --noEmit` passed.
- `node scripts/build-app.mjs` passed; existing unrelated duplicate-case/bundle-size warnings remain.
- V111 version saved and production deployment status **succeeded**.
- Cloud Browser encountered the protected Sites ChatGPT sign-in gate and did **not** independently render the owner's drawing. **Physical Android save → reload → edit → save → reload is pending owner verification**. Do not report this as browser acceptance.

## Next safe acceptance

1. On the **existing** drawing in Android Chrome, refresh once; the original image should return without reupload because neither the stored snapshot nor image bytes were deleted.
2. Check that image and annotations remain; perform a small drawing edit, **Save drawing**, refresh again and check retention.
3. If still grey, do **not** select tldraw **Reset data**. Report the visible status and time so the exact new GET can be traced without exposing private content.
4. Pygbag graphical acceptance and any other outstanding PR #83 interactive-content browser acceptance remain separate and **unverified**. Keep PR #83 draft and unmerged.

Official references consulted: [tldraw asset storage](https://tldraw.dev/docs/assets) and [TLAssetStore](https://tldraw.dev/reference/tlschema/TLAssetStore) (cross-checked with Context7).
