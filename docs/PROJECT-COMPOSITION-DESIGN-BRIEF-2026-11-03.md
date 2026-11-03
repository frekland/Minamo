# Minamo — GPT-composed Projects and flexible layouts

**Status:** 3 November 2026 · owner-selected **draft product direction**, requirements open for editing in the new draft PR. This is not approval to implement, merge, migrate learning data, or deploy. The existing owner-private Site is deliberately restored to **V91**. V92–V98 remain saved experimental history (the V98 native source is also retained on its experimental branch).

## Authority and retired directions

This brief is the forward design authority for the **new draft**, replacing the proposed product directions in draft PRs #78 (contextual workspace) and #79 (learner-first Work/Study/Find reset). Neither should be merged or resumed as the product plan. Their findings, safety controls, useful code and owner feedback remain evidence, not required UI architecture. Do not reintroduce a mandatory Project → Stage → Question hierarchy, a new Work/Session/progress taxonomy, or a contextual wrapper around disconnected record pages.

The owner wants the actual experience of learning to improve, while keeping the already effective natural conversational GPT ↔ Minamo MCP continuation. The website is a rich workspace, not an embedded paid LLM. The user controls when GPT writes to Minamo.

## Product goal

A Project is an evolving body of work that may begin with **anything**: an idea, a question, a source, code, terminal output, measurements, language text, an image or freeform notes. GPT can compose and maintain the **server-rendered Project experience** from ordinary chat, with explicit update authority. Stages are an optional layout/organising device, never a prerequisite.

The key loop:

1. The learner talks naturally with GPT and does relevant work, potentially with other tools.
2. The learner asks **"Update Minamo"** (or equivalent). GPT can infer a reasonable *bounded* content-and-presentation update from the current conversation, existing Minamo records and exact sources. They need not specify Stage moves, record types or layout slots.
3. MCP validates and commits the related content, links and presentation changes atomically. Minamo displays the revised Project clearly and returns a concise human-facing summary.
4. Later chats retrieve the saved source records and composition. GPT need not reconstruct the view from a stale web navigation history or a previous ChatGPT transcript.

**Automatic** means GPT chooses what is worth saving and how to arrange it *after the explicit conversational update request*, not ambient background writes on every message. A chat request is not proof that terminal commands, hardware tests or mastery occurred.

## Non-negotiable learner-facing decisions

- **Remove "Checkpoint" and "Saved Learning" as UI concepts.** They were terms for an informal user-requested GPT save, not product objects the learner should manage. Do not replace them with a differently named compulsory assessment/progress panel. Retain underlying historical records, revisions, receipts and recovery, with prior-composition restoration handled through GPT/MCP on explicit request—not an in-app History/undo panel.
- No mastery, achievement or completion judgments inferred from activity or phrased defensively in ordinary tutoring. Show actual work, uncertainties, problems, decisions and next possibilities in natural language where supported.
- No default requirement to create a Stage, Question, Session, status or category before work can be saved. Guided Stages are a supported optional presentation.
- No learner-facing backend/MCP terminology, provenance debug chatter, synthetic fixtures or duplicated record cards. **Projects must render eligible learning content itself** (text, Notes, code/output, research/evidence, questions) inline where useful—not become a prettier list of links to disconnected records. Original evidence remains inspectable with exact sources.
- Preserve freeform capture and normal reading/practice. GPT is the primary conversational Project-composition editor, not a barrier to using the Site.
- Content, Project presentation and layout preference must not be conflated: changing a template must not rewrite original Notes, code, source editions or links. Learner-directed inline edits and Project renaming remain possible within fixed native layouts.
- Stable block identities and prior direct learner edits resist gratuitous reorganisation. Any internal layout locks are GPT-managed and **not another visible pin/lock interface**; they are distinct from Note-to-page pins. A routine update consolidates existing work; it does not append a new panel per chat or arbitrarily redesign the entire Project.

## Remove GPT handoffs and page chrome (observed in restored V91)

