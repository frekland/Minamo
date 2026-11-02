# PR #79 architecture decisions and executable learner contracts

**2 November 2026 · binding design specification for draft PR #79 · not an implementation, migration or release authorisation.** This supplements the [learner-first product-reset blueprint](../LEARNER-FIRST-PRODUCT-RESET-CODE-BLUEPRINT.md). It resolves the architectural ambiguity identified in the second cross-repository review. Read it **before** Increment A. When this document gives a selected design, an implementing agent may not silently replace it with a Stage, a compulsory work thread, a new status table or the V95 host. A demonstrated source-level incompatibility is a **stop-and-amend decision**, not a licence to improvise a different product.

The objective remains simple: encounter useful material, think or practise, write, explicitly save what matters through Minamo or GPT, and later understand *what actually changed* without administering a record hierarchy.

## D0. Bounded architecture gate before new UI

Finish this gate on disposable D1 and source code before building the Study shell. It is an engineering decision/proof, **not** another open-ended product research or nine-persona programme.

| Decision/proof | Selected baseline | Pass evidence | Stop condition |
| --- | --- | --- | --- |
| Work identity | Versioned, Stage-free Journey **record** purpose (below), not another permanent work table | Create/open/pivot/archive/reopen and read legacy v1 without rewriting it | Existing command/validator invariants cannot safely accept v2 work |
| Explicit update | One owner-authorised transaction producing one original Note and one typed Development, with one user-visible entry | Atomic D1 fault/replay/CAS tests, old/new readers, genuinely new-chat MCP readback | Any partial Note/Development/receipt or Stage requirement |
| Meaningful return | Read-only, evidence-admitted causal projection from typed developments and original records | Contradiction, sparse, late-link, pagination, revoked-source and two-hop tests | Newest prose promoted to settled fact or incomplete read reported as complete |
| Proposal-assisted organisation | GPT may suggest exact relations; user confirms the bundle once | One update with accepted links and one without, zero writes from merely visiting | User must maintain a thread/taxonomy or speculative relation saved silently |
| Source extraction | Fresh public main + exact #78 donor dependency/retirement manifest | Compiles without the old learner shells; actual browser DOM proves non-nesting | Missing contracts/API tests or copied legacy composition |
| Product feedback | Connected A+B experience, not A-only shell | Early owner walkthrough of one authentic task before C polish | Same disconnected journey under new headings |

Record the chosen v2 validator and read-path changes, migration/no-migration conclusion, failed alternatives and exact commits in a short D0 receipt on the implementation branch. **No real owner records are rewritten by D0.** A schema, hosted-data or migration change still requires the owner's separate explicit approval.

## D1. One optional work identity: use canonical records, not a second ontology

**Decision:** represent *new* evolving work as an existing canonical Journey-family record with a versioned, explicitly declared purpose. Do not create a separate WorkStatus, CurrentConcern, Session, Thread or WorkAnchor database by default. The technical family name stays behind the adapter; the learner sees a named area of work, if they want one.

Proposed discriminated addition to LearningShape, subject to actual validator compatibility proof:

~~~ts
type JourneyShapeV2 =
  | { version: 2; kind: 'journey'; purpose: 'work'; archivedAt?: string }
  | { version: 2; kind: 'journey'; purpose: 'guide';
      stages?: ExistingAuthoredStage[]; archivedAt?: string };

type WorkFocus = { kind: 'journey-record'; id: string }; // no Stage required
~~~

