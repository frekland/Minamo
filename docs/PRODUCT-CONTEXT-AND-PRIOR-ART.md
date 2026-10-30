# Product context, prior-art lessons, and development orientation

**Updated 30 October 2026.** This is a public, deliberately sanitised orientation for a new contributor or a fresh ChatGPT conversation. It is a *product decision and investigation guide*, not a claim that all linked features are shipped or that the acceptance tests establish learning outcomes.

**Read this alongside the [recovered learner-experience redesign strategy](LEARNER-EXPERIENCE-REDESIGN-STRATEGY.md).** It restores the detailed owner feedback, historical experience decisions, prior-art comparison gates and post-#17 product-design path. The broader UX problem is **not solved** by giving GPT a better checkpoint summary, and no new Project hierarchy or visual UI has yet been chosen.

## The problem Minamo is trying to solve

A learner can build a Project over weeks: change goals, try things in a specialist tool, make mistakes, revise an explanation, leave a Note, question an Article, ask GPT for help and return in a fresh conversation. Minamo should make that evolving investigation **coherent, trustworthy, easy to inspect and natural to continue**.

The success criterion is not a large number of features, saved records, connections, checkpoints or MCP calls. On return, a learner should be able to answer:

- What am I investigating now, and how did the direction change?
- What did I actually try or observe? What was merely reported, inferred or proposed?
- Which decisions and reasons still apply? Which were superseded, contradicted or left open?
- Where is the relevant Note, evidence, Library explanation or earlier Question?
- What could I usefully do next, without being forced into a predetermined stage or assessment?

The learner decides their goals and owns their conclusions. GPT can help interpret, explain, retrieve and propose; it should not silently save progress, grade learning, assign mastery or turn an explicit checkpoint into a hidden assessment.

## What earlier product research suggested

A qualitative October 2026 comparison looked across contemporary knowledge, tutoring and research products and earlier Personal Learning Environment / knowledge-building work. These are **design precedents, not audited feature-parity claims** or evidence that Minamo is better than any alternative.

