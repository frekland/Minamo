# PR #80 — independent product scope review

**Review date:** 3 November 2026  
**Inspected PR head:** `d3b94071f11a4dc97dc130ea457cc8d9ce398bb9`  
**Verdict:** Ready to commission implementation, with the first two points resolved as early implementation decisions before the first candidate is presented as usable. They do not require another research phase or a different architecture.

## Basis and limits

Reviewed [PR #80](https://github.com/frekland/Minamo/pull/80), its [agent guidance](https://github.com/frekland/Minamo/blob/d3b94071f11a4dc97dc130ea457cc8d9ce398bb9/AGENTS.md), [brief](https://github.com/frekland/Minamo/blob/d3b94071f11a4dc97dc130ea457cc8d9ce398bb9/docs/PROJECT-COMPOSITION-DESIGN-BRIEF-2026-11-03.md) and [blueprint](https://github.com/frekland/Minamo/blob/d3b94071f11a4dc97dc130ea457cc8d9ce398bb9/docs/PROJECT-COMPOSITION-IMPLEMENTATION-BLUEPRINT.md), and the descriptions of superseded [#78](https://github.com/frekland/Minamo/pull/78) and [#79](https://github.com/frekland/Minamo/pull/79). In the authenticated cloud browser I inspected the restored Site's Home, Projects directory and Bandit Phase II Project structure, then visually examined desktop screenshots of that Project, its Bandit 10→11 Step and the open Notes dock. This was a read-only inspection, not a test of the proposed implementation, mobile assessment or a claim of owner acceptance.

The existing Project displayed record management, Related context and an empty bounded-scan panel before a list of authored Steps. The directory also displayed synthetic Projects. The desktop screenshot shows that empty scan explanation above the Steps, with management actions at the top. On the Step, task controls and navigation precede the title, the authored Checkpoint instruction appears in the lesson, and an empty Recent work area occupies a side column. Opening the Notes dock covered much of the lesson at the observed desktop viewport, although the dock is resizable and this single view does not establish its behaviour at other sizes. These observations support the PR's content-first and chrome-reduction requirements; preserve a practical reading area when Notes is open, using the existing resizable dock rather than inventing another interface. They do not justify redesigning Home or the directory in this commission. PR #78 itself records that technically valid records remained fragmented behind wrappers, while #79 records the owner's correction that natural GPT/MCP continuity already works. The current direction responds to both.

## 1. Existing Projects need a defined useful first rendering — candidate blocker

**Decision and evidence.** The brief requires inline real content and preservation of old Project/Step links; the blueprint specifies a new versioned composition and lists compatibility with older Project routes as an open decision. It does not say what a Project with no composition shows on the first candidate, or how its existing authored introduction and Steps become usable in the new surface. The live Bandit Project is such an existing structured learning resource, not a blank new Project.

**Why it matters.** A working GPT-created demonstration could coexist with the old wrapper on existing work, or an empty new composition could conceal material. Either outcome would repeat the gap between a technically correct new layer and a better everyday learning experience. This is a specification gap, not evidence that the implementation will necessarily fail.

**Smallest correction.** Specify a non-destructive default for a Project without a composition: retain access to its existing authored introduction and Steps in a content-first presentation, without requiring a migration or a GPT rewrite. On an explicit GPT update, add or initialise composition using eligible material while retaining original editions and deep links. Do not imply all historical Notes have been found. Implementers can choose a simple adapter or fallback after inspecting the source.

## 2. Define what “preserve direct edits” means for the next ordinary update — candidate blocker

**Decision and evidence.** The brief says direct edits take precedence and routine updates consolidate existing work; the blueprint says edits are automatically preserved but also that a request to replace an edited or locked block should be explicit. It leaves the interaction when GPT wants to update a directly edited block unspecified. A layout lock has separate, explicit semantics.

**Why it matters.** Treating every edited block as permanently frozen makes “Update Minamo” progressively less useful; treating it as freely replaceable risks losing the learner's words. Prompting for each ordinary change would turn natural conversation into a review ceremony.

**Smallest correction.** State a simple default: preserve the learner's edited text and placement during routine updates; GPT may add or update other content around it. When a requested change actually requires replacing that text, ask once in natural language or use an explicitly authorised edit; report a revision conflict rather than silently overwriting concurrent work. An explicit request to revise that particular content remains possible. This is a conflict rule, not a new visible lock system.

## 3. Resolve the Board's implied direct rearrangement controls — optional refinement

**Decision and evidence.** The brief describes Board cards as “movable/grouped,” and the blueprint calls for scan/reorder with an accessible alternative to drag. Both also prohibit initial per-block move controls and assign broader rearrangement to GPT.

**Why it matters.** An implementer could infer a drag-and-drop board and keyboard reordering subsystem, adding controls and complexity that the chosen minimal editing model otherwise excludes. Conversely, a static list dressed as a Board could fail to provide a distinct useful pattern.

**Smallest correction.** Clarify that initial Board grouping and order are composed by GPT, with accessible reading and direct content editing; no learner drag/reorder controls are required in this release. Keep distinct grouped visual presentation and mobile reading order. If direct rearrangement is intentionally desired, state that as a narrow exception instead.

## 4. Keep historical pins and linked sources from becoming mandatory furniture — optional refinement

**Decision and evidence.** The brief asks for a discreet page indicator and dock discovery of pinned Notes, while the blueprint also requires Note-to-page relationships, exact identities and MCP readback. These are useful explicit associations, not the retired task pin. The live Project's Related context and empty Recorded work demonstrate how quickly contextual information can compete with the learning material.

**Why it matters.** A technically complete relationship model could invite permanent destination lists or empty context panels on every Project, recreating the surface problem despite different data underneath.

**Smallest correction.** Retain the requested pin behaviour and MCP access, but make the page indicator conditional on eligible pinned Notes and keep the destination list inside the dock on demand. Do not render an empty pin panel, duplicate Note body, or automatic related-record list merely because the relationships exist.

## Conclusion

The selected direction is coherent and substantially more disciplined than the retired designs: one natural conversational update, actual inline content, six native patterns, limited direct editing, persistent Notes and optional images. The two candidate blockers are bounded implementation clarifications, not reasons to rewrite the PR or delay starting development. Resolve them during the first implementation pass and judge the candidate by the actual Project content and GPT loop, rather than schema correctness alone. Home and Projects directory design remain explicitly deferred.