* A new evolving undertaking is a Journey record with purpose=work, title, optional introductory body, zero required Stages and ordinary revisioned RecordLinks. A Guide is authored teaching material, optionally with a sequence. The same learner may use both without either owning the other.
* Do **not** change the meaning or shape of existing version-1 Journey records. Their purpose is **legacy-undetermined** unless explicitly reviewed; do not silently call every old Project a Guide. They can open in Study as a named context with authored material/outline available on request. A small explicit “Use as evolving work / Use as guide” decision may version a specific record after review, preserving old renditions/deep links. **No bulk reclassification.**
* A work context can contain zero, one or multiple independent Notes, Attempts, source references, Questions or explicit Developments via already permitted typed links. A Note can relate to multiple contexts, or none. A source visit/selection is never a link.
* A named work context can be created, renamed, have its direction updated in ordinary original writing, be archived/unarchived and reopened. Archive is visibility metadata on the versioned identity, **not Trash, deletion, completion, mastery or an invented progress state**. Older entries survive any rename, pivot or archive.
* Use an existing revisioned record relation when possible. A late association is one explicit link command on the appropriate record, with the original Note unchanged when the link belongs on the work anchor; preserve relation reason, source edition/part where supported and owner/scope checks. Remove/detach is likewise explicit and independently versioned. Avoid double-writing both ends merely to make a backlink.
* Work opening shows current **evidence** before an optional historic authored outline. It does not select a “current Stage” from a visited route. A version-1 Journey whose original outline matters can still open an exact old Stage link through compatibility routing.

The selected v2 shape deliberately avoids a new D1 table as its first implementation. Prove v1/v2 validation, create/update/rollback, old Project readers, Link/Trash/export/import, deep links and generation handling on disposable D1. If that proof fails, **stop** with the concrete failure and a minimal alternative decision for owner review; do not quietly add a parallel identity store or force v1 Stages.

## D2. One explicit “Update Minamo” transaction, including no source selected

**Decision:** one high-level, idempotent, human-authorised domain operation, provisionally named recordLearningUpdateV2, is the *normal* conversational save. A request without any selected Project, Note or source is first-class.

Canonical representation for a **new** ordinary update:

1. Create one original, revisioned Note containing the approved human-readable update. It is independently discoverable in Notebook and by fresh GPT reads, including when completely unlinked.
2. Create one versioned LearningDevelopment whose primary target is that exact Note record and whose typed facts, decisions/reasons, correction, uncertainty, next intentions, selected evidence and supersession links are the reviewable semantic index. This is not a second visible checkpoint.
3. Persist only the specifically accepted optional relations, normally as outgoing links on the new Note; never mutate an immutable Article/Activity merely to create a backlink. Neither selected browsing history nor GPT-suggested connections are automatically written.
4. Commit Note, Development, accepted relations, operation identity and replayable receipt **atomically**. Present one “Saved your update” acknowledgement with one original entry link.

The v2 target vocabulary must include an exact record target for Note, Journey, Investigation, Article and Activity where permitted. A no-source event uses the new Note as its primary target; related contexts remain optional. Historical v1 Journey-Stage and Investigation developments are never rewritten and remain readable.

Suggested **domain-level** envelope (not a claim that existing MCP tools already expose this shape):

~~~ts
type SaveLearningUpdateV2 = {
  intent: 'explicit-user-update';
  operationId: string; expectedGeneration: string;
  proposed: {
    note: { title?: string; body: string };
    development: {
      summary: string;
      kind: 'learning-update' | 'question' | 'correction' | 'interpretation';
      facts: LearningFact[]; decisions?: LearningDecision[];
      nextAction?: string; nextQuestions: string[];
      supersedesId?: string;
    };
    selectedEvidence?: ExactAdmittedRef[];
    proposedRelations?: Array<{
      from: 'new-note'; // never patch an immutable source merely to make a backlink
      to: ExactAdmittedRef;
      relation: RecordLink['relation']; reason?: string;
      accepted: boolean;
    }>;
  };
};
type SaveLearningUpdateReceiptV2 = {
  operationId: string; status: 'committed' | 'conflict';
  note: { id: string; rev: number; rendition: string; destination: string };
  development: { id: string; revision: number };
  acceptedRelationCount: number; replayed: boolean;
};
~~~

This operation **must** reject absent explicit user approval; no passive per-turn writes, no automatic “achievement” status and no hidden chat transcription. GPT may prepare a proposal, but the approved payload/operation identity is what gets saved. Preserve actual actor, evidence basis, owner, learning space, source rights, revision/CAS, generation and supersession guards.

