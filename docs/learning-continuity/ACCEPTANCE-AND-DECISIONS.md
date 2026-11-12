# Learning continuity — acceptance, decisions and revision register

**Status:** OPEN FOR DISCUSSION — not an implementation authority. **No application implementation, migration, live record mutation, merge or deployment is authorised by this planning PR.**  
Companion design: `INTEGRATED-DESIGN.md`; **latest owner-settled explicit checkpoint, Home, Journey stage and Favourites rules:** `LEARNING-WORK-AND-CHECKPOINTS.md`; mobile/private images: `NOTES-MOBILE-AND-IMAGES.md`; owner interaction/Library IA: `INTERACTION-AND-LIBRARY-RECONCILIATION.md`; **normative Library persistence/MCP contract:** `LIBRARY-DATA-AND-MCP-CONTRACT.md`; external technical evidence: `TECHNICAL-VALIDATION-20261022.md`. Use this document as the acceptance contract and issue log. Amend it when the owner adds requirements, not just the prose overview.

## A. Decision register — owner-settled behaviour and bounded engineering choices

| ID | Topic | Proposed default | Status / what is still open |
| --- | --- | --- | --- |
| N-01 | Save every edit | **OWNER-SETTLED DEFAULT:** write-through local durability on every edit, near-live **coalesced** remote sync without Save, one immutable in-flight operation per Note; editing never blocked. Initial online ≤1s ACK is a measured goal, not one server round-trip per keystroke | **IMPLEMENTATION BASELINE**; only reopen on observed failure/resource constraint, not another owner approval. Verify local, dispatched and acknowledged timings separately. |
| N-02 | New Note lifecycle | Create stable record on first meaningful content/title; **zero open tabs is valid**; closing last tab or hiding panel never manufactures a blank draft | **OWNER-SETTLED user behaviour**; first edit/server identity protocol remains to be proven with offline/multi-tab tests. |
| N-03 | GPT visibility of writing | GPT sees only owner-authorised, currently server-acknowledged Note revisions and freshness metadata | Proposed settled safety boundary; never assert visibility of local unsynced text. |
| N-04 | Existing Note migration | Keep canonical Note body and history, replace editor autosave/write scheduler; no old Notes rewritten | Proposed settled. |
| F-01 | Learning-work granularity | One explicitly requested checkpoint Development (may contain several typed facts) targeting a specific **Investigation OR Journey stage**; no formal sessions or automatic per-turn writes | **OWNER-SETTLED**; do not log each exchange or terminal command. |
| F-02 | Investigation states and creator classification | **No started/suggested/active/parked/concluded lifecycle or creator-origin classification** for the new learning model. Legacy v1 fields remain immutable on historic renditions for compatibility, not visible as learning status | **OWNER-SETTLED**; operational actor and evidence provenance still mandatory. |
| F-06 | Valid primary learning targets | Exact Investigation OR Journey stage (Journey ID + stable stage ID), no invented parent Investigation required | **OWNER-SETTLED**; one shared development authority and stage-specific evidence. |
| F-07 | Recording trigger | "Use minamo" invokes retrieval when needed; **only explicit checkpoint/save/add/edit/Favourite requests make writes**. GPT must not proactively checkpoint or ask repeatedly | **OWNER-SETTLED**; actual installed MCP intent behaviour needs tests. |
| F-08 | Formal sessions and interaction receipts | No sessionId/start/finish, implicit sessions, mandatory "Use minamo" interaction receipt or copied conversation transcripts; optional operational logging isn't learner progress | **OWNER-SETTLED**; retrieval describes saved chronology, not unsaved chats. |
| F-09 | Checkpoint content | Short evidence-aware Development, correction and open next question, optionally referenced Note revision; no transcript or invented observed experiment | **OWNER-SETTLED**; payload bounds measured. |
| F-10 | Legacy v1 Investigation migration | Read old question/mode/provenance and preserve original reading hash, but new questions are question-only v2 and show no statuses/origin | **MANDATORY** compatibility; check all deployed callers and publisher. |
| V-03 | Continue ordering | Rank bounded targets by last meaningful **acknowledged checkpoint**, never by last visited, editorial publication, Note save or Favourite toggle | **OWNER-SETTLED**; fallback when no checkpoints = empty/quiet, favourites independent. |
| V-04 | Favourites | Reuse whole-record `FlagTarget`/`setFlag` for eligible Journey, Investigation and Article records; current eligibility/Trash and stable target rev | **OWNER-SETTLED**; no new favourite table. |
| V-05 | Grouped chronology | Related developments may group by exact target/time at **read time**, not a saved or inferred session; retain individual history | **OWNER-SETTLED**, bound/visual presentation tunable. |
| V-06 | Last viewed versus last worked | Journey `sessionStorage` position stays navigation only; don't report visited stage as learning or cross-device checkpoint | **OWNER-SETTLED**, future cross-device nav preference out of scope. |
| F-03 | Revision policy | Append a meaningful correction linked to the earlier event; allow explicit CAS-guarded edit/withdrawal of erroneous private text while retaining revision provenance and replay | **IMPLEMENTATION DEFAULT**; exact labels can be tested during build without more owner approval. |
| F-04 | Perspective generation | On **explicit checkpoint**, GPT may submit a bounded current perspective with exact Development IDs; Worker checks provenance/structure, no hidden server LLM or autonomous writes | **OWNER-SETTLED write boundary**; technical projection implementation provisional. |
| F-05 | Conversation evidence | User-stated results may be saved as learner-reported; only supplied transcripts/actual Minamo receipt substantiate stronger classes | Proposed settled. |
| R-01 | Link authority | **Extend existing accepted `RecordLink` as the initial single write authority**, with explicit identity/rev/direction and legacy reverse link reconciliation. Suggested connections stay separate | **IMPLEMENTATION DEFAULT**; change to one central typed table only if actual guarded multi-writer test proves existing store inadequate, never dual-write independent authorities. |
| R-02 | Sparse semantic discovery | Explicit relationships + concepts + literal/FTS5 candidate search, safe no-hit | PROVISIONAL, no Vectorize/Workers AI. |
| V-01 | Home grouping | **Continue / Recent Developments / Favourites** from owner-scoped saved work and target bookmarks; read-time grouping by exact target/chronology, no session ID, browser page load or routine edits as progress | **OWNER-SETTLED**; visible window/limit measured. |
| V-02 | Journey projection | Direct Journey-stage checkpoint history plus explicitly stage-relevant Investigation events; broad Investigation link alone is **related context**, not proof that stage progressed | **OWNER-SETTLED**; no duplicate event, percent or compulsory completion. |
| D-01 | Diagrams | Reuse native codecs; deterministic safe Mermaid subset or explicit typed input; faithful code fallback | OPEN: exact supported grammar and whether any safe Mermaid renderer is justified. |
| D-02 | Visual baseline | Curl case gains meaningful native HTTP exchange visual, accessible text fallback | Proposed acceptance fixture. |
| M-01 | External playable video | Explicit provider-scoped user-activated YouTube/Vimeo embed; no pre-consent thumbnails/requests | OPEN: provider choices and privacy/consent copy. |
| M-02 | Media source provenance | Owned R2 files stay distinct from external link/embed; no remote copying | Proposed settled. |
| C-01 | Command indexing | Explicit command reference section/directive + validated entry compilation, not indiscriminate extraction | PROVISIONAL; final author syntax open. |
| C-02 | Scope | Authoritative versioned **catalogue sidecar** reference entries, projected as compatible `Article.concepts` DTO only when needed; deep-linked and searchable across paginated Library | **ALIGNED TO LIBRARY DATA CONTRACT**, not a separate mutable Article index. |
| U-01 | Format toolbar | Lucide icons with accessible tooltips/labels, scoped CodeMirror shortcuts | PROVISIONAL; exact secondary shortcuts to avoid OS/browser conflicts. |
| U-03 | Mobile Notes writing-first | Dedicated near-full-height sheet with editor visible immediately; no permanent admin/search/dock selector | **OWNER-SETTLED desired behaviour**; responsive geometry and keyboard safe area verified in implementation. |
| U-04 | Mobile minimise/restore | Single small floating Notes launcher while minimised, main Minamo usable, restore same tab/caret/draft | **OWNER-SETTLED desired behaviour**; launcher placement, Android Back and keyboard collisions to test. |
| U-05 | Compact open Note tabs | Mobile compact row, **desktop persistent bottom bar open tabs even while panel minimised**, shared + creation and direct single-tap restore; close tab does not Trash | **OWNER-SETTLED behaviour**; exact overflow/focus/state controller to verify. |
| U-06 | Rename active Note via pen icon | In-tab tentative rename editor, Enter/blur commits once to shared Note autosync; **Escape cancels even if autosave idle interval elapsed**, never sends uncommitted title; no large separate form | **OWNER-SETTLED**; test actual pending/edit focus behaviour. |
| IMG-01 | Desktop image insertion | Paste/drag file image at caret into writing canvas; bounded inline preview; continue text below unobstructed | **OWNER-SETTLED desired behaviour**; upload/revocation baseline in current code. |
| IMG-02 | Mobile screenshots | Small image/screenshot button invokes Android file picker and inserts at caret; no mandatory camera capture | **OWNER-SETTLED desired behaviour**; mobile keyboard/focus/upload experience to test. |
| IMG-03 | Authoritative image placement | Versioned image-placement token linking private image part and source position, or tested single ordered Note-canvas model | **OPEN IMPLEMENTATION CHOICE**: prototype against existing Note Markdown and exact reading/UTF-16 before settling; never duplicate ordering authority. |
| IMG-04 | Image upload durability | Non-blocking staging via existing owner-private R2, bounded local pending Blob storage when possible, atomic attach and retry | PROVISIONAL technical approach; browser quota/offline/reload fallback and image-limit behaviour to test. |
| U-02 | Format toggles | Bold/italic/headings/lists/code/link should toggle or replace selected Markdown correctly, not add nested stray delimiters | Proposed settled. |
| UX-01 | Notes bottom bar vs Your Work | Retain left-nav Your Work (all personal records); bottom “Manage Notes” opens same organiser in Notes-filtered URL mode | **OWNER-SETTLED destination**; action label proposed because a literal “Your Work” label would be misleading. |
| UX-02 | Notes bar and zero-tab lifecycle | Desktop bar uses available space for Note tabs/+; close last tab leaves ZERO tabs, restore usable editor, no replacement draft or tiny collapsed box | **OWNER-SETTLED**; browser state routing details to implement. |
| UX-03 | Note creation and deletion | One [+] menu with labelled Blank Note / Note about this page; direct Move to Trash in active Note menu; close/minimise/Trash distinct | **OWNER-SETTLED intent**, menu arrangement provisional subject to accessibility testing. |
| UX-04 | Your Work default controls | Remove New Note, eyebrow/description and two-filter stack; one full server-backed search; advanced organisation remains under deliberate disclosure | **OWNER-SETTLED**; specific filter UI/wording adjustable. |
| UX-05 | Annotation navigation | Card opens exact retained annotated source + existing inline preview; user-own prose fallback if unavailable, not full separate management screen | **OWNER-SETTLED**; preserve old deep links. |
| UX-06 | Flag inside annotation | Outlined/solid Flag toggles original passage target bookmark; small marker complements dotted mark; no duplicate or canonical text mutation | **OWNER-SETTLED**, precise marker positioning to test. |
| UX-07 | Visible branding | Remove private/V2/tagline/sidebar filler; copy exact V1 wordmark/icon assets into V2 on eventual implementation | **OWNER-SETTLED**; V1 paths verified, preserve license/accessibility. |
| UX-08 | Global/library create actions | Remove prominent global New Investigation, Library New article/Create knowledge area/Browse sources; retain contextual/secondary authoring | **OWNER-SETTLED**, no loss of capability permitted. |
| LIB-01 | Library hierarchy | Subject areas (areas), Topics (articles), References (article concepts/functions/commands) as facets, not duplicated records | **OWNER-SETTLED IA intent**; final menu/route wording optional. |
| LIB-02 | Multiple subject memberships | One article can connect to multiple accepted areas and Journeys; no automatic reclassification/project-based duplicate article | **OWNER-SETTLED intent**, depends on one accepted relationship authority (R-01). |
| LIB-03 | Unified Library search | One owner/gen-scoped paginated query across ALL eligible areas/articles/reference entries with typed filters and current rights | **OWNER-SETTLED**; extend existing query versus narrow new endpoint OPEN. |
| LIB-04 | Meaningful topic previews | Author-supplied topic-specific synopsis preferred; legacy bounded passage excerpt only if useful, otherwise omit summary | **OWNER-SETTLED purpose**; precise metadata/heuristic provisional. |
| LIB-05 | Scalable landing | Landing is compact catalogue; area detail and 150+ articles paginated; ungrouped not misrepresented as recommendations | **OWNER-SETTLED**; exact visual density tunable. |
| DATA-01 | Catalogue versus reading identity | Authoritative separately revisioned Library catalogue sidecar for new summaries/concepts/commands; historical Article concepts remain read-only historical and projected compatibly | **TECHNICALLY RECOMMENDED after verified source:** `renditionFor` currently hashes Article.concepts and learningShape; implementation must prove old hashes still resolve. |
| DATA-02 | Taxonomy classification | Keep explicit RecordLink accepted area membership authority initially (no redundant writable graph), area associations don't rewrite `learningShape.subject` | **RECOMMENDED**; validate bidirectional old links and precise confirmed-source mutation. |
| DATA-03 | Targeted manuscript updates | Preserve `sectionId/partId` across edits by stable mapping, otherwise fail with `anchor_migration_required`; historical captures never remapped by title | **MANDATORY correctness**; algorithm to be proven with fixture. |
| DATA-04 | Indexed commands | Case/punctuation BINARY term/alias table for `-i` versus `-I`, FTS5 optional prose-only projection | **EVIDENCE-BACKED**; local SQLite unicode61 token test collides. |
| DATA-05 | Library metadata recovery | Archive catalogue heads/revisions, raw source linkage and accepted relations; rebuild derived indexes on generation restore | **MANDATORY**; 8 MiB/20k row current budgets trigger capacity gate. |
| DATA-06 | Source summaries | Preview-only authored metadata has distinct catalogue revision; displayed reading-text changes are legitimate new renditions | **MANDATORY domain distinction**; no hidden prose rewrites. |
| MCP-01 | Learning authoring tools | Extend one-call manuscript publisher, scoped Library search and bounded context/relation tools; use same domain services as frontend | **RECOMMENDED**; avoid per-button MCP tools and huge hand-built schema. |
| TECH-01 | CM6 images and history | State-field decorations map edits but aren't persistent; authored ordering and owner R2 attachment are separate; native CodeMirror undo with serial remote CAS | **OFFICIAL CM6 DOCS + SOFA scoped evidence**; no actual Minamo integration yet. |
| TECH-02 | D1 transaction versus R2 | D1 `db.batch` is atomic for its statements; R2 staging/attachment uses separate guarded/idempotent reconciliation | **OFFICIAL D1 DOCS**; no cross-product atomicity claim. |
| TECH-03 | React shared state | Single Notes controller or stable snapshot external store with `useSyncExternalStore` (SSR-consistent getServerSnapshot) | **OFFICIAL REACT DOCS**; one shared source required, hook optional. |
| S-01 | Additional paid inference | No extra paid model service; ChatGPT conversation remains author/reviewer | Proposed settled. |
| S-02 | Release authority | This is a draft design PR; **no coding/deployment until explicit owner instruction** | **LOCKED while this planning PR is draft.** |

