# Learning work, explicit checkpoints, Home and Favourites

**Owner-agreed direction · 22 October 2026 · DRAFT design, not implementation authority.** This document reconciles the later owner decisions with PR #19's earlier Investigation-only work model. **Normative for learning-work behaviour** where older drafts discuss "suggested/active" Investigations, automatic developments, sessions, interaction receipts, or Home progress.

**Do not implement, merge, deploy, alter live learner data, or change unrelated PRs on the authority of this document.** The eventual Work/Sites commission requires separate explicit owner authorisation. Read with `INTEGRATED-DESIGN.md`, `IMPLEMENTATION-SEQUENCE.md`, `ACCEPTANCE-AND-DECISIONS.md` and the existing Library/Notes interaction and persistence contracts. Changes here do not weaken owner auth, evidence provenance, historical renditions, Source permission floors or encrypted recovery.

## 1. Product contract: learning without status management

- **An Investigation is simply a question** with optional authored reading and developing learner work. No learner-facing or server-owned learning lifecycle of `suggested`, `active`, `started`, `parked` or `concluded`. No Start button, completion badge, percent or compulsory final answer. Merely asking/visiting a question implies nothing.
- **Do not classify investigations by creator/origin** as a learning property. Whether owner or GPT initially wrote a question neither changes its status nor merits prominent UI. Preserve necessary operational actor/operation identity for security/audit and evidence provenance *on developments*. Historical v1 `learningShape.provenance` must remain in retained records for compatibility, but new questions do not need a `gpt-prompt`/`owner-created` field, and new UI/MCP must not infer merit/status from it.
- **Journey stages and Investigations are equal primary work targets**. A learner following an ordinary Journey stage may checkpoint directly without creating a separate Investigation. The same Development event/evidence/revision mechanisms serve both. The Journey's authored stages and Investigation's original question remain independent canonical reading.
- **No formal learning sessions**: no `sessionId`, start/stop API, automatic start when a chat begins, forced status, inferred completion or "session progress" table. A query such as “What happened last session?” reads the most recent saved developments by timestamp and shared context, and states the time window examined rather than claiming an explicit persisted session boundary.
- **Favourites are explicit owner choices**, not inferred by recent activity or learning progress. Use existing **whole-record `FlagTarget.kind='record'` / `setFlag` bookmark state**, displayed as “Favourite” for eligible Journey, Investigation and Library Article records. Passage annotations/Flags still use exact passage bookmarks with their distinct meaning. Do not add a second favourite database or mark a favourite "in progress".
- Home has **Continue**, **Recent Developments**, and **Favourites**. There is no compulsory Discover/Explore section (Library/Journeys/Investigations already provide discovery) and no auto-selected lifecycle status.

## 2. Source-verified current V2 gaps and migration consequence

