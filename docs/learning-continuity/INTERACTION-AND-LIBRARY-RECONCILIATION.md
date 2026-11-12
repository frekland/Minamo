# Consolidated interaction and Library architecture — owner browser review

**Status:** DRAFT IMPLEMENTATION DESIGN; agreed user-facing direction · 22 October 2026. **DO NOT IMPLEMENT, MERGE OR DEPLOY YET.**  
**Scope:** existing private `frekland/minamo-v2` PR #19.  
**Read with:** `LEARNING-WORK-AND-CHECKPOINTS.md` (**normative owner-directed checkpoints, Home and stage/favourite semantics**), `INTEGRATED-DESIGN.md` (shared Development/provenance), `LIBRARY-DATA-AND-MCP-CONTRACT.md` (**normative Library storage, reading identity and MCP publication**), `NOTES-MOBILE-AND-IMAGES.md` (writing canvas), `ACCEPTANCE-AND-DECISIONS.md` (tests), `IMPLEMENTATION-SEQUENCE.md` (future build). `TECHNICAL-VALIDATION-20261022.md` provides checked external evidence.

## 0. Decisions and priority — no competing rebuild

Three owner-annotated reviews exposed repeated controls, broken Notes lifecycle, annotation management screens that interrupt reading, and a Library whose current landing structure will not scale. The owner agreed to consolidate them into one future engineering task.

The **latest clarifications supersede earlier suggestions**:

- **Keep left navigation “Your Work”** as the comprehensive organiser, including Notes, annotations, Flags, Runs, Trash and advanced management. The **bottom Notes bar's management link opens the same organiser filtered to Notes**. Prefer label **“Manage Notes”** so destination and action agree; an earlier suggestion to label it "Your Work" predates this clarification.
- **Keep a mobile full-height writing sheet AND one floating minimised Notes launcher**, with compact switchable mobile tabs and pen-icon renaming. **Desktop bottom Notes bar uses its width for open Note tabs**, directly selectable even while editor is minimised. Do not replace either with a disconnected second Notes store.
- **Keep the existing successful select → Annotate and Flag interactions.** Enhance annotation return/navigation, inline editing and small Flag glyph; don't rebuild them. Separate full annotation detail page is **not** the normal destination, but an eligible own-writing fallback is required when original source is unavailable.
- **Advanced organisational features remain accessible under Your Work**, but hidden behind deliberate filters/bulk “Organise” actions instead of stacked default forms.
- **Library**: Subject areas, Topics, References (concepts/functions/commands) are complementary facets over one canonically owned corpus, not three copies. A topic remains reusable across multiple accepted areas/Journeys without copying its teaching. **References are stored in a separately revisioned authoritative catalogue sidecar** and may be **projected as compatible `Article.concepts` for readers**. Catalogue-only changes cannot generate a new canonical reading rendition. Targeted wording edits must **preserve independently accepted Area memberships** absent an explicit guarded unlink.
- Remove prominent redundant global “New Investigation” and Library "New article", "Create knowledge area", "Browse sources" browsing controls; retain contextually discoverable authoring and legitimate Source management elsewhere.
- Branding: use the *real* V1 wordmark/icon; remove visible V2 badge, “Private workspace” label, tagline and sidebar inspirational copy. Security, versions in About/Help and owner-only auth remain intact.

This plan **does not replace** first-class explicit Journey-stage and Investigation work entries, status-free Home Continue/Recent/Favourites projections, per-edit Note local durability and near-live server sync, private in-flow image placement, safe diagrams, external video embedding or authoritative curl command indexing described elsewhere in PR #19. It integrates their navigation and catalogue presentation.

## 1. Verified code ownership and why the issues exist