**How to resolve a decision:** record the date, the exact owner's clarification, the chosen behaviour, compatibility impact, affected design/acceptance IDs and tests. Do not silently mark provisional decisions "settled" on engineering preference alone.

## B. Traceable acceptance matrix

Each gate must have **source tests + actual Worker/HTTP/MCP where relevant + real saved-site evidence where relevant**, not only declarative fixture unit tests. A gated production exercise may follow a safe test deployment; no real user corpus should be mutated without a separate, explicit owner request.

### Investigation work and authenticity

| ID | Scenario | Required result |
| --- | --- | --- |
| INV01 | New isolated curl Investigation with zero Journeys | Saves **question-only** reading and accepts an **explicit** checkpoint without a fake Journey parent, mode, source-origin classification or achievement. |
| INV02 | Owner reports using Kali and describes a response with **no transcript** | Development marked learner-reported (not minamo-observed); can explicitly preserve prediction, misconception and unresolved issue. |
| INV03 | GPT describes a hypothetical teaching example during ordinary 'Use minamo' chat | **No write at all without explicit request**; on explicit save, only illustrative/provisional basis allowed, never observed Run/achievement/completion. |
| INV04 | Owner checkpoints prediction, trial, error, correction and next question | One coherent explicitly requested Development with typed facts, basis/source refs and concise summary, no transcript dump. |
| INV05 | A later observation contradicts an earlier interpretation | Correction references prior event; history remains readable. Current perspective updates without rewriting old canonical Investigation rendition. |
| INV06 | A development is revised, trashed/restored, or its source becomes unavailable | Exact ID/CAS/permissions/readback apply; provenance and revised/withdrawn state are honest. |
| INV07 | Tab disconnects after server commit but before response | Identical operation replay yields one Development, correct revision and no duplicate activity. |
| INV08 | Two independent concurrent updates | No lost write; correctly serialised or conflict surfaced with both intents retained for reconciliation. |
| INV09 | A Note is linked to Investigation but no explicit checkpoint recorded | No false progress appears on Investigation, Journey or Home; private Note remains separately editable and readable only when eligible. |
| INV10 | Read only current Investigation context through GPT | Bounded recent history, latest perspective, unresolved questions and provenance available without dumping entire Notes. |

