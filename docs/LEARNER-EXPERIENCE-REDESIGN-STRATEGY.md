# Learner experience redesign: recovered decisions and next evidence-led experiment

**Decision handoff — 30 October 2026.** Public, sanitised orientation for a fresh development chat. This is **not** a commission to change production data, implement a new schema, redesign the Site, reset a fixture, enable tracing or run visual agents. Historical reports and earlier designs remain evidence, not blanket implementation authority.

> **Start here after the synthetic architecture work:** Minamo's aim is not merely to retrieve a better Project summary for GPT. The Site itself must become a coherent, active environment for investigating evolving work. Server-side context, MCP and UI are complementary; none alone establishes that outcome.

> **31 October 2026 — current implementation method and fresh-chat handoff:** Read [Project Workbench: build approach and fresh-chat handoff](PROJECT-WORKBENCH-IMPLEMENTATION-HANDOFF.md) before commissioning new Project UX work. The first working slice must use genuine Minamo records/permissions/Note persistence/return paths and prove one complete longitudinal workflow; mocked save/conflict behaviour and attractive preview shells are insufficient. **Existing information architecture is not sacred**: Project/Step/Question hierarchy, navigation, projections, domain relationships and even a justified schema can be redesigned substantially, with explicit migration and record-fidelity safeguards. Keep the required #14/#17 foundation → #12 controlled 3×3 corpus → #51 hybrid-workbench experiment sequence. This handoff authorises planning only, not a product rebuild or release.

## 1. The product failure we are trying to correct

An organically evolving Project can start with one plan, detour into research, contradict an assumption, accumulate practical evidence, change direction and resume weeks later. At present Minamo can preserve many relevant records and a fresh GPT can often reconstruct them, but the **learner-visible Project** may still read as a static ordered plan accompanied by detached Questions, Notes, Activity and repeated checkpoint summaries.

The owner-observed requirements are to:

1. Open the Project and **immediately see where the investigation stands**, including significant uncertainty and whether external facts are currently verified or merely saved reports.
2. Understand **what changed, why and what evidence supports it**, including abandoned paths, without a transcript dump or repeated checkpoint prose.
3. **Actively explore:** ask a question about a decision, inspect its original Note/code/Library passage/terminal or GitHub evidence, think or write at the relevant point, and return without losing place.
4. Continue meaningful work or explicitly ask GPT to **update Minamo/checkpoint**. The learner authorises the save; GPT/Minamo organise relevant committed work with honest receipts. A new chat can resume *saved* material, not unsaved conversation history.
5. Do all of this naturally on a narrow screen, without routine taxonomy management, an administrative Session ceremony or assumed learning scores.

A prettier card, an activity feed, a graph, a linear Step list, a larger context payload or a good GPT answer **does not by itself satisfy these requirements**.

