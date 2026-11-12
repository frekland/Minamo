# Integrated workspace release — 21 October 2026

Commission: frekland/minamo-v2 issue #1. This is a substantial implementation checkpoint, **not complete fulfilment of the entire intended scope**. Original Minamo and cyber-learning were not modified.

## Delivered

Persistent responsive charcoal React workspace; visible search over title, body, article sections, code/results and eligible captured text; Home separates personal work from editorial changes; Journeys and multi-parent Investigations; curated knowledge areas, authored Library reading and attributed link-only sources; deliberate rich article/collection/record authoring; status choices; unified Notes/Annotations/Flags/Runs organiser and recoverable Trash.

Notes have contextual/removable links or deliberate independence, owner-scoped retained drafts, debounced acknowledged saves through one command path, CAS conflict review, same-operation uncertain recovery and dock/focus/collapse/minimise/close/reopen controls. Article reading maps canonical title, introduction, headings and ordered body/code parts to content-hashed retained renditions, exact UTF-16 multi-part captures, annotations/Flags and honest retained-edition return. Diagrams render safe flow boxes with textual source and enlargement; code copy chrome stays outside mapped text.

CodeMirror editors integrate actual Pyodide Python, SQLite, JavaScript regex, Unicode and finite Web DOM experiments. Tool runtime ownership survives ordinary route changes. Execution is distinct from storing a Run. Captured output/input and synthetic/observed provenance persist through the shared domain. GPT cannot relabel synthetic/fabricated changes as a genuine observed Run.

Typed MCP workspace/read/query/context/preview/apply/status tools use the same server validation, owner identity, revision guards, operation receipts and eligible records as HTTP. The previous read-only foundation probe remains supported.

## Verification

- TypeScript and the exact Worker/client/SSR/RSC build pass.
- 77 automated checks pass: real local D1/R2 handlers, exact compiled Worker, shared API/MCP records, concurrency/idempotency, source admission limits, Trash/restore, metadata-only receipt recovery, Unicode/surrogate/multi-part/rendition identity and actual engine packages.
- Production dependency audit after patched Next16.3.8 and transitive updates: zero known reported vulnerabilities. This is the audit result at the checkpoint, not a permanent security guarantee.
- Real desktop browser inspection of synthetic development-only fixture: Home → Journey → Investigation with two real memberships → Library reading; exact passage actions → annotation editor; Notes open/dock/focus/collapse/close, retained Unicode draft across navigation; unauthenticated autosave rejected with full draft retained rather than fake Saved.
- Actual browser engines: Python returned Values12/18/24, mean18.0 and café UTF-8 bytes; SQLite produced rows12/18/NULL and mean15; regex returned real match offsets; Unicode reported UTF-16/codepoint/UTF-8 distinctions; Web button changed count0→1 with actual captured DOM/console.
- Actual 390×844 iframe viewport (373 CSS content width excluding scrollbar): responsive menu, Library/Unicode reading, Notes opening/collapse via Enter; measured document width equalled viewport width. This is a real narrow browser viewport, **not Android emulation or physical-device/TalkBack acceptance**.
- Browser startup defects found and fixed: HTTP preview lacked crypto.randomUUID; fallback uses crypto.getRandomValues; opaque iframe external-controller startup failed; nonce-authorised trusted srcdoc controllers now start without adding same-origin or network permissions. Mobile New accessible name/offscreen navigation focus and article-section search were corrected.
- Browser console showed extension metadata errors unrelated to app execution; no app hydration error observed in inspected captures. This is not exhaustive console coverage.

Development fixtures never grant API identity; authenticated writes are verified in compiled local tests, while fixture saves are rejected. Both fixture routes return404 in compiled production tests. No hosted test records were created or genuine records imported by this run.

## Hosted acceptance and source evidence

Native/GitHub source identities, CI and private deployment receipt are recorded after publication. The installed existing V2 MCP probe successfully read its own hosted D1 at the start. Final expanded client-visible catalogue/invocation, browser-authenticated create/save/reload, cross-version hosted D1/R2 readback and physical-device acceptance must not be inferred from local tests or deployment success.

## Remaining functionality, ordered

1. Complete hosted authenticated web/MCP write/readback acceptance using the expanded connected tool catalogue; check client-visible schema refresh independently of hosted tools/list.
2. Extend canonical exact reading beyond authored article fields to Journey/Investigation/Note/Run and admitted external source renditions. Existing authored-article captures are durable; do not silently retarget them.
3. Implement explicit source-excerpt admission and ongoing permissions/provenance, richer canonical command/function/reference metadata and section-pinned code references. Current source URLs/rights are validated; unadmitted excerpts are rejected.
4. Implement protected full archive/generation rollback/recovery, separate from current record revision history, recoverable Trash and save-operation receipts. No original recovery identity was copied.
5. Add paged large-corpus retrieval beyond the current300-record/2MB snapshot bounds, broader authoring/history controls and V2 file-upload workflow.
6. Physical Android/touch/TalkBack, wider browser/accessibility and end-to-end teaching validation remain.

The next bounded implementation task is hosted write/catalogue acceptance plus non-article exact rendition mapping. The active issue stays open; this release is independently buildable and resumable, not a declaration that every intended feature is finished.