### Cross-context relationships and projections

| ID | Scenario | Required result |
| --- | --- | --- |
| REL01 | Investigation later added to Journey A stage 2 | One accepted relationship with reason and exact stage; details live once in Investigation. |
| REL02 | Same Investigation linked generally to Journey A and B | One history and two **related-question** projections; do **not** infer all developments advanced both stages. Only explicitly stage-relevant events count as stage-specific work. |
| REL03 | An accepted broad Investigation↔Journey link is removed | General related-question projection disappears, but **direct Journey-stage developments remain**. Investigation/event histories stay intact without copied data. |
| REL04 | Legacy stage/section link or rendition is edited | No silent relocation of old anchors; explicit relationship repair or warning. |
| REL05 | Candidate semantic overlap found in Library | Candidate labelled "suggested" with reason, never written into accepted graph automatically. |
| REL06 | Sparse or empty workspace | Zero candidates is valid; no fabricated knowledge graph link or "you have completed" claims. |
| REL07 | Source revocation, archived Note or deleted related record | Current eligibility prevents unauthorized details/summaries from leaking via backlink or Home/GPT. |
| VIEW01 | Investigation receives explicit checkpoint | Its page visibly presents event, current perspective and next question after acknowledgement, with **no Start/status/origin display** or GPT-created personal Note. |
| VIEW02 | Journey has direct stage checkpoints and multiple linked Investigations | Stage-owned work is visible, only explicitly relevant external events contribute to stage work; other Investigations shown as related context, no copied prose or percent. |
| VIEW03 | Three explicit checkpoints close in time on the same target | Home may show a coherent grouped read-time recent item while all exact events remain accessible; **no session record or inferred start/end**, no routine edits. |
| VIEW04 | An Investigation hasn't received new checkpoints recently | Existing last-meaningful work remains available within deterministic Continue window/cursor or Favourites; opening it or editing other records doesn't manufacture fresh activity. |
| VIEW05 | Recent-work cursor/page and direct deep link | Server sorting and pagination are stable, authenticated and useful with >first-page data. |

### Stage-owned work, owner-directed checkpoint behaviour and Home/Favourites

**Normative tests for user decisions:** `LEARNING-WORK-AND-CHECKPOINTS.md`. These extend and refine existing INV/REL/VIEW tests. Ordinary model chat is not a durable session.

| ID | Scenario | Required result |
| --- | --- | --- |
| STAGE01 | Following a Journey's HTTP stage without any Investigation | Owner explicitly checkpoints, Development belongs directly to exact Journey ID+stage ID; works on Journey/Home/GPT, no fabricated Investigation. |
| STAGE02 | Stage checkpoint records prediction, observed output reported by user, misconception and correction | One evidence-aware Development with honest bases, stable IDs and bounded current perspective; no invented execution. |
| STAGE03 | One Investigation relates to three stages, no per-event stage association | General 'related question' links visible separately; none of its Developments falsely count as direct stage progress. |
| STAGE04 | Explicitly assign one Investigation Development to just one stage | Only the named stage receives relevant work indicator; one event ID/history, no duplicate rows/percent complete. |
| STAGE05 | Reorder Journey stages while stored Developments exist | Stable stage IDs and old canonical anchors survive; work stays with intended stage, not numeric position. |
| STAGE06 | Remove or rename a Journey stage referenced by existing work | Current resolution rejects wrong replacement and offers eligible historical exact-target recovery; no silent reattachment by title. |
| STAGE07 | User switches stages or resumes last locally opened one with no checkpoint | Last visited remains navigation state, not new Development, Home Continue or completion. |
| STAGE08 | Correct/withdraw a direct stage Development | Exact CAS/provenance history preserved, stage perspective and Home updated, no new fictional evidence or duplicate event. |
| STAGE09 | Two simultaneous checkpoints to same stage, one uncertain response | Ordered/guarded operation receipts, both user intents recoverable; no duplicate development or lost work. |
| CKPT01 | New chat starts “Use minamo. What was I doing last?” | Focused bounded relevant MCP context **read**; zero learning writes, no invented session/origin and no 'last chat transcript' claim. |
| CKPT02 | Twenty ordinary follow-ups on same Minamo topic | Reuse chat context, no per-turn MCP read/write requirement, **zero automatic checkpoint or interaction-summary writes**, measured latency/calls. |
| CKPT03 | User says “Checkpoint this” after reported Kali work | One purposeful MCP write containing exact target, concise facts, basis, corrections/open question, acknowledged receipt. |
| CKPT04 | User asks “save what we established” / “record progress on this stage” | Equivalent explicit checkpoint intent without rigid command phrase; no extra permission ceremony if target clear. |
| CKPT05 | User asks GPT for a challenge but not to save | Draft response in chat; read Library context if necessary; **no new Journey/Investigation/Library or Development**. |
| CKPT06 | User says “Add that challenge to my Journey” | Deliberate targeted content-authoring MCP write, **not** a fabricated Development or personal Note. |
| CKPT07 | GPT infers a significant insight but user didn't request persistence | **No** automatic checkpoint, question or repeated “Want me to save?” prompt, and no full conversation/interaction receipt. |
| CKPT08 | Explicit checkpoint has two equally plausible primary targets | One concise target clarification or faithful refusal, not a fabricated parent Investigation or guessed stage. |
| CKPT09 | User checkpoints a correction to earlier checkpoint | Revision/correction linked with source/event IDs; old history remains exact, current perspective updates. |
| CKPT10 | User explicitly asks to checkpoint observations across two targets | Small bounded atomic batched targeted write only if intended, proper primary targets/provenance and one original operation identity. |
| CKPT11 | New chat later asks what happened in the “last session” | Report time span and actual **saved** checkpoints; no formal session, no access to unsaved past chat, honest absence of data. |
| CKPT12 | User only asks to look up a Note, Library Article or favourites | Read scope adequate; no narrative interaction record, progress event, start-state or automatic follow-up write. |
| HOME01 | Several Journey-stage and Investigation checkpoints exist | Continue lists a bounded set of exact work targets sorted by last meaningful acknowledged checkpoint with next question and direct link. |
| HOME02 | Only record was favourited, no checkpoint | Favourites appears, Continue/Recent empty or quiet; never claim that a visit, bookmark or content edit was learning progress. |
| HOME03 | Three checkpoint events on one target close in chronology | Recent may group display read-time, each separate event remains accessible; **no persisted/inferred session ID**. |
| HOME04 | One old favourite and one newly checkpointed stage | Favourite remains despite inactivity; recent stage is Continue; no false "active" status or duplicate giant cards. |
| HOME05 | New Article/Area publication and several Note autosaves | No Home meaningful Development feed entry; editorial changes can remain separate from learning if appropriate. |
| HOME06 | Revoked Source or withdrawn/corrected evidence | Perspective dependency rev/epoch invalidates stale prose and returns currently eligible evidence-labelled saved facts until **explicit new checkpoint** updates it; correction may itself appear meaningfully recent, superseded assertions no longer shown as current progress; no silent inference. |
| HOME07 | Owner has no personal saved checkpoints and no favourites | Useful quiet Home navigation without forced Investigation/Start status, fabricated milestone or empty mandatory Explore feed. |
| HOME08 | 1500 corpus items and 1000 checkpoints | Bounded server-qualified **per-list/compound cursors** with stable committed timestamp+event-ID tie-break, owner/generation/epoch binding and grouping across page boundaries; no loaded-only N+1 query. |
| HOME09 | After acknowledged checkpoint in ChatGPT, open Home and exact stage | Fresh bounded server projection on **enter/foreground return even when no record selected**, with sourceVersion/dependency guards; no extra write, page-wide fetch or polling needed. |
| HOME10 | Browser visits stage and Note while another device checkpoints | Visited state doesn't affect meaningful ordering; acknowledged stage work updates cross-device server projection. |
| HOME11 | Favourite and Continue point at same record | Both meanings retained, UI may avoid duplicating a large card; unfavouriting does not affect saved learning work. |
| FAV01 | Whole-record Bookmark of eligible Investigation, Journey and Article | Existing target-based Flag/setFlag stores reversible favourite, no new Favourite table or reading-rendition change. |
| FAV02 | Favourite click repeated after network loss | Immutable operation receipt, expected targetRev and reconciliation prevent duplicate records and false toggles. |
| FAV03 | Unfavourite old article while its Development history remains | Home Favourites updates; Continue/history unaffected, no implied conclusion/deletion. |
| FAV04 | Existing whole-record Flag before UX update | Projects as Favourite if eligible, preserves prior bookmark and rev; passage Flags remain passage marks, not Home favourites. |
| FAV05 | Trashed/revoked source or record as favourite | Current eligibility suppresses content/metadata; old bookmark tombstone/history remains safe and can't resurrect removed record. |
| FAV06 | Favourites available to GPT on a cold-start recall request | One bounded eligible read with exact family/id/deep link, no per-item MCP call or silent writes. |
| FAV07 | Favourite Library Article and go to its exact reading | Current eligible Article target remains canonically readable with correct historical source; bookmark doesn't rehash it. |
| FAV08 | Foreign owner requests favourites or mixed-generation bookmark read | No title/ID/source leakage across owner/generation, privacy floor enforced. |
| FAV09 | Favourites list includes archived/legacy Flag inconsistencies | Bounded reconciliation or actionable unavailable status; never two active favourites for same target. |
| LEARNMCP01 | Inspect installed MCP after implementation | Discover target-agnostic get/record/revise learning tools with short clear descriptions; old unshipped investigation-only tools not doubled. |
| LEARNMCP02 | Model starts new Use minamo conversation with read-only request | Fetch bounded focused relevant saved context, 0 checkpoint/authoring operations, never claim full previous chat history. |
| LEARNMCP03 | Normal learning Q&A across 20 turns | Tool call budget/latency measured; no per-turn polling, automatic 'session' record or standing checkpoint. |
| LEARNMCP04 | Explicit checkpoint requested | One idempotent tool operation and immediately useful receipt, no redundant post-write read unless required for uncertain status. |
| LEARNMCP05 | Explicit publish/favourite request separate from checkpoint | Uses original appropriate publisher/setFlag tools; no substitute Development or extra serial write. |
| LEARNMCP06 | Last-chat recall when learner never checkpointed | Clearly says no saved relevant checkpoint, may use available favourite/Library records; no invented unsaved dialogue. |
| LEARNMCP07 | Journey stage Work target validation | Exact Journey/stage/old rev pin, current eligibility and stable historic identity; no forced investigationId. |
| LEARNMCP08 | Evidence and actor distinction | Developer audit provenance retained, **no question-creator/origin learner metadata** in new shape; learner-reported vs observed correctly separated. |
| LEARNMCP09 | Legacy v1 investigation reading and v2 question-only published in same workspace | Both usable/retained, no mode/origin rehash or forced migration, Status/Start UI absent; current creation accepts new shape. |
| LEARNMCP10 | Refresh after correction/unfavourite/source revocation | Same HTTP/MCP domain returns eligible current perspectives/favourites with cache/freshness rev; no stale status/progress leaks. |
| LEARNMCP11 | GPT creates question-only v2 Investigation under editorial preflight | `lib/editorial-policy.ts` and `lib/authoring-package.ts` accept origin-neutral Question with explicit owner-directed authoring, retain anti-fabricated learner-results/coverage checks, no `suggested/gpt-prompt` requirement or Start-status display. |
| LEARNMCP12 | Owner uses “Discuss with GPT” on a non-first Journey stage without a selected passage | Clipboard brief remains read-only and includes exact stage/work target, retained reading identity, return destination and stage-sensitive invalidation. Combined bounded `relatedRefs` read when supported rather than eight compulsory calls; no checkpoint/log just from copying. |

