# Core learning continuation · 2026-10-21

Integrates PR #4 at 98798b66b00e0572b12907af20b27735f6d8c49b into the newer V4 source. Its documentation merged on GitHub as fb7a11b0cc7e748a12e97743f0c9255bb5948c54 after exact-head CI; newer implementation was retained. Original Minamo and the learning repository remain unchanged.

## What changes for the owner

The existing cleaner layout now uses the requested neutral charcoal canvas/panels and muted blue/cyan actions, stronger fields/focus and readable supporting text. Reading, Notes, authoring, overlays, CodeMirror and the isolated optional Web preview share semantic tokens. Desktop and narrow reading remain primary; tools are secondary.

An explanation can be improved with a block-level patch rather than resubmitting a whole older article. The normal editor derives narrow updates when possible and omits unchanged unavailable blocks; structural edits that cannot safely preserve them stop with the proposal retained. The same domain supports rich Article, Investigation, Note and other readable records.

The owner can select and decode a local PNG/JPEG/WebP, review it before sending bytes, upload the original privately, add its description/caption to a reading and save the parent record deliberately. Local files are not silently uploaded or promised to survive reload. R2 bytes have an opaque owner-scoped identity; the parent D1 CAS and attachment metadata commit together. Retained editions can still access an older image after current removal while its parent remains eligible. Revocation hides bytes and image description/caption across current/history/context/quotes; unrelated personal prose survives. Stages expire after 24 hours; bounded opportunistic cleanup runs on deliberate upload, never render.

The server validates bounded raster containers/signatures/checksums/dimensions, not full compressed-image entropy or semantic pixels. The browser decodes the selected local image. Limits are 8 MiB, 8192 pixels per axis and 32 Mi pixels; animations are rejected. Source filenames are not stored. Audio/video/documents remain unsupported. There is no automatic extraction, redaction or claim that GPT inspected image pixels. Authenticated image reads are implemented; full protected archive/export/restore is not.

“Discuss with GPT” previews the topic, exact saved target and opt-in related records, accepts an optional question, copies a bounded stable read instruction and offers an ordinary Open ChatGPT link. It does not inject a conversation or grant writes. Foreground/deliberate checks revalidate the active context and a bounded related-source set; newer text is offered deliberately while the current passage remains stable. Permission changes discovered by checks replace restricted projections.

## Evidence and limits

240 aggregate tests pass, with TypeScript and production build. Actual Miniflare D1/R2 and shared HTTP/MCP tests cover raster formats, owner fencing, uncertain upload identity, losing CAS, attach/revoke races, retained images, exact image caption/LF anchors, targeted edits, idempotent receipts, query masking and preserved prose. The compiled production Worker test independently exercises raw upload → guarded parent save → pixel read → revoke → redacted context through its actual routes. Generated migration 0002 was inspected and applied locally; Sites applies it on publication. No runtime/render DDL was added.

The application palette itself passes the reference 70-pair contrast calculation, not merely the documentation CSS. Actual browser checks show canvas/header rgb(27,27,27), panels rgb(37,37,37), code background rgb(32,32,32), code text rgb(226,226,226), 17px reading prose at 29.75px line height and a visible 2px keyboard outline. Real iframe widths 320/390/768/1440 have no horizontal document overflow (client widths 305/375/753/1425 respectively). The narrow GPT dialog wraps within its surface. Expanded Notes retained its synthetic draft and changed docking without loss. The image picker decoded a known synthetic raster; explicit upload was correctly rejected without authenticated identity and retained the image/description. This is browser error/recovery evidence, not successful hosted image saving/enlargement.