| Current source | Current behaviour | Commissioned change |
| --- | --- | --- |
| `lib/contracts.ts` | `LearningShape.investigation` is v1 with `question`, `mode:'suggested'|'active'` and `provenance:'gpt-prompt'|'owner-created'`; Journey stages have persistent `id` and `sectionId`. `RecordLink` has optional `sourceContext.stageId`. | New versioned, minimal Investigation authoring shape (question only) plus **separate** target-agnostic `LearningWorkTarget`/Development contracts. Keep legacy v1 read/retained compatibility. |
| `lib/learning-validation.ts` | New Investigations require v1 `mode`/`provenance`; Journey stage IDs and canonical sections are validated. | Accept v2 question-only Investigation creation and old v1 reads; reject new status/origin requirements, preserve old historical source; validate exact target stage IDs, stage revision and historical source when checkpointing. |
| `lib/manuscript.ts` | Every new manuscript Investigation gets `mode:'suggested',provenance:'gpt-prompt'`. Whole manuscript updates generate sequential `stage-sN` IDs. | Publish a question without staged provenance/status; on targeted Journey edits carry over stable stage/section IDs or return a reviewable conflict (per existing Library/reading stable-ID contract). No fabricated Investigation creation to record a stage checkpoint. |
| `lib/editorial-policy.ts` / `lib/authoring-package.ts` | GPT authoring policy explicitly rejects an Investigation unless `shape.mode==='suggested'` and `shape.provenance==='gpt-prompt'`. Its `suggest-investigation` editorial action and policy copy imply a special creator/status category. | Version the editorial policy/validation to accept minimal question-only Investigations; retain anti-fabricated-evidence, coverage, originality and owner-authorised publication checks. Replace `suggest-investigation` for new packages with an origin-neutral `create-distinct`/`open-question` editorial decision; legacy policy/source may be read, but cannot force learner-visible status. |
| `app/gpt-handoff.tsx` / `lib/gpt-context.ts` | Existing “Discuss with GPT” builds an owner-selected clipboard brief (`get_minamo_context`) and **explicitly makes no network/tool calls or writes**. | Preserve the safe read-only handoff: passing context to GPT never authorises a learning checkpoint, automatic interaction log or start event. New explicit save requests use the separate checkpoint tool. |
| `app/investigation-workspace.tsx` | Distinguishes “OPTIONAL QUESTION · GPT-AUTHORED PROMPT” vs “YOUR OPEN INVESTIGATION”; “Start investigating” mutates canonical `learningShape.mode`. | Remove categorisation and Start action; show question + *actual recorded work*, current perspective, evidence-aware chronology and next questions. Contextual Note and read links remain optional. |
| `app/journey-route.tsx` | Ordered stage reading and `sessionStorage` for last visited stage; no learner-work recording or stage developments. | Server-projected **direct stage developments**, stage-local synopsis and optional checkpoint/edit affordance. Keep last-visited as **navigation only**, not evidence. Stage-order changes preserve IDs or unresolved work remains accessible without wrong attachment. |
| `app/workspace.tsx` | Home uses currently loaded `v2_activity`-adjacent records, `recentThinking` and `editorial` and an ornamental hero; freshness limited by page; no meaningfully grouped checkpoint/record favourites view. | Replace/augment learning surfaces with bounded owner-server-backed Home projections: Continue/Recent/Favourites; do not infer progress from edits, visited stages, Notes or Flag toggles. Preserve normal navigation and catalogue authoring links. |
| `lib/domain.ts` `renditionFor` | Canonical Investigation `learningShape` (including v1 mode/origin) contributes to reading hash. | Do **not** globally change v1 hashes. New v2 minimal authored question may have new hash semantics. Development/favourite operations must not mutate the source Investigation/Journey `v2_records` just to record work. Retained old anchors remain exact. |
| `lib/bookmark-targets.ts`/`lib/bookmarks.ts` | Whole-record bookmarks already support readable families (including Journey, Investigation and Article), exact target keys, desired-state CAS and durable off tombstones. | Reuse as Favourites, add bounded authenticated bulk/projection reads (avoid one per-card call), current eligibility/Trash checks and correct Home/MCP labels. No second favourite state. |
| `lib/domain-handler.ts` | MCP schemas expose version-1 Investigation mode/origin and generic record authoring. | Provide versioned question-only create/update, new **explicit checkpoint write** tool and bounded, efficient initial context read; clear descriptions preventing routine conversational auto-writes. Preserve older records/tools with honest compatibility. |

## 3. One shared event model with two primary targets

The earlier draft described `v2_investigation_developments` and required `investigationId` on every Development. **Those were proposed-only tables, not deployed commitments. Replace that design before writing migrations.** Do not build two competing event systems.

```ts
type LearningWorkTarget =
  | {kind:'investigation'; investigationId:string}
  | {
      kind:'journey-stage';
      journeyId:string;
      stageId:string; // stable stage identity, independent of stage order
    };

type LearningDevelopment = {
  id:string; schemaVersion:1;
  primaryTarget:LearningWorkTarget;
  summary:string;
  kind:'learning-update'|'question'|'correction'|'interpretation';
  facts?: Array<{
    role:'prediction'|'attempt'|'reported-observation'|'misconception'|
         'correction'|'interpretation'|'open-question';
    text:string;
    basis:'learner-reported'|'supplied-artifact'|'minamo-observed'|
          'gpt-interpretation'|'provisional'|'illustrative';
    refs?:EvidenceRef[];
  }>;
  relatedContexts?: Array<{
    target:LearningWorkTarget | {kind:'library';articleId:string;sectionId?:string};
    relevance:'explicit'|'accepted-relation'; reason?:string;
  }>;
  noteRefs?:Array<{id:string;rev:number;purpose:string}>;
  nextQuestions?:string[];
  supersedesId?:string;
  author:'user'|'gpt'|'system'; createdAt:string; revisedAt?:string;
  revision:number; operationId:string;
};
```

