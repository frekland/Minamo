# PR #79 — Learner-experience implementation contract

**Owner clarification, 2 November 2026 · binding product design for draft PR #79, not implementation or deployment authority.** Read with the canonical learner-first blueprint and D0–D11 architecture. This is the short, executable contract for the *learner-facing result*. In a conflict over the primary experience or GPT handoff priority, this later owner clarification supersedes earlier C5/D7 copy/open emphasis. The security and source-rights guarantees remain.

## 1. The product we are building

Minamo should be a place where a learner can **encounter useful material, do something with it, think or write, notice what genuinely changed and pick up naturally later**. It must improve the experience of learning rather than primarily the experience of recording learning. The learner is not a database administrator and must not need to understand Journey/Stage/Investigation/Development/RecordLink concepts.

**The existing natural-language GPT ↔ Minamo MCP conversation is a strength.** The owner reports that asking GPT naturally to continue, discuss and explicitly update Minamo has worked very effectively. Preserve that workflow and extend its record compatibility only where necessary for Stage-free Work and projectless updates. Do not redesign it as a mandatory Site → clipboard → GPT → Site ceremony. A separate Site handoff is an optional convenience, not a product-cutover gate, and must not take precedence over the site learning experience. If retained, it respects source export permission and defaults to source identities rather than copying private prose. Ordinary GPT/MCP interactions still require rights, explicit save authority, idempotency and independent fresh-chat readback.

**Hard negative constraints:** no compulsory Project, Work, Stage, Inquiry, Question classification, study Session, status score, formal checkpoint, separate progress ledger, duplicate Note editor, backend coverage panel, publication-console detour, automated fabricated current state or old route shell underneath new headings. No artificial GPT mastery commentary.

Study / Find / Notebook are **working navigation labels**, not new silos or a requirement to file each action. One primary material/undertaking remains available while finding, practising and writing; changing location must not destroy source position, draft or return route.

### Learning value, not merely record access

A learner should be able to **do something intellectually useful at each visit**, even if nothing is saved. For a networking Article, that might mean predicting what a command will show, trying an authored task, inspecting the result and revising a hypothesis. For Japanese, it might mean reading a real example with furigana, attempting an expression, checking feedback and noting a point of confusion. These are optional learning actions close to the substantive material, not formal assessment steps. Reuse real authored Activities, examples and existing execution/practice engines; don't generate a fake quiz, score or completed flag from a Note. Let the learner choose to explore further, try another example or continue elsewhere.

**Progress is experiential and evidential:** “I worked through this, discovered that assumption failed, and want to try this next” can be supported by an actual Attempt/Note/correction. A mere click, save count, last Step, GPT prose or externally reported command is not proof of understanding. Where no explicit change was saved, show the original work and a useful way to compare or continue.

## 2. The single connected Study surface

The most important unit is **what the learner is attending to now**. Implement one content-dominant Study canvas with the following responsibilities, not a dashboard of backend record types:

1. **Primary material or task.** An Article passage, Activity task, original Note, independent Question, practical evidence, or optional named Work occupies the first useful viewport. Exactly one meaningful title. Reader contents and language tools remain available without a second page header.
2. **Nearby useful action.** Show at most three context-appropriate actions, usually *Note on this*, *Try a related activity* or *Return to source*. These actions work, rather than merely navigate to an old full-page application. Do not render controls irrelevant to the current material.
3. **Writing without filing.** The existing rich Notes editor opens alongside the material on desktop and as a full-width sheet on mobile. One free-form Note with optional exact source chip; no required Prediction/Outcome/Progress/Record-a-change form. The original stays recoverable; one actual save/receipt owns the visible result.
4. **Lightweight context, on demand.** A compact Related/History action opens specific original entries with a human reason. Their actor, time, revision, link quality and missing evidence are inspectable; raw API/coverage/hash text does not dominate.
5. **Reliable return.** The actual passage/task/edition survives Activity → Note → source, additional browsing, new tabs, refresh and Back/Forward where available. A visit is not a saved relation or a claimed learning achievement.

A learner must be able to use the Site for weeks without ever making Work, recording a formal Development or interacting with a GPT handoff widget.

### A. Ordinary start and spontaneous idea

