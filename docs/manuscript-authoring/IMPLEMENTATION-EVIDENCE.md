# PR18 — implemented text-first authoring

Implementation and release commission, 22 October 2026. Runtime publication remains the existing owner-private Minamo V2 Site. This report supersedes the seed-only implementation-status descriptions in the original commission; the requirements themselves are preserved.

## Working system

`lib/manuscript.ts` parses complete manuscripts with unified/remark-parse/remark-gfm into the existing safe canonical reader. The original full brief and exact Markdown (including CRLF and unsupported source) remain immutable. Styling uses bounded UTF16 offsets over canonical text, not DOM-derived replacement text. H2 headings produce sections/stages; only explicitly authored Intent:/Outcome:/Checkpoint: paragraphs produce those metadata fields. Title and stage ordering are structural projections, never learner achievements.

`publish_minamo_manuscript` is the preferred one-submit operation; preview is optional. Matching authenticated HTTP routes live at `/api/manuscripts/publish`, `/preview`, and `/source?operationId=...`. `read_minamo_manuscript_source` retrieves original source and exact target revisions, explicitly labelled historical when later canonical edits differ. Archived source is unavailable while any member is in recoverable Trash. It is not a current-document reconstruction.

Defaults create new original records. Whole-document replacement requires an explicit document `target:{family,id,rev}` AND a matching `existing` targeted-update declaration. Missing/mismatched/stale targets reject; title matching cannot select a record for replacement. Small edits still use narrow existing commands. Existing reuse links use declared exact family/id/revision. Local `[label](minamo:document-key)` links resolve server identities and Journey source-stage contexts. Whole-record links intentionally open current coverage; exact retained captures continue to pin their original rendition. New within-package section/part links retain the package publisher's prospective-rendition rules.

`lib/authoring-package.ts` reuses the guarded D1 batch for canonical records, history, activity, operation receipt AND `v2_manuscript_editions`. A missing/failing source insertion rolls back all members. Same operation+payload replays; changed payload conflicts. No extra inference service is installed. The existing ChatGPT session supplies writing and editorial review.

The graph-v1 codec supports general cycles, bidirectional edges, self-loops and disconnected nodes without pretending they are DAGs or trigger-labelled state machines. Existing codecs and historical text projections remain intact. The native safe SVG has a complete text connection list, enlargement and narrow-screen cards. Unknown Mermaid/raw HTML/images remain visible safe source fallbacks and are not executed or imported.

Inline bold/emphasis/code/HTTPS links coexist with exact table TSV captures, overlapping Flags and annotations. Inline Minamo links retain native hrefs and use existing in-workspace navigation when hydrated. Plain editor/command text changes clear inherited stale styling; explicit replacement spans remain validated. Original source and historical renditions remain untouched by later edits.

## Verification and independent correction

The aggregate typecheck/build/test receipt is recorded in PR18 and issue1 after source freeze. Real Worker/Miniflare/D1/MCP tests cover preview zero writes, all roles, full >500-character brief, exact source readback, CRLF/Unicode, rich tables, graph cycles, exact styled/table captures, split-surrogate denial, owner isolation, cross-origin rejection, Source authority, generation/revision races, identical concurrent retry, changed-payload conflict, forced member11 rollback, forced source-row failure and zero partial effects. They also cover explicit replacement, old/new source editions, historical annotations and recovery validation. Existing reading/source/recovery/security suites run in the aggregate.

Recovery adds immutable source editions to the existing protected and encrypted checkpoint/import paths, with owner namespace remapping, digest validation, mutation-watermark capture, row/byte budgets and compatibility with older files. Five dedicated tests exercise real D1/R2/encrypted round trips and tampering. Existing recovery import now admits the already-supported learningShape contract.

Independent engineering review found and corrected duplicate bold subsection spans, missing Journey source-stage IDs, and stale inherited editor styling. The new source edition shares the existing transaction and permission boundaries. This is agent review, not external human acceptance.

Three fresh briefs were selected by a writer who did not inspect the implementation: a read-only duplicate-file reporter, cache freshness, and an open SQLite-index investigation. Nine documents were published using **three** actual isolated local authenticated Worker/D1/MCP submissions, with **zero rejected submissions**, followed by exact full-source reads. `lib/manuscript-benchmark-saved.json` is actual saved synthetic readback, not private learner data. Its DEV-only reader fixture grants no authenticated API identity. No installed-client friction claim is inferred from a local server test.

Independent educational review found five P2 flaws and all were corrected: edit the fixture source rather than its already-deleted temporary file; supply a deterministic injected read failure; include same-device timestamp ties; distinguish plans from measured row visits; give reproducible independent-database/alternating-order sampling instructions. The reviewer executed all three original examples and the corrected failure/tie/mutation probes in disposable local directories. No remaining P1/P2 teaching defect was established in the corrected saved records. These are synthetic observations, not learner evidence or production performance findings. The SQLite inquiry remains open.

Browser QA used real desktop and 390px/320px iframe rendering of these saved local records. Desktop inline Journey→Library navigation and exact originating-stage return worked. The 390px page width equalled its scroll width; stage controls, inline code and long examples remained readable. Native secure clipboard access was unavailable in the HTTP preview; the explicit manual-select fallback appeared. Earlier synthetic annotation drafts were isolated under a new PR18 preview scope. Authenticated production-browser review is a separate gate: the available cloud browser reaches a sign-in page and has no authenticated owner session. No login or device acceptance is invented.

## Fairness and limits

The source request sizes were 9,193 / 6,147 / 9,395 bytes versus 14,238 / 10,911 / 14,929 bytes for compiler-generated low-level packages for the same material, before any caller work to author that schema. This measures representation overhead, not GPT tokens, time saved or a controlled old-vs-new educational experiment. There is no fair matched installed-old-client run in this session. Do not claim one.

Deterministic findings can identify suspicious outcome questions, literal repetition, sparse explanation or mirroring patterns. They cannot establish teaching quality or genuine semantic uniqueness. Legacy metadata self-certification is not demanded by manuscript callers; internal generated decisions explicitly state that they are structural and not a semantic review. Hard provenance/security failures still reject.

Bounds: one request <=220KB, <=16 documents, original brief <=24,000 UTF16 units; existing per-record section/part/table/link budgets still apply. Oversize input rejects with no truncation. There is no continuation upload protocol because these measured heterogeneous manuscripts fit comfortably. Unsupported syntax is preserved safely; no arbitrary HTML/SVG, remote excerpt import, inference or hidden paid dependency exists. Whole-record links intentionally open current records; original manuscript/selection editions retain historical identity. Multi-record source read is withheld if a member becomes unavailable rather than leaking that member through the archive.

## Release and post-release gates

Follow the exact native/GitHub tree receipt on PR18. Merge only the extended PR18; do not execute PR12/14 or any unrelated work. Preserve the existing Site audience and all genuine records.

After deployment, compare installed workspace contract and actual tool catalogue. If the host still omits publish/preview/source manuscript tools, only the Minamo V2 plugin reinstall/reconnect is necessary; server tools/list alone does not prove installed availability. Then publish bounded exact-ID synthetic acceptance through the installed client, read original source and operation recovery, and recoverably Trash only those created IDs. Compare the genuine baseline revisions before/after. These post-release installed-client steps must not be reported complete until actually performed.