**Interpretation:**
- Exactly **one primary target** owns a Development. A Journey-stage Development does not require an Investigation; an Investigation Development needs no Journey. Extra relevant contexts are references/projections, **not extra copies of the event**.
- A general accepted relationship `Investigation↔Journey stage` does **not** automatically imply that *every* historic Investigation development applies to that stage. An event appears as **stage-specific learning** only when its primary stage is that stage or it has an explicitly supported stage-level relevance reference. General related Investigation cards can still appear as clearly labelled related context, not stage progress.
- Preserve stable `stageId` across meaningful Journey manuscript edits (as required in `LIBRARY-DATA-AND-MCP-CONTRACT.md`). Capture stage `journeyRenditionAtRecording` or `journeyRevAtRecording` for historical provenance in the record while keeping stage ID as durable target. When stage removed/Trashed, keep historical work recoverable through exact eligible historical reading, not silently rebind to new stage index/title or count toward another stage.
- The `supersedesId` relation corrects or withdraws earlier claims without erasing historical basis. The current perspective is a **revisioned human/GPT interpretation with exact Development ID+revision dependencies (or an equivalent dependency epoch) and its own CAS guard**, not independent verified truth. A corrected/withdrawn fact or a Source whose permission changes **invalidates affected stored interpretation prose**; the projection must fall back to bounded **currently eligible, evidence-labelled saved facts** until an **explicit user-requested** checkpoint/revision supplies updated prose. Neither the server nor GPT silently regenerates or edits perspectives to patch stale reasoning; unchanged eligible owner-authored prose may remain where permissible.
- Actual Kali outputs must remain learner-reported or supplied-artifact unless eligible Minamo tool execution receipts exist. No invented `minamo-observed`, achievements, "completed stage" or mechanical mastery score. An illustrative example never counts as genuine learner progress.

### Storage / transaction sketch (illustrative, not deployable SQL)

```text
v2_learning_developments(
  owner, id, primary_target_kind, investigation_id NULL,
  journey_id NULL, stage_id NULL, target_rendition_at_recording NULL,
  revision, operation_id, author, created_at, updated_at,
  event_json, supersedes_id NULL, trashed_at NULL
)
v2_learning_development_revisions(
  owner, development_id, revision, data, created_at
)
v2_learning_perspectives(
  owner, primary_target_kind, target_id, target_stage_id NULL,
  revision, summary_json, source_development_ids,
  source_development_revisions_or_dependency_epoch,
  rights_dependency_epoch, updated_at
)
```

Choose exact SQL types/indexes after reviewing D1, namespace recovery and cross-target joins. Check one-of-target constraints in validator and guarded D1 claim. **A work event/summary write does not update canonical `Journey` or `Investigation` `rendition`**; it appends one event, optionally a perspective tied to **specific source event revisions or a dependency epoch**, and operation receipt **atomically with perspective CAS and current Source rights guards**. If a competing checkpoint changes a perspective while this operation is pending, fail/return a guarded conflict for the full uncommitted transaction rather than allow a stale perspective overwrite or partial event. All authoritative events, revisions and perspectives belong in encrypted checkpoint/restore; rebuild derived feed queries after activation. Existing `v2_activity` remains an audit of operations, not Home's source of meaningful progress.

A checkpoint may contain several related facts and (only if user explicitly asks for multiple targets) a bounded small list of *separately targeted developments in one atomic MCP operation*. Do not force GPT to make a separate call for each fact, or store the whole ChatGPT transcript.