With no selected item, start quietly: **Find something**, **New Note**, **Try an activity** and eligible genuinely saved **Continue** entries. No empty scan cards. One click opens a real Note draft; typing and autosave work. Reopening shows the original writing; locally unsaved and online-committed states remain distinct.

A saved entry can be resumed from Study or Notebook regardless of category. A recently viewed source may be labelled *Recently opened* but is never passed off as saved work or a next intention.

### B. Read → try → think → return

An Article begins with substantive explanation, code, examples or language content, not the record wrapper. A genuinely eligible Activity is offered adjacent to the relevant concept or passage, with older/unpinned eligibility described accurately. Opening it presents the Task, not *Your attempt*. The learner can try, inspect feedback or the result, jot a free Note and return to the exact source. The Note and Attempt are visible where relevant on the next visit. Optional prediction/reflection prompts may help learning but never become mandatory fields.

**Reject** if this journey opens duplicate Reader/Activity Studio shells, shows source hashes above the Task, hides Activity under Tool, requires a Stage or loses the original position.

### C. Find by meaning, not record type

One natural Find query searches admitted **Articles, Activities, personal Notes, independent Questions and new Work by default**, with meaningful result groupings and optional scope filters. The learner should not know which record family held a remembered idea. Match useful body passages and tasks as well as titles; show why a result matters and open it directly. Use server-side owner/rights/space/generation/synthetic filtering, stable pagination and exact edition semantics. Notebook may provide personal writing filters, but is not a separate search universe.

If no material is suitable, *Ask GPT about this* can simply tell the learner that natural GPT/MCP conversation is available; creating new material through existing preview/permission commands is optional and must not expose publishing internals to ordinary learning. Do not force a site-to-GPT clipboard process.

Legacy Journeys remain **Off by default** under Settings → Workspace as the owner requested. A restrained *Search older Journeys* affordance can lead to that preference for a deliberate legacy lookup, including when ordinary results exist but do not answer the query; no silent legacy title leaks, permanent Journey tab or discovery filter after pagination. Existing direct old links always open.

### D. Pick up an evolving undertaking

Work is optional, Stage-free and easy to create/reopen from a relevant Note, Activity, saved source or a quiet *Resume work* affordance; it is not a fourth compulsory navigation section. A Work record supplies an identity, not authoritative progress. It can change direction and acquire late accepted links without rewriting original Notes or older Journeys.

**Opening Work must first answer the learner's practical question: what is worth attending to now?** The first viewport is a small *working orientation* based on admitted originals, rather than a static plan plus a record feed:

- **Where I left off:** one relevant dated original Note, Attempt or explicit saved update, linked to its exact source; show several separate strands rather than inventing one if needed.
- **What changed:** an intelligible, source-linked explicit correction or decision *with its recorded reason* where available; show a competing earlier account when consequential. Never infer causality merely from newer prose.
- **Still open / next:** only genuinely saved uncertainties and intentions, with a direct action to resume the pertinent material. If unavailable, provide a neutral *Choose what to explore* action, not a technical error paragraph.
- **Inspect the evidence:** one action to reach each original; the old Stage outline is an optional historical guide, never the main working surface.

A Work page with only recent Note cards and a Related list is **not sufficient**. It must help the learner move from a consequential change to its original source and on to meaningful doing, in one connected path. Don't repeat the same checkpoint in multiple cards.

For *ordinary unstructured history* without typed updates, show original dated writing and a one-action **Compare these entries** view (or comparable side-by-side/contextual inspection) before proposing an interpretation. It can expose recorded differences and contradictions as original quotations, but must not pretend to establish a reason or settled understanding. GPT can help through the already-effective natural-language MCP workflow when the learner chooses; no in-Site inference promise or mandatory semantic-tagging ritual. Site-only *Record a change* remains optional and secondary, not required for useful return.

### E. Continue old work without administration

An exact old Journey link works even while legacy discovery is Off. *Continue as Work* offers one understandable, previewed adoption action, keeping old Stages and Notes unchanged. The learner can accept a bounded set of suggested links in one review rather than manually organising dozens of entries. Older evidence remains reachable, but does not silently become a present claim. Check a realistic history with many Notes and pivots, not just a two-record example.

### F. Natural GPT/MCP learning continuity