Version 4 already has actual authenticated hosted MCP read/write/readback evidence and preserved useful repository-linked reading. The installed catalogue still exposes the older writer shape. New image/patch fields are tested in the real server schema/domain, but must not be sent through a stale typed client. The portable discussion request deliberately uses verified stable fields. A new independent ChatGPT conversation, authenticated hosted browser writes, physical Android, software-keyboard/zoom/forced-colours acceptance and successful browser image enlargement remain unperformed. No optional-engine performance benchmark is claimed. Exact checked commits, common tree, CI and private deployment identities are in the issue #1 receipt.

## CE-01–CE-28 disposition

“Partial” denotes unfinished acceptance, not a future enhancement or completed core commission.

| Requirement | Disposition in this release |
|---|---|
| CE-01 | Reuses V4 and PR #4; original project untouched; genuine V2 records retained. |
| CE-02 | Shared typed rich sections/Reader across readable families; broader populated personal workflows remain partial. |
| CE-03 | Text/code/table/callout/reference/image and narrow block edits implemented; full prose/list semantics and every surface scenario remain partial. |
| CE-04 | PNG/JPEG/WebP lifecycle supported; native audio/video/document paths unsupported. |
| CE-05 | Multiple authored arrow paths/text source retained; declared general diagram codec and adversarial branch fidelity remain partial. |
| CE-06 | Actual private D1/R2 lifecycle/races/history/revoke tested; hosted upload and protected export/restore unfinished. |
| CE-07 | Existing hashes/anchors retained; image description/caption exact ranges tested. Versioned general codecs, table-cell identity on reorder and all caption projections unfinished. |
| CE-08 | Source-excerpt admission/transclusion and cross-source capture remain unfinished. |
| CE-09 | Exact text/code/table/image textual ranges and chrome exclusions tested; pixels never text ranges. |
| CE-10 | Authored canonical links/backlinks implemented; complete two-Investigation browser scenario remains partial. |
| CE-11 | Canonical concept/command aliases and ambiguity previews unfinished. |
| CE-12 | Guarded targeted improvements preserve IDs/editions; actual hosted ordinary article improvement verified on V4. New patch-client acceptance pending. |
| CE-13 | Stable bounded handoff, optional question, ordinary ChatGPT link and exact return implemented and browser reviewed. |
| CE-14 | Actual installed stable tools work; image/patch-rich authoring awaits client-visible catalogue refresh/verification. |
| CE-15 | New independent GPT context acceptance unperformed. |
| CE-16 | Metadata explicitly distinguishes container validation from semantic/visual inspection; GPT pixels not delivered. |
| CE-17 | Bounded foreground/explicit revalidation and historical continuity implemented; helper tests pass; authenticated two-client browser check unperformed. |
| CE-18 | Image revocation tested across reads/history/query/context/capture; source permission lifecycle, exports and full browser cache acceptance unfinished. |
| CE-19 | Existing draft/operation recovery retained; narrow editor and image-failure retention tested; no durable binary browser queue claimed. |
| CE-20 | Canonical application palette applied; 70 token contrast checks and populated computed-style/browser review pass. |
| CE-21 | Strong controls/visible keyboard focus/distinct marks implemented; high-contrast/forced-colours acceptance partial. |
| CE-22 | Four actual CSS widths checked; 200% text/400% zoom, software keyboard and physical-device acceptance unfinished. |
| CE-23 | Reading/relationships/Notes/handoff flows checked in parts; full authenticated whole-flow acceptance unfinished. |
| CE-24 | Denied/malformed/stale/uncertain/unavailable image and block states tested; unknown-version preservation and complete fault matrix partial. |
| CE-25 | Protected full rich archive/export/restore remains unfinished. |
| CE-26 | Lazy editor/engines and viewport image loading retained; measured comparative performance acceptance unfinished. |
| CE-27 | Opening/reading performs no execution, achievement or automatic write; synthetic examples remain labelled. |
| CE-28 | Checked source/CI/private deployment recorded in receipt; explicit server-versus-installed schema compatibility retained. |

Continue the commission from this checkpoint. Do not recreate projects, copy private records into fixtures, import source text without admission or mark the full core programme complete.