A live read-only inspection of a Bandit Project Step found **Pin task**, **Continue with GPT** (a large generated copy/paste request, GPT scope selector and ChatGPT link), **Manage this record and saved learning**, **Related context**, and a generic **Recent work** panel competing with the teaching material. The same design tendency affects the top/bottom of other reading and work pages. These are real V91 UI affordances, not requirements to carry into the new composition.

- **Retire the learner-facing GPT handoff workflow outright.** No "Continue with GPT"/"Discuss with GPT" copy-request dialog, copied instruction packets, handoff links, GPT scope picker, task handoff prompt or "open ChatGPT" CTA in Project, Step, source/reading, Activity or Note surfaces. Connected GPT/MCP and normal conversation are already the continuation mechanism. Preserve canonical MCP reads, exact source references and existing deep links; remove the *presentation ritual*, not the data.
- **Retire "Pin task" and task-pinning chrome.** No persistent task chip/bar, pinned task selector, task-specific takeover or task query-parameter state as a learner workflow. Historical links and context can still resolve internally where needed, but must not revive a task-pinning affordance. This is not the same as pinning a Note to a page.
- **Quiet top and bottom of pages.** Lead with the title, relevant content and a few purposeful actions; keep useful navigation and unobtrusive Notes access. Remove duplicated copy/context/continuation toolbars, empty or generic Recent work panels, backend disclaimers and heavy meta footers. Show related sources or actual work contextually when it improves learning, not as an obligatory wrapper.
- Remove legacy "Checkpoint", "Saved Learning" and achievement-management boilerplate **from the composed learner display**, including operational text embedded in old authored templates where appropriate. Do not silently erase or misrepresent canonical learner-written material; keep original source inspectable when relevant.
- Don't compensate for removed toolbars with another row of tiny icons. A single quiet Note-pin action and a compact signal for already linked Notes are intentional exceptions.

### Across the existing app: remove shared clutter, preserve useful functionality

The independent visual review also found handoff/record-management chrome ahead of the **Library's TCP article** (including duplicate return actions and an Activities panel before the title), and a Notes dock that could cover much of the reading area in one desktop view. Apply the same **content-first chrome cleanup** to Projects/Steps, Library subjects/Articles, Practice/Activities, Your Work and Tools **where those redundant shared controls actually occur**. Keep article prose, table of contents, diagrams, code, meaningful source return, existing Practice functionality, the Python editor and Notes autosave. Make the dock's resizable footprint comfortable without adding another Notes UI.

This is removal/repositioning of demonstrably redundant controls and copy, **not a redesign or feature expansion of each area**. Practice/Activities are currently unused and unrefined by the owner: no substantive Practice or Activity redesign, new scenarios or dedicated development campaign in this commission. A review saw Practice stuck at “Finding practice…” but did not test an Activity, so that observation is not by itself a mandate for unrelated feature work.

### Library — bounded find-and-read refresh

Keep the existing **Library → subject → article** model and canonical article content. Make discovery and reading effortless without new data models or MCP commands:

- **Library catalogue:** one useful compact search field plus tidy, fully clickable subject rows/cards. Avoid duplicate Open buttons, backend labels, empty panels and extra search/filter controls. Search results should link **directly to the matching article**, rather than forcing a subject detour.
- **Subject page:** clear subject title and optional short description, then a clean list of articles whose **entire rows are links**. Use existing article titles/descriptions; no generated recommendation feed or new tags.
- **Article page:** show **one small breadcrumb/back route, the article title and actual reading material immediately**. Keep the existing table of contents (compact/collapsible on mobile), diagrams, code/copying, source attribution, inline links and original reading rights. Remove handoff, Pin task, redundant management/related-context panels, duplicate return controls and Activity widgets **before the title**. If relevant related articles/Activities exist, put them discreetly after the material or behind an on-demand disclosure, not mandatory chrome.
- **Navigation/accessibility:** clear keyboard focus and full-row hit targets; sensible mobile reading width, purposeful horizontal scrolling for code only, and ordinary browser-back/search-query retention where inexpensive. The globally persistent Notes dock remains available; do not add a second Note launcher or obscure the article with new panels.
- **Scope boundary:** no Library hierarchy rewrite, knowledge graph, progress tracking, AI summaries, new annotation system, novel recommendation feed, additional view-mode toggles or Practice/Activity redesign. This is a restrained component/copy/navigation cleanup; richer Library product work is deferred.