| Source | Verified current behaviour | Required future changes |
| --- | --- | --- |
| `app/workspace.tsx` | `v2-notes-bar` displays Notes count, decorative “Your thinking stays with you as you explore” and “Organise your work” opening unfiltered `view=work`; Home uses loaded recency/edit rows rather than learner checkpoints or whole-record favourites. Header has m≈ logo, V2/private/tagline and global New Investigation. | Shared Notes bar, **server-derived Home Continue/Recent/Favourites**, Notes-only organiser route, keep full sidebar Your Work, clean redundant chrome without confusing favourites with progress. |
| `app/notes-panel.tsx` | `closeTab` explicitly manufactures a blank draft when final tab closes. Independent panel minimise/collapse and bottom-bar toggling can restore a tiny secondary box. Move to Trash for an open Note is buried at panel bottom. | One lifecycle state machine: zero-tabs allowed, restore usable window, direct recoverable Trash via active Note menu, no phantom draft. |
| `app/personal-work-organiser.tsx` | Duplicate New Note, eyebrow/copy, two search fields plus sort/context/topic, large "Topics and connections" form before results. Clicking annotation's title calls `onOpen` to its own record detail, although `onReturn` exists. | Simple server-backed search, compact type tabs, progressive advanced management, annotation's default opens *exact original passage* with safe fallback; Notes-only URL state. |
| `lib/personal-work-organiser.ts` / `lib/reading-links.ts` | Exact annotation `workReturnLinks`/`buildDisplayReturnLink`/`buildAnchorLink` already available; `workRows` only filters loaded preview records. | Reuse exact anchors and ownership; server query rather than misleading local-only filtering; respect unavailable source. |
| `app/annotation-preview.tsx` / `app/reader.tsx` | Contextual selected-passage annotation editor works, including existing saved overlay. Dotted-underlined Flag mark and ◈ saved marker aren't an obvious flag. | Preserve creation flow; add underlying passage's outlined/solid target Flag action in annotation popup, small flag glyph at marked passage, accessible overlap support without canonical text mutation. |
| `app/bookmark-toggle.tsx` | Revision-aware target `setFlag` and recovery implemented. | Reuse this exact bookmark operation, not independently write a Flag for the annotation record. |
| `app/learning-links.tsx` | `LibraryIndex` expands all loaded area groups + topic cards on Library home; a small area-link nav duplicates those expanded sections; overflow "More reading to explore" is actually ungrouped articles. `term` filters current loaded topic titles/bodies only. | Compact subject catalogue and paginated topic/area views; neutral ungrouped handling; server-wide Library search and reference entries; no huge page. |
| `app/concepts.tsx` / `lib/manuscript.ts` | Reference catalogue reads `Article.concepts`, not any Markdown command table; Article `body` may be empty and `sN/pN` IDs can shift during manuscript replacement. Article concepts are currently part of `renditionFor` hash. | Adopt revisioned **catalogue sidecar** authority for future index and summary, preserve historic concepts and stable anchored targets through compatibility read adapters. |
| `lib/domain.ts`, `lib/domain-handler.ts`, `lib/contracts.ts` | Validated owner/gen D1 query, concept matches, explicit relation links and cursor pagination. `renditionFor` hashes Article concepts and `learningShape` but **not links**; old archived captures depend on retained hashes. | Preserve exact reading/historical data; separate catalogue head/revisions/derived index, accepted `RecordLink` authority, shared Site/MCP Library query and compound publishing transaction. |
| `frekland/Minamo` `app/index.html` and `app/identity/` | V1 actually uses `/identity/minamo-header-refined.png` (desktop wordmark), `/identity/minamo-icon.svg` (mobile and favicon); those exact files exist in V1's `app/identity` folder. | Copy approved V1 assets into V2's owned public bundle during later implementation; original repo remains read-only. Verify branding license/attribution; no invented new logo. |

Source was inspected in V2 `main` at this design checkpoint; future Work must recheck before writing.

## 2. URL/routing, shared controls and lifecycle

### Global navigation