**Atomicity mechanism:** implement the multi-record write with the project's current domain-operation and D1 transaction machinery; D1 batched statements are transactional and roll back as a unit on failure ([official D1 API](https://developers.cloudflare.com/d1/worker-api/d1-database/)). A successful SQL no-op due to an expected-revision mismatch is **not** a commit: test and enforce CAS as a real abort/conflict. Persist the operation receipt in the same transaction. Test a retry with the same operation ID and identical input (same receipt), the same ID with altered input (reject), two competing writers, a failed intermediate statement and lost acknowledgement recovery. Never claim atomicity from consecutive independent writes.

**Read closure:** audit and adapt all consumers of primaryTarget.kind, target_key and v1 LearningDevelopment, including lib/contracts.ts, lib/learning-work.ts, lib/project-context.ts, #78-only lib/continuity-evidence.ts, domain-handler/MCP tool descriptions, installed tool exposure, search/Notebook/Study, source-rights checks, export/restore, revisions, generation, synthetic isolation and rollback. The new Note is discoverable without any linked work. A second *independent* GPT session must retrieve the same original and semantic facts using installed Minamo tools.

## D3. Causal, partial and contradictory continuation: specified read algorithm

The work projection is **read-only** and never becomes another authoritative current-state table. It admits original records with owner/generation/space/source-rights checks, then derives limited, inspectable interpretation.

1. **Scope and frontier.** Select explicit work focus or an unscoped personal Notebook window. Start from admitted original revisions and typed direct links; traverse a bounded, explainable one/two-hop frontier including Journey → Question → Note, both incoming and outgoing accepted relations. Never connect records by title similarity or co-visit. A late accepted relation can bring an older Note into the current work view without changing the Note itself.
2. **Completeness.** Use real cursor/limit semantics. A successful first page, a non-truncated direct Project-root context or a deferred evidence branch does not prove a complete connected history. Preserve missing, deferred, ineligible, revoked and partial outcomes internally. Only call something “latest”, “none outstanding” or “last actual recorded” when the eligible scope/ordering genuinely supports it. Otherwise say “Recent saved work” or show eligible original entries without a blanket absence claim.
3. **Primary material.** Show a short, original, dated, attributed Note/Attempt/Development entry first. Keep distinct saved strands separate. Never let an old authored Stage or mere last visit override later actual writing.
4. **What changed and why.** Derive causal changes only from an explicit supersession, a typed correction, a recorded decision and reason, or a user-confirmed relation to a prior claim/evidence. Chronological adjacency, prose resemblance, titles and GPT interpretation are not proof. When no reason was recorded, show the relevant originals and “The reason was not recorded” if useful; optionally offer a clearly labelled **reviewable interpretation**, not a saved fact.
5. **Competing accounts.** A later timestamp does not automatically revoke an earlier claim. Preserve separate dated interpretations and unresolved contradictions. A withdrawal/supersession applies to its identified event, not to every assertion in the broader undertaking. An explicit user correction can resolve a selected pair without erasing history.
6. **Next intention.** Use the newest *eligible, explicit, non-withdrawn* nextAction within its own strand. If there are two conflicting live intentions, show both with source dates; do not pick a single synthetic “next”. If only free prose hints at an action, display it as an original excerpt, not an authoritative planned step.
7. **Unknown and external freshness.** Distinguish unsaved, not found, partial read, unavailable source and not rechecked external status. None is proof of mastery, failure, completion or a current external fact.
8. **Source drill-down.** Every displayed claim that goes beyond quoting an original must carry the exact admitted source/revision, actor, timestamp and support or uncertainty. The learner sees a natural sentence and one “Why?/Source” route, not the raw coverage receipt.

This algorithm has **negative** tests: older checkpoint vs later Question-linked Note; competing next actions; Note linked after capture; multiple unrelated work contexts; no checkpoint; failed/deferred pagination; revoked evidence; edited edition; withdrawn correction; reported terminal output vs observed execution; a recent but unrelated Note; archived/renamed work. Exercise actual first-viewport wording, not only returned JSON. A failure may degrade gracefully to accurate original excerpts, never to fabricated certainty.

