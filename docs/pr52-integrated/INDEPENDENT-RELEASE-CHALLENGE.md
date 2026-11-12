# Independent integrated release challenge — 26 October 2026

This is a focused source and actual isolated-storage challenge of the integrated PR52 implementation. It is not a hosted/browser, physical-device, native-speaker or fresh-installed-MCP receipt. Root owns those release surfaces and the final exact-source full suite/build.

## Material defect found and corrected

The initial integrated Attempt writer validated current source/media rights before writing, but its atomic D1 batch pinned only the Activity revision. A source could enter Trash or an audio asset could be revoked between validation and the batch without changing that Activity. Later projections hid derived feedback, but the write itself was not fenced against that race.

The shared writer now pins the direct reading record and any underlying original excerpt permission record, as well as referenced image/media revisions, for both Activity publication and Attempt admission. Listening additionally pins a real eligible current/retained attachment witness: asset revision alone cannot detect Trash of its last owning record. A changed dependency causes the existing guarded operation to return conflict; no Attempt/history/progress is inserted. The immutable operation identity and draft retry semantics are retained. This extends the existing owner/generation/CAS mechanism and adds no persistence table or provider.

The new actual Worker/D1/R2 regression injects a concurrent mutation immediately before the write batch and verifies four distinct cases:

1. Direct source Article enters Trash.
2. The original admitted Source of an Article excerpt is revoked while the display Article revision stays unchanged.
3. Exact listening audio is revoked.
4. The last eligible owning Article of the audio enters Trash while the transcript is in a different Article and audio metadata revision stays unchanged.

All four reject the Attempt and preserve the absence of a new Run. Test grouping reports five passes including the parent. The fixtures are original synthetic content under isolated principals; no genuine record, production permission or source was mutated.

## Other focused findings

- Complete answer fields and authored explanations are removed from ordinary practice reads; exact retained rule checking and deliberate complete-answer reveal use the shared current-rights projection before raw rule lookup. Canonical practice passages expose prompts rather than answer keys.
- Response/feedback/review identities are retained under guarded updates. The existing real D1 tests exercise answer revision before delayed GPT return, exact old-target attribution, immutable retry, rejected historical rewrites, disputed-correction descendant suspension and source revocation. This review found no additional release-blocking defect in those paths.
- Actual server wiring was checked explicitly: `validateAttemptTarget` invokes scenario replay and character/listening semantic validators on every Attempt write, and recovery invokes the same function for current/retained history. A further real D1 test admits one valid trace and rejects nine malformed traces (nonexistent/wrong-state choices, spatial events in a dialogue, foreign edition, wrong block kind, out-of-range points/stroke, invented mastery and excessive events); it verifies that no Development is created. No wiring repair was necessary.
- Scenario replay admits only bounded finite authored choices or one-cell grid operations against exact scenario identity/version; it executes no callback or imported code. Character rendering accepts bounded numeric path grammar rather than SVG documents, rejects markup/URLs/nonfinite or excessive coordinates, and labels tracing/keyboard recall as interaction facts.
- Resource-quality readback operates on the already projected eligible record. Its signals are advisory structural observations, not pedagogical certification or a word-count gate; personal Notes are not expanded. Exact missing/stale named destinations have explicit findings.
- No browser runtime, real terminal, stronger GitHub authentication, speech proficiency, native-speaker review or automatic learning checkpoint is conferred by these data contracts.

## Executed validation

- `node --test tests/practice-write-authority-races.test.mjs tests/practice-domain.test.mjs tests/practice-audio-domain.test.mjs`: **15 passed**, zero failures/skips. Includes actual isolated Worker/D1/R2, licensed real speech bytes, exact source/media binding, post-write restore and the four injected races.
- `node --test tests/practice-character-scenario.test.mjs tests/resource-quality.test.mjs`: **10 passed**, zero failures/skips. Includes malicious path payloads, finite replay, seven-language rule semantics and proportionate quality feedback.
- `node --test tests/practice-interaction-admission.test.mjs`: **1 passed**, zero failures/skips; validates one accepted and nine rejected server-side interaction cases.
- `pnpm run typecheck`: passed on the integrated source after the authority repair.
- `git diff --check`: passed.

Source review and these targeted results qualify the repaired paths for final integration testing. They do not replace root's final-source tests/build, authenticated production UI, current installed catalogue, fresh producer/resumption, preservation or cleanup receipts.