Keep left-sidebar **Your Work**; it opens `/?view=work` with full scope. Bottom bar Notes management goes to `/?view=work&tab=notes` (or equivalent exact one-route mode). URL-specified tab takes precedence over a remembered client tab; Back/Forward, refresh, direct links and legacy `?view=work&family=annotation&id=...` remain safe and deterministic. No separate management database or second organiser. Annotation-tab/Trash existing routes remain usable.

Remove "Private workspace", visible V2 marker, tagline, sidebar “Understanding starts...” and redundant generic eyebrow/description on Your Work and Library; keep About-version, sign-in enforcement, Help/Settings and working navigation.

Remove prominent global **New Investigation** (and other redundant global creation). Users still deliberately author from the relevant Investigation view or a contextual menu. Library creation/area/source maintenance moves to secondary contextual controls. Do not make important functionality unreachable while removing prominent buttons.

### Notes bar and shared state controller

Desktop bottom Notes bar:
- Remove decorative `v2-bar-context`. Use width for horizontally scrollable **open Note tabs** (not entire Note database). Selecting one restores that Note's *fully usable editing surface* even if minimised, without an intermediate tiny collapsed Notes box. Preserve per-tab cursor, scroll, draft and operation queue.
- Provide a compact `+` menu with **Blank Note** and **Note about this page**, the latter only when a meaningful eligible current record exists; menu text and keyboard accessibility avoid unrecognisable icon-only controls. Reuse one creation command across bar/panel/mobile.
- Right action **Manage Notes** opens the existing Your Work organiser at its **Notes-only filter**, not All Work. Keep left-nav Your Work as full organiser.
- Panel header contains one compact menu for dock left/right/top/bottom, focus/restore and **Move active Note to Trash**. Remove permanent Dock selector and redundant large creation controls from the writing area.
- Mobile retains one small floating restore launcher *only when minimised*, not the entire desktop tab bar; open writing sheet includes compact tabs, [+], pen rename and image button, per `NOTES-MOBILE-AND-IMAGES.md`.

Explicit transition invariants:

| User action | State/data result |
| --- | --- |
| Close a Note tab | Hide that tab, not delete a saved Note. Preserve any pending local writing and operation receipts. |
| Close **last** Note tab | **ZERO tabs remains valid**. Hide panel/minimise appropriately. **DO NOT create replacement blank draft** (current code does). |
| Reopen Notes with zero open tabs | Minimal “Open an existing Note / New Note” state, not an auto-created Note. |
| Minimise → restore via bar/floating launcher | Return directly to previous usable docked/focused editor, same tabs/caret/scroll; no tiny second collapse box. |
| Select a tab on minimised bar | Restore that selected Note and panel, not just toggle a collapse flag. |
| Click tab pen | Rename stable actual Note title with same acknowledged autosave; no second enormous title input. |
| Trash open saved Note | Small active-tab/header menu with confirm/recoverable Trash; after acknowledged deletion close its tab, keep others; failed/uncertain deletion doesn't silently remove local work. |
| Discard unsaved local draft | Deliberate local action, separate from Trash; do not silently discard pending unsynced bytes. |
| Hide Notes panel | Hide presentation only, not delete tabs, reset drafts or generate blank Note. |

Do not merge selection/dock/fullscreen/Tab state with server source-edition identity or mutate a Note merely because a panel was opened/closed. Reuse existing note autosync coordinator planned in `IMPLEMENTATION-SEQUENCE.md`; no typed character loss while requests are pending. Notes panel and bottom bar must consume one shared controller; test two-way click paths with desktop/mobile, browser Back and pointer/keyboard.

## 3. Your Work and annotation actions

### Routine Your Work