## D4. Intelligent organisation without learner administration

Do not substitute a new compulsory Thread, Session, Inquiry, taxonomy or manual filing ritual for Stages.

* During an explicit GPT save, the agent may **propose** a bounded set of typed relationships: related to this optional work, supports, contrasts, corrects, extends or links to an exact passage/Activity where supported. Each proposal has source identity, direction, natural reason and confidence/uncertainty. A title match is insufficient.
* One plain-language review combines proposed Note content, material decisions/uncertainties and suggested associations. The learner can untick any proposal or save only the Note. One approval invokes the transactional command. No individual manual MCP calls.
* A standalone Note does not need a project, category or intention. From the Note itself, “Link to...” can propose matches; an accepted late link is an explicit revisioned operation. No duplicate Note or inferred single owner Project.
* Relations have a provenance basis distinct from the truth of the associated claims. An agent-proposed relation becomes a **user-accepted link**, not “Minamo verified the scientific claim”. If a relation is withdrawn, original content remains.
* A first viewport should favour the *reason the learner opened the material*: real content, relevant related Activity, current writing and useful original change. Never present a relationship-management dashboard by default.

## D5. Connected Study interaction states — stronger than a component inventory

The application must demonstrate these states using real authenticated DOM and saved data. The UI may adapt arrangement, but all four interactions must be possible without entering full legacy route shells.

| State | First viewport / nearby actions | Required transition |
| --- | --- | --- |
| Read and practise | Actual Article passage with one title; nearby eligible “Try this”, “Note on this”, “Discuss with GPT”; source details secondary | Activity opens on Task; Note editor preserves original source and local draft; one exact Back-to-passage route, even through Note and refresh |
| Change direction in evolving work | A short original dated change/decision, why if explicitly saved, competing earlier claim if relevant, next/unknown where warranted; old authored Guide outline subordinate | Inspect the older evidence; ask GPT about the contradiction; save a new correction; return without Stage maintenance |
| Compare uncertain sources | One primary source, an optional temporary comparison of distinct exact renditions/Note/Attempt, selected origins and a compact context review | Deselect/compare; send only accepted exact refs into prepared GPT handoff; zero implicit durable links |
| Return after gap | Recent actual saved writing before arbitrary navigation history; explicit open problems and next intentions only where recorded; helpful original source destinations | Continue original material, choose a new direction or create a Note; no technical scan/exclusion panel or made-up “current state” |

On mobile, show one content-dominant column and a full-width Note sheet; on desktop, a nearby optional working pane is acceptable. Do not place “record type”, hash, publication route, API contract or coverage notice above the learner's subject. An empty source/history state is an ordinary start, not an evidence failure.

**Disqualifiers even if tests are green:** Study imports or renders full JourneyRoute, LearningHome, WorkingContextHost or ActivityStudio shells; Project map/Step roadmap leads the viewport; “Note” opens the publishing package; “Discuss with GPT” is an inert button; or a recently saved contradictory Note remains invisible because it is not the nominal Stage checkpoint.

## D6. Find and creation — a minimum real retrieval contract

Implement **one server-owned, rights-filtered, cursor-honest** search over the admitted content of references, activities, optional Guides, relevant independent Questions and personal Notes when the user chooses that scope. This is not concatenated browser-side title lists.

* Search headings, body/parts/code, Activity task text and meaningful metadata—not just titles. Current eligible editions by default; historical editions only deliberately selected, with their exact identities.
* Apply owner, generation, language/learning-space scope, Trash, synthetic exclusions and source rights **before** relevance or excerpt delivery. A result explains in human terms why it matches and opens its exact native destination.
* Rank exact authored source/Activity relationships above plausible older/unpinned associations when suggesting a practical Activity; label older/unpinned as such rather than falsely exact. A search match never writes a relationship.
* Provide bounded page cursors, an incomplete/read-error state, an intentional scope choice and index freshness tests. Choose a pragmatic SQLite/catalogue index based on current data and measure a representative non-title query; no speculative vector search or unbounded client aggregation.
* When no suitable material exists, “Ask GPT for material” prepares a useful ordinary request, with selected context and a platform-honest handoff. “Create reference/activity” goes through the existing preview/permission and explicit confirmation path, **without forcing an ordinary learner through the publishing-package console**. Do not automatically fabricate an Article or assert a GPT chat is already attached.

