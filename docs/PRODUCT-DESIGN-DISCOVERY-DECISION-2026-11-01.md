# Minamo learner-experience design direction — contextual, capture-first and evidence-grounded


## Later owner-selected forward direction — contextual learning, not a predetermined Workbench

**Owner preference confirmed later 1 November 2026. This is now the forward direction for D3 interaction design study, not a commission to build production UI, a settled information architecture or permission to modify learner data.** The owner favours exploring a **capture-first, context-aware Minamo with optional evidence workspaces and adaptable Projects**, as a hybrid of the researched mechanisms. The core unit of experience is **what the learner is trying to do or understand**, including unplanned or uncertain work—not a mandatory Project, Stage, Inquiry, Episode, Note dashboard or Workbench. The prior divergent A/B/C/D analysis remains valuable as challenge evidence, not four equally obligatory implementations. [Independent audit](research/2026-11-01-independent-pre-design-audit.md), [regression specifications](research/2026-11-01-pre-design-route-regression-spec.md), [continuity contract](research/2026-11-01-pre-design-continuity-contract.md) and [task storyboards/prior art](research/2026-11-01-pre-design-task-storyboards-and-prior-art.md) are **proposed research**, not test passes.

**D3 research continuation — 1 November (not a new decision):** The [same-task A/B low-fidelity study](research/2026-11-01-contextual-learning-interaction-study.md) and [executed read-only synthetic evidence + unrun route test oracles](research/2026-11-01-contextual-study-evidence-and-test-oracles.md) are now available. The owner still needs to judge two concrete first-action/context-return alternatives. Its provisional lean towards source-first entry **does not approve** a design, a persistent model, code or fixture changes, a functional slice, or deployment. This canonical decision remains the authority.

**Preferred interaction principles to investigate:**

1. **Capture freely.** A Note, question, observation, source excerpt or experiment can begin outside any Project; record exact available origin and edition without forced classification. Suggested connections remain suggestions until the learner accepts them.
2. **Continue honestly.** Surface recent eligible authored work, explicit (possibly competing) next intentions, unresolved problems and changes in understanding, with links, timestamps, source revisions, author/report-versus-verification and visible coverage limits. Show multiple strands or **unknown** rather than invent one GPT-determined “current concern.” The five-question contract supplies evidence; it need not become five permanent dashboard panels.
3. **Work with sources in context.** While reading, practising, experimenting or writing, offer discoverable related Activity and exact source/return actions; selected evidence may be compared in an optional worktable/field-notebook view. Canonical records are reused, not copied into a new untracked graph.
4. **Make Projects adaptive guidance.** A Project may provide structure and authored Stages but must not constrain capture, current intent or next action; changing direction, skipping/revisiting guidance and maintaining several concerns remain ordinary. Do not assume the current Stage/Step hierarchy is the new organising centre.
5. **Keep GPT deliberately subordinate to learner control.** Use bounded, rights-safe selected sources to propose synthesis, relevant links or next checks for explicit review; no unrequested persistent intent, misconception, progress score, relation or background chat ingestion.

**Recommended comparison — exactly two focused conditions initially, not four full prototypes:**
- **Repaired-Minamo baseline:** existing Reader, Notes, Library, Practice, Project guidance and continuation, with the two known contextual-return/Activity-discovery defects specified for repair and a truthful bounded return view. This is a *comparison condition*, not evidence those repairs have happened.
- **Contextual-learning hybrid:** capture first, task-sensitive truthful continuation, revisable learner-chosen focus without an obligatory new Inquiry model, and an optional canonical evidence comparison space. Project/Stage functions as reference guidance, not gatekeeper. The lightweight dated field log is its complexity floor, while living inquiry and worktable are optional mechanisms that must earn their cost.