- Header: **Your Work** only, without "Your thinking, kept together" eyebrow or generic sentence, and without duplicated **New Note** button.
- A **single** server-backed search input, compact kind tabs (All/Notes/Annotations/Flags/Runs/Unlinked/Trash), optional small Filter/Sort disclosure. Exact context/area and advanced marked-passage filtering can remain available when explicitly opened. No default double search fields ("Search saved titles" vs "Filter these previews") or giant "Topics and connections" form.
- Bulk link changes, optional topic/context association and recoverable operation/Trash review remain in a deliberate Organise/Advanced surface, ideally selection-triggered; preserve per-record revision and *independent* mutation semantics. Do **not** present a set of separate record commands as a single atomic transaction.
- Server pagination/query must honour owner/gen, selected kind, search and cursor. Loaded preview transformations may exist but never represent a partial page as complete global search results. An organiser opened from Notes bar explicitly shows Notes; from left nav shows All. No broad implicit per-note progress from filtering/saving.

### Annotation origin is the default destination

- A normal annotation card title in Your Work opens its exact saved **source passage** and displays the existing compact Annotation Preview; it does not open a giant annotation management page. Reuse `onReturn`/`workReturnLinks`/`buildAnchorLink` and their retained rendition, source family/ID, section, part, offsets and capture ID.
- Prefer saved intended `displayReturn` where eligible, otherwise saved original `anchor`; never invent a new location from title or quoted text. Ensure marking focus and exact reader selection/highlight, with direct edit/delete without navigating away.
- **Unavailable source fallback:** show compact, owner-eligible *annotation-own-writing* editor from Your Work with clear “original source unavailable” status, edit/delete and possible explicit restore/retry. Do not show the unavailable original quote, source bytes or claimed current passage. Preserve legacy deep links to standalone annotations as safe compatibility routes, but don't default ordinary clicks there.
- Reuse existing successful create/edit overlay and local draft recovery. This is a routing/permission enhancement, not a new annotation system.

### Annotation-window Flag and in-text marker

- In annotation popup header show a small **outlined Flag = not bookmarked / filled Flag = bookmarked** for the *underlying selected passage*, not for the annotation record. Tooltip and aria-pressed (“Flag this passage / Unflag this passage”), keyboard/touch and pending-result status. Reuse `BookmarkToggle` (`setFlag`, exact target revision and idempotent operation receipt), including concurrent change reconciliation. Do not create multiple Flag rows by repeatedly tapping.
- A tiny Flag glyph near an existing dotted marked passage makes it obvious that the mark is a Flag, distinct from annotation underline styling. It must reference exact captured segment; group overlapping marks sensibly, remain accessible and not insert extra characters into canonical selectable text or disturb UTF-16 mapping. Prefer existing mark chooser as fallback where icon placement is ambiguous.
- Annotation creation and Flags continue to be separate user actions; no automatic Investigation progress, GPT command or achievement.

## 4. Library architecture: independently reusable knowledge

### Three facets over existing entities

| Facet | Authority | Interface |
| --- | --- | --- |
| **Subject areas** | Existing `area` records for broad reusable fields; curated accepted area ↔ Article relation. Project-specific areas can remain valid, but aren't exclusive parents. | Compact paginated area catalogue with counts and short authored/grounded descriptions; click opens area detail. |
| **Topics** | Existing `article` records for reusable explanations, one canonical identity across any number of Journeys and area memberships. | Server-paginated topic list/cards with useful one-line synopsis, subject context and direct Article link. |
| **References** | Authoritative new catalogue-sidecar concepts/functions/APIs/shell commands and flags, projected compatibly as `Article.concepts` where existing reader/clients need that DTO. Historic raw entries stay immutable. | Fast exact-term/alias/signature search (case/punctuation aware), direct validated topic/section/part destination. |

Do **not** copy a broad computing explanation into project-specific Library articles because a Journey needs it. An article such as graph traversal may be used by the kitten RPG *and* other projects; preserve accepted contextual links without moving/copying its identity. Multi-area membership must use the **same one accepted relationship authority** being designed for Investigation-Journey semantics (extend existing `RecordLink` or central typed table after a measured compatibility decision). Don't silently reclassify real owner data in a schema migration. Semantic candidate links remain suggestions until deliberately confirmed.

