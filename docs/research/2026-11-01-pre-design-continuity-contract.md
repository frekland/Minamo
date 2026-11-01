# Proposed read-only, source-attributed learner-continuity contract

**Status: proposed projection/UX test contract, not a persistent state model or accepted GPT summary.** Parent [independent audit](2026-11-01-independent-pre-design-audit.md), [five-question ledger](2026-11-01-connected-episode-ledger-and-divergent-interactions.md), [root-cause audit](2026-11-01-project-stage-continuity-root-cause-audit.md), [issue #51](https://github.com/frekland/Minamo/issues/51).

The owner requires **five truthful questions**, not five reassuring generated sentences. Source attribution and unknowns are part of the answer. A Project may be relevant but is never a prerequisite: direct Note, Article, Activity and Question sources are first-class.

## Data and attribution contract C0 (proposed)

Read only, scoped to a specified authorised learner, as-of read time, optional Project/Question/Article/Activity context and an explicit bounded traversal. No persistent “CurrentConcern” entity is required for v0.

Each returned **evidence item** has:
- Stable source: family, opaque record identity, recorded relation kind, owning scope, exact revision/rendition/edition, author/origin (learner writing, authored lesson, GPT proposal, test artifact, independently observed result), created/updated/observed timestamps and canonical resolver/deep link.
- Extract: small, rights-safe quotation or faithful paraphrase, distinction between reported action, planned action, hypothesis, observed test and assessed outcome; claim context and temporal qualifiers.
- Provenance: selected source path (e.g. Project → Stage → Question → Note versus Note → linked Question), relationship certainty (explicit canonical link, contextual adjacency, lexical suggestion), retrieval method/cursor, rights checked as-of, and whether source superseded, challenged, confirmed or merely followed an older claim.
- Claim status: *recorded*, *learner reported*, *tested/verified independently*, *provisional*, *contradicted*, *withdrawn*, *GPT suggested*, or *unknown*. These are labels for presentation, not persisted learner state; independently verified requires a test artifact/observation, not the existence of a code snippet or a confident statement.
- Competing-evidence group: retain multiple candidates and their original words when chronology, target or intent conflicts. Do not collapse multiple concerns into one “next step”.

Each **coverage envelope** has asOf time; top-level scope and traversed relation families; explicit maxima/window; counts returned, skipped, denied and possibly omitted when calculable; cursor/moreAvailable/partial/truncated flags; quality of identity match; source availability, and missing coverage (e.g. Activities not fetched, external context not inspected). “No item found” is **not** “none exists” when any pertinent coverage is partial, cursor unconsumed, rights uncertain or link graph non-transitive.

Each of the five **answer slots** has a short learner-facing answer, basis references, qualifiers, competing candidates, unresolved/unknown flag and suggested user action (which can be none). Link may be absent under rights restrictions. Render no private record IDs in public telemetry or handoff. A direct learner confirmation is an **explicit action with identity and source**, not a GPT interpretation of silence or recency.

### Five questions and deterministic guarantees

| Question | Read-only projection can establish | GPT may propose for review; never silently assert |
|---|---|---|
| 1. Last work | Most recent *eligible, authorised, actually returned* learner-authored Note/Activity/checkpoint/change, revision and relation path; where it appeared. An older formal checkpoint can coexist. | Explain what was being attempted or why it matters; ask whether an unlinked recent Note belongs to this concern. |
| 2. Next intention | Exact explicit next-action wording from learner Note or checkpoint, dated/ranked but not overwritten, with contradictions shown. | Draft a feasible next action based on constraints; request learner choice between competing plans. |
| 3. Unresolved problems | Explicit open questions, blockers, failed observations, status claims, later closure evidence if any; mark coverage uncertainty. | Cluster semantically related blockers, suggest a check or triage; cannot declare resolved from absence. |
| 4. Changed beliefs | Source pairs and revisions that explicitly contradict, revise or challenge a claim, including old/new meaning and certainty. | Describe an apparent misconception revision, ask learner if it is a settled correction. |
| 5. Progress | Trace actual new artifact/revision, independently observed outcome, learner-reported test, new constraint understanding; distinguish completion from movement. | Explain *potential* significance; no stage-count or checkpoint existence promoted to achievement. |

**Ranking is not truth.** Last-edited date selects *recent evidence*, not automatically *current intention*, accomplishment or resolved belief. Prefer explicit dated learner statements over GPT interpretation; keep verified test results distinct from author self-report; a checkpoint is a historically signed claim, not automatic latest truth. Older evidence remains inspectable. On source deletion, edition drift, permission change or missing membership, re-evaluate and safely degrade; never use cached inaccessible content in generated continuity.

## Proposed read-only projection pipeline

1. Resolve the authorised learner and optional focus; establish asOf, rights and exact record IDs/revisions. Do not infer from a display title (many TEST ONLY variants reuse Project names).
2. Obtain bounded direct Project/Stage/Question, Note/task edges, Activity/source Article links, checkpoint, revision/readback and relevant context; record *each traversal boundary*. Existing [lib/project-context.ts](../../lib/project-context.ts), [lib/learning-work.ts](../../lib/learning-work.ts), [lib/note-capture-context.ts](../../lib/note-capture-context.ts), [lib/layout-workspace.ts](../../lib/layout-workspace.ts) and Minamo context retrieval are candidate components, not one integrated guarantee.
3. Collect known source-backed candidate claims; label as explicit/lexical and reported/verified. Associate old and revised claims only with supported identity/semantics; a text diff is not sufficient to infer corrected belief.
4. Return the five slots **plus gaps**, including multiple simultaneous concerns and conflicts. A candidate from a multi-task Note may appear in more than one context with its full edge provenance; avoid assigning it to an arbitrary primary Project.
5. Optional GPT works on a visible, bounded, access-checked selection; emits proposals/quotes/uncertainty with source links and revision pins. Learner explicitly chooses whether to save a Note, edit a checkpoint, change links or discard. Subsequent readback verifies the chosen write; there is no automatic background promotion.

Projection must be testable without GPT. GPT's useful contribution is semantic synthesis and options, not database truth, permissions, hidden completeness or event creation. A simpler “recent Notes + pinned intention + linked source” could be sufficient; evaluate latency, error and learner cognitive overhead before adding a new state model.

## Synthetic example outputs — *illustrative contract, not live application responses*

The evidence comes from **registered TEST ONLY snapshots** described in the [ledger](2026-11-01-connected-episode-ledger-and-divergent-interactions.md); no fixture was replayed or mutated here. Dates below are source narrative/recorded chronology, not proof of simulated execution. Sample source aliases are descriptive **not canonical IDs**; a real API response must supply exact IDs and revisions privately.

### Mood-to-Music K, changed privacy direction

- **Last work:** “The revised scratch-plan Note, revision 2, recorded after the S03/H checkpoint, discusses a reported v5 refresh and an unverified v7 retest.” Basis: learner-authored Note rev 2, Oct 30 19:23 UTC; older S03/H checkpoint Oct 30 15:19 UTC. *Reported—not independent browser validation.*
- **Intended next:** Competing candidates: later learner Note proposes **disable Remember labels, reload, compare against exact source/tests**; older checkpoint proposes **v6 digest/browser verification**. Do not choose one implicitly. Offer review of both.
- **Open concerns:** v7 persistence after full reload; provider/source check; other loose ends recorded in a Note linking two Questions. More context may exist beyond bounded retrieval.
- **Changed belief:** prior objective mood scoring abandoned for personal labels; a React-state filter is not evidence that labels survive reload. New v7 opt-in privacy policy is **proposed/reported**, not verified.
- **Progress:** documented conceptual revision and new Notes, not demonstrated successful v7 behaviour or Stage completion. **Coverage:** selected Question's context reported moreAvailable=true and partial=true; direct Project context lacked some Question-only links. Return “other work may be missing.”

### Cap sparse interrupted K, no checkpoint

- **Last work:** recent restart Note reports finding the old instance unusable and planning a new permitted instance; sparse Note revision 3 and older old-address Note also in return cluster. Provenance: learner Notes, no saved checkpoint.
- **Next:** learner states “confirm current authorised instance; make one harmless observation; avoid spoilers and unsupported credential/flag claims.” Do not invent an agreed checkpoint action.
- **Open/changed:** instance continuity and verification remain unresolved. A prior unverified inference was set aside, **not established as a resolved misconception**.
- **Progress:** safer scope and revised method are recorded. No exploit, success flag or independently verified result. **Coverage:** Project-root direct relations omit some newer linked Notes; return an incompleteness flag.

### Plant careful-calibrator K, no checkpoint

- **Last work:** recent return-with-calibration and raw-readings rev 3 Notes discuss simulated data/state model; not physical sensor measurement.
- **Next:** compare earlier universal 15% threshold with raw-count/hysteresis hypothesis; collect labelled dry/wet readings with attenuation, soil and time metadata.
- **Open/changed:** threshold is **challenged provisionally**; no validated physical calibration. Distinguish a deterministic CSV/state computation from real-world data.
- **Progress:** stronger measurement proposal, not proven calibration. Absence of checkpoint is normal for this learner; no automatic “start first step.”
- **Coverage:** related sets may be direct, bounded and non-transitive, even when relatedTruncated=false.

### Multiple simultaneous concerns

A learner's loose-end Note points to Questions Q1 and Q2; Activity X cites Article A, while another recent unlinked Note expresses concern C. Output three separately sourced candidates or “unlinked, relevance unconfirmed”; the one source can support two concerns. Do not select Q1 only because it is first, or invent a master Project. Learner may confirm, defer or reject each link independently.

## Adversarial acceptance cases

| ID | Input/condition | Must output / must not do |
|---|---|---|
| C01 | Mood newer Note rev 2 vs older S03/H checkpoint | Surface both dated intentions and why they differ; never call older checkpoint newest. |
| C02 | Same Note edited from rev 1 to rev 2 | Invalidate any earlier derived summary keyed only by record ID; pin quote to rev 2 and show changed provenance. |
| C03 | Note explicitly says “I ran test” without logged result | “Learner reports running test”; never “test passed.” |
| C04 | Verified independent result contradicts earlier self-report | Preserve both, elevate verification with trace, no silent alteration of learner writing. |
| C05 | Cap/Plant no checkpoint | Answer from Notes and source links; no made-up checkpoint or “no progress.” |
| C06 | Two explicit competing next intentions of similar recency | Two source-linked candidates plus learner choice; no GPT arbitration presented as fact. |
| C07 | Partial read, moreAvailable cursor, skipped Activity relation | Mark incompleteness; no absolute “nothing unresolved/no Activity/last ever.” |
| C08 | Permission removed between fetch and presentation | Re-authorise sources, hide sensitive text and deep links, degrade to safe unknown. |
| C09 | Lexically similar Notes in another learner/Project or synthetic variant | Exact identity/scope; no title-only cross-contamination. |
| C10 | Multi-task Note omitted by single-task continuation resolver | Include as competing multi-scope evidence where explicitly linked; explain that “continue” destination is not total history. |
| C11 | Old Article edition vs newest, anchor offset drift | Pin edition and rights, show updated/unavailable; never quote from newest as old if mapping unproven. |
| C12 | Empty results with complete authorised coverage | “No recorded evidence in checked scope,” not an unqualified learner diagnosis. |
| C13 | GPT suggests “misconception resolved” | Label proposed and unconfirmed; learner explicitly accepts or rejects; no hidden write. |
| C14 | Shared or GPT-authored content appears in learner context | Separate origin from learner-authored intention; no counterfeit first-person voice. |
| C15 | Multiple concerns with one Note and two Question links | Preserve both edge receipts; no arbitrary single concern assignment. |

## What must be measured before a design can depend on this

Run **read-only** repeatable retrieval for exact registered K-phase targets, collect source IDs/revisions and bounded path/cursor metadata privately, compare five slots with a hand-labelled expected ledger, and record false certainty, missed latest eligible Note, stale revision, cross-scope bleed and elapsed time. Measure cold and warm read paths independently; do not treat a Project direct-related response as exhaustive merely because its *direct* relatedTruncated is false. Run safe permissions fixtures separately. The current investigation used read-only MCP but has **not** implemented this projection, exhaustively paginated all paths, verified activity/attempt across all variants, tested revoked rights or run new write/readback.

**Decision rule for persistent model:** add persistent current concern/intention only if a read-only projection plus user-pinned existing Note/checkpoint demonstrably fails the identical learner tasks, and an owner explicitly wants stable, editable, user-controlled continuity. A database field cannot resolve disputed meaning by itself.