### Notes live capture and formatting

| ID | Scenario | Required result |
| --- | --- | --- |
| NOTE01 | New Note first meaningful character | Stable identity, locally retained immediately; server creation without Save when connected. |
| NOTE02 | Existing Note edits while prior save pending | No typing lock; immutable local sequence and original operation **committedRevision** distinct from **later currentRevision**. New edits survive late ACK and tab switch; unrelated server changes aren't silently rebased. |
| NOTE03 | Long uninterrupted typing (30+ seconds) | No "pause to save" dependency, no lost characters and measured ack freshness meets chosen N-01 target. |
| NOTE04 | Refresh/close during active edit then restore | Latest local edit recovered; operation status identifies exact committed revision independently from any newer current revision; no duplicate Note, lost title/context or revision regression. |
| NOTE05 | Offline, throttled network, 503 and conflict | Clear local/sync/server statuses; later safe reconciliation, never falsely "Saved to Minamo". |
| NOTE06 | Two tabs independently edit same Note | CAS/conflict preserves **title, body, context links, sections and image order**, not body-only comparison; exact committed rev2 vs concurrent title-only rev3 lost ACK yields honest conflict or complete reconciliation, not silent overwrite. |
| NOTE07 | Notes dock left/right/top/bottom, max/min/collapse; Pixel-like 390/320 widths | No lost selection/caret or draft; no false sync on display-only changes. |
| NOTE08 | GPT queries Note while user types | Server returns only last **acknowledged** eligible revision/time; browser-only pending edits are **unknown to server-only MCP**, never asserted as known pending/no pending. |
| NOTE09 | Note associated with Investigation and two Library items | Associations preserved; no automatic note text copied into progress; explicit revision-pinned citation works. |
| NOTE10 | Private Note content changed or Trashed after cited | Historical work provenance preserved without revealing a no-longer-eligible source body. |
| FMT01 | Toolbar toggles selected bold and italic on/off | Undoable reversible formatting; no doubled delimiters, preserved selection/caret. |
| FMT02 | Heading, list, block quote, code and link on active selection | Predictable transform, no source corruption or global side effects; proper link validation. |
| FMT03 | Ctrl/⌘ shortcuts, composition/IME, editor focus, Android toolbar | Scoped keyboard behaviour only; accessibility and browser shortcuts retained where unhandled. |
| FMT04 | Icon-only narrow toolbar | Accessible names/tooltip/pressed states, usable touch targets; format settings not permanently crowding writing area. |
| MOBILE01 | Open mobile Note at 320/390px with virtual keyboard | Caret/writing surface visible immediately, no preliminary scroll; no large admin/search/preview/dock selector above editor. |
| MOBILE02 | Minimise Note and continue using Minamo | Exactly one small accessible floating launcher; app is interactive and launcher doesn't obscure key buttons; restore same active Note, caret, scroll and pending sync. |
| MOBILE03 | New Note + switch among 4+ open tabs | One compact horizontally scrollable row plus +; independent editor states, local drafts and autosave queues; no duplicate Notes or multiple rows. |
| MOBILE04 | Active tab pencil rename | Tap pen icon adjacent to active tab label; inline focused input, Enter/blur commit, Escape cancel, stable Note ID and intact contextual links; no large duplicate title field. |
| MOBILE05 | Close tab vs minimise sheet vs Trash | Close removes tab only; minimise preserves entire sheet state; Trash requires deliberate action; reopening restores correctly. |
| MOBILE06 | Android Back, rotation, keyboard and safe-area | Correct sheet dismissal/restore and editor toolbar placement with 320/390px/landscape; no focus trap or browser navigation regression. |
| MOBILE07 | Desktop Notes across docks/focus | Existing four-way dock/minimise/resize/focus and compact tab renaming remain functional; mobile-specific launcher doesn't duplicate desktop launcher. |
| IMG01 | Paste PNG into desktop Note between paragraphs | Local placeholder appears at caret; private staged asset/attached Note visible inline, editing below image remains unobstructed; no data URL in body. |
| IMG02 | Drop JPEG/WebP into desktop Note at pointer location | Correct CodeMirror document position, no overlay, stable caret/scroll/selection and undo; no remote URL fetching. |
| IMG03 | Mobile screenshot picker | Small image button opens device's image picker (no forced camera); image inserted inline at intended caret, bounded viewport height, typing continues. |
| IMG04 | Long writing alongside several images | Previews remain bounded in normal text flow, never cover following text or horizontally overflow; expand on deliberate interaction. |
| IMG05 | Image uploads during typing, tab switch and minimise | User edits remain writable and locally durable, image placement/attachment commits atomically after validation, different Notes sync independently and GPT sees only acked revisions. |
| IMG06 | Upload failure/restart/offline/quota/expired staging | Retry/Remove placeholder, no orphan server marker, no duplicate asset, surrounding text safe; pending Blob recovered where supported or reselect clearly required. |
| IMG07 | Image source/canonical identity and older Notes | Exact body/part ordering, MIME/alt/caption mapping and UTF-16 selection/Flags/annotations; existing end-of-Note attachments remain unchanged. |
| IMG08 | Image eligibility and recovery | Same-owner/current-generation read only; revoke/Trash/export/recovery handle bytes/alt safely, no old-generation leak and same Note placement after restore. |
| IMG09 | Clipboard safety and accessibility | Pasted HTML/URL not silently imported; unsupported format safe fallback; keyboard file selection, screen-reader label, caption/alt prompt and no raw bytes in logs. |
| IMG10 | GPT reads Note with images | After acknowledgement it gets only eligible Note text/metadata (not pixel contents); while upload pending it sees only last acked version/freshness, never fake learning evidence. |
| FMT05 | Formatting + same-note autosave while pending | No lost text or conflicting rebase and full Markdown source/visible-range correctness. |

