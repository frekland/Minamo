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

## Home and Projects overview — preserve for separate design

The owner's 3 November mobile screenshots exposed genuine clutter: a stack of creation/independent-question actions on the Projects directory, and a Home page dominated by a test fixture banner, empty Recorded-work scan language and duplicate navigation shortcuts. This is evidence for **later focused Home and Projects overview redesign**, not a mandate to invent their new structures inside this commission.

**Scope boundary for PR #80:**
- **Keep Home as a distinct page.** Do not merge Home into Projects, redirect the Home route, invent a new Home dashboard, replace it with a recent-work recommender or add another Notes link. The persistent Notes launcher already works across Minamo.
- **Keep the Projects directory/overview as its own surface** for now. No comprehensive card/grid, sorting, favourites or Home-navigation redesign. Only adapt it where necessary to the new system: remove the now-obsolete in-app New Project/Create-with-GPT creation controls, reflect Project renames and optional small thumbnails, and keep accessible navigation.
- Obvious low-risk hygiene (e.g. keeping synthetic test fixtures out of ordinary learner discovery, hiding backend scan/provenance paragraphs or stale handoff controls) may accompany the work **without creating replacement panels or new content strategies**. If it entails a broader information-architecture change, defer it.
- Detailed purposes, content priorities, visual layout and navigation relationships for Home and Projects overview should receive **their own owner-directed design brief and commission later**. Project **content sections and their six templates** remain in scope for PR #80.
- The one-click Notes dock is persistent globally; do not add a second entry to it on Home, the Projects directory or a new dashboard.

## Simple, direct editing within refined templates

**GPT is the conversational creator, organiser and revision-restoration assistant; Minamo remains a direct content editor.** Fixed, validated layout templates determine polished presentation, but they are *not locked documents*. The owner can rename Projects, add an individual layout section and immediately put content in it, or edit existing content without returning to GPT for every typo. Broad reorganisation and retrieving/restoring earlier compositions happen through explicit GPT requests, not an on-site dashboard.

- **Rename Project** directly in the Project page (and via an unobtrusive per-card menu in the directory), with immediate title update across cards, links and MCP reads. Also support conversational rename on explicit GPT request. Identity and deep links remain stable; title changes are revisioned and reversible.
- Provide one quiet **Edit** action or contextual menu that reveals inline editors for applicable text, summaries, headings, code snippets, tables, captions and media blocks. In Edit mode, **Add section** opens a small chooser of the six native layout patterns; selecting one inserts that section *in the current Project*, ready to fill immediately. **Do not expose per-block move/hide/lock controls in the initial learner UI.** GPT handles structure and explicit “keep this here” instructions through MCP; changes made by the learner directly are protected automatically. No whole-Project layout switcher, compare-layout screen, version picker or generic page builder. Keep normal View state clean: no permanent pencil icon on every block or a second toolbar at both ends.
- Editing a **GPT-composed editorial block** updates that block. Editing an existing canonical Note, Article or other source must follow its authentic source editor and revision rules; do not silently fork it into a stale Project copy. Clearly distinguish read-only referenced content from editable local composition. User edits and explicit layout locks take precedence over routine GPT rearrangement.
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
- The Notes dock shows where the Note is pinned (titles/links and remove-per-pin actions). On a page with linked Notes, offer discreet discovery/opening in the same persistent dock, not a large extra context pane. If an unsaved Note is active, use the existing Note save/recovery coordinator to save then attach, or report why the pin cannot yet be committed; never claim a local-only pin is server-saved.
- The **pin target is a stable canonical page identity**, not browser navigation history or the displayed URL string: Project, optional Stage/section, source/Article, Question, Activity or specific stable passage/block where supported. Preserve exact edition/anchor details when they matter. Recomposition, moving Stages, changing section layouts and later visits must not silently drop pins; inaccessible/removed targets are identified honestly.
- A pin is created **only by deliberate user action** (UI or explicit GPT instruction). Merely opening a page, viewing a source in a conversation, following a return link or having a Note open does not create an association.
- **GPT must be able to read the pins via MCP**: for a Note, the complete eligible pin targets; for a page/Project, the eligible pinned Notes. Return stable identities, human titles and edition/anchor context in the existing source-aware MCP read paths so another chat can reliably use the links. A brief Note snippet is optional; the full Note must obey ordinary auth/read limits.
- Pin/unpin must share owner authorization, revision checks, retry identity and truthful save receipts with existing Notes operations. Keep Notes drafts, autosave, tabs and image/code attachments intact; protect against stale-page targets when navigation changes during an in-flight action.

