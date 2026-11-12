# Source excerpt continuation · 2026-10-21

Continues the V6 checkpoint and the PR #4 core-learning direction in the existing owner-private Site. Original Minamo and cyber-learning remain unchanged. No private learner artefacts or imported corpus were committed.

## Integrated behaviour

A Source can admit one exact manually supplied excerpt with immutable text, edition, locator, attribution, use basis and an explicit signed-in owner attestation. A URL alone never grants import permission. There is no remote fetching. Initial admission is an owner Web action; GPT cannot attest permission on the owner's behalf. An admitted Source keeps its identity and provenance; a new edition needs a separate Source. Display can permanently stop for that admission and export permission can only narrow. The independent Source explanation remains editable.

Readable records can reuse a bounded passage from an already admitted Source. Discovery returns bounded Source summaries, followed by an exact authenticated read. The editor shows edition, locator, attribution and permission before deliberate range/full-passage reuse. Stored UTF-16 offsets and text must match the exact current Source edition at attachment. Later reads check current permission while retaining the pinned edition. Source revision guards participate in the same D1 compare-and-set batch as the parent record and its history. Revocation during a dependent save produces an acknowledged conflict, not a partially attached passage.

Reading presents admitted words separately from original explanation, with provenance outside the selectable passage. A capture inside one reused excerpt anchors the original Source's exact `__article/__excerpt` coordinates and keeps an independently validated display return. Mixed excerpt/prose or multiple-source selections reject rather than guessing a combined original. Highlights can follow the same exact Source range across eligible display contexts. Direct/SSR capture return and GPT response links preserve both destinations without placing quoted text in URLs.

Revoked or trashed Sources stop supplying original/reused words and protected provenance through current/history/preview/context/MCP/capture projections. Independent personal prose survives. Query membership and aliases cannot reveal a revoked excerpt destination. Imported excerpt bodies and their permission metadata are deliberately excluded from literal search even while permitted; explicit Source reads supply currently eligible text. This is a conservative search boundary, not semantic retrieval.

Imported quotations and permission notes do not enter supported localStorage drafts or frozen operation payloads. An open tab can retry the identical pending payload. After reload only operation/target identity is retained for status recovery; new writes remain blocked until reconciled. Source text is reconstructed only from an exact eligible authenticated read, never from a remembered quotation. Independent authoring/annotation prose is retained separately. An unavailable quotation is withheld and cannot be saved; user writing remains editable. Browser memory already shown before a permission change cannot be recalled from an offline tab; foreground/deliberate checks and scoped invalidation revalidate active views.

## Evidence and limits

317 aggregate tests pass. The suite covers actual D1/HTTP/MCP admission, immutable provenance, owner fencing, UTF-16 boundaries, current versus retained Sources, exact original/display capture, source-change/revoke races, preview/history/query/context masking, metadata-only uncertain receipts and independent prose retention. An independent adversarial test found a revoked locator/permission-note projection leak; the fix and regression now pass. Final test/build/CI counts and source/deployment identities are recorded in the issue #1 release receipt.

Internal browser QA reviewed the 390px admission form, provenance-separated reading, whole-excerpt annotation and reload recovery. Exact Source links work with pointer and keyboard and focus the pinned original passage. Reading at 320/390/1440 CSS widths has no horizontal document overflow or hydration error. In the unauthenticated fixture the revalidation correctly returns 401: the quotation is withheld, the independent annotation draft survives, and saving remains disabled. Synthetic local checks do not demonstrate successful authenticated hosted owner admission, reuse, revocation or physical Android acceptance. Development fixtures remain production-disabled and contain only original labelled synthetic prose.

The installed MCP client may retain an older typed writer. The live server contract `.7` exposes excerpt/read/patch/source-policy shapes, but local schema changes do not establish installed-client freshness. Do not pass undeclared fields or claim that GPT independently supplied owner permission. Existing useful private records are preserved and checked after deployment.

## Remaining core work

This delivers a bounded manual source-admission and one-level excerpt reuse lifecycle, not arbitrary ingestion or a full source-document system. Full protected archive/export/generation restore remains unfinished, including enforcement of `exportAllowed` when those paths are implemented. No export capability is currently claimed by that metadata. Audio/video/document uploads, independent fresh GPT-context acceptance, successful authenticated browser admission/reuse/revocation, zoom/software-keyboard/physical-device and broader performance acceptance remain unfinished.

Continue from this checkpoint, not a new assessment or scaffold. Keep real Kali/GitHub work authoritative for practical evidence; imported reading and GPT explanation do not attest execution or learning achievement.