### Diagrams, embedded video and indexed references

| ID | Scenario | Required result |
| --- | --- | --- |
| DIA01 | Explicit native `graph-v1` cyclic diagram | Rendered native figure, exact connections/labels, accessible text and narrow-screen usability. |
| DIA02 | Supported friendly flow/graph syntax authored in manuscript | Faithfully compiled to correct codec without author constructing nested internal JSON. |
| DIA03 | Unknown Mermaid/diagram | Visible source preserved, useful warning, no invented nodes/connections or XSS. |
| DIA04 | Curl request/response diagram in both Investigation and reusable Library where educationally useful | Meaningful rendering; not merely ASCII code, not diagram spam. |
| DIA05 | Highlight/Flag/Annotate near media/diagram with non-BMP Unicode | Exact retained UTF-16 selections and no DOM mapping corruption. |
| MEDIA01 | Supported direct YouTube video ID referenced with explicit embed intent | Initially static card; zero third-party requests until click; keyboard-usable player after click. |
| MEDIA02 | Supported Vimeo direct video ID | DNT parameter, clear limitations, opt-in playback, external link fallback and correct CSP. |
| MEDIA03 | Non-video listing URL such as `https://curl.se/docs/videos/` | **Not** treated as a playable video; useful original link and explanation retained. |
| MEDIA04 | Unsafe host, invalid ID, provider denies embedding, offline | No iframe execution or proxy; safe fallback without loss of citation. |
| MEDIA05 | Existing private owned MP4/WebM attachment and revocation | Owner eligibility, revocation, no cross-owner/old-generation playback regressions. |
| MEDIA06 | External media caption/transcript and provenance | Accurate "external linked" label, no invented transcript/streaming success/source rights. |
| INDEX01 | Authored curl command reference with aliases and flags | Article includes valid `shell-command` entries and `ConceptBrowser` shows/copies deep-linked commands. |
| INDEX02 | `-i`/`--include`, `-I`/`--head` | Exact case-sensitive alias meaning retained, HEAD not mis-described as hidden GET. |
| INDEX03 | Ordinary code examples mention random tokens | No indiscriminate low-confidence publication of false canonical command entries. |
| INDEX04 | Article edited or indexed destination moved | Exact record/section reference repaired deliberately; immutable past renditions preserved. |
| INDEX05 | Library with >first page and several areas | Index search doesn't silently omit later owned canonical command entries. |

### Owner-annotated navigation, Notes lifecycle and Your Work regressions

These are *additional to* NOTE/MOBILE/IMG tests above and must be checked with the same owner-scoped state and production-equivalent reading contracts. No separate Notes store or second personal organiser.

| ID | Scenario | Required result |
| --- | --- | --- |
| NAV01 | Desktop bottom Notes bar with four open Notes, panel minimised | All four open tabs are usable in compact width; selecting one immediately restores the complete useful editor at that tab, no tiny secondary collapsed Notes box. |
| NAV02 | Bottom-bar Manage Notes and left-nav Your Work | Bottom opens Notes-filtered view; left nav opens All Work; both use the same organiser; explicit URL tab survives refresh/Back and overrides previous local tab preference. |
| NAV03 | Close final open Note tab (currently creates blank) | Zero tabs remains valid, panel hides appropriately; no new local draft, duplicate Note or server create; floating/bar launcher remains. |
| NAV04 | Reopen Notes with zero open tabs | Minimal Open Note/New Note choice; no automatic empty draft, while old saved Notes/drafts remain recoverable. |
| NAV05 | Close tab, minimise, hide panel, Trash saved Note | Four independent intentions. Direct Move to recoverable Trash in active Note menu with confirmation, exact revision and receipt; never mistake tab close for deletion. |
| NAV06 | Save or image upload pending during close/Trash/minimise | Draft/operation bytes and identity retained; safe conflict/error retry; no re-created blank Notes or lost subsequent typing. |
| NAV07 | Press [+] desktop or mobile | Clear Blank Note vs Note about this page menu with meaningful-context guard and accessible shortcuts/names; same underlying creation semantics. |
| NAV08 | Global header without New Investigation and Library without new/article/area buttons | Relevant intentional Create/authoring remains reachable contextually; Help/search/settings/auth continue working. |
| WORK01 | Your Work landing | No duplicate New Note, slogan/eyebrow, redundant paragraph or bulky default management controls; personal cards appear promptly. |
| WORK02 | Search across later owner-only records | One query searches current eligible stored work beyond first loaded page, with stable pagination; optional kind/sort/context filters, no misleading local-only completeness. |
| WORK03 | Open advanced organisation | Context/area and bulk linking, explicit independent CAS operations, retries/Trash remain available on demand without dominating default reading. |
| WORK04 | Open Notes-only organiser via bottom CTA | Notes selected and query appropriately scoped without losing ability to switch to All/Annotations/Flags/Runs/Trash; no second database or hidden source rights. |
| WORK05 | General work card and specific annotation card | Note opens in editor; annotation follows its exact source by default; Rules/Flags remain distinct, no standalone management page in routine click. |
| ANN01 | Click saved Annotation card in Your Work | Navigate to exact family/id/rendition/section/part/range of original marked passage and show existing contextual preview (edit/delete), not full annotation detail. |
| ANN02 | Source retained at older revision | Open *exact* historical eligible passage; don't silently relocate quotation to latest text or match by title. |
| ANN03 | Source Trashed/revoked/unavailable | Compact owner-eligible annotation **own prose** fallback in Your Work; no unavailable source quote/title leak, with edit/delete and explicit retry/recovery option. |
| ANN04 | Legacy direct annotation URL and Browser Back | Compatible deterministic exact-return or unavailable-prose fallback; accessible focus/return to organiser. |
| ANN05 | Existing mobile and desktop selection-to-Annotate | Works exactly as before, including UTF-16 emoji/multipart selection, save/retry and in-place editing; overhaul does not introduce compulsory management screen. |
| ANN06 | Edit/Delete contextual annotation with concurrent change | Correct CAS/receipt/Trash and existing drafting; no duplicate private annotation or discarded own prose. |
| FLAG01 | Toggle outlined/solid Flag within annotation editor | Targets original exact passage bookmark, not annotation record; pressed state and descriptive label, keyboard and touch. |
| FLAG02 | Existing dotted Flag decoration with small flag glyph | Clearly discoverable and distinct from annotation mark without duplicate icons per overlapping segment or adding text to canonical UTF-16 ranges. |
| FLAG03 | Toggle same Flag from reading and annotation concurrently | Target identity, rev checks, idempotent retry and no duplicate Flag record, correct state after refresh. |
| FLAG04 | Trashed/revoked original passage but user-owned annotation intact | Flag control disabled with reason; annotation own prose remains accessible, permission-safe. |

### Scalable Library, subject organisation and source-backed indexing