## Home and Projects overview — modest quality-of-life refresh, not redesign

The owner's mobile screenshots show stacked creation actions, repetitive text-only Project rows, a prominent test fixture, empty Recorded-work scan explanations and duplicated navigation links. **Clean these up in this commission**, retaining the existing Home and Projects overview routes and their basic purpose.

- **Home:** keep it as Home. Remove the owner-visible synthetic test banner from the everyday experience, empty scan/provenance disclaimers, pointless empty panels and duplicate oversized navigation shortcuts. Improve spacing and content hierarchy lightly, but **do not invent a new Home model, recommendation system, progress dashboard or new Notes link**. The persistent Notes dock is already available globally.
- **Projects overview/directory:** retain a straightforward catalogue, now with one category selector and a simple Cards/List presentation preference as specified below. Remove redundant in-app New Project/Create with GPT actions (GPT creates Projects through MCP) and the unrelated Independent questions shortcut. No complex filtering, sorting, progress badges or management panel.
- **Synthetic fixtures and backend chatter:** keep test records accessible from explicit developer/testing tools, not ordinary Home/Projects. Hide diagnostic/coverage prose on learner-facing surfaces without deleting canonical records.
- **Scope limit:** this is a restrained visual/content cleanup and image capability, **not a wholesale redesign of Home or the Projects overview**. More ambitious decisions about their purpose and information architecture can follow in a separate owner-directed brief.

### Projects overview — bounded catalogue presentation

Show exactly the information needed to recognise and open a Project, with a compact heading and controls:

- **One category selector:** All, Computing, Languages, Other. Reuse the existing learning-space classification/filter state—Computing/Languages, with Other representing unclassified/miscellaneous Projects—rather than introducing another Project-family database. A Project legitimately classified in multiple spaces may appear in both filtered groups but only once in All. **Do not show two contradictory category selectors**; reuse or reposition the existing header control on this route. Keep narrow mobile presentation comfortable (a dropdown is acceptable).
- **Two native presentations of the same items:** **Cards** (a restrained responsive grid on wider screens) and **List** (compact rows; sensible mobile default). A single unobtrusive Cards/List toggle changes CSS presentation only, with a device-local remembered preference; no MCP/tool call or server-stored learner state.
- **Whole card/row is the link:** clicking anywhere opens the Project. Use an accessible semantic link with keyboard focus, not a tiny arrow, separate Open button, duplicate title link or nested interactive menu.
- **Minimal content:** Project title, optional small thumbnail and optional **short description** (one or two sentences, clamped to roughly two lines). GPT supplies the description at Project creation; the learner edits it within the Project or explicitly asks GPT to revise it. Preserve a learner-edited description on routine updates. Description explains the Project's subject, **not** an auto-regenerated progress or achievement summary.
- **Existing Project reuse:** current titles, introductions and private `projectCover` assets are donors. Derive the short description from existing authored introduction text where appropriate, never invent it on every page load. Prefer one optional field in existing Project metadata if a distinct short description is needed; no second description database. Derive a card thumbnail crop from the cover by default; no separate thumbnail-management interface is required. Attractive text-only cards remain valid.
- **Stable simplicity:** keep one predictable default ordering with no sorting controls, statuses, progress counters, time-since-updated badges, favourites management, recommendation panels or new Project creation actions. Hide synthetic fixtures from ordinary browsing. Avoid tall posters/overly decorative mobile cards.

This is a modest **Projects overview** improvement, not a broader rethinking of Home, navigation or Project-management information architecture.

## Simple, direct editing within refined templates