## 4. Explicit user requests control all conversational writes

**“Use minamo.” (case-insensitive) is a learning-context instruction, not standing authority to save learning after every exchange.** No formal sessions or automatically inferred checkpoint boundaries.

| Request | MCP/ChatGPT behaviour | Durable writing |
| --- | --- | --- |
| "Use minamo. What was I doing last?" | One **focused** recent-context read if needed (possibly favourites and meaningful developments). Reuse retrieved facts in subsequent turns. State when no later record exists. | **No** |
| "Use minamo. Explain why my curl test did that." | Fetch one relevant exact Note, Investigation, Journey stage or Library reference when needed, not on every turn. Discuss using conversation context. | **No** unless separately requested |
| "Use minamo. Summarise the problems I had last session." | Retrieve recent saved developments by chronology/context, describe the **period examined**, not a fabricated explicit session record. No requirement that a session started. | **No** |
| "Use minamo. Build me a challenge about X." | Read relevant history/Library if necessary; compose a challenge in chat. Creating *unsaved proposed content* is not publishing it. | **No** |
| "Checkpoint this", "save what we established", "record my progress on this stage" | Resolve exact intended target from current conversation and eligible records, synthesize concise, evidence-aware fact summary and one idempotent checkpoint mutation; return receipt. | **Yes**, immediately as explicitly directed |
| "Add that challenge to my Journey", "update my Library article", "favourite this" | Use intended authoring operation / `setFlag` with ordinary source/permission checks, not as a generic learning Development. | **Yes**, only requested action |
| GPT notices possible milestone without user instruction | May keep the insight in current chat; **must not automatically checkpoint, record interaction summaries or interrupt with unsolicited repeated save prompts**. | **No** |

**Performance and ergonomics:** an initial targeted MCP read for a new "Use minamo" chat may be appropriate; do not fetch the entire corpus, "log" a session by writing, or make a read/write on *every* back-and-forth. Cache/reuse the relevant tool result in current conversation context, refresh on new explicit topic/record need or staleness affecting a requested action. Do not claim access to a full previous ChatGPT transcript in a future conversation—only saved Minamo records and presently accessible context. The server cannot see hidden browser-only Note edits.

**Interaction receipts:** the earlier idea of a new private conversational-interaction log is **NOT adopted**. Do not add `v2_learning_interactions`, `sessionId`, `startSession`, `endSession`, per-chat summary writes, mandatory MCP read-audits, or automatic "Use minamo" activity rows. Existing operational `v2_operations`/access logging can continue for security/replay but is not evidence of learning, is not displayed on Home and cannot reconstruct an unsaved conversation. Avoid silently enabling a new audit feed just because tools are used.

**Checkpoint targeting:** when current conversation and known eligible context unambiguously indicate the destination, save directly; do not ask for another ceremony/confirmation. If Journey stage and Investigation are both possible, prefer the explicit user-referred target; if genuinely ambiguous, ask one short clarification rather than invent an Investigation or quietly attach the wrong stage. If nothing meaningful is evidenced, a checkpoint can truthfully save a provisional/open question when the user explicitly asks; never invent observations. A checkpoint after a correction preserves earlier facts and returns the new current perspective.

**Evidence provenance ≠ Investigation origin:** still store `author` of an operation and `basis` of observations for correctness, permission and trust; remove question `origin/provenance` and `mode` as authored learner metadata. Legacy archived fields cannot be deleted or rehashed.

### MCP contract (suggested names, one capability each)