| Precedent | Relevant insight | Boundary or risk for Minamo |
| --- | --- | --- |
| [Heptabase](https://heptabase.com/) | People actively rearrange, connect and work with material; retrieval alone is not sense-making. | Do not assume a graph or canvas automatically provides continuity. |
| [GitLearnOS](https://github.com/Guojiz/gitlearnos) | Agent-assisted, learner-owned evidence and reversible history can support changing decisions. | Keep record/version complexity behind clear user actions; avoid Git administration as the user interface. |
| [DeepTutor](https://github.com/HKUDS/DeepTutor) | Long-lived learner context and adaptive help across activities matter. | Avoid unrequested ability scoring, hidden psychometric profiles and claimed comprehension. |
| [RemNote](https://www.remnote.com/) | Notes, references, questions and review can support one another. | Minamo is not obliged to impose spaced-repetition, formal curriculum or mastery targets. |
| Capacities, Tana, Fabric, Notion AI, NotebookLM and ChatGPT Projects | Structured relationships, external sources and AI assistance are established ideas. | Integration quality and actual use matter more than claiming novelty from the feature list. |
| Personal Learning Environments and knowledge-building research | Learning is an evolving, personally directed activity with contributions, context and revisable ideas. | Do not reduce learning to document storage, a fixed syllabus or completion indicators. |

The specific hypothesis worth pursuing is **integrated, learner-directed continuity** across Projects, Questions, Library, Notes, annotations/Flags, external evidence and deliberately authorised GPT/MCP updates. It must be demonstrated in longitudinal use, not asserted as a market distinction.

Minamo should complement specialist environments—terminal/VM, coding editor, language practice, physical experiments, archives and other apps—rather than recreate them. Connections and evidence from those tools should carry their actual provenance.

## Owner-observed problem, not a hypothetical visual-test defect

The current Site has substantial unresolved problems with Project orientation and learning continuity. In particular:

1. Ordered Project stages often dominate even when ongoing work has branched or changed direction.
2. Questions, Notes, annotations, evidence and checkpoints can feel like separate destinations rather than one understandable account.
3. Saved technical facts and links are not equivalent to a useful explanation of *where the work stands*.
4. Earlier visual/graph approaches did not resolve the sense-making problem.
5. MCP can reconstruct individual records but a natural Project overview may require many reads and GPT-side assembly.

These are **product observations and investigation hypotheses**, not yet a proven database-root-cause diagnosis. A prettier Project screen or a new global progress dashboard is not the chosen next intervention.

The next question is whether Minamo's **server-side learner-context projection, temporal relationships, read contracts and write choreography** can make sense of the existing source records more faithfully. First investigate, measure and prototype the smallest needed change; then decide what the UI should expose. See [longitudinal closeout and architecture experiment](acceptance/2026-10-30-m2m-v3-closeout-and-learner-context-roadmap.md).

## What the synthetic system is for

The versioned Mood-to-Music Project is a **test instrument for Minamo**, not a React application to perfect. It preserves a fictional learner's changing code, decisions, misunderstandings, observations, Notes and Questions. Its imperfect storage/consent/clearing behaviour is intentional scenario material.

The repeatable cycle is:

1. Establish a versioned synthetic learner history and exact Minamo source/build baseline.
2. Ask an ordinary fresh GPT to retrieve current canonical state and respond to the fictional User.
3. Record authorised writes, receipts and transcript evidence, then independently reconstruct and review.
4. Determine whether the **Minamo architecture** hid, lost, misrepresented or awkwardly exposed meaningful context.
5. Make one bounded architecture/MCP improvement, rerun the same fixture and compare outcomes.

A source permalink proves *which code was cited*, not that it executed. A model-submitted transcript does not independently observe every MCP request or failure. Canonical state receipts do not prove learner understanding.

### Current evidence state

The six-session synthetic S01/F–S06/K longitudinal GPT/MCP run completed with a **bounded PASS** in independent cold-context reviews. At the 30 October closeout: scenario `mood-to-music/3`, phase K, epoch 3, controller revision 21, no pending transition; transcript `TEST-ONLY-m2m-r3-s01-v77-20261030` remains **open**, revision/event count 40/40. Neither the run nor the source code is a proof of real-site usability or assessed comprehension. See [run tracker #16](https://github.com/frekland/Minamo/issues/16) and the [full closeout](acceptance/2026-10-30-m2m-v3-closeout-and-learner-context-roadmap.md).

### Next order (do not reverse casually)

1. **Maintain source and evidence hygiene:** integrate reviewed stacked source PRs and historical acceptance reports; pin actual source versions.
2. **Fix intrusive mastery/assessment wording:** ordinary MCP descriptions and checkpoint context should speak about choices, evidence, uncertainty and explicit authorisation, without prompting GPT to congratulate or disclaim mastery. [Continuity issue #14](https://github.com/frekland/Minamo/issues/14).
3. **Synthetic observation architecture:** [#17](https://github.com/frekland/Minamo/issues/17) stage 2 server-received MCP call/error/latency correlation and stage 3 canonical pre/post state diffs. Distinguish from model-authored transcript. Keep data bounded, redacted and TEST-ONLY.
4. **Diagnose context assembly and MCP cost:** read-only benchmark against existing F/H/K history under [#14](https://github.com/frekland/Minamo/issues/14). Compare precise record coverage, decisions/reasons, provenance, contradictions, extra calls and latency.
5. **Prototype the smallest data/read/write contract improvement**, then repeat the *same* synthetic Project to measure context usefulness and fidelity.
6. **Later:** additional subjects and fictional learner variants [#12](https://github.com/frekland/Minamo/issues/12); selective visual/UI testing [#18](https://github.com/frekland/Minamo/issues/18) only once a meaningful architectural/interface hypothesis is ready.

External code execution/source-bound receipts are a **separate, focused investigation** in [#11](https://github.com/frekland/Minamo/issues/11). Begin with one pinned claim using existing GitHub/CI/local evidence; do not build a general runner or artifact schema by assumption. Historical issue text may be superseded by newer status banners and this decision record.

## Fresh-chat reading order and boundaries

For a development-orientation request, **first read this document**, [the V3 closeout/roadmap](acceptance/2026-10-30-m2m-v3-closeout-and-learner-context-roadmap.md), [TESTING](TESTING.md), issues [#14](https://github.com/frekland/Minamo/issues/14), [#17](https://github.com/frekland/Minamo/issues/17), [#11](https://github.com/frekland/Minamo/issues/11), and the relevant currently open PRs. Consult [Architecture](ARCHITECTURE.md) and actual source before proposing a schema or API change. Check current GitHub merge status and live Site source independently; dated state above may have advanced.

Keep these distinctions visible in every recommendation:

- User-authored, GPT-authored and externally observed data are different.
- Current state, historical state and superseded interpretation are different.
- A tool's successful write, a valid checkpoint and a learner's understanding are different.
- Synthetic server traces, transcript claims, GitHub CI receipts and browser observations are different.
- A GitHub merge is not a Sites deployment.
- Synthetic test resets, Site publication and real-user data changes require separate explicit authority.

This guide intentionally omits owner-private learning data, credentials, exact private Site administration details and unreviewed internal research documents.