Compare both with **identical concrete tasks**: (T1) unplanned Note without Project, (T2) Mood K return with later conflicting Note and older checkpoint, (T3) Cap/Plant sparse or non-technical no-checkpoint resumption, and (T4) exact Article → linked Activity → new thinking → original Article edition/passage/task. Include narrow mobile, keyboard/accessibility, interruption and relevant cross-source rights/stale-revision behaviour. Capture first screen, actions, evidence reused, error/unknown representation, backtracks, cognitive burden and failure/rejection criteria. Do not grade invented persona satisfaction. An owner-facing compact interaction demonstration may follow this paper/low-fidelity study, but **no polished/functional prototype, new schema, synthetic mutation, Site deploy or production change is authorised here**.

**Execution order for the next chat:**
- **Track 1 (objective groundwork):** refine/run safe read-only retrieval coverage checks and the five-question source-attributed projection expectations; turn the two reproduced route failures into exact deterministic failing-test designs. **Any app-code edits or mutating fixture tests require a separate authorisation.**
- **Track 2 (design groundwork):** produce one sufficiently detailed, low-fidelity interaction-level comparison of repaired Minamo and the preferred hybrid on the same tasks, including mobile/keyboard flow, source receipts, multi-intention and missing-context states; explain whether simpler capture-first integration outperforms a new worktable.
- Use existing completed D1 evidence, PR #76 and prior-art observations. Do **not** restart generic PR/UI inventories, repeat the owner's rejected four UX questions, commission four full implementations or assume all nine cold-context sessions must finish first.
- Return with a **specific small interaction choice** requiring owner UX judgement; after that, propose **one real authenticated vertical slice** with explicit permission, fidelity, rollback and release gates. The owner has chosen a direction to **study**, not preapproved its final design.

**Rejection gates:** if the hybrid requires a new compulsory organising record, silently treats partial history as complete, makes sparse/mobile work slower than a simple Note, copies sources without identity/edition fidelity, obscures rights, or cannot beat a repaired baseline on meaningful action and return, reduce or reject it. More metadata, AI summaries and flexible panels are not inherently better.

---

**Owner direction · 1 November 2026 · CURRENT DESIGN AUTHORITY.** This decision supersedes conflicting product-design sequencing, mandatory prototype alternatives and information-architecture assumptions in issue #51, the 31 October Workbench handoff, the V89 information contract and the design recommendations of PRs #66–70. Earlier evidence, technical acceptance records and historical decisions remain intact. **This is a research/commissioning decision, not permission to build a Workbench, change schema, touch learner data, reset fixtures or deploy.**

Start here for any future Minamo Project/Workbench/learner-experience design work. Then read [the implementation handoff](PROJECT-WORKBENCH-IMPLEMENTATION-HANDOFF.md), [recovered strategy](LEARNER-EXPERIENCE-REDESIGN-STRATEGY.md), [product context](PRODUCT-CONTEXT-AND-PRIOR-ART.md), [architecture](ARCHITECTURE.md), and current issue/PR comments. Where these sources disagree about *design direction*, **this document governs**. Current operational test and release safeguards in AGENTS.md, TESTING.md and the three-layer protocol still govern their respective technical work.

**Direct owner UX correction (later 1 November; priority input):** The owner has now supplied [first-hand feedback](ux/2026-11-01-owner-firsthand-ux-feedback.md): Notes still feel disconnected; **Projects and Stages are the biggest problem—disconnected and unadaptive**; Library Articles are hard to discover, navigate and use with Activities; after a break the displayed last work, next intended activity, outstanding problems, addressed misconceptions and progress were **all stale**. This overrides the D1 report's tentative “awaiting owner frustration” language and the assistant's four generic questions. Existing data links or continuation code do not refute the experienced failure. Research should now trace the connections and recency/meaning failures, then evaluate contrasting remedies. The owner need not restate this diagnosis before GPT proceeds; later owner validation of proposed solutions remains essential. No design choice or implementation is authorised.