**The distinction matters:** a Project *layout lock* protects a composed block from GPT rearrangement; a *Note pin* intentionally links a persistent Note to one or more pages. Neither resurrects the retired "Pin task" workflow.

## Layout-first scope

Invest substantially in **six functional, responsive and composable layout patterns**, not six separate apps or rigid Project types:

| Pattern | Purpose | Important behaviours |
| --- | --- | --- |
| **Dashboard** | Focus, significant recent changes, problems, questions, next possibilities | Prominence rules, compact responsive overview, no mandatory empty panels |
| **Notebook** | Evolving observations, freeform ideas, code and chronological work | Mixed-content reading flow, dated entries distinct from inferred event chronology |
| **Workbench** | Building, debugging, experimenting, comparing material | Side-by-side panels on wide screens, coherent stacked/context-preserving mobile view |
| **Board** | Brainstorming and several simultaneous strands | Movable/grouped cards, optional priorities, no forced status workflow |
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
7. **Clutter regression:** at mobile width, the Project content experience has no handoff/task-pin/management chrome, layout-switch or version-history UI. The Projects directory reflects GPT-created/renamed Projects and optional thumbnails without creation controls. Home and directory redesign remain separate; no duplicate Notes launcher is introduced.
8. **Trust:** layout-locked sections survive routine updates, original records and exact editions survive composition changes, failed/duplicate operations do not half-save, and owner-private access is unchanged.

Product acceptance is based on whether the Project gets **more useful** as learning happens, with little organisational work by the learner. Engineering integrity gates remain specific to the change. **Learner scenarios are opt-in and owner-customisable:** on request, run a specified sequence (for example five actions, a substantial planning chat, code review, or live JLPT N5 grammar tutoring); never initialise the owner as an automatic test fixture.

## Explicit non-goals for the first commission

- No broad 20–25-widget capability library or novel all-purpose execution runtime.
- No replacement of Minamo's canonical Notes/Articles/Activities system or independently authoritative learning-progress database.
- No imposed GPT transcript capture/handoff UI, persistent AI persona memory, automatic per-turn write, or compulsory Stage hierarchy.
- No resurrection of V92–V98 as the learner-facing product baseline or silent merge of draft #78/#79.
- No long series of research/acceptance checkpoints before a runnable candidate: implement a coherent working slice and use it as a learner.
- No in-app Project creation wizard, whole-Project template switcher, side-by-side layout comparison, previous-version restore screen, per-block lock/move panel or new Home/Projects landing-page architecture. GPT/MCP supplies creation, restructuring and historical restoration; the Site supplies a small Add section choice when editing.

## Owner-editable decisions before coding

- Exact block/template registry within a **flat ordered section model** (each template may have its own internal slots); no recursive cross-template nesting for the initial commission.
- Whether composition metadata belongs in an existing revisioned Project sidecar or a small new versioned D1 representation; select only after a bounded source-level compatibility check.
- Where server-scoped composition, direct-user-edit protection and GPT-managed internal layout preservation flags belong. They are **not new device-local layout preferences or visible lock controls**. **Note-to-page pins are saved owner-visible relationships**, not device-local chrome.
- Minimum semantics for GPT-authored "what we did / problems / next" claims and attribution.
- What changes require explicit confirmation versus the broad "Update Minamo" instruction.
- Which specialised block, if any, earns inclusion in the initial six primitives.
- Image role defaults (header crop, small thumbnail crop), whether a separately uploaded thumbnail is available immediately, and the clearest low-chrome Edit / Add section / Appearance menu. Keep the existing Project image upload path as the starting point.
- Exact short MCP workflow for asking GPT to inspect a past composition revision and restore it, distinguishing layout from irreversible changes to canonical source data.
- Risk threshold for optional preview/confirmation. Routine user-authorised additions/updates should apply in one validated write, without a compulsory preview tool call.

These are design details to resolve within this draft PR, **not excuses to restart a months-long discovery programme**.

## Implementation boundary

This draft contains requirements and architecture only. A later owner commission can implement on a focused public branch, preserve the current V91 Site until a candidate is authorised, use the existing native Sites source/version workflow, and deploy quickly under [the focused Sites release policy](SITES-RELEASE-WORKFLOW.md). The Site's custom audience, D1/R2/MCP bindings, secrets and historical learner records must remain unchanged unless separately authorised.