| ID | Scenario | Required result |
| --- | --- | --- |
| LIB01 | Library home, no search | Show compact Subject areas / Topics / References facets and genuine counts, not every area's complete Article grid. |
| LIB02 | 150 and 1,500 eligible Article fixtures across many areas | Landing remains bounded; individual area/topic views paginated; no unbounded grids, huge anchor-nav-to-expanded-pages or false partial counts. |
| LIB03 | Query matching article after first loaded page | One server-backed search finds it and opens exact article; no "Filter loaded topics" or separate "Search full workspace" gate. |
| LIB04 | Search curl command alias and Python function | Authoritative sidecar index of actual references (projected as compatible `Article.concepts` read DTO), flags/case distinct and exact section/part/rendition deep links across full eligible server corpus. |
| LIB05 | One cross-project graph-traversal Article related to two Journeys and two subject areas | One Article identity, approved links exposed in both contexts, no copied teaching content or unique-parent requirement. |
| LIB06 | Suggested semantic relationship to a new area | Clearly suggested with grounded candidate reason; does NOT auto-reparent or appear as accepted until deliberate confirmation. |
| LIB07 | Existing kitten RPG project-themed area / legacy source | Remains valid and accessible, general computing explanations discoverable independently; no bulk reclassification or destructive migration. |
| LIB08 | Uncategorised HTTP/curl article | Appears in All topics / neutral Other topics, **not** “More reading to explore” framed as an editorial recommendation. |
| LIB09 | Article with authored useful one-sentence summary | Card says what mechanism is explained and its source; no generic “A reusable Python topic”/“Library reading” boilerplate. |
| LIB10 | Legacy Article with no useful summary | Honest truncated relevant excerpt if safe/meaningful, else title-only; never fabricate an educational promise or rewrite original for card. |
| LIB11 | Area detail with 200 children and 2 approved area memberships per Article | Correct eligible counts, deduplication, cursor and links; no first-page-only area tally. |
| LIB12 | Source is rights-revoked or target moved while search index stale | Final read eligibility denies inaccessible hit/body/alias and no stale deep-link disclosure. |
| LIB13 | Library UI content and creating resources | “FOLLOW THE CONNECTIONS”, generic introduction, New article/Create knowledge area/Browse sources absent from routine landing; deliberate creation/source controls available contextually. |
| LIB14 | More reading/semantic recommendations | Only explicitly reasoned accepted editorial relevance may be labelled recommended; ungrouped is not implicitly recommended. |
| LIB15 | Topic click and browser history | Exact article/section/part opens, full canonical reading, citations, diagrams/video/Flag/Annotate function; list state/search/facet recovered with Back. |
| LIB16 | Empty/sparse Library, missing area and name collision | No invented parent/equivalence or duplicate area/topic records; useful empty-state and deliberate authoring path without clutter. |

### Branding and integrated non-regressions

| ID | Scenario | Required result |
| --- | --- | --- |
| BRAND01 | Desktop/mobile header after brand change | Actual V1 `minamo-header-refined.png` wordmark and `minamo-icon.svg` display with correct proportion, accessible Home link and contrast. |
| BRAND02 | Remove visible V2/private/tagline/sidebar text | Owner-only authenticated scope, Help/About version metadata, original resource licensing, mobile navigation, keyboard/desktop controls still work. |
| BRAND03 | Home/Investigations/Library after global New button removal | Authoring is still intentional and discoverable in proper context; not an app feature regression. |
| INT01 | Save Note, change annotation, Flag/favourite a record or passage, reorganise Library, visit a stage | Does **not** create learning Development, learner achievement or noisy Home 'Recent' item; Favourites separately change only by deliberate whole-record bookmark state. |
| INT02 | End-to-end reported Kali learning when using Journey stage directly or a separate Investigation | **One explicitly requested** Development via shared work target, correct Journey/Investigation/Home projection, Notes separate, no duplicated source/history. |

### Library data editions, GPT/MCP authoring and concurrency contract

| ID | Scenario | Required result |
| --- | --- | --- |
| DATA01 | Add curl `-i`/`-I` reference, edit Article catalogue synopsis only | Current Article `rendition` unchanged, `catalogueRev` advances, old Flag/annotation exact offsets and read links still resolve. |
| DATA02 | Update canonical explanation, diagram, authored caption or title | New genuine reading rendition created; previous eligible saved rendition and passage captures unchanged and retrievable. |
| DATA03 | Legacy Article concepts and `learningShape.subject` before cutover | One safe sidecar backfill from actual current concepts, original `v2_records` and historic `v2_revisions` untouched, no global rehash. |
| DATA04 | Query R via rendition-only URL after C1, C2 and C3 independent catalogue editions | Rendition-only pins **reading**, not an arbitrary catalogue timestamp. Original publication metadata shown only if provably associated; otherwise omitted, with optional separately-labelled **current** catalogue. Exact catalogue-as-of requires explicit catalogue revision/edition selector. |
| DATA05 | Ordinary unambiguous targeted paragraph insertion/reorder plus separate ambiguous update | **Unambiguous edit actually succeeds**, preserving durable stage/current reference identities; ambiguous mapping **separately fails** with precise `anchor_migration_required`. Old captured passage remains exactly pinned to retained old rendition, no speculative global semantic remapper. |
| DATA06 | One Article accepted by two subject Areas and two Journeys | One canonical Article/rendition; deduplicated accepted links; stage associations not treated as exclusive subject or parent. |
| DATA07 | Wording-only targeted Article update with manually accepted Area membership, then deliberate unlink | Omitting catalogue/independent relationships **preserves membership** despite new authored `links` array; exact requested unlink removes intended membership (including authoritative legacy reverse direction), not unrelated authored/source links. One link authority, CAS and receipt. |
| DATA08 | Change only broad Library classification label | New catalogue/membership revision only; don't alter `learningShape.subject`/canonical Article text or manufacture a new reading edition. |
| DATA09 | Authored short subject-specific catalogue summary vs genuine reading introduction | Metadata summary changes without false reading version; actual displayed prose edit creates new version and source mapping. |
| DATA10 | Reference entry points to removed/moved reading block | New index update fails with precise target diagnostics or deliberate relinking; no automatic wrong link to another paragraph. |
| DATA11 | FTS5 searched for `-i` versus `-I` and `--include` versus `--head` | Exact BINARY term/alias matching distinguishes flags/case/punctuation; FTS5 alone never authoritative for command identifiers. |
| DATA12 | Library search after Source revoke/Trash and stale FTS index | No unavailable source text, title/excerpt/snippet/alias leak; final current-eligibility check filters all results. |
| DATA13 | Publication error injected after Article and catalogue head but before last exact index entry | Entire D1 transaction (reading, raw source edition, catalogue, links, terms, activity, receipt) rolls back, and replay is safe. |
| DATA14 | D1 catalogue operation races with another accepted link or source revision | Exact source/catalogue/relationship revision and evidence-dependency checks; loser returns actionable conflict, no last-write-wins. |
| DATA15 | One Library article published from natural GPT Markdown with optional brief catalogue intent | Correct links, intentional commands and original rich source archived/published in one MCP call; no agent-built `p1/section/rendition` JSON. |
| DATA16 | Substantial 150/1,500-topic catalogue plus cumulative Note revisions, operation receipts and asset identities | Search bounded, **supported cumulative workload must complete encrypted checkpoint/export AND successful older-checkpoint staging/activation with preactivation backup** under actual bounds. Oversize safely rejected only **beyond** declared supported envelope; no silent omitted history. |
| DATA17 | Current Article with frozen legacy concepts is edited after sidecar cutover | The server writes raw stored reading, not projected concepts; **cutover-aware current validator uses active sidecar reference targets**. Removing a now-obsolete current part succeeds after deliberate current reference re-anchor/removal; old retained rendition/concepts/Flag unchanged. |
| DATA18 | Index-only metadata operation and a genuine reading-content operation interleave | Separate `catalogueRev` and `readingRendition`/record revision prevent stale references; linked commands marked needs-target-review or re-pinned explicitly, no current link to wrong part. |
| MCP01 | Preview new manuscript with existing candidate areas, duplicate Article and reference aliases | Grounded exact eligible candidate IDs/revs, accepted versus suggested separately, no write, complete brief unchanged. |
| MCP02 | Text-only targeted publication with independently accepted links and separate explicit removal | Omitting catalogue/membership preserves accepted links, only authored source-scoped links follow deliberate source changes. D1 one-operation publication/receipt consistent; explicit named CAS unlink removes exactly requested edge, rollback and replay safe. |
| MCP03 | Existing Library content edited via old `upsertConcept` client after sidecar cutover | Legacy client action safely redirects to catalogue CAS or rejects with documented recovery; no conflicting second index authority. |
| MCP04 | Get current versus retained Article context | Returns reading rendition and catalogue revision separately, eligible current index and exact archived old reading metadata without silent retargeting. |
| MCP05 | Query all Library facets and exact aliases through site versus MCP | Same server domain result scope, pagination/permission ordering and exact deep links; no local-only hidden catalogue. |
| MCP06 | Confirm semantic area or Journey association | Deliberate accepted exact-target operation with reason, expected source/target revisions; suggestions never auto-promoted. |
| MCP07 | Uncertain publication response after server commit | Read original operation receipt and replay identical bytes, never repeat side effects or reconstruct a second package. |
| MCP08 | GPT-assisted 'Use minamo' learning discussion, later explicit checkpoint | Read-only dialogue first; one target-agnostic Development MCP mutation only on checkpoint, no GPT-authored Note dump, bounded current Library/Note context. |
| MCP09 | New catalogue-aware installed tool contract after runtime integration | Actual MCP tool discovery, bounded schemas, backward-compatible existing manuscript inputs and exact operation receipts verified—not inferred from source declarations. |
| TECH01 | CodeMirror widget insertion, deletion, IME, cursor mapping, undo/redo and drop | Editor presentation maps versioned document-owned image placement, not a detached DOM overlay; exact saved reading ranges preserved. |
| TECH02 | Note A rev2 ACK lost; another tab changes title/context at rev3 while A queues new text | Exact A committed base remains rev2; later readback rev3 is **not** A's ACK. No silent whole-Note overwrite; local queued text retained and conflict/complete reconciliation surfaced, undo history preserved. |
| TECH03 | R2 stage succeeded, acknowledgement fails or Note moved to Trash mid-upload | Inspect immutable object/byte digest and staged state before retry, no duplicated/orphan asset or broken Note marker; D1/R2 not called atomic. |
| TECH04 | Shared Notes state used by desktop bottom tabs, mobile sheet and floating launcher | One stable store or parent controller, no stale snapshot/tearing, no ghost blank draft on final tab close. |