**GPT is the conversational creator, organiser and revision-restoration assistant; Minamo remains a direct content editor.** Fixed, validated layout templates determine polished presentation, but they are *not locked documents*. The owner can rename Projects, add an individual layout section and immediately put content in it, or edit existing content without returning to GPT for every typo. Broad reorganisation and retrieving/restoring earlier compositions happen through explicit GPT requests, not an on-site dashboard.

- **Rename Project** directly in the Project page (no edit menu in the directory), with immediate title update across cards, links and MCP reads. Also support conversational rename on explicit GPT request. Identity and deep links remain stable; title changes are revisioned and reversible.
- Provide one quiet **Edit** action or contextual menu that reveals inline editors for applicable text, summaries, headings, code snippets, tables, captions and media blocks. In Edit mode, **Add section** opens a small chooser of the six native layout patterns; selecting one inserts that section *in the current Project*, ready to fill immediately. **Do not expose per-block move/hide/lock controls in the initial learner UI.** GPT handles structure and explicit “keep this here” instructions through MCP; changes made by the learner directly are protected automatically. No whole-Project layout switcher, compare-layout screen, version picker or generic page builder. Keep normal View state clean: no permanent pencil icon on every block or a second toolbar at both ends.
- Editing a **GPT-composed editorial block** updates that block. Editing an existing canonical Note, Article or other source must follow its authentic source editor and revision rules; do not silently fork it into a stale Project copy. Clearly distinguish read-only referenced content from editable local composition. **Routine GPT updates preserve directly edited text and its placement**, adding or revising other content around it. An explicit request to revise that exact text or restructure its placement is allowed; ask once conversationally if genuinely ambiguous and report revision conflicts rather than overwriting concurrent work. No permanent freeze or extra lock UI.
- Make direct-edit save/cancel and conflicts understandable but unobtrusive; use current revisioned operations/receipts and preserve draft recovery. **Historical composition/source revision inspection and restoration are GPT/MCP operations on explicit request**, without a visible history/restore interface. No compulsory "Save learning", "Checkpoint" or achievement-management step.

## Optional imagery without extra interface clutter

- Support an optional **Project header/cover image**, a **Project-list thumbnail** and images/media inside appropriate content blocks. The same source image may power cover and thumbnail with separate crop/focal settings; allow a distinct thumbnail if desired. Projects without images remain attractive text-first cards.
- The project list shows a small, consistently sized thumbnail *only if available*; it must not turn into a wall of tall posters on mobile. Covers should be compact/collapsible within page design and never obscure the title, reading text or controls. Allow remove/replace, crop/reposition, image description (alt text when meaningful), and decorative indication.
- A single unobtrusive **Appearance / Change image** option in Edit mode or the Project menu is enough. Image controls and upload panels should appear only when invoked, not permanently decorate Home, card rows or headings.
- **GPT can create suitable artwork on request** using available image generation, informed by Minamo's machine-readable roles and sizing/format requirements. The Site should offer an accepted path to attach that generated file to the Project through validated upload/MCP tools where supported, or a short manual file upload as fallback—**not** another prefilled copy-to-ChatGPT prompt. GPT cannot be assumed to generate or directly transfer image bytes in every host/session.
- Reuse the existing private Project-cover asset flow and accepted PNG/JPEG/WebP (currently up to 8 MiB); design responsive cover and thumbnail crops, safe focal area, readable overlays, alt/decorative metadata and access checks. Publish a concise image-generation spec through the layout capability metadata so GPT can aim for compatible composition, aspect ratios and content (prefer image-only artwork without embedded text). Exact aspect/crop defaults may be refined in the PR.
- Images are presentation assets, **not evidence of learning**. Replacing artwork must not mutate Notes, Stages, activity/history or source citations; removing a card/cover asset must not delete the canonical Project.

## Persistent Notes: one-click pin to the current page

The existing floating/dockable Notes interface stays central. While a Note is open, a recognisable **pin icon** adds an explicit relationship from **that same Note** to the **current Minamo page**; no new Note, clipboard handoff, destination picker or mandatory Stage is involved. The learner can repeat on multiple pages and can pin several Notes to one page.

