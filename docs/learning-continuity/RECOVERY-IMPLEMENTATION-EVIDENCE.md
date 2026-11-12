# Complete cumulative recovery — implementation evidence

Synthetic local Worker/D1/R2 evidence for the PR #19 integrated implementation. These are executed Miniflare/Workerd tests, not hosted deployment or physical-device evidence. No genuine learner namespace was used or altered.

## Capacity and bounded execution

Complete protected recovery now admits up to 100,000 authoritative rows, 64 MiB of row JSON, 512 image and 512 media metadata identities, 64 MiB image bytes and 80 MiB combined private asset bytes, within a combined **88 MiB archive plaintext** envelope. The encrypted transfer remains bounded to 90 MiB and uses existing 64 KiB independently authenticated AES-GCM frames. The limits are intersecting bounds, not additive promises of every maximum at once.

A complete cumulative workload is backed up; retained Note revisions, full historical operation responses, canonical reading revisions and manuscript/catalogue/development histories are never silently pruned. Metadata-only expired/revoked asset identities count honestly. A single row beyond 480,000 bytes is explicitly unsupported and safely rejected.

D1 reads use keyset pages with a running byte bound; each returned row page and staging parameter is approximately 480 KiB or less. A namespace mutation watermark brackets the complete capture. A concurrent mutation rejects the mixed capture rather than publishing it as a consistent checkpoint. Retrying the same recovery operation is safe. A backup during continuous remote writing may require a quiet capture window; it never freezes or overwrites the writer.

New captures above 1 MiB use `minamo-v2-checkpoint@2`: a small immutable R2 index with content-addressed immutable row pages. Checkpoint creation, verification, staging and preactivation backup process pages without materialising the cumulative corpus in the Worker isolate. Encrypted `minamo-recovery-bundle@2` streams the index, row pages and original private assets through the same authenticated framing. New small archives retain the original checkpoint/bundle v1 shapes. Existing v1 files remain readable and restorable. The bounded, non-restorable portable JSON view remains a separate small-corpus convenience.

Partial page uploads are invisible until the final immutable manifest and archive index are published. Interrupted staging is an inactive namespace with exact insert identities and can be resumed. Generation activation remains the existing guarded pointer change with an automatic complete backup and current namespace watermark CAS. No claim of an R2/D1 distributed transaction is made.

## Executed cumulative fixture

`tests/recovery-cumulative.test.mjs` created an isolated synthetic namespace containing:

- 1,500 substantive Article readings and retained canonical revisions;
- 256 distinct 16 KiB Note revisions with full historical operation response payloads;
- 1,502 current records, 1,757 retained revisions and 257 operation receipts.

It successfully created and verified a **19,202,640-byte** complete checkpoint in **44 bounded row pages**, exported and imported a **19,160,951-byte** encrypted file, restored an older small checkpoint over the large current corpus with a complete automatic backup, and restored that automatic backup into a further generation. The final Note remained revision 256 and the final Article remained readable. The latest run spent approximately **19.2 seconds** in the recovery/transfer flow; total fixture setup and validation took approximately 43.7 seconds. These timings describe local Workerd/Miniflare, not production latency.

## Authority, historical compatibility and rights

Authoritative learning Developments, immutable Development revisions, perspectives, catalogue heads and immutable catalogue revisions are included. Derived catalogue terms are excluded from authoritative archives and rebuilt after staging. Restored Development target revision/rendition/stage identities and catalogue reference destinations are validated against retained canonical editions. Unsupported/malformed new rows are rejected before a candidate can become active.

`tests/recovery-learning-catalogue.test.mjs` passed complete new-authority round-trip, old-schema file import with absent additive tables, derived index rebuilding, malformed Development target rejection, malformed catalogue target rejection, and current Source-floor intersection. Restricted evidence disappears from Development heads, retained Development revisions, dependent perspectives and nested operation readbacks in encrypted exports.

`tests/recovery-cutover-evidence.test.mjs` passed both small and paged encrypted export/import for two consequential cases:

1. An Article's frozen historical `concepts` still points at a removed old part, while the independently revisioned active catalogue is empty and a normal canonical edit has succeeded. Validation checks frozen legacy entry **shape** without treating its old destination as a current authority. Raw saved JSON and reading identity round-trip unchanged; active and historical sidecar targets retain their own exact validation.
2. A checkpoint references Note revision 1 containing a Source excerpt; Note revision 2 removes that excerpt; the Source is then revoked. Both exact per-fact Note references and global `noteRefs` are resolved against the **retained cited revision**, not the current Note. Restricted summary/facts/questions/perspective prose is withheld; independently evidenced facts can remain. The decrypted and restored learning histories contained none of the restricted synthetic text.

`tests/recovery-authority-watermark.test.mjs` passed an actual race: a catalogue-only SQL update after preactivation backup publication but before activation caused `generation_conflict`; canonical Article JSON/revision remained unchanged, the new catalogue metadata survived, and the generation pointer did not switch.

`tests/recovery-paged-assets.test.mjs` passed a paged encrypted transfer containing an attached PNG, an owned text document and 65 expired/revoked upload identities (66 image metadata rows total, beyond the former 64-row limit). Original private file bytes round-tripped exactly. An independently re-encrypted hostile page with forged geometry on an expired asset was rejected; encrypted integrity is not metadata authority.

The existing protected recovery tests passed authentication/owner isolation, old-generation rejection, exact retained reading and image bytes, bookmark off tombstones, lost-ACK recovery, interrupted immutable manifest acknowledgement, current Source/image restrictions, automatic backup rollback and safe oversized-row rejection.

## Remaining evidence boundaries

These tests use actual local Worker, D1 and R2 implementations and disposable synthetic principals. They do not prove production-specific Cloudflare quotas, production latency, hosted file-picker behaviour or physical Android interactions. Hosted release smoke must verify the deployed recovery contract without activating test recovery over genuine learner work. No full stress fixture should be inserted into the genuine learner namespace.