The learner may simply say in connected GPT, **“Let's continue my mood-to-music investigation”**, **“What changed in my understanding?”**, or **“Update Minamo with what we've worked out.”** GPT reads canonical admitted records and holds a natural conversation. A deliberate update persists one original entry and compatible typed semantics without requiring a Stage or a sequence of manual MCP calls. A fresh GPT conversation can find it.

The explicit natural-language update request is the primary authorisation signal for a bounded, faithful save; ask a further clarifying/approval question when the payload, inferred causal assertion, additional links or permissions are materially ambiguous. Do not require a separate confirmation ritual for every ordinary, clearly scoped update. GPT proposals and unaccepted links are not writes. Preserve established MCP behaviours wherever already sufficient; the domain extension is not a reason to replace the conversational UX.

**Do not make a Site copy/open handoff a required first-release user journey.** If a small optional link or handoff remains, it must be truthful, consented, export-safe and out of the primary learning path. The normal product acceptance tests use an already connected GPT session directly, not a fabricated Site transport ceremony.

### G. Language, practical work and interruption

The same surface supports Japanese ruby/furigana, Mandarin and other language reading, input composition, audio and practice, as well as code, diagrams, terminal observations and externally sourced practical work. Preserve the distinction between what the learner reported, an artefact they supplied, GPT/connector lookup and independently observed execution. Externally changing facts have source and check time, not invented live status.

Saved originals can continue on Android after desktop work. Device-local drafts, reading positions and legacy preference are not falsely represented as synchronised. Failure, changed permissions, stale revisions, conflicts and lost acknowledgement never silently discard writing or show another owner's information.

## 3. Implementation composition and state changes

Build the interaction, not merely the component inventory:

| User moment | Primary screen | Persistent state change | No-go |
| --- | --- | --- | --- |
| Unplanned curiosity | Study start → Note | Normal Note only | Mandatory Work/classification |
| Article reading | Real content → relevant Task | Only actual Attempt/Note save | Legacy page within Study |
| Note on source | Content + Note sheet | Exactly accepted original link, CAS receipt | Auto-link from co-visit or second editor |
| Returning to Work | Original work + meaningful changes + nearby source | None from reading | Static Steps/feed or inferred status |
| Comparing old prose | Two exact originals in context | None unless deliberate update | Fake causal explanation |
| Finding an idea | One cross-family Find | None from search | Search by backend type first |
| GPT continuation | Natural connected chat | One explicitly requested save | Checkpoint ceremony or obligatory clipboard |
| Old Journey adoption | Exact legacy material → optional Work | Only previewed accepted links | Destructive conversion or manual mass filing |

The implementation must use content-level Reader/Activity/Notes engines, the existing Notes coordinator, validated origin codec and bounded canonical reads. No imports of full `JourneyRoute`, `LearningHome`, `WorkingContextHost` or old `ActivityStudio` shells into `app/study/*`. Respect the D9 full feature-disposition and exact #78 donor manifest. Use a **single active selection/return model** so a Note, Activity or search does not create a separate navigator with its own stale context.

## 4. Build sequence and owner decision points

All C1–C7 **except the retired mandatory Site handoff interpretation of C5**, L1–L5 and M1–M5 remain required for the accepted product. C5 is now **natural GPT/MCP continuity and Site reflection of committed updates**; the separate clipboard/Open ChatGPT feature is optional. Keep source/rights and native-host security invariants.

- **D0 — short technical compatibility proof:** prove new Work family, atomic stage-free/source-free update, exact claim correction anchors, old/new readers, authentic Note link-flight compatibility and source donor dependency closure on disposable D1. Record precise incompatibilities. Do not demand the new UI's browser, cross-device or search behaviour before it exists.
- **A — first genuinely new learning loop:** one Study surface, ordinary Note, meaningful full-content Find, Article→Activity→Note→source, no old shells, legacy recovery, desktop and narrow browser. **Owner sees and uses this actual candidate**, while understanding it is incomplete.
- **B — meaningful continuation:** integrated Work orientation, late links, sparse/contradictory prose comparison, corrections, Site-only optional semantic capture, natural GPT/MCP update and fresh-chat readback, external evidence, missing-material creation and multiple saved revisions. **Owner evaluates a real changing-work return before C polish.**
- **C — product-quality and cutover:** complete feature parity, accessibility, Android/IME, ordinary longitudinal use and nontechnical/language paths; fix observed friction. All mandatory requirements pass, followed by explicit owner usefulness acceptance. A targeted owner-authorised opt-in engineering deployment can occur earlier under the fast Sites gate; it is not product acceptance.