- A saved Note may have **many independent page pins**. Repeating the action on the same exact page is idempotent, not a duplicate. Each pin can be removed independently without deleting/changing Note text or other pins.
- Show a page-level pin indicator **only when there are eligible pinned Notes**. Keep the open Note's destinations inside the Notes dock **on demand**, with independent unpin actions. No always-visible destination list, empty Note-pin panel, duplicated Note content or automatic related-record list. On a page with linked Notes, offer discreet discovery/opening in the same persistent dock, not a large extra context pane. If an unsaved Note is active, use the existing Note save/recovery coordinator to save then attach, or report why the pin cannot yet be committed; never claim a local-only pin is server-saved.
- The **pin target is a stable canonical page identity**, not browser navigation history or the displayed URL string: Project, optional Stage/section, source/Article, Question, Activity or specific stable passage/block where supported. Preserve exact edition/anchor details when they matter. Recomposition, moving Stages, changing section layouts and later visits must not silently drop pins; inaccessible/removed targets are identified honestly.
- A pin is created **only by deliberate user action** (UI or explicit GPT instruction). Merely opening a page, viewing a source in a conversation, following a return link or having a Note open does not create an association.
- **GPT must be able to read the pins via MCP**: for a Note, the complete eligible pin targets; for a page/Project, the eligible pinned Notes. Return stable identities, human titles and edition/anchor context in the existing source-aware MCP read paths so another chat can reliably use the links. A brief Note snippet is optional; the full Note must obey ordinary auth/read limits.
- Pin/unpin must share owner authorization, revision checks, retry identity and truthful save receipts with existing Notes operations. Keep Notes drafts, autosave, tabs and image/code attachments intact; protect against stale-page targets when navigation changes during an in-flight action.

**The distinction matters:** a Project *layout lock* protects a composed block from GPT rearrangement; a *Note pin* intentionally links a persistent Note to one or more pages. Neither resurrects the retired "Pin task" workflow.

## Existing Projects: straightforward adaptation to the new layout schema

Current Projects largely have a description/introduction and ordered Stages. **Do not strand these Projects behind a separate legacy interface or require GPT to recreate them.** For a Project without a composition, initialise/derive the same ordered-section schema from its existing description and Stage content: typically an introductory content block and one **Guide** section containing the current Stages in their existing order. Render their actual text and eligible linked content inline.

Choose the smallest safe mechanism (deterministic read adapter or one-time idempotent composition initialisation) after inspecting the source. Preserve original Stage IDs, source editions, links, cover images and old deep links. Do not silently rewrite canonical material or claim missing Notes were found. Once adapted, old and newly GPT-created Projects use the **same section renderer**, not two competing Project UIs. An explicit GPT update can add/rearrange native sections without losing the original content.

## Layout-first scope

Invest substantially in **six functional, responsive and composable layout patterns**, not six separate apps or rigid Project types:

| Pattern | Purpose | Important behaviours |
| --- | --- | --- |
| **Dashboard** | Focus, significant recent changes, problems, questions, next possibilities | Prominence rules, compact responsive overview, no mandatory empty panels |
| **Notebook** | Evolving observations, freeform ideas, code and chronological work | Mixed-content reading flow, dated entries distinct from inferred event chronology |
| **Workbench** | Building, debugging, experimenting, comparing material | Side-by-side panels on wide screens, coherent stacked/context-preserving mobile view |
| **Board** | Brainstorming and several simultaneous strands | GPT-composed grouping and order; distinct card/group presentation with accessible reading order; **no initial learner drag-and-drop or manual reordering controls** |
| **Research** | Reading, sources, questions, evidence and comparisons | Exact source references, credibility/uncertainty, sources adjacent to interpretations |
| **Guide** | Deliberate ordered instruction or optional Stages | Stable Stage IDs, optional branching/skip, no automatic mastery/completion |