- **`get_minamo_learning_context`**: purpose + bounded `scope:'recent'|'home'|'target'` with optional `LearningWorkTarget`, cursor/limit. One answer can supply concise last meaningful developments, relevant last-question, favourites, exact destination and freshness; not full transcript or all Notes. Reuse `get_minamo_context` compatibly.
- **`record_minamo_learning_development`**: explicit checkpoint intent, `expectedGeneration`, immutable `operationId`, exact `LearningWorkTarget`, bounded one-event payload with optional evidence links and related contexts, and optionally a bounded small batch if explicitly asked for multi-target checkpoint. D1 receipt returns exact refs/current perspective summary; no mandatory follow-up read merely to confirm.
- **`revise_minamo_learning_development`**: correction/revision/withdrawal with current CAS; no silent overwrite or erased history. User can also correct from corresponding Journey/Investigation page with equivalent authenticated HTTP domain method.
- **`get_minamo_relationship_candidates`/`confirm_minamo_relationship`** remain read-only suggestions versus explicit accepted relationships; confirming a link is an independent requested write, not a checkpoint.
- **`publish_minamo_manuscript`** remains for deliberate Journey/Investigation/Library content authoring, not routine chat and not a substitute for a Development. Publishing an Investigation no longer forces `suggested`/`active` or origin. **Update `lib/editorial-policy.ts` and `lib/authoring-package.ts`, not just `lib/manuscript.ts` and the MCP JSON schema**: legacy policy `suggest-investigation`/`mode:'suggested'` conditions must accept minimal v2 questions while retaining strict prevention of fabricated learner results, read-only coverage preflight and owner-directed authored edits.
- **`setFlag`/`readBookmarkState`** remain favourite operations; one bounded Home bulk projection returns current eligible favourite records, not an N+1 client loop.

Names `record_minamo_investigation_development` and `get_minamo_investigation_work` from the **earlier unshipped PR proposal** should be *replaced* by the target-agnostic names, not both implemented as independent stores. If a comparable API is found already installed at execution, add a tested compatibility alias onto **one** underlying domain method, not parallel write paths.

The client and backend cannot themselves guarantee every future GPT model invocation will choose the right tool. Improve discoverable tool descriptions with the exact examples and a narrow intent routing contract, test held-out realistic ChatGPT chats, and report failures rather than relying on speculative autonomous behaviour.

## 5. Purposeful read projections for Home, Journey, Investigation

### Home: Continue, Recent Developments, Favourites

Build `homeLearningOverview` through a single, **bounded authenticated server read**, not the browser's loaded `records` array, `v2_activity` mutation stream or calendar/session assumptions. Suggested DTO:

```ts
type HomeLearningOverview = {
  asOf:string; generation:string; sourceVersion:string;
  continue: Array<{
    target:LearningWorkTarget;
    title:string; lastMeaningfulAt:string;
    shortSummary:string; nextQuestion?:string;
    destination:string; lastDevelopmentId:string;
  }>;
  recent: Array<{
    target:LearningWorkTarget;
    lastMeaningfulAt:string; summary:string;
    developmentIds:string[]; basisLabels:string[]; destination:string;
  }>;
  favourites: Array<{
    target:{family:'journey'|'investigation'|'article';id:string};
    title:string; destination:string; bookmarkTargetRev:number;
  }>;
  page?:{recentCursor?:string;favouritesCursor?:string;continueCursor?:string};
};
```

- **Continue** ranks a small set of eligible contexts by last **acknowledged meaningful checkpoint**, not `active` status, recent page open, Note keystroke, generic record `updatedAt`, actor origin, link edit, Favourite toggle or manuscript publication. Direct to exact Investigation or Journey stage. If no checkpoint, Continue may be empty; favourites provide user-selected access.
- **Recent Developments** shows a bounded list of meaningful updates, optionally target-grouped when neighbouring checkpoints affect the same target. Grouping is **read-time** (target, sequence, bounded chronology), not a saved `sessionId`; keep stable tie-break `(committedAt, developmentId)` with explicit correction/supersession and page-boundary deduplication. **A meaningful correction may itself appear as recent learning**, with corrected claim and evidence basis clear; a superseded/withdrawn/illustrative assertion must not masquerade as current genuine progress. Old eligible events retain individual drilldowns; no fabricated period/session label.
- **Favourites** lists eligible current record bookmarks for **Journeys, Investigations and Library Articles**, independent of recency, via existing target-based `v2_bookmarks` / accepted legacy Flag reconciliation. Render a straightforward star/Favourite action on those records and a discoverable Home shelf. A record may be both in Continue and Favourites, but the UI may avoid duplicate large cards. Unfavouriting changes only bookmark state, not learning history.
- **No “Explore” feed** and no administrative progress/achievement stats. A quiet empty state can point to Journeys/Investigations and existing quick navigation without implying that starting is required.
- The server must enforce current eligibility for every title, source snippet, perspective dependency and favourite; revoked/Trashed targets cannot leak via cached feed. **Use independent list cursors or a documented compound cursor** for Recent/Favourites/Continue, not an ambiguous single `nextCursor` applying to unrelated arrays. Cursor bindings include owner, generation, filter and projection version; sort by stable committed-time + event-ID tie-break, dedupe group boundaries, and return explicit stale-cursor restart after correction/unfavourite/generation change. **Revalidate bounded Home when entering/returning to foreground, even if no record is selected**; current selected-record-only revalidation is insufficient. Avoid periodic polling and N+1 full-record reads.

