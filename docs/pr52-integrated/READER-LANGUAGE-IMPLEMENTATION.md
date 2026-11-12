# Shared Reader and language assistance

The shared Workspace header now owns the Learning Space selector and its conditional study-language control alongside search and view selection. The former full-width selector band is removed. A responsive arrangement keeps the same selector owner and scope-switching callbacks; it does not remount Notes or change pending-command identity. At constrained widths the controls wrap within the header.

Ordinary reading headings, paragraphs and rich-content wrappers no longer have a persistent focus-selection role. Exact navigation gives its destination temporary programmatic focus and removes that temporary tabindex; no selected-card outline is applied to prose. Actual links, buttons, saved marks, expandable details and scrollable table regions keep their visible keyboard focus. The global whole-passage picker and its selection handler have been removed. Native source-exact selection, copying and contextual Flag/Annotate remain under the existing Reader authority.

Sections navigation occupies normal flow. The shared layouts use one visible section navigation control when the outer Reader navigation exists, with the inner contents list retained for embedded readings without an outer control. A static reserved flow prevents the previous sticky Sections row from crossing article text. Section anchors have a small scroll margin within the actual independently scrolled main pane. Desktop padding is reduced, prose retains a bounded measure, and code/tables/diagrams can use the wider reading pane. Reference-result actions sit beside one another beneath the explanation rather than being distributed to the far edge.

## Source-exact language interaction

Existing canonical ruby passages now expose deliberate word help, independent reading reveal, contextual reading/gloss/grammar/provenance cards and exact-expression selection for the existing Flag/Annotate interaction. Source text remains ordinary selectable text; assistance controls are outside canonical capture containers. Closing a word card returns focus to its real trigger. There is no default click-to-select behavior on every word.

`LanguageText` accepts an optional independent `phrases` layer. Each phrase declares an exact original base/range and explanation, with an optional independently validated translation range. Phrase ranges may overlap ruby words and other phrases without changing the nonoverlapping ruby contract. The Reader highlights the source expression and the corresponding translated expression. No word-for-word equivalence is inferred. Span metadata may optionally carry `lemma` and `senseId`; these fields are admitted and exposed in the complete semantic public schema.

The ordinary word card retrieves current eligible records through the existing paged authenticated query. Corpus examples require exact language, script, written form, reading and declared sense/gloss identity. Each repeated occurrence keeps its own original offsets and retained-edition link. Trashed, unavailable, source-excerpt, stale-base, unannotated and different-sense records do not become equivalent examples. The page explicitly distinguishes a checked page from complete corpus coverage and offers continuation. Requests are cancelled on scope/source changes; prior example results are cleared when a source becomes unavailable or the page is hidden.

Optional recall and TSV export are available directly in the canonical Reader. Recall is ephemeral and creates no Attempt, checkpoint, review event or proficiency claim. Export preserves authored metadata and neutralizes spreadsheet formula prefixes. New practice Attempt persistence remains the separate shared practice-domain workflow.

## Validation and limits

- Six new semantic/corpus tests cover overlapping phrase layers, malformed/Unicode/translation ranges, identity separation, exact retained links, rights/Trash/stale rejection and repeated occurrences.
- Reader interaction and semantic rendering checks pass, including native source-map fallback, retained draft/uncertain-save semantics, saved mark controls and removed ordinary prose focus/passage pickers. The combined targeted Reader/semantic/corpus command passed 20 tests.
- Existing language domain/platform/core tests passed 28 tests, including actual isolated D1/MCP/capture admission and retained source rights.
- Integrated TypeScript typecheck passed after all shared modules were present.
- Authenticated hosted geometry, selection, Notes and responsive browser evidence is recorded by the release owner separately. These tests do not claim physical Windows/Pixel, IME, screen-reader or native-speaker acceptance.

No dictionary bundle or new external inference service enters default boot. The corpus is an exact authored occurrence tool, not automatic semantic search or a complete dictionary. Optional phrase alignment and lexical identity remain authored teaching metadata rather than a linguistic certification.

## Authorised permanent reference revision

Two pre-existing thin technical Articles were enriched in place through installed ordinary manuscript preview/publication. The exact targets/revisions were read first; both original Area memberships and all five reference identities were retained. Command destinations now reach substantial specifically named pwd/ls/stat and grep/find sections. Their previous exact editions were read back successfully after publication, independently of the revised current editions. The owner-private metadata ledger and original drafts remain outside the source repository.

Both references include original explanatory progression, harmless runnable Bash specimens, output interpretation, counterexamples, implementation distinctions, diagrams and primary GNU documentation links. Eleven runnable specimens/explicit continuation fragments executed successfully in the synthetic container using Bash 5.2.21, GNU grep 3.11, GNU findutils 4.9.0 and GNU Coreutils 9.4. This is engineering verification of authored examples, not execution evidence from a learner's real machine or Bandit progress.