### Security, migration, recovery and operational completion

| ID | Scenario | Required result |
| --- | --- | --- |
| SEC01 | Anonymous / different-owner / cross-origin read/write | Reject; never leak prose, Note drafts, evidence metadata or existence of inaccessible records. |
| SEC02 | Old generation or stale target revision | Reject atomically; no partial Development, perspective, link, receipt or Note overwrite. |
| SEC03 | Injection through untrusted markdown, media URL, image description or chat excerpt | Safe literal rendering or rejection; never arbitrary HTML/SVG/JS execution or automatic remote import. |
| SEC04 | Identity/permission-floor changes | Current Source, image/media and personal rights fences apply to projected data and history. |
| REC01 | Complete encrypted checkpoint and older restore at realistic cumulative sustained Note/Library workload | All work/events/catalogue, **retained Note revisions, full receipt payloads, staged/expired asset metadata**, rights and IDs round-trip. Current large but **supported** corpus permits preactivation backup and older valid restore; no unusable restore merely due to current size. |
| REC02 | Import older valid archive missing new tables | Backward-compatible empty new state; old records/history readable; no fabricated work backfill. |
| REC03 | Corrupt/oversized archive or media outside declared supported workload | Reject without partial activation or misleading success; separately prove **normal supported workload succeeds end-to-end**, including older restore. |
| REC04 | Restore archival pre-sidecar Article and new sidecar records in new generation | Compatibility legacy reads still resolve; authoritative catalogue restored; derived term/FTS indexes rebuilt/revalidated with current rights; no false new rendition. |
| CI01 | TypeScript/build/unit + real Worker/Miniflare/D1/MCP tests | All green; actual test counts, failure injection and limits reported. |
| UI01 | Saved 1280/768/390/320 views and phone gestures | Critical flows work; do not assert physical Android without device evidence. |
| UI02 | Live owner-authenticated installed MCP contract and browser on deployed candidate | Tool discovery, intentional writes, exact readback and source/evidence integrity demonstrated. |
| CLEAN01 | Synthetic fixture work cleanup | Only exact disposable test IDs moved recoverably to Trash; genuine records and permission settings unchanged. |
| SHIP01 | Owner issues future explicit single full implementation-and-release commission | **One authorisation** then permits scoped implement/integrate/independent review/test/fix/merge/private deploy **within the same Work/Sites task once gates pass**; no added intermediate user approvals except genuinely unavoidable installation/permission prompts. This draft PR alone grants none. |

### Integrated review-proposed proof scenarios — reusing existing acceptance IDs

**One future Work/Sites commission, not 13 owner reviews or isolated PRs.** The 211 traceability IDs can share evidence. Treat the scenarios below as **cross-cutting demonstrations** covering multiple existing gates, with a link from each ID to its exact executed artifact; no new artificial count of independently executed tests. Independent source inspection, local tests, D1/Worker, candidate Site, installed-ChatGPT/MCP and actual physical Android evidence are different classes—state honestly what ran and what was unavailable.

| Proof | Bounded scenario and decisive assertion | Existing gates reused |
| --- | --- | --- |
| T01 | Note save rev2 commits but ACK lost; another writer modifies only title/context at rev3 while first editor has newer unsaved body. Original operation receipt remains rev2; no silent overwrite; local intent recoverable. | NOTE02/04/06; TECH02 |
| T02 | Substantial cumulative corpus with many acknowledged Note revisions/full receipt responses, catalogue history, staged/expired image IDs and Source history. **Complete backup, stage an older valid archive, preactivation backup, activate, read back** within declared supported workload. Separate over-limit safe rejection. | DATA16, REC01/03/04, SEC04 |
| T03 | Correct/withdraw one Development, revoke another Source without an explicit further checkpoint; perspective dependency revisions/rights invalidate old interpretation and truthfully fall back to eligible events. Race two guarded perspective writers. | INV05/06, HOME06, SEC02 |
| T04 | Start on Journey's **second stage**, no text selected; Discuss with GPT carries exact stage + return link, remains read-only, then **explicit** stage checkpoint; repeat stage switch and removed/stale stage. | STAGE01/05/06, LEARNMCP12, CKPT03 |
| T05 | Migrate old Article concept targets; re-anchor/remove current sidecar reference, then delete obsolete current part. Current validator admits genuine update; old retained rendition/Flag exactly preserved. | DATA03/17/18, MCP03, SEC04 |
| T06 | Keep reading rendition R unchanged through catalogue C1/C2/C3; compare current, rendition-only and explicitly selected catalogue-as-of reads before/after recovery; no false claim of historical catalogue timestamp. | DATA01/04, MCP04, REC04 |
| T07 | Word-only manuscript replacement **preserves manually accepted Area membership**, explicit named unlink removes it; force last SQL statement failure and replay lost committed ACK. No partial link/term/source/receipt. | DATA07/13/14, MCP02/07 |
| T08 | Unambiguous insertion/reorder preserves stable stage/current reference ID and **succeeds**; separately ambiguous change fails with exact actionable diagnostic; old captures remain tied to old reading. | DATA05/10, STAGE05/06 |
| T09 | Same-timestamp Home events, paging across a grouped boundary, correction, un-favourite and Source revocation plus generation restore. Stable cursors, no leaked/duplicated work, foreground revalidation without selected record. | HOME06/08/09/10, VIEW05 |
| T10 | Type continuously while global search has a next page and a retained Article is open; no per-revision full refresh, lost selection or pagination reset. Rename buffer Escape remains cancellable after idle interval. | NOTE03/07, NAV01, UI01 |
| T11 | Text–image–text; undo/remove placeholder before upload acknowledgement; switch tabs/Trash; uncertainty replay. Persist order, bytes/rights, adjacent text, no orphan/resurrected image. | IMG/TECH01/03, NOTE04/05 |
| T12 | Restore new learning/catalogue/perspective rows and older archive without them; source rights redaction and same-generation mutation watermark block stale activation; rebuilt indexes safe or explicitly unavailable. | REC01/02/04, SEC02/04 |
| T13 | Real installed-client cold read, twenty ordinary discussion turns **with zero automatic writes**, explicit checkpoint, authoring, Favourite, target ambiguity and new-chat saved-only recall. Record calls, source identity and latency. Distinct held-out pedagogical curl/graph-reuse task plus genuine saved browser/mobile evidence. | CKPT/LEARNMCP/STAGE, UI02, INT02 |

Use deterministic barriers, not sleeps, for concurrency races. Run high-volume and failure-injection fixtures in **disposable local/test namespaces or a dedicated candidate environment**, **not** in the genuine learner namespace: even Trashing synthetic records leaves archive/receipt/history rows. A small hosted smoke test must be separately scoped and cleaned. Source/reader testing must include user-owned and synthetic paths, with no false home progress.