A Project is an **ordered collection of sections**, each using one of the six rich native patterns. Each section can have its own internal slots, but the initial schema has **no recursive nesting of layout templates**. **GPT normally chooses the composition; a learner may also insert one named layout section in Edit mode and fill it immediately.** Minamo owns typography, responsive layout, navigation, accessibility and interactions. Layouts must be meaningfully different, not cosmetic skins of the same record grid. GPT may reorganise sections on explicit request, preserving original content and direct user edits. **Keep composition revisions for MCP-supported recovery, not an on-site switch/compare/restore workflow.**

### Initial content capability set — deliberately limited

Implement only enough reusable content blocks to make all layouts useful:

1. Rich text, headings and structured callouts.
2. Original Notes and links to eligible existing Minamo records.
3. Code and terminal/supplied-output displays.
4. Tables or basic structured data.
5. Existing image, diagram and approved media presentation.
6. Questions, tasks and Activities as ordinary contextual material.

These are shared primitives, not a mandate to build a new runtime for every subject. Interactive charts, simulations, elaborate language tools, canvases and other specialised widgets belong to later additive capability releases if actual use warrants them. The registry should support future capabilities without redesigning Projects.

### Composition and presentation

GPT provides a versioned, declarative **Project composition**: an ordered list of stable section IDs and named layout patterns/slots, stable content block IDs, content/reference data, order and emphasis. Keep internal preservation flags only where needed; no learner-facing layout-lock UI. Minamo validates against a capability registry and renders polished native components. GPT never supplies arbitrary HTML/CSS/JavaScript for execution on the server; any future executable learning runtime requires separate sandboxing and scoped authority.

Original Notes, Articles, Activities, source anchors, code and history stay canonical. GPT-authored summaries may appear as attributed composition text linked to evidence, not as a false replacement for source records. A presentation template may be changed without mutating underlying learning content.

## Conversational behaviour and design advice

**Normal update:** "Update Minamo with what we did." GPT reads the relevant Project, extracts significant reported/verified work, decisions, obstacles, open questions, source/code artifacts and possible next actions, then directly saves a bounded content/composition change with ordinary revision, permission and idempotency checks. No mandatory preview/approval ritual for routine changes; reserve preview and extra confirmation for major or destructive rearrangements. Missing categories are omitted; no fabricated progress. Summaries are edited/consolidated rather than stacked as duplicate learning events.

**Explicit design-help request:** "How would you lay out this Project?" GPT can inspect Project content and available layouts, compare plausible alternatives, explain tradeoffs and offer a choice. Default is a natural conversation. An optional ChatGPT interactive choice UI may be used where the host supports it; MCP can return typed suggestions or request input, but cannot guarantee a particular host-rendered UI. Do not make a special form/copy-to-ChatGPT workflow mandatory.

**Authority and conflicts:** An ordinary "Update Minamo" permits bounded addition, composition and consolidation, but not deletion of historical evidence, undisclosed broad Project moves, unsupported mastery assertions or overwriting a learner-locked section. Ask if Project identity is ambiguous or a major destructive/meaning-changing edit is proposed. Return a short receipt and current link; preserve exact operation identity after uncertain responses.

## Experience acceptance (owner usefulness, not test-count theatre)

Use genuine, varied conversations rather than a new large synthetic fixture programme:

1. **Start freeform:** create a Project from a loose idea or conversation, without a Stage, and view a useful page.
2. **Evolve:** work through networking/TCP, including code/terminal material and a changed focus. A later "Update Minamo" adds what was done, encountered problems and useful next options without an explicit filing ritual.
3. **Compose layouts:** GPT builds a mixed Project with Dashboard/Notebook/Workbench sections; the learner adds one named section directly in Minamo and immediately fills it. Neither action duplicates source records or breaks links. No global switch/compare UI.
4. **Other subject:** use language text or a plant-sensor investigation to prove the system is not a networking-specific template.
5. **Return after a gap:** new GPT chat reads eligible saved context and understands the current Project, contradictions and unknowns; Site gives a useful view, not a stale first Step.
6. **Owner editing and images:** rename a Project, insert a native layout section and type into it, edit composition text inline, adjust an image/crop and see a tasteful thumbnail in the mobile directory. GPT's next ordinary update preserves the direct edit and existing links. The site remains useful with no images.
7. **Clutter and directory check:** in short mobile/desktop checks, real content appears first on Project/Step and Library/article pages; handoff/task-pin/empty diagnostic wrappers are absent. Home loses test/scan/duplicate-link clutter. The Projects overview filters All/Computing/Languages/Other using existing classification, offers accessible whole-card Cards/List views, and shows optional thumbnail/short description without new management chrome. The global Notes dock remains practical. No wholesale redesign.
8. **Trust:** direct edits survive ordinary updates but can be explicitly revised, old description/Stage Projects render via the new section schema with stable links, Note pins remain discreet, original records/editions survive composition changes, failed/duplicate operations do not half-save, and owner-private access is unchanged.

