# Authoring and selective handoff acceptance — 26 October 2026

Implemented against native V30 source `733b6384b47c328346824d6f6c13ecc75a40cd4f`, corresponding to GitHub main `4c54689e17d288b81496c84f9d5f383790811cda` / tree `c99c0257d57db68b44eacdaf4afdc6f2bdb3b992`. This document records local compiled Worker/D1 evidence only. Production acceptance and installed-client refresh need the release receipt.

## Changed behavior

- Manuscript documents accept explicit `learningScope`; shared domain validation handles canonical packages and commands. Wording-only manuscript revisions preserve existing metadata when the field is omitted. Invalid language tags return an exact document/language path.
- BND-001/005: `catalogue_area_unresolved` identifies `manuscript.documents[i].catalogue.areas[j].ref` and explains both the exact `area:id` reference and the required revision-bound `existing` declaration. A declared bare ID gets its exact corrected literal. No title lookup, permission bypass or automatic revision inference is introduced.
- The normal editorial policy supplies a complete copyable existing-Area manuscript request, explicit Japanese/Mandarin/French semantic fences, source/subject/locale distinctions and a selective GPT session-handoff recipe. Existing policy version remains compatible; safe guidance additions do not invalidate old inspected proposals.
- BND-006/007: a top-level `presentation` gets a direct move-to-`activity.presentation` error; unsupported block slots list the exact allowed slots. The capability catalogue returns all 13 complete nested template examples and source/slot compatibility. Every example uses inert supplied source, never execution authority.
- BND-002/003 remain advisories. Coverage guidance now explicitly distinguishes prior query history from package-bound exact inspected references. Shared guidance belongs in the overview; each stage should describe its actual task rather than repeat administrative scaffolding.
- New practical view admission validates the exact source under the selected static view, in addition to existing registry/hash validation.

## Executed checks

`node --test tests/pr49-authoring-handoff.test.mjs` exercises actual compiled MCP handlers and disposable D1/R2 with synthetic principals:

1. Read-only discussion/guidance leaves records, revisions, operations, activity and Developments unchanged.
2. Existing-Area malformed forms reproduce the rejection and improved path/help. The complete recipe validates on its first correctly populated preview; an Article publishes into the previously created exact Area without lookup retries. The field study historically reported three failing/correcting preflights for this interaction; these local intentional rejection probes are separate test calls, not a claim about production success rates.
3. Japanese classification survives publication and omission during a later wording revision; an unknown `jp` tag is rejected with a precise language path.
4. An explicitly authorised synthetic resource + one personal Note saves separate evidence/interpretation/uncertainty/next intention. Exact readback agrees, immutable retry replays without duplicate records, a fresh authenticated client discovers the scoped Note, and Developments remain zero. This is a fresh client test, not a separate independent GPT or genuine learner session.
5. All three task-owned records enter recoverable Trash, leaving no active synthetic records and no checkpoint. Nothing is permanently deleted.
6. All 13 returned presentation packages preflight successfully without writes. Top-level presentation and hint-in-supporting-slot failures return targeted diagnostics.
7. All three language-fence examples compile as exact semantic base text with authored-translation provenance; none falls back to a code block and no source is persisted by preview.

Inherited targeted regression run: 20 tests passed across Activity capability examples, future authoring guidance, manuscript catalogue, large-envelope and publication/CAS/source-history tests. Typecheck passed after integration of parallel edits.

## Explicit limits

The protocol retains separate guarded resource/Note/checkpoint operations. It does not claim atomic all-or-nothing session saving. Uncertain outcomes use exact operation lookup or immutable retry. No Live audio, transcript, acoustic measurement, pronunciation grading, learner attainment or new formal checkpoint is inferred. Hardware, authentic owner session, independent new-GPT continuation and hosted browser acceptance remain separate release evidence.
