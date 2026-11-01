# Direct owner UX feedback — connected work and trustworthy return

**Owner-supplied first-hand product evidence · 1 November 2026 · CURRENT PROBLEM PRIORITY.** This is a correction to the GPT-led [D1 existing-capability audit](2026-11-01-d1-existing-capability-gap-audit.md) and its [PR #72](https://github.com/frekland/Minamo/pull/72) framing. Read with the [superseding product-design decision](../PRODUCT-DESIGN-DISCOVERY-DECISION-2026-11-01.md). It does **not** authorise an implementation, fixture write, migration or deployment.

## What the owner actually reported

In response to the four speculative “what remains unresolved” questions, the owner rejected that framing (“1–4 no no no no”) and supplied direct answers to the three proposed real-use prompts:

1. **Spontaneous capture:** “note remains disconnected.”
2. **Actual reading/doing:** “project and stages are biggest problem, disconnected and unadaptive. Library articles difficult to find and navigate and hard to connect with activity.”
3. **Return after a gap:** “what was I last doing and what was the next intended activity, what problems were outstanding, misconceptions that were addressed, progress made. All of it was stale.”

These are **owner observations and product requirements**, not hypothetical GPT reactions or a synthetic user interview. They do not prove server data loss or a particular engineering root cause. Do not ask the owner to answer the same four abstract questions or repeat the three prompts merely to “validate” that these problems exist.

## Priority correction to D1

**The key product failure is now described, not merely suspected:** learning work is disconnected across Notes, Projects, Stages, Library, Activities and return; Project/Stage experience is the owner's **biggest problem**. Return information is experienced as stale across *all* of the following: last actual activity, next intended activity, outstanding problems, misconceptions addressed and progress made.

A component inventory remains useful for preventing duplicate engineering, but **“a capability exists” is not evidence of a coherent or adaptive experience**. The existence of global Notes, RecordLinks, Home Continue, checkpoints, GPT context and Activities did not solve the owner's lived workflow. The earlier recommendation to treat integration as a possible friction and request more general owner feedback was overly tentative. A minimal navigation/polish hypothesis may still be evaluated, but must earn its place against the reported failure; do not assume it will suffice.

| Owner problem | Prior D1 fact that must not dilute it | Design outcome to investigate | Evidence still needed from GPT |
| --- | --- | --- | --- |
| **Notes remain disconnected** | Standalone and source-linked Notes exist; Your work supports record relations | Writing and evidence must be usable in the task where they matter, with explicit learner-controlled linking and context return; avoid forcing a Project assignment for every capture | Trace Note → context/work surface → Activity or Question → return, including deliberately unlinked and linked cases; identify where visibility/usefulness breaks |
| **Projects and Stages are disconnected and unadaptive** — **highest owner priority** | Home/project continuation chooses some saved Notes/checkpoints; Steps, Questions and Activities are implemented | The working context should respond to what actually happened and the learner's current intentions, not remain a stale ordered Stage syllabus. Preserve independent strands and source provenance; do not fabricate one authoritative “current concern” | Trace Project/Stage UI inputs, continuation heuristics, actual Note/Question/Activity linkage, latest-versus-old precedence and gaps from existing synthetic histories |
| **Library articles hard to discover, navigate and connect to activity** | Library Subjects/Articles, search, section anchors, backlinks and Reader controls exist | Find relevant material from the active task, move within it, use it in an Activity/Note, and return without losing the task; not simply more catalogue links | Compare task-first discovery, Reader navigation and Activity-source affordances in live/synthetic paths; map exact interruption points and search state bug |
| **Return state entirely stale** | Home Continue/Recent Notes and Project read projections exist; direct Project root context has a known bounded indirect-link miss in selected V89 cases | On return, accurately present: **last actual work**, **next intended action**, **open problems**, **misconceptions revised or corrected**, **what genuinely changed/progressed**. Each claim needs time, source and uncertainty. Do not equate a Stage tick, saved record or claimed run with verified learning | Check available canonical evidence, recency, indirect relation coverage, conflicting histories, empty/ambiguous cases and what present read models omit. Distinguish “source recorded,” “learner reported,” “observed,” “inferred” and “unknown” |

**“Progress” means an honest account of work and changed understanding, not a compulsory score, mastery estimate or synthetic completion percentage.** “Adaptive” is a task/continuity requirement, not permission for hidden autonomous reclassification or writes. Any proposed synthesis must remain attributable, inspectable, uncertainty-aware and reversible.

## Design/engineering consequences

1. **Reweight discovery around a connected learning episode and cold return**, with Project/Stage at the centre while retaining Library, Notes and Activity as equal context participants. The owner is not commissioning the old three-pane Work/Questions/Evolution contract or a predetermined Workbench.
2. **Do not make the owner repeat the diagnosis.** D1's earlier “owner feedback pending” is superseded for problem identification. It is still reasonable to seek the owner's judgement *after* GPT presents specific contrasting solutions and a functional candidate; further device/assistive evaluations remain separate.
3. **Autonomous next step:** produce a focused traceability matrix, using existing public source, tests and already-authorised read-only synthetic/browser paths, answering for each of the five return questions: which canonical records can supply it, how old/stale it can be, what the UI currently chooses, which relations it misses and what can truthfully be shown when evidence is absent. Include actual task-to-Library-to-Activity and Note-in-task routes. This can expose whether the root cause is retrieval, projection, interaction hierarchy or domain semantics without choosing the solution in advance.
4. **D2/D3 should be directed by this evidence.** Evaluate a few structurally distinct ways to *work with connected material and resume truthfully*—including minimal integration and more fundamental Project/Stage reorganisation—against the same reported tasks. Prior art should be used for specific interaction mechanisms (contextual object use, juxtaposition, source selection, field notebook), not as a feature checklist.
5. **Implementation remains a later owner gate.** A code/route/schema change, synthetic persisted write, real learner-data manipulation or Site deploy still requires the applicable explicit scope and verification. Preserve source/revision rights, owner control and the V88/V89 technical evidence limits.

## Practical acceptance questions for a future candidate

These are **criteria for a proposed solution**, not a request to restate the complaint:

- After a break, does opening an evolving Project identify the **last actual recorded work**, not only the nominal current Stage?
- Is the **next intended activity** visible if it was explicitly recorded, or honestly unknown if not? Can the learner correct it?
- Are **outstanding problems** and **misconceptions already addressed** distinguished from old or superseded checkpoints, with links to the relevant Note/Question/attempt and time?
- Can the learner see **what genuinely changed** without invented mastery or forced single-path progress?
- Can a relevant **Library Article** be found from the task, navigated to the exact material, used during an **Activity or Note**, and returned from without losing context?
- Can a Note become **active working evidence** with learner-chosen connections rather than remain another disconnected item in Your work?
- Do these paths work for a sparse/new case and a contradictory multi-strand history, without leaking private data or silently elevating GPT interpretation?

**Status:** Owner problem statement received; no additional generic UX questionnaire is required before focused GPT research. No solution or prototype has yet passed these criteria, and no UI, domain, learning record or deployment change is authorised by this note.
