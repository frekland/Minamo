# Independent strategic audit before Minamo experience design — 1 November 2026

**Status: independent research, proposals only. Not a design authority, approved solution, implementation or acceptance pass.** This document extends, rather than replaces, [the current owner design decision](../PRODUCT-DESIGN-DISCOVERY-DECISION-2026-11-01.md), [direct owner feedback](../ux/2026-11-01-owner-firsthand-ux-feedback.md), [root-cause trace](2026-11-01-project-stage-continuity-root-cause-audit.md) and [PR #75 evidence ledger](2026-11-01-connected-episode-ledger-and-divergent-interactions.md). Central tracking: [issue #51](https://github.com/frekland/Minamo/issues/51).

Detailed proposed research artefacts, all subordinate to this audit and the owner's decision:
- [A. Route and Activity-discovery regression specifications](2026-11-01-pre-design-route-regression-spec.md)
- [B. Read-only, source-attributed continuity contract](2026-11-01-pre-design-continuity-contract.md)
- [C. Divergent task storyboards and prior-art interaction teardown](2026-11-01-pre-design-task-storyboards-and-prior-art.md)

## Scope, baseline and independent verdict

**Verdict: ready to compare concrete low-fidelity task interactions, not ready to commission functional Project Workbench prototypes.** More documentation and bigger fixtures alone will not establish usefulness. An entire new Workbench may be unnecessary; alternatively, fixing links and return summaries may leave the owner-reported rigidity of Projects/Stages untouched. Both are live hypotheses.

- **Public main reviewed:** [46acee8283fbd995711366881bcdb16840cb9ff9](https://github.com/frekland/Minamo/tree/46acee8283fbd995711366881bcdb16840cb9ff9), PR #75 merged. PRs [#74](https://github.com/frekland/Minamo/pull/74) and [#75](https://github.com/frekland/Minamo/pull/75) are closed/merged documentation research. [#67–70](https://github.com/frekland/Minamo/pull/70) remain open, qualified acceptance/comparison reports; their older design prescriptions are superseded by the current owner decision. The reviewed main contains no newer superseding research. Recheck before a future commission.
- **Hosted Site:** Sites listing and version provenance confirmed currently deployed **V88**, native source **ea255bce9a5d849e96c46383188af2a1cb21fd1c**, separate from public main. This was not a byte-for-byte native-Sites/public-main comparison. Existing signed-in, read-only Chrome Cloud Browser navigation was performed on 1 November; no learner-data edits or synthetic resets.
- **Synthetic MCP:** read-only scenario list returned legacy Mood phase K/epoch 3/revision 21 and registered three-by-three variants. Exact Mood storage-Question learning context showed author, rev, edition, chronology, connection, partial coverage and the older checkpoint; direct Project context showed different related closure. No transcript/observer or controller mutation.
- **Direct UI reproduction:** the same TEST ONLY Mood Stage → storage Question → recent loose-ends Note → exact Question backlink retained record identities but lost the original Back to Step. A current Japanese N4 Activity → source Article → reverse Activity route reproduced the Activity hidden beneath collapsed Your work, labelled Tool, and the legacy tools destination successfully opened Activity Studio. No private Article/Activity IDs, contents or account details are reproduced here.
- **External operation:** the publicly shared [eLabFTW demo](https://demo.elabftw.net/) was operated as a non-admin demo user; dashboard, a labelled demo experiment and its revisions were inspected read-only. Heptabase/Capacities/RemNote/Zotero observations below come from official interaction documentation, not authenticated hands-on trials. GitLearnOS/DeepTutor/Logseq remain pinned static-code evidence from [the earlier report](2026-10-31-prior-art-code-reading.md).

**Owner evidence outranks proxy UX:** Notes disconnected; Project/Stage rigidity; Library–Activity discovery; stale five-question return. The direct route failures explain parts of those experiences but do not explain their entirety or establish a population failure rate.

## What the earlier investigation got right—and what it did not

| Earlier finding | Independent judgement | Corrective consequence |
| --- | --- | --- |
| Canonical data is present even when retrieval or UI makes it hard to use | **Supported.** Both live route reproductions preserve exact record relationships; Project-root versus deeper synthetic MCP projections differ. | Separate storage, relationship eligibility, query coverage, presentation and task-route state in every requirement. Do not commission a new relation store from the two bugs. |
| Newer Notes can conflict with an older checkpoint | **Supported, narrower than “stale data.”** The Mood Question target returned dated, authored Notes newer than an eligible checkpoint. The newer writing is not necessarily verified, and current activity returned moreAvailable:true. | Keep competing dated sources; show unknown rather than inventing one current truth. A joined read may be useful, not authoritative. |
| Project/Stage hierarchy feels disconnected | **Owner-proven complaint; source supports fixed authored ordering, not the magnitude of UX harm.** The revised Project still presents Step 4 of 5 and Previous/Next. | Test task-first, capture-first and Project-optional interaction; a prettier Stage home does not answer the complaint. |
| Route context loss and Activity discoverability are important | **Independently reproduced in V88.** Code reveals more opportunity for reuse than PR #75 made explicit. | Use existing contextual-link and reading-position machinery before inventing a navigation framework. |
| Three contrasting technical histories provide robust acceptance | **Robust for selected uncertainty, not representative learning overall.** Nine registered variants use three technical subjects, all generally already Project-shaped. | Add lightweight non-technical, projectless and external-tool tasks. No new large fixture programme by default. |
| Three candidate interaction directions are sufficiently divergent | **Plausible, not yet proven.** A living episode can become another required object; a worktable can become a new filing chore; minimal repair can leave mandatory Stage thinking intact. | Evaluate identical tasks and include a fourth counter-hypothesis: a chronological field log/inbox with optional thematic views. Do not rank candidates via GPT taste or synthetic happiness scores. |
| Extensive tests mean Minamo is ready for major UX design | **Not supported.** Source, domain and acceptance tests protect identity/revisions/synthetic isolation, but no current real-use end-to-end outcome or mobile/assistive success was established. | Retain those strengths while measuring task completion and context breaks. Technical PASS must never imply UX PASS. |

### Strategic critique of recent PR trajectory

The main product gained substantial typed Activities, rich Notes, exact readers, rights-scoped relations, recovery, GPT handoff and synthetic acceptance infrastructure. These are valuable foundations. But the late series [#52–66](https://github.com/frekland/Minamo/pull/64) concentrated on prior-art notes, 3×3 fixture/hosted controller, reconciliation and Workbench contracts; [#71–75](https://github.com/frekland/Minamo/pull/75) corrected product direction and documented UX evidence. **The recent PRs improved observability and the quality of the argument more than the learning experience displayed in V88.** That is not failure of the engineering work; it is a warning that passing the next synthetic acceptance is not equivalent to fixing the owner’s task.

We have also risked conflating six different things:
1. **Navigation:** whether the learner can return to an exact passage and originating task.
2. **Relations:** whether canonical explicit connections exist, with revisions and rights.
3. **Retrieval:** which connected records a bounded read actually returns.
4. **Memory/interpretation:** what statements remain plausible, contradicted, open or unknown.
5. **Progress:** what work, evidence or change occurred—not Stage count, visit history or mastery.
6. **Pedagogy:** what kind of prediction, explanation, practice or inquiry helps learning now.

One new dashboard cannot fix all six, nor should all six be collapsed into a single CurrentConcern object.

### Preserve these proven capabilities, regardless of eventual interface

- Quick standalone Notes; deliberate contextual Note links; rich text, code/terminal/media and recoverable local drafts ([note-capture-context](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/lib/note-capture-context.ts), [Notes panel](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/app/notes-panel.tsx)).
- Structured Reader with exact immutable edition/section/part/UTF-16 text anchors; explicit source rights and current/retained edition handling ([reader](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/app/reader.tsx), [reading-continuity tests](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/tests/reading-continuity.test.mjs)).
- Owner-scoped, revision-safe canonical writes, operation receipts, Trash/recovery, permission redaction, synthetic isolation ([architecture](../ARCHITECTURE.md), [domain](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/lib/domain.ts)).
- Explicit Questions, Activities/Attempts, annotations/Flags, source-linked GPT handoff and useful practice—not necessarily today's navigation labels ([practice index](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/lib/practice-index.ts), [GPT context](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/lib/gpt-context.ts)).
- An *underused* existing local task/reading arrangement: taskFamily/taskId/rendition, optional pin, bounded opened resources and section/part reading-position memory ([layout-workspace](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/lib/layout-workspace.ts), [hook](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/app/layout-workspace.tsx)). These are **view/navigation state, not learned knowledge**, and direct full-page links can drop them. They deserve narrow route testing before a new Workspace Session record.
- The model is external ChatGPT by design. Preserve deliberate, bounded source selection and explicit learner-approved writeback; do not silently add embedded AI, proficiency scoring or continuous personal telemetry.

### Solved, covered, and unresolved are different

| Capability/problem | Verdict |
| --- | --- |
| Standalone Note creation and exact linked Note retrieval | **Exists**; does not demonstrate useful later connection or return. |
| Direct Step → Article → Back to Step and Activity → Article → Back to Practice | **Observed working on sampled routes**; cannot generalise to all multi-hop paths. |
| Question → Recent work Note → Question → Step | **Observed failing in V88**; now has precise source trace, no fix/test merged. |
| Reverse Article ↔ Activity relationship | **Exists in inspected case**; Activity is still undiscoverable in the reading task without expanding a generic footer and is mislabelled. |
| Home/Project continuation | **Implemented, partly tested**; a destination is not a current, conflict-aware answer. Synthetic ordinary exclusion is intentional. |
| Full three-layer observation and nine independent cold GPT sessions | **Qualified/incomplete** per open PRs #67–70 and #17; not a D2/D3 blocker. |
| Current functional UX, mobile, assistive, draft-conflict, return under permission change | **Not accepted.** Historic V70 dispositions and isolated tests are not new hosted passes. |

## Evidence matrix — material claims and their limits

Legend: **LIVE** = operated interface; **MCP** = current authorised record read; **CODE** = inspected current main; **OWNER** = firsthand product report; **DOC** = vendor or earlier research; **INFERENCE** = interpretation requiring a task test. High confidence means within the stated scope, not universal validity.

| Claim | Evidence and direct source | Class/confidence | Limitation |
| --- | --- | --- | --- |
| Two root defects persist in deployed V88 | Independent signed-in V88 route walkthrough; [PR #75 reproduction](2026-11-01-connected-episode-ledger-and-divergent-interactions.md) | LIVE, high for sampled paths | No mobile/assistive or other identities exercised. |
| Recent work drops Step return at the Note hop | [ThinkingItems](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/app/learning-activity.tsx) uses raw destination anchor; [Navigation context](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/app/navigation-context.tsx) has a helper used elsewhere | LIVE + CODE, high | A narrow fix must still test native new-tab, Back/Forward and stale permissions. |
| Activity is buried/mislabelled rather than absent | [LearningConnections](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/app/learning-links.tsx), [family labels](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/lib/learner-labels.ts), V88 Article | LIVE + CODE, high | One eligible non-synthetic N4 pair; not an all-Article coverage estimate. |
| Practice catalogue cannot query “using this Article” | [practice-index](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/lib/practice-index.ts) (kind, scope, title, exact Activity ID), V88 Practice view | CODE + LIVE, high for implemented selector | Related links may already surface some Activities elsewhere. |
| Project has several partial concepts of “now” | [project-context](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/lib/project-context.ts), [learning-work](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/lib/learning-work.ts), owner report | OWNER + CODE + MCP, high for separation | Semantic meaning of prose cannot be deterministically adjudicated. |
| A bounded Question read exposes new Note and old checkpoint | Exact TEST ONLY Mood Question target: rev 2 Note; newer rev 1 Notes; partial activity with moreAvailable:true; [earlier ledger](2026-11-01-connected-episode-ledger-and-divergent-interactions.md) | MCP, high for this fixture | Returned 10-item window incomplete; fixture's narrative dates differ from write timestamps. |
| Direct Project-root context differs from deeper linked context | Exact TEST ONLY Mood Project root and Question target reads; [V89 comparison](../acceptance/2026-11-01-v89-workbench-research-baseline.md) | MCP + prior evidence, high for chosen route | relatedTruncated:false describes direct selected set, not transitive completeness. |
| Multi-target Note may be skipped by continuation | [resolveProjectContinuation](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/lib/project-context.ts), explicit targets.size>1 skip | CODE, high | Intentional safety guard, not licence to erase that Note from other views. |
| The 3×3 corpus lacks non-technical breadth | MCP test scenario list; [corpus registry](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/tests/project-scenarios/corpus-registry.mjs) | MCP + CODE, high | Scenarios still valuable as technical/adversarial fixtures. |
| Existing route helpers are promising reuse | [useContextualHref](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/app/navigation-context.tsx), [library-return tests](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/tests/library-return.test.mjs), [layout-workspace](https://github.com/frekland/Minamo/blob/46acee8283fbd995711366881bcdb16840cb9ff9/lib/layout-workspace.ts) | CODE, high for existence, medium for proposed reuse | No new regression implementation or integrated-host acceptance yet. |
| A workbench/graph is not a proven improvement | [owner feedback](../ux/2026-11-01-owner-firsthand-ux-feedback.md), [prior-art code reading](2026-10-31-prior-art-code-reading.md) and no owned A/B outcome | OWNER + INFERENCE, high that choice is open | Requires real-task owner assessment; model preference is not evidence. |
| External mechanisms challenge current taxonomy | [Zotero reader](https://www.zotero.org/support/pdf_reader), [RemNote portals](https://help.remnote.com/en/articles/6030742-portals), [Capacities backlinks](https://docs.capacities.io/reference/backlinks), [eLabFTW demo](https://demo.elabftw.net/) | Official DOC plus one LIVE demo, medium | Do not infer competitor task success or Minamo suitability without a matching task. |

## Proposed preparation requirements — not approved engineering work

Priorities indicate investigation value, not permission to implement. Detailed acceptance and negative fixtures appear in the three linked appendices.

| Priority | Proposed behavioural requirement | Acceptance criterion for any eventual candidate | Likely tier |
| --- | --- | --- | --- |
| **P0 R-NAV** | Exact source identity and **originating task return** survive a linked detour, including native links and history. | Stage → Question → Note → Question → Article and reverse flow retains a visible, valid Stage return or explains unavailability; no wrong-stage fallback. | Navigation/UI + route tests. |
| **P0 R-DISCOVER** | An eligible authored Activity is discoverable **from the Article passage/task**, labelled Activity rather than the legacy Tool when that saved subtype warrants. | Activity appears visibly without footer hunting; exact edition/source and return retained; missing/revoked activities never advertised as ready. | Reader/relationship presentation; possibly indexed projection. |
| **P0 R-RETURN** | Five return questions derive attributable, bounded candidates, never an automatic settled GPT summary. | Each displayed answer has source ID/rev/actor/time/rights status; conflicting or unknown cases stay explicit, and old checkpoint is dated as old. | Read projection, no new table assumed. |
| **P0 R-CAPTURE** | Spontaneous Notes stay valid without Project and can be found/used later deliberately. | Capture → find by content/date → use in a task or leave independent, without forced classification or silent link promotion. | Existing Notes/search, contextual integration. |
| **P1 R-USE** | Read, practise, annotate and write while keeping the source and selected place readily recoverable. | Source→Activity→Note→same Article part and task, with draft retention, permission and edition checks. | Existing Reader/Notes/Activity integration. |
| **P1 R-SPARSE** | No checkpoint, no formal Project, several simultaneous concerns, or absent data are first-class states. | Sparse Cap/Plant and one lightweight non-technical task do not display invented nextAction, mastery, completion or stale Stage as fact. | Read projection and interaction; durable confirmed intent only if required. |
| **P1 R-CONTROL** | GPT reasoning stays a reviewable proposal; writes are explicitly user authorised and receipt-verified. | A proposed correction/intent cannot mutate canonical state until owner confirms exact source, scope and consequence. | Existing MCP/edit contract plus UI. |
| **P1 R-ACCESS** | Navigation is understandable via keyboard/screen reader/touch and does not depend on spatial desktop layout. | Named/visible Activity controls, expanded-state announcements, focus and Back/Forward restoration at narrow viewport; real assistive confirmation separately. | UI/accessibility acceptance. |
| **P2 R-ECONOMY** | Added structure must earn its cognitive and technical cost over current Minamo/plain notebook. | Same four tasks measured for forced taxonomy decisions, lost context, repeated searches and unsupported assertions; owner assesses actual burden. | Comparative D3 research. |

## Prior-art challenge and overlooked opportunities

The additional [task-oriented teardown](2026-11-01-pre-design-task-storyboards-and-prior-art.md) distinguishes source-code, official documentation and one actual demo operation. The most relevant lessons are:

1. **Source-to-Note-to-source may be a better primitive than Project-to-dashboard.** Official [Zotero PDF reader](https://www.zotero.org/support/pdf_reader) documentation describes dragging exact annotations into a Note with citation/page backlink and “Show on Page.” This is a source-in-context interaction, not a global knowledge graph. Minamo's exact passage anchors are an asset that could support a simpler equivalent.
2. **One canonical item may appear in many *temporary* working contexts.** Heptabase's official [card/whiteboard separation](https://wiki.heptabase.com/fundamental-elements) and RemNote's [portals](https://help.remnote.com/en/articles/6030742-portals) both challenge Project ownership of content. Do not import mandatory canvas management or live-editable transclusion risk.
3. **A backlink footer is not automatically useful discovery.** Capacities' own [backlinks documentation](https://docs.capacities.io/reference/backlinks) puts them at an object's bottom and allows collapse; its [reading workflow](https://docs.capacities.io/reference/use-cases/reading-workflow) explicitly says “menu, not recipe.” This is the wrong default for Minamo's missing in-passage Activity action. Use optional semantic links and contextual queries; reject compulsory link-processing.
4. **Experiment-first structure also has costs.** In the operated [eLabFTW demo](https://demo.elabftw.net/), the dashboard foregrounded recent experiments and resources; an experiment showed Goal/Procedure/Results, status, rights and revision actions. The revision view reported a configurable maximum of ten stored revisions and a 100-character change threshold. These are direct demo observations, not a claim about all deployments. Useful lab provenance does not imply complete learner history; “Success” or “Running” statuses cannot become Minamo progress scores.
5. **The missed opportunity may be reduction, not addition.** A quiet field log (capture first, date/real context, optional links and revisit) with source-grounded GPT proposals could serve unstructured work better than B's persistent Episode or C's curated worktable. It is a counter-hypothesis to try, not a fourth commissioned prototype.

## Decision and readiness

**Ready now without owner interruption:** review the four low-fidelity task comparisons; turn the route specifications into deterministic failing tests on a separate authorised implementation branch; measure bounded read coverage/rights/latency through read-only calls; inspect accessible external demos without payment; prepare one lightweight non-technical and capture-before-Project task without mutating existing fixtures. No need for six more cold chats before D2/D3.

**Requires new engineering/test authority:** changing source or schema, adding Activity/Attempt to registered variants, fault injection, fixture reset/replay that changes hosted state, deploying V89+, or a real persistent new Note/Activity/AI-write roundtrip. The user authorised this research and safe synthetic inspection, not a production fix. We deliberately did not exercise synthetic mutations because no reset was needed for the read-only questions.

**Requires owner judgement, once presented a concrete choice:** whether A's small contextual return and Article practice entry would materially improve a real task; whether B's selectable inquiry feels like work or overhead; whether C's juxtaposition helps enough to justify selection/arrangement. Do not repeat the original generic UX questions. One realistic technical and one reading/non-technical task, tried against a simple note+GPT baseline, should discriminate more than another fixture replay.

**Gate before commissioning one functional vertical slice:**
1. The route failures have explicit tests with safety/rights/edition/draft coverage and their live baseline is pinned.
2. The continuity contract can return a truthful *unknown* and conflicting candidates on existing synthetic evidence, with measured coverage and source links; no derived GPT claim is silently persistent.
3. A/B/C and the capture-first counter-hypothesis have identical task storyboards and rejection criteria. Project remains optional in at least one serious candidate.
4. The owner has inspected one or two concrete task interactions and selected the smallest genuine benefit worth trying, including an acceptable level of hierarchy and interaction cost.
5. The proposed slice has real authenticated persistence, exact source/return, explicit write/readback, recovery/rollback and independently reviewed Sites/public-source comparison gates; only then seek separate implementation/deployment permission.

**Answer to the original question:** the investigation was not narrow for lack of code or testing sophistication. It became narrow in its *unit of analysis*: a long Project and its recovered history. Re-centre on a small productive learning episode—including one that never becomes a Project—and let existing evidence and navigation capabilities compete against a new Workbench. No chosen product direction changes by publishing this audit.

## Continuation handoff

Start from [AGENTS.md](../../AGENTS.md) and the current [owner decision](../PRODUCT-DESIGN-DISCOVERY-DECISION-2026-11-01.md). Keep this independent audit and its three appendices as **proposed evidence/specifications**, not a superseding design mandate. Review the open #67–70 acceptance PRs with their independence limits. Next safe tasks are (1) evidence-backed route test design, (2) a deterministic read projection spike plan with negative rights/coverage cases, and (3) owner-facing task comparison, not a compulsory Workbench. Re-verify main/Sites versions before any implementation. No code, schema, learner record, fixture, deployment or acceptance state changed in this PR.
