# PR30 verified findings: implementation and validation

24 October 2026. Focused implementation of the two verified P2 findings in [PR30](https://github.com/frekland/minamo-v2/pull/30). That research PR and its rejected experimental adapters remain unchanged. No optional Article-first lookup change, schema, dependency, service, learning model or genuine learner-content change is included.

## Repairs

**Rich Note lifecycle:** `app/note-writing-editor.tsx` keeps its owned rich-editor host mounted, hiding it for plain/source/fallback views. Existing identity/scope reconciliation continues owning source, histories, selection and pending images. This deliberately replaces the teardown prototype with a smaller change that avoids destroying a valid editor. The component hidden rule also covers narrow layouts. V23 detached the host while retaining its view; the corrected component has one stable host and a visible editor after formatting conversion. See [Note implementation](NOTES-IMPLEMENTATION.md).

**Cyclic corrections:** `lib/learning-work.ts` recovers committed immutable operations before inspecting bounded current ancestry. It rejects self/cyclic corrections and includes every inspected ancestor's exact revision, withdrawn state, target and edge in the existing atomic D1 claim. Concurrent preflights cannot both install opposing edges. Recovery validates current head metadata across pages and rechecks old staged generations before activation; historical revisions remain retained and valid legacy chains longer than the live 40-head write window remain recoverable. See [correction implementation](CORRECTION-IMPLEMENTATION.md).

No current-context projection or chronology code is changed; a correction without a next action still does not inherit an old one. The rejected guard-before-recovery prototype is not shipped.

## Independent challenge and automated validation

[Independent review](INDEPENDENT-REVIEW.md) found no scoped blocker. Its additional real Worker/D1 tests force a distant-ancestor race and challenge withdrawn-terminator restoration and immutable replay. The combined focused run passed 36/36; it overlaps the full suite.

The final source passed typecheck, production build and **660/660 tests**, with zero failures or skips. Ten new permanent tests cover one actual-component host invariant, six correction/recovery cases, two independent adversarial cases and a twelve-checkpoint continuity replay. The full suite ran against the completed final build; preliminary focused runs are not added to this total. A cross-request-Promise barrier initially failed in a test harness because of Worker isolation; the final barrier uses per-request polling and no failure was waived.

The graph cases exercise HTTP/MCP parity, no partial records/receipts, ordinary correction/withdrawal, payload mismatch, replay after target eligibility changes, batch-generated IDs, owner/target refusal, bounded ancestry, opposing writes, withdrawn-head races, hostile encrypted imports, cross-page validation and valid 45-head legacy recovery. The longitudinal case retains exact Note editions, old rationale, deferred evidence, stale cursors, Trash/restore and honest correction-only continuation.

## Actual browser checks before release

The managed preview needed its supported local execution-profile configuration refreshed before serving. No product or network-policy workaround was introduced. Browser inspection then exercised the production `NoteWritingEditor` in the framework and the complete Notes workspace:

- Edited rich text and a nonempty selection survived rich → plain → enable-format → rich switching. Plain `**literal**` and backticks remained literal. One rich editor was visible after conversion; switching/initialization emitted no extra source writes.
- The original rich Note's undo/redo remained independent, and exact code bytes and the image placement marker survived. Memory retained the selected range (anchor 34/head 33 in this fixture). Component unmount/reopen, repeated switching, source fallback, minimise/restore and isolated scope clearing were inspected.
- In the actual workspace, an unauthenticated save was genuinely refused. The UI labelled it as refused, retained the exact Unicode draft, and restored it after minimise and full reload. This is rejection/draft evidence, not an acknowledged production save or simulated network timeout.
- At 390 × 844 CSS pixels the actual Notes sheet kept formatting controls, draft and actionable save refusal visible. [Browser screenshot](narrow-rejected-save.jpg). This is responsive browser evidence only.

The development-only `/preview-notes` route has the same production not-found guard as existing previews. Its source/write/memory receipts aid replay; it has no account or fake save acknowledgement. Installed MCP, authenticated browser autosave/image and narrow hosted acceptance are performed after deployment and recorded in the implementation PR's final receipt, together with exact release and cleanup identities. A local component fixture is not substituted for those gates.

## Durable evaluation material

`tests/fixtures/pr30` retains the five scripted project histories, compact original Python/Node/SQL/loopback specimens and evaluator-only truth/rubric. Nine Python tests, eight Node assertions, SQLite checks and four loopback HTTP checks passed. See [usage and provenance](../../tests/fixtures/pr30/README.md).

The frozen tutor conditions, comparisons and 19 original responses remain retrievable at PR30's pinned research commit rather than being copied with its generated logs/screenshots/adapters into this release. Permanent tests assert the corrected product contract; historical V23 defect expectations remain historical. This is no new simulation subsystem.

## Limits

Responsive browser viewports do not establish physical Android acceptance. Existing editor memory does not promise per-Note restoration of the surrounding `.rn-note-body` scroll container, and the OS textarea undo stack is not converted into ProseMirror history. The stable host preserves existing rich state ownership rather than adding either feature. A full reload still requires reselecting unsaved image bytes under the existing contract. Live ancestry validation has an actionable 40-head write bound; recovery preserves valid longer legacy chains. No human learning gains are claimed.

The implementation PR conversation/description is authoritative for merge, native source/tree, saved release, deployment, live MCP/browser acceptance and synthetic cleanup receipts; those post-release facts are not fabricated in this pre-release source document.