### Journeys and Journey stages

Journey overview keeps authored ordered stages, intent/outcome/checkpoint, canonical reading and navigation. Adds bounded **stage learning summary** grounded in:
1. Direct `journey-stage` Developments for that precise `journeyId+stageId`;
2. Explicitly stage-relevant Investigation Developments (by per-event accepted/explicit target reference);
3. Accepted related Investigations as a separate **related questions** section, not automatically as evidence of stage progress.

Each stage can show latest meaningful development, relevant difficulty/correction, open next question, exact source/evidence links, and small “Record/checkpoint work” or edit/withdraw affordance (without forcing a mode/start). The learner may leave a stage without checkpointing; there is no completion semantics. Overview must not replicate entire event histories or unrelated library content. Last-opened `sessionStorage` remains local navigation convenience, **never** learning history or a cross-device “session”; if later owner wants cross-device last position, create a separate explicitly consented navigation preference, not fake development.

### Investigations

Investigation page presents original question/readings, latest evidence-aware current perspective, chronological relevant developments/corrections, open questions, associated personal Notes **as links only**, and accepted relations to Journey stages/Library. It does **not** display `suggested/active`, "GPT-authored prompt", "Start investigating", automatic conclusion, or a progress bar. No status controls are necessary. Revisit/read is not a write. Existing Notes remain independent authoring and do not automatically become work Developments.

### GPT and freshness

The same server methods rendering Home/Journey/Investigation feed bounded `get_minamo_learning_context`. Return actual event/source IDs **and revisions/dependency epoch**, evidence basis, current generation, as-of/source version and honest "no saved checkpoint" information. A corrected/withdrawn event or revoked Source invalidates stale perspective *without hidden rewriting*; show still-eligible saved developments with correct basis until a subsequent **explicit** revision/checkpoint. Retained reading remains source-rights guarded. Refresh Home/target by bounded fetch/revalidation after acknowledged MCP writes or on foreground return, **even without a selected record**; don't rewrite canonical Journey/Investigation Markdown.

### Stage-aware read-only GPT handoff — preserve learner context without sessions

The current `JourneyRoute` shows a stage-specific Reader but `app/reader.tsx` passes only the whole Journey record to `GptHandoff`; `app/gpt-handoff.tsx` and `lib/gpt-context.ts` omit the current `stageId` from the copied brief, its cache/invalidation key and its return destination. **On a non-first stage with no text selected, GPT otherwise cannot distinguish this stage from another stage.**

- Pass an optional **exact** `LearningWorkTarget` (`journeyId`, stable `stageId`, currently eligible/pinned reading rendition and relevant section) through `JourneyRoute → Reader → GptHandoff → buildGptContextBrief`. Include it in the handoff's context key, source refs, bounded targeted read arguments/explicit focus and exact return URL. **Switching stage must invalidate a previously prepared clipboard brief**. Retained/removed stage IDs must not be reassigned by title/index; show unavailable-source diagnostics when necessary.
- Handoff remains **read-only**, owner-triggered, without an implicit checkpoint. If user later says “Checkpoint this stage”, the exact stage target is available for the **separate** explicit learning-development operation.
- The current clipboard brief can demand up to eight separate `get_minamo_context` calls for `relatedRequests`. Where the installed/current API supports a bounded `relatedRefs` context read, use **one combined read** and validate ownership/size/rights; don't promise a new server context feature or require eight serial calls for an ordinary handoff. Keep the original individual-only route as compatible fallback if needed.
- Test non-first Journey stage, no selection, stage switch, old rendition, removed stage, one relevant related Article, browser return path and cold ChatGPT handoff. Measure actual MCP calls. This is **one integrated Work/Sites slice**, not an independent handoff rebuild or formal session.