Required oracle: a phrase present only in an Article passage finds it; from that passage a valid Activity is offered; older/unpinned Activity links remain visible with honest quality; create/ask-missing-material works and exact return survives. Test false positives, partial pages, revoked source and nontechnical/language examples.

## D7. Site ↔ GPT ↔ Minamo return — honest transport and one receipt

The existing #78 copy-and-open approach is a **transport fallback**, not seamless host integration. Do not claim a Site can silently insert material into an existing connected ChatGPT conversation.

1. Select passage/Activity/Note or a bounded multi-source set; review exact identities and **which excerpts/links** are included. Recheck permissions, generation and source editions when preparing.
2. If no supported host transfer exists, provide **Prepare and copy** plus **Open ChatGPT**. Say once, plainly, that the learner pastes the brief and uses the Minamo connection; never imply clicking Open sent it. Clipboard denial has a manual selectable-text fallback. Do not expose a large machine-readable contract to the learner.
3. The brief contains exact admitted ref identities, what the learner wants to discuss, a bounded return URL/selection and an instruction to independently re-read original Minamo records before treating excerpt text as current. The URL is navigation only, not an authority token or durable relation.
4. “Update Minamo” inside GPT prepares the D2 proposal and requires explicit authorisation. It saves once and returns a **natural single Note link**; no unsolicited mastery/completion disclaimer or duplicate card. A genuinely fresh conversation can retrieve the same entry without memory of the previous chat.
5. Returning to the Site restores the original exact selection when eligible, refreshes the authenticated saved-work read and exposes the new entry without fabricating a sync acknowledgement. If the return origin is unavailable or rights changed, explain and offer a safe Study/Notebook destination. Native link, new tab, reload, Back/Forward and cross-source navigation must preserve origin without persisting it as a relation.

Test the **actual** Android/desktop-host platform path, including cancellation, clipboard failure, changed rights, stale editions, source-free conversation and acknowledgement loss. If platform capability is insufficient for a promised action, **change the label/interaction**, not the truthfulness guarantee.

## D8. External-world changes: source identity, observation, interpretation and recheck

A commit URL alone is not proof that Minamo independently verified a repository. Existing evidence validators can validate pinned URL shape without fetching or attesting external state. Never label that as a server-verified change.

Use an explicit provenance distinction in the next compatible evidence schema/read adapter:

| Basis | Allowed learner wording |
| --- | --- |
| Learner-reported terminal action | “You reported running…”; never “Minamo observed execution” |
| Supplied file/screenshot/artefact | “Supplied artefact…” with exact revision/rights, not a replayed execution |
| GPT/connector-reported remote lookup | “GPT reported checking…” with provider/source and check time; not independently server-verified |
| Independently server-verified remote observation (only if implemented) | “Checked against [source] at [time]” with exact returned identity/receipt |
| Interpretation/decision | “You recorded/approved this interpretation/decision…” with cited evidence |
| No recheck | “Last checked…” / “Current external state not checked”; never unqualified “currently…” |

Capture source URI, immutable revision/commit where available, provider/actor, time observed, permissions/rights and the interpretation as separate, original records or fields. A new check appends another observation; it does not rewrite the old one. The learner can ask connected GPT to recheck via an authorised source; do not promise the Site maintains continuous GitHub sync. Show meaningful delta only when two properly scoped observations can actually be compared.

Acceptance sequence: pinned GitHub change → learner-reported practical result → GPT/learner interpretation → later contradictory observation → explicit correction → gap return. The first viewport separates external changes from what the learner personally did or understood. Include a non-technical or language case so this is not a GitHub-only product.