**Release/verification rule:** one cross-functional Work task can run parallel internal streams and independent review where safe, **then own integration and correction itself**. A gate is not passed because test code exists or old CI is green. Distinguish executed vs inspected tests, deployed browser/installed client vs direct JSON harness, and physical Android vs narrow desktop viewport. Unavailable essential evidence is reported, not invented. No mandatory extra owner review checkpoint or endless planning loops.

## C. Realistic disposable fixture graph

Use synthetic **local/owner-private V2 test-only records** with exact IDs distinct from current data. Never embed real owner Notes, curl console output or conversation excerpts in Git fixtures:

- Journey A: Web Infrastructure, 4 short stages including an HTTP stage.
- Journey B: Python API Clients, 3 short stages including a request/response stage.
- **Direct Journey-stage checkpoint:** learner-reported work in A:stage-1 *without any Investigation*; separate from links to Investigation I. Test one correction and one reordered/removed stage ID.
- **Sessionless chat fixture:** 20 normal `Use minamo` turns with zero writes; one explicitly requested checkpoint; new chat recall only persisted work; one unsaved challenge proposal versus an explicit authored Journey update.
- **Favourites fixture:** existing exact whole-record bookmark for Journey A, Investigation I and HTTP Library Article, then unfavourite/Trash without altering current reading or work.
- Investigation I: standalone curl question, **without status or creator category** in new shape; later general accepted links to A:stage-2 and B:stage-1. An explicit event relevant to A:stage-2 must **not** count as progress on B:stage-1.
- Investigation II: separate unrelated question with no links.
- Library Article: HTTP response metadata and curl flags with explicit command entries.
- Note N1: voluntary user-typed source, linked to Investigation I, edited after a Development cited revision 1.
- Note N2: independent personal draft, not included in progress.
- Note N3: owner-typed multi-paragraph image-bearing draft with PNG pasted at caret on desktop, JPEG dropped at another line, Android screenshot selected via compact icon; no automatic Investigation development. Preserve stable inline placement across edited, restored and revoked renditions.
- Mobile interaction fixture: >4 switchable Notes, active-tab pencil rename, minimise/restore floating launcher while app continues, no duplicate title field/search administration above the writing surface.
- Development D1: user-reported unexpected result; D2: correction; D3: unresolved next step.
- One explicit external YouTube and Vimeo test direct ID with author-captioned link-only fallback, plus one `curl.se/docs/videos` listing that must **not** embed.
- One safe `graph-v1` cycle and one rejected hostile/ambiguous diagram.
- **Library stress fixture:** 150 and 1,500 synthetic eligible Article records spread across broad curated areas (Python, Web/HTTP, Operating systems), plus an area with >200 related articles, an article in two areas, an unclassified Article and a project-born article that must not be duplicated. Include actual reference aliases and one stale/trash/rights-withdrawn source, all synthetic.
- **Personal-work interaction fixture:** four open Note tabs, one queued autosave/image; close last tab; reopen from persistent bar; direct Trash the current saved Note; click a legacy Annotation card into its exact older eligible rendition; make that source unavailable and verify prose-only fallback. Two concurrent passage Flag controls must resolve the same bookmark identity.
- **Header/branding fixture:** read-only V1 asset IDs and copyright/provenance checks, existing Help/About version and current auth; UI text removals must not alter accessibility, authenticated ownership or navigation.


An **explicitly requested** Development on a Journey stage or Investigation should make an accurate target stage/Investigation and Home view appear *by projection*, without editing Journey contents or publishing a new Note. Repeat the same write operation with identical payload to prove idempotency and changed payload to prove conflict.

## D. Required developer/operator evidence

Before claiming completion, the future implementation report must distinguish:

- Real installed-MCP intent scenarios: ordinary chat with no auto writes, explicit checkpoint and explicit authoring, individual tool counts/latency, and honest new-chat reconstruction from saved records only.
- Direct Journey-stage checkpoint vs Investigation-linked **related context**, and Home Continue/Recent/Favourites built with one current owner-scoped server read, not page-loaded records.

1. Typed source/schema/transaction tests, including forced later-member failure.
2. Real deployed Site/installed plugin evidence, not source-only tools/list claims.
3. Exactly which Note characters were locally durable, queued and server-acknowledged in a timed experiment, with **measured median and p95 acknowledgement delay** on a representative throttled connection. Do not promise a timing SLA from one run.
4. Actual saved Note read from GPT/MCP *while another editor is typing*; explicitly report staleness if pending.
5. Rendered native diagram and two providers' external media opt-in/fallback, with browser network evidence of no pre-activation third-party requests.
6. Indexing of `curl` and flags into the actual Library entry view.
7. Bounded Home/Journey/Investigation reads from one data source, after updates/Note association/removal, without copied transcript spam.
8. Recovery snapshot → restore → readback with current permission intersections and note/edit history.
9. No new inference bill, new Site, or original project mutation.

## E. How to modify this living plan

When an additional owner-requested change appears:

1. Add an entry below with `date / new requirement / decision status`.
2. Map it to a domain entity, MCP/HTTP operation, expected page projection, source files, migration/recovery effect and acceptance gate(s).
3. Update **seven living implementation documents**: `INTEGRATED-DESIGN.md`, **`LEARNING-WORK-AND-CHECKPOINTS.md`**, `NOTES-MOBILE-AND-IMAGES.md`, `INTERACTION-AND-LIBRARY-RECONCILIATION.md`, `LIBRARY-DATA-AND-MCP-CONTRACT.md`, `ACCEPTANCE-AND-DECISIONS.md` and `IMPLEMENTATION-SEQUENCE.md`; consult `TECHNICAL-VALIDATION-20261022.md` for external evidence. Mark superseded advice and agree a single owner/source of truth for each operation. Do not leave contradictory instructions.
4. Add or revise synthetic failure fixtures and report any new scope/cost/dependency risks.
5. Keep PR **draft and docs-only** until the owner explicitly authorises implementation. No agent should mistake a specification revision or approving conversational tone for authority to execute.

### Change history
| Date | Change | Status |
| --- | --- | --- |
| 2026-10-22 | Independent Pro read-only review adjudicated: targeted recovery availability and Note committed-revision safeguards (High), stale perspective, legacy index validation, Notes refresh, stage handoff, historical catalogue selection, accepted link preservation and **positive** ordinary edit tests; retained one-task internal gates and existing product architecture | **DRAFT DOCUMENT-ONLY RECONCILIATION**; no implementation authority or report auto-adoption beyond source-grounded supported changes |
| 2026-10-22 | Owner explicitly rejected Investigation learning statuses/creator categories, formal sessions, standing/automatic checkpoints, per-turn MCP writes and interaction receipts; approved direct Journey-stage learning work, Home Continue/Recent/Favourites via existing whole-record bookmark, and deliberate checkpoint/authoring requests only | **OWNER-SETTLED INTENT / DRAFT PLANNING**; source+API/UX/compatibility contract in `LEARNING-WORK-AND-CHECKPOINTS.md` |
| 2026-10-22 | Context7 + SOFA + Firecrawl technical review exposed current Article index/learningShape reading hash coupling, PR18 positional section IDs, FTS5 command-token collisions and explicit recovery-size risks; introduced sidecar catalogue/MCP/reading contract and new race/scale tests | **DRAFT ARCHITECTURE REFINEMENT**; no runtime edits; technical sources in `TECHNICAL-VALIDATION-20261022.md` |
| 2026-10-22 | Consolidated three rounds of agreed desktop/mobile owner annotations: Notes bottom-bar tabs/direct Trash/zero-tab state, Your Work advanced disclosure/Notes-only route, exact annotation source return and bookmark glyph, V1 branding, and scalable Library subject/topic/reference catalogue and server search | **OWNER-AGREED INTENT / PR DRAFT**; implementation tradeoffs remain where flagged; see `INTERACTION-AND-LIBRARY-RECONCILIATION.md` |
| 2026-10-22 | Owner supplied Android Notes screenshots and clarified mobile sheet must minimise to one floating launcher, support compact multi-Note tabs and pencil renaming, and accept inline desktop paste/drag plus small mobile screenshot upload | **REQUIREMENTS ADDED**; source anchor and pending-image durability choices remain open; see `NOTES-MOBILE-AND-IMAGES.md` |
| 2026-10-22 | Initial integrated model: Investigation work, cross-context projections, near-live Notes, icons/shortcuts, diagrams, video embeds and canonical command index | **DRAFT** — further owner discussion expected |

### Pending owner additions
- Further requirements and owner acceptance are still expected. Reconcile against the new `INTERACTION-AND-LIBRARY-RECONCILIATION.md` rather than opening a competing new commission.

