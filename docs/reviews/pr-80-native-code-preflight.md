# PR #80 native code preflight

**3 November 2026 — implementation review, not implementation authority.**

**Verdict:** Credible to implement in the agreed scope. Use the existing revisioned record store, a small semantic Project command adapter and one shared section renderer. No new composition database, migration, editor framework or mandatory preview workflow is necessary. Resolve the specific contract details below during the first coding increment.

## Inspected identities and limits

| Surface | Verified identity |
| --- | --- |
| Draft PR #80 | `169b6b0bd095faf7c117f2cf68e4232c0b9f0178`, branch `docs/gpt-composed-projects-2026-11-03`; head rechecked before preparing this report |
| Public base | `c2ea606e4ea91fa34adf3902d6671523ad922c32` |
| Production Site | [Minamo](https://minamo.jscymru.chatgpt.site), project `appgprj_6ad8a4e85eb48191accd6e78976b47e3` |
| Actual live version | **V91**, source `b649c630a6302433c466e251aed1885dc5dc00c6` |
| V91 publication | Deployment `appgdep_6ae91cffa69881919163a09010f41ef2`, **succeeded**, updated 2 November 2026 23:30 UTC; matches Site update time |
| Native remote HEAD / latest saved version | **V98**, `82b35b70d3dc4117c7b22d8a68788f1967944455`; this is **not** the restored live version |

Read PR-head AGENTS.md, the current brief, blueprint and fast release workflow. Read the independent [Terra scope report at its separate review commit](https://github.com/frekland/Minamo/blob/3fe8d2fc12d6472ddad029667b121d6339187322/docs/reviews/pr-80-product-scope.md); it is not present at the PR head. Its compatibility/edit-preservation findings are incorporated in the current requirements.

Opened the protected native Git repository without pushing; inspected V98 and a detached V91 worktree, alongside relevant public files fetched at the exact PR head. Native source was inspectable. Comparisons covered the relevant domain, contracts, Notes, assets, navigation and rendering seams, not whole-tree parity. No learner records, database rows, production logs or authenticated learner pages were read. No build, test suite, scenario or deployment was run. Live identity is established through Sites provenance/status, not a new visual acceptance claim. This report contains no native source excerpts or secrets.

## Recommended seams and minimal representation

### Record storage and atomic GPT/MCP updates

Keep Project identity as `family:journey`. Add a validated optional `projectComposition` metadata field to its existing JSON record, using `v2_records`, `v2_revisions` and `v2_operations`. Use the Project record revision as the write CAS; an independently stored composition head/revision is unnecessary initially. Existing snapshots provide composition history.

**Prefer existing canonical Project body/sections/PassagePart content for Project-owned text, code, tables and media.** Let the composition describe flat section order, pattern, slots, stable block placements and references to that content. Reference original Notes/Articles/Activities by their canonical identities; do not duplicate their bodies. This reuses current rich validation, asset attachment, rights projection and reading identity instead of hiding a second content store inside arbitrary `content:unknown`.

Add a small shared Project service/validator, called by both HTTP and MCP from `lib/domain-handler.ts`; register any new HTTP path in `lib/domain-routes.ts`. Reuse:

- `worker/index.ts` admission; handler identity, generation namespace and generation fence.
- `lib/domain.ts`: `authoringDomain.prepared`, `readRecord`, `readRendition`, `projectRecord`, receipts and existing write guards.
- The guarded, nonce-owned `DB.batch` approach in `lib/authoring-package.ts:61` and `lib/relationship-command.ts`: validate every proposed mutation first, then commit records, revisions, assets and receipt together.

The existing authoring package is a **transaction donor, not a drop-in API**: it accepts journey/article/area/investigation, excludes Notes, and explicitly rejects section image/media/excerpt publication. Its editorial declarations are also excessive for routine Project organisation. Implement the small typed Project operation path using those established guards; do not call several independent `executeCommand` writes and label the result atomic. Include image/media attachment statements and permission guards when relevant.

The current `requireEditorialPackage` blocks substantial raw GPT Journey creation/update. Give the semantic Project path an explicit bounded policy for Project composition/personal framing; retain the manuscript policy for substantial reusable teaching resources. Merely adding tools around the old command will otherwise fail freeform creation or demand irrelevant publication paperwork.

Expose capabilities and one semantic apply tool (blueprint names `get_layout_capabilities` / `apply_project_update`), with create/update, rename, section/block insertion, content patch, structural arrangement and explicit restoration. Require retry-stable operation ID, generation and current revisions of records actually changed. Routine authorised updates validate/apply directly. Optional preview can share the same preparation function; it must not grant authority or reserve revisions.

Extend existing exact Project/context reads with composition and bounded history-by-**record revision**. A rendition identifies reading content, not a unique arrangement: multiple composition revisions can share it. Reuse natural-name discovery and `read_minamo_operation`; return new refs/link in the receipt. Avoid a tool per layout or edit.

### Rendering and compatibility

Use `app/journey-route.tsx` as the route seam, delegating to a small `ProjectSections` renderer, six section components and shared content rendering/edit controls. Keep `app/workspace.tsx` responsible for navigation and the global Notes dock.

| Pattern | Native implementation |
| --- | --- |
| Dashboard | Leading focus content plus compact secondary slots; omit unused slots |
| Notebook | Continuous narrative/entry flow with mixed rich content |
| Workbench | CSS grid for adjacent code/output/source; stack in declared reading order on mobile |
| Board | Named groups with ordered content cards; no drag/reorder subsystem |
| Research | Source content/citation beside interpretation or comparison |
| Guide | Ordered authored stages/content with stable Stage destinations |

Reuse `Reader` for canonical section reading and `RichReadingPart` (`app/reader.tsx:186`) for diagrams, inline semantics, tables, code, private images/media and excerpts. Reuse Note Markdown/terminal display and existing Activity rendering. Do not mount the entire toolbar-heavy Reader independently for every block: extract/reuse its content layer while retaining canonical record/section/part identities, capture behaviour and heading hierarchy. Namespace DOM anchors when the same source appears twice; a composed view must not create ambiguous source selections.

For Projects without composition, use a deterministic **read adapter**, with no database write on view: introduction/unassigned authored sections, then Guide entries referencing `learningShape.stages[].id/sectionId` in existing order. Use existing `journeyStages` and link builders. Include all remaining authored content; never drop sections simply because no Stage points at them. Persist the adapted manifest on the first deliberate edit/update under CAS. Old `stage`, `section`, `part` and `rendition` URLs continue to resolve through the same renderer, including retained editions. New freeform Projects need no learningShape.

### Direct editing, descriptions and imagery

One local Edit state and Add section chooser are sufficient. A chosen pattern inserts stable section/slot IDs and immediately editable content; reuse existing rich authoring primitives rather than a generic page builder. Rename changes title only, retaining ID; use at most one optional short-description field in Project metadata, with authored intro/title fallback.

Record direct-edit preservation **server-side** at the stable content/placement IDs when the user save commits. Routine GPT patches must reject replacement, hiding, deletion or ancestor movement that would defeat this preservation. Explicit targeted owner revision can override it under current CAS. Define placement as section/slot and relative order, rather than freezing an absolute array index against harmless insertions. Protect the short description too. Referenced sources use their authentic editor and revision rules.

Reuse `app/project-cover.tsx`, `lib/project-cover.ts`, `stageImage` and private asset admission. Extend validated cover metadata with focal/crop presentation; derive the thumbnail using the same asset and CSS crop, with no new image service. A separately selected thumbnail, if included, must join existing image-budget, attachment, projection and recovery handling. Retire the copy-prompt action. Publish generation guidance through capabilities; the inspected MCP catalogue has **no general file-byte upload tool**. Existing authenticated manual upload is the credible initial fallback, not a release blocker or a reason to invent host media transfer.

### Persistent Note pins

Keep the current Notes dock/save coordinator. The existing `RecordLink` represents semantic/source relationships and cannot cleanly distinguish a deliberate page pin or address a new composition section. The smallest extension is a bounded typed `pagePins` array on the existing Note JSON record, not a new table or duplicate Note.

Use stable target identities for record, Stage/composition section and supported exact passages. Normalise a target key for idempotent pin/unpin; keep source rendition/UTF-16 coordinates where applicable. Do not use URL strings, navigation history, the single passage `anchor`, or retired task pins as this array.

Extend the existing Note command/read contracts with targeted pin/unpin and reverse page lookup; owner-scoped JSON querying with pagination is enough initially. Read pins through MCP in both directions, projecting titles only after current admission and reporting incomplete pages honestly. No graph/index subsystem is needed.

For an unsaved/dirty Note, flush through `app/notes-panel.tsx` / `lib/note-sync.ts`, then pin against the acknowledged revision. Advance the dock's base revision after pinning without replacing retained prose, undo state or attachments. Capture the clicked page identity before awaiting the save, so navigation cannot retarget it. Indicators are conditional; destinations stay inside the dock on demand.

## Bounded cleanup: keep existing behaviour

- **Projects:** `app/projects-index.tsx` already has whole-card links and private thumbnails. Add purpose text and CSS Cards/List preference; remove independent-question/recency-status chrome. Use current predictable ordering without extra controls. Exclude synthetic records from ordinary discovery without deleting them.
- **Scope:** `app/header-learning-space.tsx` already imports licensed Lucide Monitor/Languages glyphs. Reuse them, add matching original All/Other SVGs, remove the select and cycle existing `LearningSpaceSelection`. Other maps to `unclassified`. Check `workspace.changeLearningSpace`: it remembers a particular language, so the Languages cycle state must deliberately select all languages rather than unexpectedly restoring a hidden language filter. Keep existing language-content routes.
- **Home/shared chrome:** target `app/learning-home.tsx` and `app/workspace.tsx` fixture banner, empty continuity/context wrappers, duplicate shortcuts, GptHandoff and task-pin controls. Remove presentation/calls no longer needed; retain source context and useful tools.
- **Library:** reuse `ServerLibraryIndex`, `LibrarySearchResults`, `libraryItemDestination` and existing history/query restoration in `app/library-browser.tsx`. Rows currently contain title/Open links plus optional Preview/membership actions. Make a single primary whole-row anchor while keeping any retained secondary links outside it; never nest buttons/anchors. Preserve exact search-result editions/passages. Remove workspace pre-title actions/Activities wrappers, retaining title, TOC, source rights, reading content and dock. No new search schema or Practice redesign.

## Essential corrections and remaining clarifications

1. **Native/public drift is real.** V91 includes exact selected-related rendition/selection support, continuity evidence reads, Note passage capture/clear-anchor handling and mobile dock focus recovery absent from the inspected public branch. Native `lib/reading-links.ts` also uses the actual deployment origins; public defaults are placeholders. Preserve these behaviours on touched native paths. Do not replace entire native contracts/domain/Notes/workspace files with public versions or copy protected source into public GitHub. Keep native-only adaptations in the native checkout.
2. **Resolve the compact contract before coding:** fixed pattern/slot enums, block IDs, total byte/count limits, direct-edit override semantics and the metadata-only rendition rule. Preserve an existing rendition on composition/pin/cover/description-only changes; the current special case covers only a cover-only update and can otherwise rehash older content. Metadata must not create duplicate learning-development records.
3. **History restore needs exact semantics:** restore arrangement by prior record revision against today's Project CAS; retain current canonical Notes/content and current rights. If an old arrangement references missing or explicitly revised material, report/preview that consequence rather than silently rolling back sources.
4. **Two stale blueprint details need interpretation, not redesign:** its sample `upsertBlock/focusBlock` lacks the final section/slot semantics, and its acceptance paragraph says rename from the overview despite the binding rule that editing happens inside the Project. Follow the latter rule.

5. **Exact retained references need dedicated admission.** `lib/domain.ts`'s `admittedLinks` currently rejects a newly attached non-current rendition, apart from its Activity-attempt exception. Composition/pin admission must validate the requested eligible retained rendition and coordinates while guarding the current target's availability/rights; do not silently substitute latest or globally relax existing link rules.
6. **Bypass legacy Stage inference for composed freeform Projects.** Omitting `learningShape` already permits creation, but `journeyStages` falls back to treating every canonical section as a Stage. New compositions must use their declared patterns directly; reserve that fallback for adapting old records.

No source-access or storage blocker was found. The genuine implementation hazards are the existing raw-GPT editorial gate, incomplete atomic/asset integration, loss of native functionality and stale-edit overwrites. Exact crop defaults and internal component filenames are optional refinements, not reasons to delay implementation.

## Practical implementation, checks and delivery

1. Implement the record metadata/typed adapter, atomic command/read path and Dashboard/Notebook content rendering together. Include the deterministic existing-Project adapter, direct-edit preservation foundations and handoff removal. Demonstrate the complete GPT create/read/update loop before calling this candidate usable.
2. Finish the other four templates, quiet editing/Add section, descriptions/crops, scope cycler and catalogue/Home cleanup. Add Note pins/history restoration and bounded Library cleanup in the agreed sequence.
3. For native delivery, start from the **verified live V91 behaviour**, while reconciling the remote V98 descendant history explicitly. Prepare a normal descendant native commit with only deliberate changed-path reconciliation; do not force-push the V91 pin or publish untouched V98. Check the native entry/router paths so rejected Study/contextual routes are not accidentally reactivated. Preserve native hosting/auth/origins and existing bindings/access policy; no database reset.
4. Run the native production build through the Sites build helper and TypeScript check for changed contracts/components. Focus disposable-D1 checks on atomic success, stale/concurrent revision, denied owner/source, identical retry/mismatched payload and rollback after a failing member. Cover direct-edit preservation/explicit override, old Stage link adaptation and two-page pin/unpin/autosave interaction. Add a small recovery/export round-trip for the new JSON fields/assets, since raw snapshots alone do not prove portable projections preserve them. Reuse relevant existing test fixtures; no full suite or hosted controller.
5. After later deployment authority, package/push the intended native source, save/deploy that exact commit to the existing custom audience, then check terminal Sites status and one brief relevant authenticated UI/MCP smoke using disposable authorised content. Record public/native pins and keep immutable V91 rollback available. No lengthy parity/browser campaign.

**Plugin refresh:** Sites' current MCP guidance says republishing refreshes the existing Site plugin from its new tools/list. No reinstall or owner setup is needed during this review or before server implementation. At the **first capability/tool/schema deployment**, verify the host-visible catalogue and a read-only capability response before attempting new Project writes. If tools remain stale, start a new chat/reload the catalogue; install/connect the existing Site plugin only if missing or disconnected. Do not create a second plugin or assume tool availability from server JSON alone. This applies again when pin/history selectors are added later. The current connected catalogue exposes the existing tools, not the proposed Project tools.

**Review-only validation:** required documents/source identities checked; no application/configuration/database mutation, PR edit, merge, new PR or publication. Only this report is to be committed on the separate review branch.