## D9. Donor/retirement, feature parity and branch-authority closure

**One-way dependency boundary:** app/study may import audited data adapters, content render primitives and the **existing** Notes persistence coordinator; it must not import full JourneyRoute, LearningHome, WorkingContextHost, ActivityStudio or duplicate Reader page shells. A CSS hide is not retirement. Add an import-graph assertion and an actual rendered-DOM browser test.

#78's eight named donor files are **not a complete copy manifest**. For example, lib/working-context-read.ts imports SelectedContextRef from a #78-specific contracts change missing on current main; handoff components depend on continuity-sources and client generation/auth plumbing. Before copying any donor, record at least:

* exact public-main source SHA and #78 donor SHA;
* imported types, helpers, API endpoints, CSS and tests required transitively;
* current-main equivalent and new Study responsibility;
* retained, transformed or discarded exports;
* unchanged owner/generation/rights/CAS invariants;
* explicit prohibition on old-page-shell reuse;
* rollback/no-migration proof and source-native parity.

Complete a **feature-disposition matrix** before deleting old UI. Minimum categories: rich Article sections/selection/citations/diagrams/code; Note attachments/images/video/terminal, draft conflicts/autosave and immutable receipts; Activity Task/Attempt/Run/file evidence; Flags/annotations; retained versions/rights; exact routes; Japanese furigana/Chinese/language and IME; spaces; Settings/Trash/recovery; keyboard/mobile/accessibility; MCP old/new tools. Each is *reuse engine*, *replacement*, *compatibility-only* or *deliberately retired*, with a focused test. A radical UI reset is not permission to silently drop working educational capabilities.

**Authority handoff defect:** public main AGENTS.md and issue #51 still promote the earlier 1B/2A programme. The next coding commission starts from a **fresh public-main source tree**, then its **first commit must carry forward PR #79's canonical blueprint, this architecture contract and updated AGENTS direction**, before application edits. Alternatively rebase a clean PR #79 docs branch onto the then-current main with no #78 application history. Record which approach is used; do not accidentally start with old main guidance, merge #78 wholesale or leave two contradictory “current” blueprints. Historic #51/#78/D3 evidence stays available but is superseded for proposed implementation on that branch. No PR/issue metadata is an authorisation for deployment or owner-data mutations.

## D10. Integrated product gates and stop rules

A+B+C remain **one product commission**, with safe checkpoints; opt-in incomplete deployment may follow the fast Sites gate but does not imply product acceptance.

**Before Increment A:** D0 typed-shape/transaction/legacy-read proof and donor/feature manifest complete. Resolve failures explicitly. Do not postpone a wrong data identity until after drawing Study.

**After Increment A:** a real authenticated source→Activity→Note→exact-source loop, no legacy shell, first-use simplicity and non-title Find with a missing-material request. This is engineering evidence only.

**After integrated A+B, before major C polish:** invite an early owner-usefulness check on a real or honestly fictional changing-work episode and an unplanned capture. If it still feels like an archive of detached records, stop and correct architecture/interaction—not another banner, modal or dashboard.

**Before product/default-route cutover:** all C1–C7 plus UX-N01–N19 and new D0–D9 negative oracles are satisfied. Demonstrate two naturally connected episodes: (1) reading→Activity→Note→multi-source question→GPT explicit save→fresh GPT→exact Site return, with no Project; (2) changing optional work→external observation and uncertainty→correction→late Note link→return after a gap. Include non-technical/language, narrow real device/IME and a sparse/contradictory history. Compare to V95 on content-firstness, backtracks, origin retention, draft recovery and owner preference; do not invent timings or satisfaction scores.

The owner may reject the product even if every technical invariant passes. A failed usefulness judgement returns to implementation, **not** an automatic new administrative layer. Technical proof and first-hand usefulness are independent gates.

**Final boundary:** This file changes the planning contract only. It does not create database objects, install MCP schema changes, reclassify old Journeys, write learner records, merge PRs or deploy Sites.