### Reading identity, catalogue index and publisher are separate authorities

**Independent Pro challenge alignment:** Exact current/prospective catalogue references, not frozen historic Article concepts, govern validation after migration. A rendition-only historical reading link does not identify which later catalogue revision was intended; show only provably associated historic metadata or separately labelled current metadata, otherwise omit. Targeted text-only manuscript publication **preserves independently accepted membership**, while deliberate source-authored links may change by source edition. Unambiguous stage/section edits must work, not merely be rejected safely. Details and tests are normative in `LIBRARY-DATA-AND-MCP-CONTRACT.md` and `ACCEPTANCE-AND-DECISIONS.md`.

The earlier Library UI sketch is insufficient as a storage contract. **Read [LIBRARY-DATA-AND-MCP-CONTRACT.md](LIBRARY-DATA-AND-MCP-CONTRACT.md) before editing D1, `renditionFor`, the manuscript compiler or Library search.** It supersedes any implication that it is safe to update `Article.concepts` and `learningShape.subject` for mere catalogue organisation.

- Current reading rendition hashes `Article.concepts` and `learningShape`; flags/aliases or broad subject labels can create false new reading editions. Keep immutable old readings and introduce a separately versioned metadata/command catalogue for current indexing. Accepted Article↔Area associations use explicit links (not hashed as reading text), with revision checks and one accepted relationship authority.
- `CatalogueEdition` summary and reference entries pin exact Article reading rendition and valid part IDs. PR18's sequential `sN/pN` full targeted updates need stable ID carryover or rejection to protect captured passages.
- Search is a **derived** cache; rebuild on restore/rights change. It must not leak revoked Sources or treat loaded pages as full corpus. Exact `-i` vs `-I` flags require a case/punctuation-preserving term index; FTS5 is for prose only.
- MCP publication must atomically commit D1 reading/raw source edition/catalogue metadata/accepted area links and term indexes, returning separate `rendition` and `catalogueRev`. This is **not** merely a card/UI change.
- Complete encrypted backup includes catalogue editions and accepted relation authority, not derived FTS. The existing 8 MiB JSON/20k-row recovery budget must be tested and handled at substantial corpus size.

### Search and server DTO

One Library search box searches the *entire eligible Library scope*, with facet and optional area/kind refinements, not separate “Filter loaded topics” + “Search full workspace”. Suggested contract shape (actual name may extend `query_minamo_records` and existing `/api/query` instead of adding duplicate read systems):

```ts
type LibraryQuery = {
  q?: string;
  facet: 'areas'|'topics'|'references';
  areaId?: string;
  referenceKind?: 'concept'|'shell-command'|'python-function'|'api'|'language-syntax';
  cursor?: string;
  limit?: number;
};
type LibraryPreview = {
  kind: 'area'|'topic'|'reference';
  id: string; title: string;
  summary?: string;
  summarySource?: 'authored'|'current-section-excerpt'|'none';
  areaIds?: string[];
  target: {family:'area'|'article';id:string;rendition?:string;sectionId?:string;partId?:string};
  matchReason?: 'title'|'canonical-text'|'concept-term'|'concept-alias'|'accepted-area';
};
type LibraryPage = {items:LibraryPreview[];nextCursor?:string;truncated:boolean};
```

Both web and MCP must use the **same** authenticated owner/gen-scoped indexing/query/permission path. Search authoritative current eligible titles, sections/parts, meaningful summaries, exact command aliases, signatures and accepted area links; unprivileged/stale candidates must not leak titles/existence. Bounded deterministic sort and cursor bound to exact search/facet/area/referenceKind; include >150 Article fixtures, pagination, Back/Forward, direct area/category URL, mobile. Use current D1 lexical + concept index initially; FTS5 optional after compatibility proof, no paid Workers AI/Vectorize. A semantic suggestion result, if supported, must be labelled separately and never silently become a topic membership.

