# PR #12 — phase 0: exact code paths and first read-only discovery slice

**Status:** Source audit and implementation entry points; performed in an ordinary ChatGPT conversation against GitHub `main` and authenticated, read-only Minamo MCP, 2026-11-13. **No runtime implementation, tests, deployment or live data writes are claimed here.**

**Source assumption supplied by owner:** GitHub is current and aligned with production. Use GitHub `main` as the starting implementation baseline; verify branch diffs before changing code, but do not make a costly Sites-to-GitHub reconciliation the default first task.

**Primary design:** [MINAMO-ACCUMULATION-AND-COMPOSITION-RFC.md](MINAMO-ACCUMULATION-AND-COMPOSITION-RFC.md). This audit narrows the first code slice, rather than revisiting product metaphors.

## 1. Existing working primitives

| Code path | Verified role | Implication |
|---|---|---|
| `lib/contracts.ts` | `WorkspaceRecord`: owner-scoped records, revisions, renditions, typed `sections[].parts[]`, rich interactive parts, exact references, `createdAt/updatedAt` | Preserve canonical source records; don't duplicate material into new pages |
| `lib/domain.ts` `readRecord`, `readRendition`, `readRecordRevision`, `readContext` | Projects currently eligible source material, resolves current and retained revisions and source rights | Arrangements must reuse the same read-time rights/edition fences, not trust raw client-supplied refs |
| `lib/domain.ts` `queryRecords` / `eligibleRecordQuery` | Bounded, cursor-based record-level discovery with owner/scope filters, rights projection and literal match evidence | Good candidate-discovery foundation, but inadequate for cross-record **per-passage** discovery at multi-year scale |
| `lib/search-evidence.ts` | `canonicalReadingParts` yields rich canonical passages and searchable fields; one `recordSearchEvidence` explanation selected per record | Reuse match evidence rules and UTF-16 coordinates. Extend to bounded multiple passage hits, not a second independent search definition |
| `lib/learning-spaces.ts` | Independent broad space/language/subject metadata and owner-scoped matching | Useful filter, not mandatory or exhaustive classification |
| `lib/project-composition.ts`, `lib/project-learning-map.ts` | Exact, validated Project-only page/part placement and context projection | Reuse identity/validation principles; don't force the existing single-Project composition schema onto cross-record arrangements |
| `app/reader.tsx` `RichReadingPart` | Preserves Japanese displays, diagrams, tables, interactive components, source metadata and canonical selection | Reuse safely with parent-record context; avoid duplicate `passage-<section>-<part>` DOM IDs in a multi-source view |
| `lib/project-interactive.ts` | Typed `flashcards.cards[].id`, `language-dialogue.turns[].id`, `language-pattern.examples[].id` | Nested items can be discovered by exact *local* IDs; do not mistake them for globally durable identities independent of their containing record/rendition |

## 2. Current discovery's concrete scaling boundary

`lib/domain.ts` `eligibleRecordQuery`:

1. Selects a page of **at most 600 record candidates** (updatedAt order) with a **2 MB raw-record scan window**, scoped by owner, learning space and optional filters. Cursor continuation is supported.
2. Projects **each** candidate through `projectRecord` to enforce current rights, then applies literal matching using `recordSearchEvidence`. The operation is bounded and safe, but repeated broad searches can scan many unrelated records across several pages.
3. Returns matching **records** and match evidence. `recordSearchEvidence` chooses one explanation per record; the caller doesn't receive a ranked list of every relevant passage or nested interactive example.
4. `sourceCandidates` searches `canonicalReadingParts(record)`, but an interactive part's canonical `text` is generally a short description of its component. Nested flashcard fronts/backs and dialogue turns are **not** independently searchable there.
5. Retrieval uses actual permitted source projections; SQL prefiltering alone must never establish permission or leak snippets, and any future derived index needs permission invalidation/repair and read-time validation.

**Result:** Existing search should be a baseline and safety reference, not discarded. It is insufficient as the finished discovery path for multi-year, multi-source composition. Optimise by measuring real usage and then adding the smallest rights-safe indexed candidate layer proven necessary.

## 3. Direct MCP evidence that existing pieces can be reused across Projects

The canonical passages and nested items already hold useful material. In a *read-only developer inspection*, searching the two eligible Japanese Projects for **聴く** located:

- `Making Friends`: the owner's original long music answer, its grammatical explanation, a spontaneous incorrect `惹く` attempt with correction to `弾いたり、音楽を聴いたりします`, further original usage and a contrast table.
- `Japanese Speaking Practice`: multiple individual flashcards, a grammar explanation, a comprehension reveal, a dialogue turn and vocabulary.

These are not equivalent types of content. A naïve document reader, one-match-per-record search or giant combined transcript would be a poor first experience. A useful composition could bring the owner's attempt/correction together with grammar and selected practice **without moving or rewriting the originals**, if it can discover the correct source passages reliably and represent their roles honestly.

MCP content was inspected read-only. The owner subsequently authorised public use of Minamo learning material in a reproducible GitHub test corpus; see [the real-corpus development harness](MINAMO-REAL-CORPUS-DEVELOPMENT-HARNESS.md). This audit itself remains a focused code-path summary. No live Project was edited.

## 4. Updated execution sequence: reproducible corpus before implementation

First create the versioned representative real-content fixture and isolated local D1/R2 loader per [the authoritative harness contract](MINAMO-REAL-CORPUS-DEVELOPMENT-HARNESS.md). Use existing MCP reads for extraction and refresh; test against snapshots locally. The current code seams below remain valid investigation inputs, but are **not** a mandate to ship the first discovery API before challenging architectural alternatives or checking the frontend experience.

## 5. First concrete engineering slice after architectural comparison

Implement a **read-only candidate extraction and source-selection path** before inventing new persistence or a global navigation change.

1. **Extract a bounded source candidate projection** from *already rights-filtered* current/retained `WorkspaceRecord` reads. Include exact `family/id/rendition/sectionId/partId`, text kind, parent titles and relevant local nested item ID/type when available. Never send raw unprojected database JSON to the client/model.
2. **Retain source/derived distinctions:** don't automatically assign 'learner-authored' or 'mistake' merely because a paragraph contains those words. Explicit `provenance` is scarce in existing Projects; omit or return 'unknown' when absent. A later owner-authorised capture contract can provide better structured metadata going forward.
3. **Make multiple passage candidates available per record**, with bounded snippets/size, exact references and explicit result continuation. Validate source rights on retrieval. The first approach can reuse `search-evidence.ts` match rules; benchmark it before deciding whether a derived D1 index is necessary.
4. **Cover typed subitems** (flashcard cards/front and back, dialogue turns, pattern examples, reveals) for search without falsely promoting local subitem IDs to independent canonical destinations. A selected nested item initially resolves to its containing canonical interactive part, with an optional local member key for the reader where safe.
5. **Prove cross-record selection** of authentic original, explanation and generated practice using the two existing Japanese Projects, without duplicating either.
6. **Build a minimal safe renderer** around exact selected sources. Existing `RichReadingPart` needs a multi-source DOM ID and interaction/selection strategy; avoid simply mounting multiple full `Reader` instances.
7. **Implement tests in the repository** using its Node tests and esbuild strategy: exact matching, nested results, permissions, hidden/unavailable parts, source change, duplicate local IDs across records, determinism, pagination and bounded candidate count. Run typecheck, focused tests and build when the environment permits.

### Working constraints

- No new paid inference, model call per render, automatic chat capture, generated progress or author-defined fixed section templates.
- No live changes to `Making Friends`, `Japanese Speaking Practice` or learner Notes.
- Build on PR #12's branch, using current GitHub source. Keep the PR draft/unmerged. Do not deploy an unverified UI or change production navigation merely to demo the architecture.
- A prototype that manually hardcodes two Project IDs is **not** evidence of a scalable discovery system. Use them for *acceptance*, not as the production corpus selector.

## 6. Explicit next validation

The first successful increment will produce a bounded set of **real cross-record passage/subitem candidates** and a stable, readable arrangement using them, with accurate source links and attributions. It should make a previously attempted Japanese example findable alongside related explanations and practice.

Then measure whether retrieval remains bounded against synthetic 100/1,000/10,000/50,000-part datasets. If the current record-query scan cannot satisfy those requirements, introduce an incremental derived passage index with current-source eligibility checks and a rebuild strategy. Do not make the storage choice ahead of evidence.

This is the practical path from the current architecture to PR #12 without recreating the whole product or relying on a magical learner-understanding model.