Do not split P1 product outcomes into a later enhancement programme. But do not hold the whole frontend hostage to proving UI outcomes during D0. Each checkpoint records a real learner action, an exact source/receipt and the remaining gap.

## 5. Non-negotiable learner acceptance episodes

Test unprompted tasks with authentic authenticated browser state and existing isolated synthetic histories, not instructions telling the evaluator where to click. Keep the owner account free of synthetic pollution. Compare to V95 on successful learning actions, source return, unnecessary navigation/backtracks, visible content, lost drafts and the owner's actual judgement. Measure time only if instrumented, never invent a satisfaction score.

**Episode 1 — everyday learning:** Start with no Work. Find a non-title Article passage, try a related Activity, jot a Note, return exactly, change the Note, then find it later by remembered subject rather than record type. The interface is calm and content-first throughout.

**Episode 2 — messy return:** Several free-form Notes over days, a misconception corrected in prose, two independent strands, no explicit checkpoint, one unrelated recent visit. Open the relevant saved work after a gap. The primary screen shows what was actually written and a useful comparison/next route, without claiming a reason that was never saved. The learner can proceed without filing everything into Work.

**Episode 3 — evolving Work:** Begin a practical/software undertaking, change direction, attach an older Note later, record competing interpretations, return after other activity, inspect the earlier claim and resume a genuinely relevant source. Legacy Stage outline does not dominate. Try adoption from a substantial historical Journey without dozens of manual relation operations.

**Episode 4 — natural GPT continuity:** Discuss and save naturally in GPT/MCP with no selected Work, then continue in a genuinely fresh chat; inspect the saved entry and related material on the Site. No obligatory Site handoff, formal assessment or duplicate Note/Development cards. Repeat updates over multiple pivots, not a single happy-path replay.

**Episode 5 — language and devices:** Japanese or another language source → practice → authentic Note → exact return with ruby/input intact. Later return on Android, distinguishing server-saved originals from device-local draft/view state.

**Absolute rejection signals:** a primary first viewport dominated by a Stage roadmap, empty backend coverage, record-type label, repeated headings, list of detached progress cards, a user-maintained relation taxonomy, publication machinery, or GPT handoff controls. A technically correct history that cannot support the real learner's next action is a failed product candidate.

## 6. Traceability and implementation handoff

| Product obligation | Existing/proposed code seam | Proof |
| --- | --- | --- |
| Content-dominant Study | `app/workspace.tsx`, new `app/study/*`, extracted `reader.tsx` primitives | Rendered DOM; first viewport and old-shell prohibition |
| Doing in context | `app/activity-studio.tsx`, `app/source-activities.tsx`, `lib/practice-index.ts` | Article→Task→Note→exact return |
| One authentic Note | `app/notes-panel.tsx`, `lib/note-sync.ts`, `lib/note-capture-context.ts` | CAS, rapid link-chip flight, conflict/recovery |
| Find by meaning | `lib/catalogue.ts`, domain search, new Study Find | Non-title cross-family authenticated query, pagination and rights |
| Useful return | `lib/learning-work.ts`, `lib/project-context.ts`, selectively extracted #78 reads, new Study presenter | Sparse, contradictory, partial, old/new evidence first viewport |
| Stage-free optional Work | `lib/contracts.ts`, domain commands, family filters, D1 and MCP | Lifecycle, old links, late relationship, archive/readback |
| Natural GPT continuity | Current installed Minamo MCP and compatible update operation | Conversational no-Work save, independent fresh-chat retrieval |
| Language/mobile and recovery | Rich Reader/Activity/Notes engines, origin and preference adapters | Physical narrow device, keyboard/IME, rights and rollback |

**Agent instruction:** Treat this contract as the learner-facing acceptance authority. The larger blueprint and D0–D11 remain the technical authority where they do not contradict the owner's later GPT-handoff correction. Show the owner actual work in the replacement UI, not diagrams, a test count or a series of screenshots of attractive empty shells. No schema migration, learner data write, PR merge, live Sites deployment or access-policy change is authorised by these documents.