**Primary first-hand evidence:** private owner feedback [#108 Feedback 002](https://github.com/frekland/minamo-v2/issues/108#issuecomment-6480708066) and [Feedback 003](https://github.com/frekland/minamo-v2/issues/108#issuecomment-6491195101), including Mood-to-Music mobile observations. Private links may require owner access.

## 2. Recovered design and research trail — what was actually decided

| When/source | Established finding or direction | Decision status / caution |
| --- | --- | --- |
| 9–12 Oct: original Cyber Theory field feedback and [Stage 3 target experience, §12.40](https://github.com/frekland/Minamo-legacy/blob/main/docs/STAGE-3-S33-TARGET-EXPERIENCE.md) | The Site's stored learning could be less understandable than GPT's explanation. An owner-endorsed *focused investigation* combined current problem, contextual evidence and possible next action with an accessible history, technical explanation, original code, embedded tools and contextual writing. | **Enduring experience requirement**, not approval of an old Session/Journey implementation or historical UI sketch. |
| 19 Oct: [Effortless Investigation continuation](https://github.com/frekland/Minamo-legacy/blob/main/improvement-ideas/EXPLORE-INVESTIGATION-CONTINUATION.md) | Concise, attributable “where I left off” with original links; no mandatory status taxonomy or compulsory new schema. | Exploration idea, **not previously commissioned**. |
| 24 Oct: private [workflow alternatives #32](https://github.com/frekland/minamo-v2/pull/32) | Integrated A/B task-centred alternatives and responsive Notes/resource trails were tested in a bounded development preview. | **Research proposal**, not final owner-accepted UX or proof of longitudinal Project orientation. |
| 26–27 Oct: private [experience review #60](https://github.com/frekland/minamo-v2/pull/60), [unified Projects #92/#93](https://github.com/frekland/minamo-v2/pull/93), [V70 review #98](https://github.com/frekland/minamo-v2/pull/98) and [V72 implementation #101](https://github.com/frekland/minamo-v2/pull/101) | Important retrieval, navigation, writing, Project/Question identity and responsive issues were addressed or documented. Projects became clearer structurally but remained heavily plan/Step-led. The 60-finding review is an interface audit, not the answer to the deeper experience question. | **Technical/structural improvements**, not evidence the intended living inquiry experience is solved. Conditional independent [Terra review #100](https://github.com/frekland/minamo-v2/pull/100) had explicit coverage limits. |
| 28–29 Oct: private [prior-art/product-philosophy study](https://github.com/frekland/minamo-v2/blob/main/docs/research/MINAMO-PRIOR-ART-AND-PRODUCT-PHILOSOPHY-2026-10-28.md) and [research addendum to feedback #108](https://github.com/frekland/minamo-v2/issues/108#issuecomment-6491836652) | Minamo is an **active, bidirectional learning-and-investigation workspace**, not a storage service for GPT. A plan, evidence history, revisable interpretation and external project status are different kinds of meaning. A map, timeline or current view could be alternative *projections of the same records*. | **Product hypothesis and comparative research plan.** It did **not** approve replacing Steps with threads, adopt a dashboard or establish a new record schema. Vendor documentation was studied; no comprehensive hands-on competitor comparison was reported. |
| 29 Oct: [revised owner delivery decision](https://github.com/frekland/minamo-v2/issues/108#issuecomment-6492950663) and [private umbrella #112](https://github.com/frekland/minamo-v2/issues/112) | Use realistic repeatable Project state, verify explicit GPT/MCP save and independent resume, then implement **one interactive, integrated Site slice** and iterate against the same evidence. Owner judgement at meaningful design milestones; avoid an extended design-only programme. | Current broad delivery principle, superseding earlier “UI before conversational return” sequencing. |
| 30 Oct: [V3 longitudinal closeout](acceptance/2026-10-30-m2m-v3-closeout-and-learner-context-roadmap.md), [#14](https://github.com/frekland/Minamo/issues/14), [#17](https://github.com/frekland/Minamo/issues/17) | Six-session GPT/MCP continuity had a **bounded PASS**. Synthetic continuation eligibility differs by read path; the current focused resume projection selects the latest eligible checkpoint, not a source-linked synthesis of later Notes and decisions. V80 corrected common assessment/disclaimer prompts. | **Engineering evidence and next diagnosis**, not proof of UI usefulness or cause of every presentation problem. |

**Historical anti-regression:** Learning Trees/Maps, Atlas/graph views and alternative workspace modes were experienced by the owner as fundamentally unhelpful for the central learning task, regardless of rendering quality or passing technical checks. Do not resurrect them simply because code remains available. Avoid compulsory work threads as a substitute for compulsory Steps, an unreadable “everything” feed, administrative status chrome or one checkpoint copied across multiple panels. See [private #112's historical lessons](https://github.com/frekland/minamo-v2/issues/112).

## 3. Prior-art mechanisms to investigate, not interfaces to copy

The 28–29 October study identified **strong overlap**, not a uniquely invented category or independently tested superiority. The useful question is *which interaction and information mechanisms help a changing inquiry?*

| Precedent | Mechanism worth testing for Minamo | Failure to avoid |
| --- | --- | --- |
| [GitLearnOS](https://github.com/Guojiz/gitlearnos) | Learner-owned intentions, evidence, corrections and reversible history; the agent hides storage administration. | Exposing Git/history management or new learner taxonomies as chores. |
| [Heptabase](https://heptabase.com/) | Directly thinking with connected material, revisiting and arranging source-grounded ideas, external AI read/write. | Assuming spatial cards or a graph automatically explain what changed or why. |
| [DeepTutor](https://github.com/HKUDS/DeepTutor) | Persistent, inspectable tutor context and synthesis connected to underlying traces/records. | Unrequested ability judgements, opaque inferred learner profiles or an internal agent platform Minamo does not need. |
| [Tana](https://tana.inc/) / [Capacities](https://capacities.io/) | Connected, flexible objects and different useful contextual views; reviewable AI-assisted organisation. | Requiring the learner to model every relationship or accept ungrounded AI edits. |
| [RemNote](https://www.remnote.com/) | Close contact between notes, questions, references and reflection. | Imposing quizzes, spaced repetition, assessment or a curriculum as the default. |
| Secondary: [Plane](https://plane.so/), [Logseq](https://logseq.com/), [OpenProject](https://www.openproject.org/), [Huly](https://huly.io/) | Dynamic grouping, event/history trails and contextual navigation patterns. | Mistaking a project-management activity feed for a learning investigation. |

**31 October 2026 implementation-source update:** A [first cloned-code inspection of GitLearnOS, DeepTutor and Logseq](research/2026-10-31-prior-art-code-reading.md) is now complete, with pinned revisions, file-level receipts, limitations and lessons for Project semantics and contextual navigation. It revealed a valuable distinction between fingerprint-detected changes and incremental synthesis of changed *meaning*; it also exposed provenance-granularity trade-offs. These are code-path observations, **not** competitor runtime/UX acceptance or approval to copy implementations. The design research and comparative Project interaction remain tracked in [public #51](https://github.com/frekland/Minamo/issues/51).

**Remaining research gate:** Compare GitLearnOS, Heptabase and DeepTutor against the *same realistically changing inquiry*, with Tana/Capacities/RemNote as challenges; separate documented capability, inspected code and observed interaction. Compare against a two-week Minamo return. The code-reading slice is done, but this is **not yet a completed head-to-head interaction study**; no competitor subscription or replication is a prerequisite for the immediate #17 work.

## 4. Keep four meanings distinct — do not choose a schema prematurely

1. **What happened:** immutable/retained attempts, Notes, source versions, observations, authorship, times, corrections and receipts.
2. **What the learner currently thinks or has decided:** revisable interpretation, reasons, unresolved conflicts, degree of evidential support and explicit owner decisions.
3. **What is intended or proposed next:** optional directions, experiments and questions. The initial plan is not the authority on an investigation that has changed.
4. **What external systems currently establish:** source-pinned GitHub state, separately evidenced execution or deployment, and last verification time; do not confuse this with the learner's experience.

These are **semantic responsibilities**, not mandated new record tables, universal statuses or four Site tabs. A derived “current picture,” historical episode, contextual Question, source view and GPT response may all use the same canonical evidence. Derived interpretations should retain **supporting record identities, revisions and uncertainty** and must not rewrite the author's original Note or a superseded decision.

The current architecture may already store much of what is needed. The next experiment must discover whether the missing value is in capture, relationships, temporal projections, efficient MCP reads/writes **or the interaction itself**.

## 5. Diagnostic decision framework after the current synthetic foundation

| Symptom under a fixed scenario | Investigate first | Evidence to require |
| --- | --- | --- |
| Relevant work was not saved, or an authorised update takes many fragile calls | Write/MCP choreography and canonical record/link ownership | Exact operation receipts, errors, idempotency, revisions, failure recovery |
| Records exist but important links or chronology are lost or falsely inferred | Record relations, event model and derived Project projection | Source-linked coverage of decisions, causes, contradictions, timestamps and authorship |
| GPT reconstructs accurately but only with large payloads/repeated calls | Server contextual reads, continuation projections and MCP contract | Same task with bounded call count/latency, context size, retrieved evidence and factual fidelity |
| Correct context is available but appears as a static plan and several disconnected pages | Site information architecture, interaction composition and navigation state | Real Project opening, question/evidence exploration and return without copying or getting lost |
| The visible picture is attractive but hides evidence, overstates certainty or demands admin work | Interaction and provenance disclosure | Learner task outcomes, wrong/invented status count, actions required, owner judgement |

**Critical instrument caveat (30 Oct):** Ordinary continuation queries deliberately exclude TEST-ONLY synthetic Notes/checkpoints, whereas exact synthetic-target reads admit them. A synthetic K “Start first step” response is **not** proof that genuine Projects restart incorrectly. Before evaluating an architecture change, #14/#17 must provide a strictly owner-only, registered-fixture-scoped test comparison that exercises production continuation semantics without exposing synthetic records in genuine Home/Project views or weakening security boundaries. Separately, latest-checkpoint-only resumption and later owner Notes require honest temporal interpretation. [Source-bound diagnosis](https://github.com/frekland/Minamo/issues/14#issuecomment-6533955591).

An old [server semantic retrieval proposal](https://github.com/frekland/minamo-v2/pull/12) may help finding related material by meaning but is **not equivalent** to meaningful Project continuation or active UX. Do not provision vectors, introduce a new “Learning Session” or rewrite the whole database based only on its existence.

## 6. Sequence — synthetic foundation first, then an integrated product experiment

**Now — bounded, separate engineering work:**

1. Finish **test fidelity** for Project continuation: owner-only registered fixture comparison, existing production eligibility logic, exact provenance and no leakage to ordinary learner views ([#14](https://github.com/frekland/Minamo/issues/14), [#12](https://github.com/frekland/Minamo/issues/12)).
2. Finish [#17](https://github.com/frekland/Minamo/issues/17) **stage 2** server-observed received MCP calls, errors and latency (not model-submitted transcripts), and **stage 3** canonical before/after state comparisons. Distinguish [#11](https://github.com/frekland/Minamo/issues/11) external source/build execution receipts. First measure the same Mood-to-Music corpus, avoid new subjects or visual agent runs.
3. Use that evidence for a bounded **#14 learner-context / MCP efficiency baseline** on known F/H/K states: what source records/revisions support current decisions, what newer Notes change, what remains unresolved, and cost/coverage/latency by read route. Prefer the smallest evidenced contract change.

**Next — complete the existing controlled 3×3 corpus before designing prototypes (31 October owner decision):**

4. Reuse the established versioned synthetic test architecture and [#12](https://github.com/frekland/Minamo/issues/12) scenario/controller design; **do not create three new ad-hoc real histories**. Complete **three Project subjects × three isolated fictional learner variants per subject**:
   - **Mood-to-Music:** intermittent weekend prototyper; provider-documentation sceptic; privacy-led interface reviser. Preserve the completed canonical V3 longitudinal baseline; the additional variant overlays remain to be implemented/verified.
   - **Retired HTB Cap machine:** command-log investigator; packet/model explainer; interrupted sparse recorder.
   - **Automatic Plant-Screamer:** breadboard-first tinkerer; careful calibrator; shared-space pragmatist.
5. Extend fixture state, synthetic record provenance, persona isolation, replay and exact-state validation within **the existing #12/#14/#17 foundation**. These are nine task/persona combinations, **not nine full cloned curricula**. The two extra Project subjects are selected but not currently implemented or accepted; keep source-vs-learner claims, old and new Note editions, privacy, temporal corrections, source execution status and interruption behaviour honest.
6. Verify realistic end-to-end synthetic reconstruction for representative states across the matrix without manufacturing successes or changing accepted historical baselines. Establish the reproducible comparison corpus before approving Project UI prototypes. Building fixtures and accepting prototypes remain separate implementation commissions.

**Then — design and compare new integrated Project-experience prototypes against that common corpus:**

7. Run the missing comparative interaction research from the 29 October addendum, distinguishing inspected open-source code, vendor documentation and actual browser observation. This study informs hypotheses; it does not substitute for using Minamo's already planned three subjects.
8. Develop the **integrated Project Workbench** as a shared experience contract, not three separate conceptual products. **Work (active investigation), Questions (inquiry) and Evolution (changing understanding)** are complementary perspectives on the same canonical Project, sources and revisions. Evidence inspection and contextual writing work in all of them. Preserve the selected item, draft and return path as the learner shifts perspective. Compare **alternative implementations of this hybrid**—for example explicit lens switching versus fluid contextual disclosure, with controlled adaptation as a possible third option. No choice of tabs, panels or permanent summary chrome is yet approved.
9. Under a **separate explicit commission**, implement at least two smallest working *interaction variants of the same hybrid workbench*, using identical canonical states and comparable tasks. A UI-only change is sufficient if the existing read projection provides the right information; new derived reads, narrow writes or substantial rebuilding require source-based evidence, not faith in a diagram.
10. **Replay each candidate against the same 3×3 synthetic matrix** with goal-based tasks, known phase/revision provenance and controlled comparisons: first-glance orientation; changed decision with exact reason; source/terminal/Library inspection; **switching Work/Questions/Evolution perspectives while retaining item selection, writing draft and back path**; explicit GPT update and independent resume. Watch for duplicate content, hidden older decisions, question fragmentation, intrusive mode switching and unpredictable adaptation. Test narrow mobile early, record observed clicks/backtracks/calls/time where measurable, and include failures as well as successes. Use optional [#18](https://github.com/frekland/Minamo/issues/18) visual/browser acceptance in a bounded way when the candidates warrant it.
11. Seek owner acceptance at meaningful design milestones; only later consider broad optional full-journey visual runs, separately consented genuine-use diagnostics ([private #115](https://github.com/frekland/minamo-v2/issues/115)) or other subjects. Do not require a compulsory two-week natural-use cycle.

**Explicit non-decisions:** no automatic Site redesign at the end of #17; no presumption that server-side work alone fixes UX; no mandatory flexible-thread schema, graph, dashboard, assessment model, universal progress signal or autonomous ingestion of unsaved ChatGPT conversations. Preserve the intentionally flawed fictional React consent/storage story as learning-progress *test material*. No execution provenance can be inferred from a pinned source link alone.

## 7. Concrete acceptance questions for the first redesigned slice

Against a reproduced substantial Mood-to-Music return after an interruption, can the learner:

- Open the Project and accurately say **what it is now about** without first reading a static Step body and a disconnected checkpoint?
- Find **a consequential change and its reason**, then inspect the original decision, earlier correction, code/terminal or Library evidence with exact provenance?
- Ask a natural contextual Question, capture personal thinking, **switch Project perspectives** to inspect a prior interpretation or source, and **return to the same selected item and writing context** without invented links, lost edits or duplicated prose?
- Distinguish saved learner observations, GPT interpretations, independently verified external facts, unresolved uncertainty and suggested next actions?
- Explicitly update Minamo, see a brief truthful acknowledgement, and have a fresh GPT **recover the same committed state** without unnecessary assessment language or tedious orchestration?

Record observed failures and strengths, not a synthetic happiness score. A technical test PASS or polished screenshot is not an owner-experience acceptance.

## 8. Current responsibility map and fresh-chat entry point

- **Public [#17](https://github.com/frekland/Minamo/issues/17):** synthetic event provenance, observed MCP trace and canonical diffs.
- **Public [#51](https://github.com/frekland/Minamo/issues/51):** **after #12's 3×3 corpus**, compare implementations of one **hybrid Project Workbench** (complementary Work, Questions and Evolution perspectives, shared focus/evidence/writing) against common synthetic states; [the gated build and IA-freedom handoff](PROJECT-WORKBENCH-IMPLEMENTATION-HANDOFF.md) is authoritative for the next commission; [prior-art source findings](research/2026-10-31-prior-art-code-reading.md) are an input.
- **Public [#14](https://github.com/frekland/Minamo/issues/14):** real Project continuity, context projections, read/write efficiency and the isolated synthetic fidelity gap.
- **Public [#12](https://github.com/frekland/Minamo/issues/12):** existing Mood-to-Music baseline plus planned completion of three Project subjects × three distinct fictional persona variants using the established versioned fixture/replay architecture; do this after the necessary #14/#17 foundation and **before** Project UX prototypes.
- **Public [#18](https://github.com/frekland/Minamo/issues/18):** future, optional arbitrary-phase Site UI/visual acceptance; currently deferred.
- **Private [#108](https://github.com/frekland/minamo-v2/issues/108):** first-hand owner experience and acceptance (Feedback 002–003 plus researched correction).
- **Private [#112](https://github.com/frekland/minamo-v2/issues/112):** future integrated Site product engineering and guarded iteration; private links require owner access.
- **Private [#115](https://github.com/frekland/minamo-v2/issues/115):** possible opt-in natural-use diagnostics with a separate privacy/consent boundary.
- **Related:** [Product philosophy and broader precedents](PRODUCT-CONTEXT-AND-PRIOR-ART.md), [longitudinal closeout and source evidence](acceptance/2026-10-30-m2m-v3-closeout-and-learner-context-roadmap.md), [testing guide](TESTING.md).

**For a fresh chat:** Start with the [Project Workbench implementation handoff](PROJECT-WORKBENCH-IMPLEMENTATION-HANDOFF.md) and this strategy, then the live issue heads/comments for #51, #12, #14 and #17 and the relevant source before changing anything. Confirm current GitHub/Sites source versions, controller state and deployment separately; historical PR/issue banners may be stale. Keep the present engineering commission narrowly on steps 1–3. When those are evidenced, propose a **task-based product design comparison** grounded in this record, not another generic UX audit or preselected visual component.

No work in this document grants scenario resets, genuine learner-data mutation, a Site release or external telemetry collection.
