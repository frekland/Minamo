# Portable Project/Library content — initial source-code foundation

**Work-in-progress code; not deployed and not a user-facing export or import yet.**

Purpose: transfer selected Projects and an owner-selected Library from legacy Minamo to the promoted Minamo, with file-based portability and without using the old whole-workspace restore flow.

## Shared page format

- `lib/portable-content-codec.ts` implements `minamo-portable-page@1`, an independent bounded page containing one Project or a small batch of Library records, plus original image/media bytes with SHA-256 digests.
- Each page has an export identity and page number so future bounded HTTP downloads can avoid legacy issue #10's long-running monolithic request. Page-boundary coordination and aggregate completeness checks **still need an authenticated export manifest**.
- Files carry canonical metadata and exact source revision/rendition claims for attribution; importing must *not* treat those numbers as proof that the new workspace has the same revision/history.
- The codec is storage/hostname-neutral. It does **not** implement access control, export-rights decisions, D1 writes, source redaction, or an importer. Those are mandatory next steps before exposing it in the UI.
- `source` records are permitted only as input to an *appropriately authorised/rights-projected* Library export. A source excerpt with `exportAllowed:false` must not be included, including retained editions or indirect references. Do not use raw database JSON in this transport without rights review.
- Note records are not part of either Project or Library portability; learner Notes are a separate class of data and should not be silently imported as GPT-authored learning content.

## Next implementation slices

1. **Rights-safe read and export handlers.** Source: `lib/domain.ts`, `lib/project-service.ts`, `lib/assets.ts`, `lib/media.ts`, `lib/domain-handler.ts`, `lib/domain-routes.ts`; use current owner/generation authority. Add independently retrievable page inventory/digests, per-page export content and authorized original-asset reads. Pagination must be snapshot-consistent or explicitly retry on revision watermark conflicts.
2. **Additive importer with explicit preview.** Parse untrusted page files with the codec, verify entire import inventory and asset hashes, validate canonical content through existing writer contracts, remap colliding IDs, preserve safe internal relationships, stage media, and commit idempotently. Never directly import D1 rows or activate whole-workspace recovery. Surface unsupported/withheld references accurately.
3. **Learner controls.** Project management: Export Project; Projects index: Import Project. Library: Export Library and Import Library with bounded progress, preview of actual prospective additions and user-confirmed commit. Keep these secondary controls unobtrusive.
4. **Legacy V149 compatibility.** Audit exact native V149 source and implement its export half against the same file contract. Existing public `Minamo-legacy-2/main` is documented as older than deployed production. Fix large Library paging first, without blocking on the full recovery bug. Preserve legacy data.
5. **Acceptance.** Tests for interrupted/missing pages, duplicate identities, oversize, unexpected record families, invalid image/media bytes, source export restrictions, edition links, older/newer formats, hostile HTML/code paths, and retry idempotence. Browser test: download real private Library and one Project from legacy, import additively into Minamo and verify via its MCP. No live mutation until owner authorisation.

## Local verification

`node --experimental-strip-types --test tests/portable-content-codec.test.mjs` — 5 tests passed under Node 22.16.0.

This is only the **first code slice**, not a certified backup/export system. The legacy issue remains open: https://github.com/frekland/Minamo-legacy-2/issues/10