**D1 differential evidence update (1 November):** The [source/UI existing-capability and remaining-UX-gap audit](ux/2026-11-01-d1-existing-capability-gap-audit.md) inventories already-implemented capture, Reader, saved-work organisation, Project continuation, Practice, GPT handoff and in-repo Activity layout experiments against the V70/V72/V86 and V88/89 evidence. **Do not repeat generic inspection or assert those capabilities are missing.** Technical D1 inventory is substantially complete; **the owner subsequently supplied direct problem feedback (see the correction above)**. Bounded D2 comparison, precise solution design and D3 choice remain open. This is an evidence supplement, not a replacement for the design authority below.

**Completed D1 root-cause investigation (later 1 November):** [Project/Stage continuity failure — source, Site and synthetic MCP trace](research/2026-11-01-project-stage-continuity-root-cause-audit.md) is now the evidence-led starting point. Three settled TEST ONLY histories confirm that Stage/Question activity can recover later Notes absent from the non-truncated direct Project-root related set; a hosted Stage shows newer v7 writing alongside the older v6 checkpoint. Both direct Step–Article return and a separate failing multi-hop return were observed. This strengthens the case for an honest, rights-aware joined return projection and task-first relevance investigation, **without choosing** a screen, graph, schema, automatic GPT interpretation or Workbench commission. D2/D3 and owner assessment of concrete proposals remain ahead.

**Next joined-workflow research tranche (later 1 November):** The [five-question synthetic evidence ledger and divergent interaction probes](research/2026-11-01-connected-episode-ledger-and-divergent-interactions.md) now adds exact task-specific return truth for Mood, sparse Cap and careful Plant, two reproduced R1/R2 navigation/relevance defects, and official-documentation prior-art mechanisms. This is **D1 follow-through and preliminary D2 desk research**, not a completed hands-on D2 comparison, D3 prototype, learner usefulness verdict or authority to alter Site/fixtures. It exposes the distinction between **record relation present**, **record retrieval available** and **action visible in context**; next compare minimal integration, living inquiry and evidence worktable on identical tasks before the owner chooses a build.

## Why this decision was needed

The V88/89 nine-variant infrastructure, source-revision records, MCP observation and three S06/K conversational reports have established useful bounded technical facts. In particular, the three *selected* long-return histories expose important recent Question-linked Notes missing from direct Project-root related-context responses, although deeper authorised reads recover them. The Site also has sampled desktop evidence of Step-first visual hierarchy and one broken return-context route. These findings justify investigation of retrieval and navigation, **not a predetermined Workbench screen or general claim about ordinary learner continuation**.

The earlier strategy was becoming too tightly organised around reconstructing long technical Project histories and comparing explicit Work/Questions/Evolution lenses against a fluid contextual alternative. The real product ambition is wider: **help a person capture curiosity, think with material, investigate, experiment, practise, explain, make artefacts, and return naturally**, with trustworthy continuity and optional user-directed GPT assistance. The most valuable design may be a smaller simpler integration, a fundamentally different working arrangement, or an interaction that changes gently with the task.

A technically correct history retrieval can still be a poor place to think. The next design phase must evaluate **productive learning and actual use**, not only provenance, clicks and continuity.

## What is superseded and what is preserved

### Superseded as design constraints

1. **Work / Questions / Evolution as the assumed core vocabulary or required perspectives.** They remain useful functional questions, but prototypes need not expose them as lenses, tabs, panels or separate destinations.
2. **A mandated A/B of explicit lenses versus fluid contextual workspace, with both implementing an already-fixed hybrid contract.** Alternative interaction models may be substantially different; their evidence, user authority and task outcomes remain comparable.
3. **The proposed ProjectWorkbenchRead / CurrentConcern / DecisionChange shape as a committed representation or mandatory first build.** It is a research hypothesis. A single current concern, turning point and next action may not exist; absence must be expressible honestly.
4. **Completing all nine strict cold-context GPT/MCP acceptance sessions as a prerequisite for broader product discovery.** The nine existing synthetic variants remain valuable test assets. Unfinished independent acceptance remains open on its *own* engineering/evidence track; do not count incomplete/compromised runs as passing or rebuild fixtures by default.
5. **Treating a Project-home screen as the only legitimate integration unit.** Capture-before-Project, global Notes/Library/search, contextual GPT use, cross-space and cross-project transitions, and short-lived inquiries are in scope for design discovery.
6. **Treating the source-linked retrieval defect as proof that the whole answer is a richer generated summary.** A bounded, rights-safe relationship-closure spike can proceed independently, with source and latency measurements. Avoid a second authoritative learner-state store or automatic claims.