## 6. Source/reference/recovery correctness

- **Canonical reading unchanged by a checkpoint or Favourite**. The current v1 Investigation mode is inside `learningShape` and affects `renditionFor`; don't simply delete v1 fields or recompute old hashes. Introduce a versioned minimal v2 Investigation shape for new/revised authoring and a legacy read adapter that ignores historical mode/origin *as learner progress* while preserving immutable stored v1/read snapshots. Historical Flags/annotations and manuscript edition IDs remain exact.
- A genuine later edit of the question or stage reading may create a new canonical rendition, with stable section/stage ID carryover or explicit targeted-update conflict per `LIBRARY-DATA-AND-MCP-CONTRACT.md`. Work events reference exact original stage ID; stage removal does not rebind previous work to new stage index/title.
- No user-generated chat interaction transcript storage, no automatic tool-call receipts as progress, no unsupported special access to conversations across chats; durable learning context relies on explicit saved checkpoints and other deliberately authored records.
- All new authoritative `v2_learning_*` tables and revisions participate in encrypted checkpoint/export/import/restore, generation fencing, evidence revocation and proper source current-eligibility. Existing D1 row/8MiB recovery capacity gates from the Library plan still apply.
- Favourites reuse the existing bookmark revision/tombstone rules; revocation and Trash suppress access; no double bookmark/Flag records. Avoid treating a whole-record favourite as a passage annotation or new learner achievement.
- New MCP read/writes return bounded responses, deterministic cursor/current/historic epoch labels, safe idempotent conflict outcomes, and accurate acknowledgement. Replaying the same checkpoint operation cannot create duplicate developments or unexpected updates on both targets.
- Do not create a new actor/origin display dimension for Investigations. Preserve security provenance and evidence basis on recorded work; do not show model-suggested questions as a separate inferior category.

## 7. Acceptance and implementation priorities

The [ACCEPTANCE-AND-DECISIONS.md](ACCEPTANCE-AND-DECISIONS.md) register includes `INV*`, `STAGE*`, `CKPT*`, `HOME*`, `FAV*`, `LEARNMCP*` gates for these exact decisions; reconcile the earlier `INV*`, `VIEW*` and `REL*` tests rather than leaving a requirement to show `mode='active'` or assign all work to Investigations.

Execute later in this order within **one** commissioned Work/Sites run:
1. Existing-source/legacy retention proof for v1 Investigation hash, v2 minimal question, Journal/Stage stable identity, whole-record bookmarks, canonical reading and existing recovery.
2. Unified LearningWorkTarget and Development append/revise domain with appropriate D1 migration, idempotency, evidence rules, current-source checks and end-to-end MCP/HTTP parity.
3. Bounded Home/Journey/Investigation/favourite read projections, exact per-development stage relevance, source rights and multi-target relationships.
4. GPT checkpoint intent/discovery descriptions, read-only clipboard handoff and origin-neutral editorial-policy tests: cold-start reads, twenty ordinary follow-ups with no write, single meaningful checkpoint write, several targeted work entries when requested, explicit question-only manuscript creation, and a new chat retrieving only saved work.
5. Replace old Investigation mode UI, add direct Journey-stage view and Favourites, retain original reading and Notes flows; test genuine Android and desktop interfaces.
6. Independent learning-quality tests and complete encrypted recovery, under the existing PR19 release gate. No declaration of real adoption until saved Site and installed MCP tests succeed.

**No further approval loop is implied for normal engineered iterations once the owner explicitly commissions the future whole build.** Any unresolvable architectural problem must be documented with its evidence rather than quietly weakening source or privacy guarantees.