**Article synopsis:** publish an explicit versioned `catalogueSummary`/`topicSummary` into the new **authoritative catalogue sidecar** where supplied, tied to a separate `catalogueRev` and source-edition intent, without editing canonical Article body or rendition. For legacy articles, *project* a bounded relevant explanatory paragraph only when genuinely informative, and return provenance `summarySource`; otherwise title-only. Never show boilerplate “A reusable Python topic”, “Library reading”, “Connected context” on every card, or invent educational promises. Avoid rewriting real article bodies just to fill previews.

### Landing page and detail

- The Library landing is an **index**, not expanded content: one search; Subject areas / Topics / References facets; compact subject-area overview with exact eligible topic counts; paginated all-topics and reference views. No entire Knowledge Area grids, long area anchor nav followed immediately by all sections, or 150 articles rendered in Home.
- Click area to open area detail with its optional synopsis and paginated topics. “More reading to explore” currently means ungrouped topics; make those neutrally discoverable through All/Other topics. Do not claim editorial recommendation without an accepted explicit reason/provenance.
- Topic previews communicate something specific, e.g. *"Represent locations with dictionaries, traverse reachable rooms and detect cycles"*. Whole card clickable with keyboard, short accessible labels. Remove empty tall card footer and repeated redundant classification prose.
- Remove Library page eyebrow “FOLLOW THE CONNECTIONS”, bland subtitle, “New article”, “Create knowledge area”, “Browse sources” from prime browsing chrome. Creation/source management still available within contextual tools/advanced authoring and existing Source route.
- Article reading pages retain PR18 canonical rich content/diagrams/safe-video improvements and exact passage capture. **Do not change previous source IDs/renditions or create new Article duplicates just for the catalogue.**
- Concepts/functions/commands from the manuscript publisher must populate real indexed `Article.concepts` (as already specified in PR #19) and appear in References, not just in a prose table.

## 5. Other user-facing cleanups / branding

- Remove visible “Private workspace” badge and “V2”; **keep security enforcement**, source version in About/Help and private Site routing unchanged.
- Remove “A SPACE FOR UNDERSTANDING” text in header, redundant sidebar aphorism “Understanding starts with a better question...” and repeated empty introductory copy on Work/Library.
- Restore **verified** V1 branding: `frekland/Minamo/app/index.html` references `/identity/minamo-header-refined.png` desktop and `/identity/minamo-icon.svg` mobile; both files are present in V1 `app/identity/`. Future implementation can copy into V2 public assets read-only from original, confirm right/licence as relevant, preserve quality/responsive wordmark and not re-create from memory. Never alter V1 source.
- Global New Investigation removal is **not removal of its create capability**: make it available in Investigations/contextual Create, consistent with reduced browsing chrome and owner-directed writing.

### Home and Favourites are navigation to saved learning, not task status

The previous Home sketch (relevant work from Investigations) is **superseded** by [LEARNING-WORK-AND-CHECKPOINTS.md](LEARNING-WORK-AND-CHECKPOINTS.md). Home shows three bounded surfaces: **Continue** (last meaningful explicitly checkpointed Investigation *or Journey-stage* work), **Recent Developments** (read-time grouped evidence-aware checkpoints with exact drilldowns), **Favourites** (eligible whole-record bookmarks for Journey, Investigation or Library Article). Do not create user-facing active/parked/concluded modes or creator badges to drive Home. `app/journey-route.tsx`'s last visited stage is navigation convenience only.

A user can favourite a Library Article and see it on Home without a new work event; this **must not** change its reading rendition, catalogue revision or semantic subject membership. Record-family favourites are existing `FlagTarget.kind='record'`/`setFlag` operations. Passage Flag styling and annotation tools remain distinct. Home's favourited record is one eligible current destination with an accessible star/toggle action, not a copied article or new Authoring Package record.

## 6. Interdependencies and invariant tests

These decisions interact, so the eventual builder must implement them as one integrated workflow, not isolated CSS tweaks:

1. **Notes bottom bar + mobile sheet + Note autosave + image placement** share a single stable Note/tab/sync state. Closing the final tab must not create a blank draft or falsely mark server data saved; minimised bar selects existing tab; direct Trash accounts for pending edits.
2. **Your Work + annotation return + original source identity** share strict URL/rendition/capture resolution. Unavailable/withdrawn source falls back to eligible own prose, *not* any similarly titled/current passage. Flags toggle the original passage without touching annotation text or canonical selection.
3. **Library facets + relationships + command index + manuscript publisher** share canonical Article/Area identities, exact accepted relations and one server-side query authority; semantic suggestions cannot re-parent content automatically. Unclassified topics are not "recommendations".
4. **Home/Journey/Investigation** meaningful learning comes only from **explicitly checkpointed Developments whose primary target is an Investigation OR Journey stage**. General related links are not stage-progress evidence. **The current Journey stage must reach a read-only GPT handoff even when no passage is selected**, with exact stage ID/rendition/return link and invalidation on stage switch. Home has **Continue / Recent Developments / Favourites**; the last comes from existing whole-record target-based bookmarks, not a parallel favourite store. Note editing, toggling a favourite/Flag, annotation edits, Library changes, reading or visiting a stage do **not** count as progress or spam Home. No mandatory start/active/parked status, creator-origin or formal session.
5. **Source/permission/recovery** apply to all new accepted links, summaries, archived Notes and image/video references. Test rights revocation, generation change, stale cursor, old capture identity and unknown owner.

### Future integrated slices (no interim owner approval checkpoints)

A. Domain contracts and guarded data models for Investigation work + area memberships + Library query/summaries, retaining exact reading.  
B. Notes/tab/organiser route state, close-last-tab restoration, inline Trash, direct annotation return and Flag toggle.  
C. Library server search and pagination, independent area/topic/reference projection, useful summaries/indexing.  
D. Writing-first Notes UI + bottom-bar tabs/mobile launcher, Your Work/Library simplification, true V1 branding and compact cards.  
E. PR19 image/diagram/video/compiler features; integration of command refs and source rights.  
F. End-to-end synthetic >150-topic + multi-journey + 4-Note + annotation/Flag + **favourite-only and directly checkpointed non-first Journey stage with no Investigation, read-only stage-aware GPT handoff**, plus an explicitly checkpointed Kali-reported Investigation case. Use real Browser/MCP/D1, a read-only 20-turn 'Use minamo' conversation, exact note committed-revision race, isolated library/recovery stress fixtures, positive ordinary manuscript edits and independent learning-quality review. One **future Work/Sites commission** owns implementation, corrections and release; these are internal combined gates, not separate owner sign-offs.

Every future write remains explicit, idempotent, revision/generation-guarded; every derived view is bounded, privacy-filtered and non-mutating. Retained source hashes and encrypted recovery remain functional. No paid external inference.

## 7. Provisional engineering options (not permission to change agreed user behaviour)

- Accepted relationship authority: extend existing `RecordLink` or add one central typed relation table; **never two conflicting stores**.
- Library summary metadata: optional authored summary plus documented fallback projection. No compulsory AI rewrite.
- Notes bottom CTA text: **Manage Notes** preferred because it opens Notes-only; left nav **Your Work** remains All. Test accessibility, no mislabeled destination.
- Note create menu: one [+] with explicit “Blank Note / Note about this page” preferred over two inscrutable icon-only buttons. Preserve keyboard access.
- Flag glyph placement: test adjacent/overlapping captures; accessible target-identity grouping rather than inserting an inline text character.
- Typed Library query: extend existing `queryRecords`/HTTP+MCP or provide narrow one shared service if necessary. **No duplicate query engines.**

These options require implementation evidence, but **the intended interaction is agreed**. No running app, live learning records, other PRs or original Minamo are modified by this planning document. **PR #19 remains DRAFT.**