### Preserved non-negotiable safeguards and useful capabilities

- Existing learner-authored records, exact anchors/renditions, source rights, authorship, retained revisions, uncertainty, history and contradictions.
- Authenticated owner scoping, synthetic isolation, validation, revision-safe writes, idempotent receipts, recoverable drafts/Trash and privacy.
- Existing Reader, rich Notes/terminal/code/media editing, annotation/Flags, Library, Questions, Activities, search and source-linked MCP tools as *capabilities to inspect and reuse*, not sacred navigation structures.
- Learner control of durable GPT updates: no silent ingestion of conversations, automatic promotion of hypotheses or unrequested mastery/progress/ability scores.
- Honest separation of a reported observation, supplied output, GPT interpretation, cited source, independently verified operation and durable persistence receipt.
- A real authenticated, genuinely persistent and reversible vertical slice before approving a production Workbench. Attractive previews or simulated saves do not count as functional acceptance.
- Substantial route, hierarchy, interaction, relation/read-model or even schema changes remain possible **only if justified**, with preservation/migration/rollback and separately authorised deployment.

**Historical scope warning:** The three S06/K reports in open PRs #67–69 were separate, useful TEST-ONLY tutor attempts but strict no-hint independence was qualified in all three; three-layer exact host-to-server call correlation was partial. PR #70 is a useful comparison, not design authority. The 3/3 root-context observation is for deliberately selected indirect-link histories, not a population failure rate. A synthetic Project's generic “Start first step” can reflect intentional exclusion from ordinary continuation, so it is not by itself proof of a real learner continuation bug. Only the Plant run includes fresh desktop browser evidence; no real-user or mobile acceptance is established. Preserve these qualifications whenever citing the reports.

## Broaden the learner activities under examination

Use these as *research jobs*, not mandatory new modules or navigation tabs:

| Learner activity | Question to investigate |
| --- | --- |
| Capture | Can a fragment, question, photo, command result or thought be saved immediately without first selecting or inventing a Project taxonomy? |
| Explore and organise | Can the learner juxtapose evidence, hypotheses and interpretations, make provisional connections and change direction without administrative bookkeeping? |
| Investigate and experiment | Can work in terminal, editor, language conversation, book or physical setting be recorded honestly and resumed without Minamo pretending to execute it? |
| Explain and create | Can the learner draft a model, comparison, explanation, design or other artefact in context, with original sources easily available? |
| Practise and reflect | Can voluntary retrieval, application and revision happen naturally where helpful, without imposed testing or mastery labels? |
| Return and choose | Can someone resume after a gap, find important context, or simply choose among multiple unresolved strands when there is no defensible single “current” answer? |
| Collaborate with GPT | Can the learner deliberately select bounded evidence as conversational context, inspect reasoning and explicitly decide what becomes saved history? |

**Coverage challenge:** The existing Mood-to-Music, retired Cap and Plant-Screamer 3×3 corpus is excellent for technical uncertainty and changed direction, but is not nine independent learning domains. Include at least one non-technical learning/reading/language activity, one sparse/early/no-clear-current-concern case, one capture-before-Project task and one genuine cross-space return in design research. Use existing records or lightweight tasks where possible; do **not** automatically create another extensive fixture programme. Compare a simple baseline (current Minamo, or ChatGPT plus a plain notebook) so additional structure must earn its place.

## Prior-art learning agenda: interactions, not feature inventories

The 31 October [source-pinned reading](research/2026-10-31-prior-art-code-reading.md) of GitLearnOS, DeepTutor and Logseq remains valid within its static-code limits. It explored change semantics, memory layers and explicit versus unlinked references, but **not** an end-to-end hands-on competitor UX comparison.