Product acceptance is based on whether the Project gets **more useful** as learning happens, with little organisational work by the learner. Engineering integrity gates remain specific to the change. **Learner scenarios are opt-in and owner-customisable:** on request, run a specified sequence (for example five actions, a substantial planning chat, code review, or live JLPT N5 grammar tutoring); never initialise the owner as an automatic test fixture.

## Explicit non-goals for the first commission

- No broad 20–25-widget capability library or novel all-purpose execution runtime.
- No replacement of Minamo's canonical Notes/Articles/Activities system or independently authoritative learning-progress database.
- No imposed GPT transcript capture/handoff UI, persistent AI persona memory, automatic per-turn write, or compulsory Stage hierarchy.
- No resurrection of V92–V98 as the learner-facing product baseline or silent merge of draft #78/#79.
- No long series of research/acceptance checkpoints before a runnable candidate: implement a coherent working slice and use it as a learner.
- No in-app Project creation wizard, whole-Project template switcher, side-by-side layout comparison, previous-version restore screen, per-block lock/move panel or wholesale Home/Projects overview redesign. GPT/MCP supplies creation, restructuring and historical restoration; the Site supplies a small Add section choice when editing.

## Owner-editable decisions before coding

- Exact block/template registry within a **flat ordered section model** (each template may have its own internal slots); no recursive cross-template nesting for the initial commission.
- Whether composition metadata belongs in an existing revisioned Project sidecar or a small new versioned D1 representation; select only after a bounded source-level compatibility check.
- Where server-scoped composition, direct-user-edit protection and GPT-managed internal layout preservation flags belong. They are **not new device-local layout preferences or visible lock controls**. **Note-to-page pins are saved owner-visible relationships**, not device-local chrome.
- Minimum semantics for GPT-authored "what we did / problems / next" claims and attribution.
- What changes require explicit confirmation versus the broad "Update Minamo" instruction.
- Which specialised block, if any, earns inclusion in the initial six primitives.
- Image role defaults (header crop, small thumbnail crop), whether a separately uploaded thumbnail is available immediately, and the clearest low-chrome Edit / Add section / Appearance menu. Keep the existing Project image upload path as the starting point.
- Minimal short-description metadata reuse on Projects, existing learning-space selector integration (no duplicate), and device-local Cards/List preference. These are bounded implementation decisions, not permission to invent a new overview system.
- Existing Library search/subject/article component seams and the smallest route/content-first chrome cleanup; preserve source rights and code/diagram behaviour.
- Exact short MCP workflow for asking GPT to inspect a past composition revision and restore it, distinguishing layout from irreversible changes to canonical source data.
- Risk threshold for optional preview/confirmation. Routine user-authorised additions/updates should apply in one validated write, without a compulsory preview tool call.

These are design details to resolve within this draft PR, **not excuses to restart a months-long discovery programme**.

## Implementation boundary

This draft contains requirements and architecture only. A later owner commission can implement on a focused public branch, preserve the current V91 Site until a candidate is authorised, use the existing native Sites source/version workflow, and deploy quickly under [the focused Sites release policy](SITES-RELEASE-WORKFLOW.md). The Site's custom audience, D1/R2/MCP bindings, secrets and historical learner records must remain unchanged unless separately authorised.
