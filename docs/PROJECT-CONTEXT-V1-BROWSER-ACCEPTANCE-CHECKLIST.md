# Project context v1 — later browser acceptance checklist

Run this only against a safe isolated Visual Lab or a synthetic owner account after its source/bindings/data are reconciled. Do not use or edit production or a genuine learner Project. Record build/source hash, browser, viewport, result and screenshots for each issue. This checklist is intentionally separate from automated test claims.

## Fixtures

Prepare three synthetic Projects with contrasting material:

- Japanese conversation: original exchange, learner correction, explanation, Japanese/English examples, audio/TTS if available, furigana and one practice interaction.
- Computing: question, original code, tested observation with provenance, explanation, historical/superseded implementation and continuation only if explicitly saved.
- Research/creative: sources with exact retained editions/passages, competing interpretations, correction and an unresolved question.

For each, preserve the original canonical content and record IDs/revisions before the pass.

## Viewports and core flow

Check 320, 390, 768 px and a wide desktop viewport. At each size:

- Open an existing Project with old layout/no named reading pages and confirm it remains readable without being rewritten.
- Open an organised Project; switch between the regular reader and **Explore project**; find an original passage, its explanation/practice, an exact external reference and any explicit continuation.
- Confirm source, translation and original material remain adjacent where authored; context and purpose labels are concise; no category is invented for content lacking metadata.
- Follow an exact internal source passage and exact external destination, including a retained rendition and target section/part. Confirm no source identity silently rebinds to a newer edition.
- Use browser back/forward and the return-to-last-opened control; verify it reflects actual UI navigation only and does not claim learning progress.

## Interaction and accessibility

- Keyboard-only: tab order, visible focus, reader/explore controls, subject/topic tabs, arrow/Home/End navigation, dropdowns, links, return and browser back.
- Screen reader: landmarks and names for section/topic navigation, selected tab state, meaningful order, link destination text, disabled previous/next controls and status changes.
- Check text zoom, line wrapping, long Japanese text, code blocks, tables, narrow overflow, control hit targets, contrast and reduced-motion preferences.
- In Japanese, inspect semantic ruby, translation pairing, pronunciation/TTS controls and any language activity. In computing, inspect code readability, controls and saved observation attribution. In research/creative work, ensure competing interpretations and unresolved status remain visible without flattening them into a definitive answer.
- Confirm Notes and learner contribution controls are clearly separate from GPT-authored Project content and preserve their existing user flow.

## Project authoring review

On synthetic material only, preview and apply one targeted update to an existing context. Verify added content appears on the intended page; old text, interactions, part IDs, learner contribution and prior editions remain intact; exact source/destination links open the intended passage; revision history reports the change; refresh and retry do not duplicate it. Check a wrong destination and stale revision fail with useful errors and no partial save.

## Report

For every failure, include viewport, fixture/revision, steps, expected result, actual result and screenshot. Explicitly record which browser-only behaviours were unavailable. Do not describe this checklist as completed until a human-visible browser pass has occurred.