Before selecting an interface, test these additional mechanisms against comparable learner tasks, without copying third-party code:

- **Heptabase:** a canonical card can occur on multiple working whiteboards; temporary spatial arrangements and source ownership are separate. Investigate active juxtaposition without assuming graph/Atlas revival. [Official explanation](https://wiki.heptabase.com/fundamental-elements).
- **Capacities:** one object appears inline, as a preview, card or embed; useful contextual views need not become new destinations. [Official views](https://docs.capacities.io/reference/views).
- **Gemini Notebook / NotebookLM:** user-controlled source selection, personal Notes as citeable sources, source-grounded AI exchange and deliberate note saving. Investigate a context-selection and proposed-update workflow without pretending Minamo has an embedded model. [Official Notes guide](https://support.google.com/gemininotebook/answer/16262519?hl=en).
- **RemNote:** quick daily capture later organised into durable material, optional practice generated in the writing context. Study the mechanism without importing a mandatory spaced-repetition or scoring programme. [Official guide](https://help.remnote.com/en/articles/6044066-remnote-in-5-minutes).

Distinguish **vendor-described behaviour**, **code evidence**, **actual UI operation** and **owner-observed usefulness**. A competitive feature list is not completion; paid trials or account authorisation require a separate owner choice.

## Earlier candidate directions (historical research alternatives; current comparison is specified above)

Consider at least these genuinely different starting assumptions:

1. **Living inquiry:** one focused, revisable working surface with sources/history progressively available.
2. **Evidence worktable:** temporarily arrange, contrast and annotate several canonical pieces of evidence without a compulsory permanent graph.
3. **Evolving field notebook:** quick observations, drafts and episodes first; questions and consequential change emerge as useful.
4. **Context-controlled GPT collaboration:** select relevant material, ask or challenge, review proposed revisions, explicitly commit what matters.
5. **Minimal integration:** preserve the present Reader/Notes/Library with better entry, relevance and contextual return; challenge whether a large new Workbench is needed at all.

These may overlap; they are **not five screens to implement**. Evaluate how a short practical session, a language/reading activity and a difficult return would actually work. The design may combine their strongest mechanisms. Do not choose a graph, canvas, journal, dashboard or AI chat as a default merely because a competitor implements it.

## Pre-commission sequence and responsibilities

Time-box discovery to roughly **two or three focused research sessions**, not a months-long paper programme or another nine-history build. The following gates deliberately separate what GPT can do from what requires real learner judgement.

| Gate and deliverable | GPT may do autonomously | Requires the owner / real learner |
| --- | --- | --- |
| **D1: Current-system activity map.** Source-and-UI audit across capture, exploration, experimentation, writing, return and GPT; strengths/gaps/complexity map | Read current public source/issues, audit synthetic Site paths with separately authorised Cloud Browser access, identify existing reusable components and precise defects, compare against simple baseline, draft gap-to-decision table | Supply or correct actual everyday friction and priorities; approve authenticated access where needed; never publish private data |
| **D2: Focused prior-art interaction teardown.** Task walkthroughs, observations versus vendor claims, design mechanisms and their risks | Read authoritative docs/code, inspect public demos, operate permitted accessible interfaces, produce comparable research and falsifiable hypotheses | Choose/pay for any restricted service, authenticate third-party accounts where necessary, say which mechanisms feel useful; no subscriptions assumed |
| **D3: Divergent experience study.** Low-cost storyboards/task walkthroughs for several structurally different approaches (including a minimal integration) | Propose alternatives and failure cases, build *clearly labelled* lightweight illustrative interactions only if separately asked, compare to technical/non-technical/sparse tasks; no simulated persistence accepted as success | Try short realistic tasks and report what feels natural, frustrating or unnecessary; **choose what deserves one real build** |
| **D4: Narrow source/projection investigation.** Evidence/rights/latency benchmarks for relevant indirect links | Diagnose existing source/relation coverage; propose or test a small synthetic-only closure with negative rights/cross-persona cases if commissioned; do not impose generated current-state model | Review product meaning where the source is ambiguous; authorise any code changes/test fixture mutations beyond read-only diagnosis |
| **D5: One functional vertical slice.** Authenticated real Note save/reload/conflict, source identity, context return, explicit GPT update/readback | After separate implementation authority: implement bounded branch, run tests, operate authorised synthetic UI/MCP, gather exact receipts, compare alternatives without diverging storage | Choose design direction, judge usefulness on actual tasks, approve schema migration, Site publication, fixture resets and any genuine learner-data writes |
| **D6: Wider acceptance.** 3×3 regressions, mobile/keyboard/assistive checks and natural use | Automate deterministic tests, run consented browser checks, produce evidence ledger, detect regressions and document limitations | Do physical/device and assistive-technology trials where automation cannot substitute; provide lived-use feedback and final acceptance |

**Delegation rule:** GPT can research, read code, operate permitted tools, generate hypotheses, implement explicitly commissioned work and verify objective mechanics. GPT **cannot** establish the owner's subjective usefulness, motivation, cognitive effort, learning outcome or satisfaction by grading its own mock personas. It cannot authorise purchases, permission expansion, third-party login, production deployment or sensitive data use on the owner's behalf. Owner feedback need not be a prolonged usability programme: a few genuine 15–30-minute tasks with candid observations is a better discriminator than more fictional “happiness” scores.

**Parallel-track clarification:** Ongoing #12/#14/#17/#18 test/observability tasks retain their independent scope and strict verdicts. They do **not** hold up D1–D3 research. A narrow read-projection bug fix may be explored alongside discovery. Do not block the product-design question on six more cold chats, and do not claim those chats completed when they have not. Technical release/acceptance gates apply later to actual implementation and deployment.

## Stop conditions and next commission

Before any Workbench implementation brief, require:

1. A concise evidence-backed map of **what Minamo currently enables** across the full learning cycle, including reusable Reader, Notes, Activities, Library, search and MCP capabilities.
2. A small set of contrasting interaction hypotheses with their *unique* benefit, trade-off and failure condition; not different skins over the same three assumed tabs.
3. Use the owner's existing first-hand complaint as the starting requirement. Include a non-technical/sparse task challenge and simple-current-product baseline; before product acceptance, have the owner evaluate at least one actual candidate task without asking them to repeat the generic diagnosis.
4. A list of what can be achieved by UI/navigation changes, read projection or minor domain changes, versus what would require schema/record migration.
5. An explicit owner choice of the **one bounded real-persistence vertical slice** to commission next, including task, permitted synthetic state, acceptance, rollback and deploy authority.

No automatic acceptance because a screenshot is polished, CI is green, GPT retrieves every record, or an interface reproduces one competitor's feature. The owner may reject the proposed Workbench, choose a narrower change or commission substantial redesign. Preserve negative findings.

## Earlier fresh-chat instruction (superseded by the owner-selected execution order above)

For the next Minamo development/design chat: **first read this decision, AGENTS.md and current public main/issue #51/PR status.** Treat the Work/Questions/Evolution contract and prior A/B/gate sequence as historical hypotheses, not current marching orders. Start from the completed D1 technical inventory, the [first-hand owner diagnosis](ux/2026-11-01-owner-firsthand-ux-feedback.md) the [Project/Stage root-cause audit](research/2026-11-01-project-stage-continuity-root-cause-audit.md) and [connected-episode follow-up](research/2026-11-01-connected-episode-ledger-and-divergent-interactions.md); **do not ask those generic questions again**. Trace the Project/Stage/Note/Library/Activity joins and stale return sources, then make a bounded D2/D3 proposal. Report clearly:

- what GPT can do now without further owner involvement;
- the minimal specific owner observation/choice needed next;
- what remains untested or requires separate permission;
- whether any coding, fixture mutation or deployment is proposed (none is implied by this decision).

Do not jump from this documentation to a prototype, schema migration, Site deployment, test reset or real learner-data write. Seek the owner gate after the short discovery tranche.
