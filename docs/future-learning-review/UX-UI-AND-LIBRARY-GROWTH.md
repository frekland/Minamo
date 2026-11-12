# UX, UI, Library growth and the learning workspace

**PR27 exploration extension · 23 October 2026.** Complements the [initial core review](INITIAL-EXPLORATION.md). The later [integrated design](IMPLEMENTABLE-PLAN.md) reconciles and selects from both drafts; its scope/sequence supersedes these exploratory lists. Current V2 remains the baseline; no learner content, preferences or production source was changed. The free-beyond-ChatGPT constraint applies throughout.

## The product direction I would choose

Minamo can feel considerably more modern and satisfying while retaining its neutral charcoal, muted blue/cyan, editorial reading style and personal character. I would make it feel like **a calm, responsive workspace for understanding and making things**. Its polish should come from clear hierarchy, useful defaults, direct manipulation, trustworthy feedback and continuity between surfaces.

The existing styling already provides a coherent foundation. My concern is that much of the product still behaves like collections of records opened in a shared reader. Journeys and Investigations have different educational purposes, but their main interaction is often reading followed by navigation. The Library has working dedicated views, but needs an editorial and organisational model that remains useful as it grows. Settings could let the owner adapt the workspace without turning every learning activity into configuration.

The largest opportunity is therefore product design, supported by frontend and server improvements. Animations and fresh components alone would not deliver it. The design should answer four questions immediately: **Where am I? What is useful here? What can I do next? What happened to my work?**

This extension distinguishes direct observations **O1–O7**, design judgement and untested hypotheses. Evidence and source links are collected at the end. It does not assert that every proposed addition is necessary.

## 1. A consistent shell with three distinct experiences

Give the major areas recognisable jobs while retaining one navigation, search and Notes system:

| Surface | The learner's question | Proposed emphasis |
| --- | --- | --- |
| Home | What was I working on, or what would I like to explore? | Deliberately saved continuity, chosen shortcuts, calm entry into browsing |
| Library | How does this work? Where is the exact reference? | Subject orientation, readable explanations, technical lookup, purposeful connections |
| Journey | What small thing can I build or inspect next? | A route overview and a focused practical stage, with references in reach |
| Investigation | What could explain this, and what would distinguish the explanations? | Question, possible approaches, learner evidence and open uncertainties |
| Your work / Notes | What did I think, try, notice or want to return to? | Fast personal capture, organisation and exact return to context |

Keep Home's current separation between learner work and Minamo updates. Consider owner-chosen pinned destinations or a small reading list, but do not infer an “active course” or rank the learner. A saved checkpoint and the last page opened are different signals; label them accordingly.

**O1:** the current Journey collection cards show record-oriented counts such as connections and sections. These are less useful for choosing a route than what the learner will make, the starting assumptions and the kinds of activities involved. Replace default card emphasis with an authored concise purpose and a few useful facets. Counts can remain secondary. Avoid estimated completion times that imply a required pace; optional approximate task size needs honest authoring and no timed progression.

A compact shared header could show location, the present object and a small set of relevant actions. Keep authoring, recovery and detailed history out of the main reading flow. On desktop, allow the global sidebar to collapse; on mobile, prioritise the current task and a dependable way back. Do not add another permanently visible navigation row for every feature.

## 2. Modern visual polish: hierarchy, density and feedback

**O2:** the live desktop Article combines a global sidebar, breadcrumb/Manage row, return link, Connected context disclosure, section selector, large title, Favourites and an additional contents column. Each has a reason; together they consume substantial space before and beside the explanation. The Journey overview similarly places route actions, introductory reading and administrative information before the stage list.

I would prototype these refinements within the existing token system:

- A tighter top region, with one clear title and one primary contextual action. Large editorial type can remain, but long titles should not push the practical task several screens away.
- One adaptive contents treatment: a compact sticky outline where space permits, an accessible section picker on narrow screens. Avoid maintaining several equally prominent controls for the same navigation job.
- A reliable reading measure, generous section separation and clear distinctions between explanatory prose, a task, a warning, code and personal writing. The same spacing scale and control heights should apply across Library, Journey, Notes and dialogs.
- Clear selected, hover, pressed, disabled and keyboard-focus states, with touch equivalents. A subdued interface still needs obvious actions; reducing contrast is not a substitute for reducing clutter.
- Small state feedback near the affected object: copied code, saved Note, changed filter, retained draft, failed attachment. Avoid a global toast for every keystroke, repeated success banners or celebratory rewards.
- A short, optional transition when opening a reference pane or switching a stage, if it helps preserve spatial context. Respect reduced motion and make navigation work without animation. No dependency on an experimental React transition API or a browser feature with no fallback.

**O3:** the global keyboard hint displays `⌘ K` while the handler accepts Ctrl or Meta. Use an appropriate Windows/Linux hint or a neutral shortcut presentation. This is small but relevant to the actual Kali/Windows workflow. Search is already a real input; preserve that. A future quick-jump overlay could add recent deliberate destinations and a few app actions, but should not replace useful search with an icon.

Satisfying feedback should be truthful: “Saved” follows a matching server receipt; “Kept in this browser” describes a local draft. A reference opening instantly is satisfying only if it is the correct version. Optimistic presentation must never imply an uncertain write succeeded.

## 3. The Library as a growing, curated body of knowledge

The Library needs an organisation model that works for a dozen resources and several hundred. The aim is not a bigger folder tree. It is to let a learner enter by subject, question, term, project connection or previous thought and arrive at a substantial useful explanation.

**O4:** current production browsing offers Subject areas, All topics, Concepts, Functions & APIs, Commands, APIs, Language syntax and All technical references. The exact lookup is valuable. The number and overlap of top-level choices could become harder to scan, especially on mobile. Current “topics” are Article results, not proof that a third Topic storage entity is needed.

### A. Subject hubs with meaningful editorial structure

Retain a compact Library home. Each subject hub could provide a short scope statement, an intentionally ordered set of topic groups, useful reference entry points and selected practical applications. For example, a networking subject might offer “follow one exchange”, “understand addressing”, “inspect with commands” and “troubleshoot a symptom”. These are example directions, not new learning content authored by this review.

Implement grouping as a small authored arrangement of existing references first. A resource can appear in more than one relevant subject without being copied. Distinguish “this project uses these subjects” from “this subject belongs to this project”. Do not automatically create an Area per Journey. Existing project-oriented Areas can remain valid; future growth should avoid making every subject heading a project title.

Use stable identity independent of display name. If genuine scale later requires topic entities or hierarchies, demonstrate the retrieval/organisation problem first. A new permanent taxonomy, arbitrary nesting and a universal tagging vocabulary create maintenance work and can make GPT authoring harder.

### B. Clear browsing versus technical lookup

A candidate layout is **Subjects / Topics / Technical reference**, with a clearly visible reference-kind filter inside the last view. Keep commands one easy action away. Test this against the existing tabs; reducing the top-level count is useful only if it improves discovery. Preserve exact case and punctuation, examples/signatures and the route into the full explanation.

Add a few useful filters when supported by real metadata: environment/language, subject and resource purpose. Show active filters and a clear reset. Do not require every Article to carry a difficulty score or estimated duration. Prefer concrete assumptions such as “uses functions and lists” over a universal Beginner/Intermediate ranking.

Offer sort choices suited to the view: curated subject order, title, or recently revised. “Recently revised” is editorial activity, not learning progress. Persist the chosen browse state and return to the same result position; do not show a loaded-page count as a corpus total. The existing server pagination and browse restoration are useful foundations, not features to rebuild.

### C. Depth and growth are editorial capabilities

Growth should come from useful coverage, not article count. A future ordinary GPT request should be able to deepen a weak explanation, add a worked example, improve troubleshooting or expose existing syntax in the reference index. It should not create a new Article every time a concept appears in another project.

A lightweight, owner-invoked Library maintenance view could show broken exact destinations, Articles without meaningful subject membership, unindexed authored references and possible overlapping coverage. These are **review candidates**, not automatic errors. A short complete definition is legitimate. Semantic overlap and poor teaching still require GPT/owner judgement. Run bounded diagnostics on request; avoid a nightly autonomous rewrite or an owner “approvals inbox”.

Separate editorial structure from personal organisation. The owner may collect a set of references for a task without moving their canonical subject home. Such a collection contains links and optional personal reasons, not cloned article bodies. It needs no completion status, public sharing or duplicate recovery system.

### D. Make discovery rewarding inside the reader

Consider accessible click/focus definition previews for exact indexed terms, with ambiguity choices where needed. A preview should name its source and offer the full explanation. Do not automatically decorate every technical-looking word or rely on hover alone.

Show a few meaningful connections: a prerequisite explanation, a contrast, a worked application or a troubleshooting route. Existing backlinks already provide much of the mechanism. Improve selection and presentation rather than replacing them with a giant knowledge graph. A small optional local relationship view can help inspect a topic's neighbourhood; force-directed animation should not become the main Library navigation.

## 4. Journeys as practical routes, not long documents to complete

The route overview and stage-specific reading are already much better foundations than presenting every stage at once. I would develop a clearer distinction between **choosing a route**, **doing one practical step** and **reviewing saved work**.

### Route overview

Lead with what can be built/explored, starting assumptions, needed environment and a concise route. Allow optional authored phases or branches when educationally meaningful. A 15-stage route can remain one route; grouping stages visually does not require splitting it into many Journeys. Keep direct access to any stage and preserve exact stable stage IDs across reorderings.

Offer “Resume saved work” when an eligible checkpoint supports it, and distinguish “Last opened on this device” where only UI navigation state exists. **O5:** current Journey resume uses sessionStorage stage position. It is not the same source as Home's saved learning continuity. Reconcile the presentation without making page visits create checkpoints or claiming cross-device persistence that does not exist.

A project reference shelf is useful but should not overwhelm the route. Consider showing the few references needed for the chosen stage first, with the full shelf on demand. An optional chosen repository/artifact link belongs near project context, not as proof that the route was completed.

### Practical stage

An illustrative structure would be:

| Region | What it contains | Interaction |
| --- | --- | --- |
| Orientation | Stage name, where it sits, short purpose | Change stage or return to route |
| Main task | First useful action, expected kind of artifact, authored guidance/code | Read, copy, try on the real machine |
| Reference | A few exact explanations and optional questions | Preview or open beside the task |
| Own thinking | Existing Notes/captures and explicitly saved continuity | Write, inspect evidence, deliberately checkpoint |
| Next direction | A reflection or discriminating test, then adjacent stages | Choose where to go; no completion inference |

This is a presentation concept, not a mandatory authoring form. Some stages need a diagram or a longer explanation; some need only a short action and a reference. Do not generate empty “Predict / Try / Reflect” boxes everywhere.

**O6:** the inspected stage repeats its heading at two levels, repeats intent/outcome between extracted metadata and canonical text, and displays duplicated ordinals where authored titles already include numbers. This is a compiler/renderer coordination opportunity for future creation. Display a single useful title/purpose and avoid repeating generated framing. Do not fix it by stripping strings from canonical text, hiding marked passages indiscriminately or rewriting existing records. Any design must retain exact source mapping and give a targeted passage a visible, truthful representation. The renderer can suppress redundant *generated* chrome before altering canonical material.

Authored environment variants could help Kali/Bash versus PowerShell learning. Render distinct, labelled code parts and explain relevant differences. Never silently rewrite a command when a setting changes, and do not assume current environment from the device displaying Minamo: the phone may be supporting a Kali VM task. A learner chooses which environment is relevant.

## 5. Investigations as places to develop a question

**O7:** the inspected Investigation has a clear question and good exploratory prompts, but its main UI is still a long reading with contents, followed by references. The workspace wrapper is thin: question heading, saved learning if present, Reader and links. This does not yet provide a strong visual distinction between an authored investigation guide and the learner's developing inquiry.

I would explore a quiet split between **Guide** and **My work**, without forcing a tab switch merely to see a paragraph and its Note. At the top, show the actual question, why it is worth exploring and a practical starting point. Below or alongside, surface deliberately saved predictions, supplied observations, current interpretations and unresolved questions from the existing model.

An optional comparison view can place two explanations and the discriminating evidence beside each other. It should be a projection of existing explicit facts/Notes, or deliberately authored material. It must not invent a hypothesis/evidence graph, infer confidence or declare one explanation proven because a Run exists. Keep quotations, learner reports and GPT interpretations visibly distinct.

Useful interactions include opening a linked Note, adding a question in one's own words, connecting an exact artifact, reviewing a correction and returning to the originating Journey stage. A Note can become the starting point for a new Investigation when the owner asks; retain the Note and create an explicit link. Do not automatically promote every annotation or unanswered thought into a new record.

If an Investigation relates to several Journeys, show those relationships with reasons. The learner should be able to enter independently and understand it without reading a particular project's story. There need not be a final “Solved” state: a concise bounded conclusion and remaining uncertainty can be useful saved work. Any user-chosen paused/parked organisation is a personal choice, not an inferred learning status.

The collection page should help select a question: its subject, concrete starting point and relevant project connections are more informative than raw section counts. Provide “linked to this Journey” filtering and independent browsing; do not duplicate the Investigation per parent.

## 6. A reference pane and Notes that work together

One of the most promising frontend improvements is **opening a bounded reference beside the current task**. A learner should be able to inspect a function explanation, compare it with code, write a Note and return without reconstructing their location.

On a wide screen, use a secondary reference pane with a clear title/version, its own bounded scroll, Close and Open full reading. Keep the main task stable. On mobile, use a full-height reference view or sheet with a reliable Back action and restored main position. The existing bottom Notes workspace must coordinate with this: do not pile a navigation drawer, reference sheet, annotation popup and keyboard on top of one another.

Start with one secondary reference, not arbitrary nested tabs. Reuse the canonical Reader/projection for the part being shown. Do not create an alternative unversioned rendering in the pane. If precise selection/annotation cannot be maintained safely in a first version, make the pane a faithful preview with an explicit Open exact reading action; do not offer inaccurate marks.

Notes already support rich editing, dock modes, resizing and multiple tabs. Improve how those capabilities fit the task before adding another note system: make the current context link understandable, allow an explicitly context-free Note, and make switch/rename/close controls discoverable. Preserve the draft when changing a reference or stage. Selection→Note should retain exact provenance without inserting a large block of administration into the learner's prose.

An optional **Focus reading** layout can collapse global navigation and secondary context while keeping a visible way to restore them and open Notes. An optional **Work alongside** layout can restore a preferred Note dock and reference arrangement. These are UI presets, not learning sessions or records of activity. Position and layout can stay device-local; only explicitly chosen preferences need cross-device sync.

## 7. Settings that help, without becoming another task

Current V2 exposes Help and Workspace recovery; the inspected source has a dark theme and local workspace state but no general settings surface. A small settings panel would be useful. Keep controls close to where they matter and collect persistent defaults in one place. Do not transfer the entire V1 settings system without reassessment.

| Setting group | Worth considering first | Scope and safeguards |
| --- | --- | --- |
| Reading | Text size, comfortable/compact spacing, reading width, serif/sans body choice, default code wrapping | Presentation only; preserve canonical text, source maps, code copy and exact anchors |
| Appearance/accessibility | Existing charcoal as default; optional light/system palette if useful; stronger contrast; motion preference | Test every surface including editors, diagrams, overlays and tool previews; honour OS reduced motion by default |
| Workspace | Sidebar default, Notes dock/size, preferred opening view, reference-pane preference | Usually device-local; do not automatically start a Journey or mark work active |
| Practical environment | User-selected default shell/OS and runtime preferences | A hint, not detection or execution evidence; explicit labelled variants only |
| Learning assistance | Optional preference for hints before solutions, spoiler sensitivity, explanation depth | Explicit owner instructions, task-relevant and overridable; GPT retrieval does not guarantee every client will obey them |
| Content and media | Data-saving mode, external-player behaviour, image display choices where supported | Default manual external playback; no blanket consent expanding source rights or background network use |
| Data and recovery | Explain local versus server saves, selected exports, existing recovery/Trash access | Reuse current protected flows; changing appearance never activates restore or clears drafts |
| Help and diagnostics | Keyboard/touch help, current capability/version, safe copyable error details | No private Note bodies, tokens or whole logs in diagnostics by default |

Start with reading size/width, workspace layout and reduced motion if real use supports them. A light theme is a complete palette/testing task, not a toggle that inverts the page. Avoid arbitrary theme builders, dozens of per-control options, technical debounce settings or a first-use configuration wizard. Good defaults remain the main experience.

A preference is different from permission. Settings must not disable source-right checks, relax exact-reading guarantees, turn on automatic checkpointing or grant GPT new authority indirectly. A learning-style setting should not become a hidden psychological model. Show what it means and let the owner reset it.

Server implementation could be a small versioned owner-preference object with explicit fields, defaults, guarded updates and bounded readback. Keep transient layout/scroll local, retain independent drafts and apply preference changes without resetting editors. Minamo's MCP can expose only relevant declared learning preferences when needed; it should not add a mandatory settings read on every turn.

## 8. Integrate content across Minamo and the learner's existing tools

The most useful integrations often reuse material already present instead of adding another provider connection.

### Internal reference cards and collections

Let a Note or Investigation include an explicit reference card to an Article section, command or source. Show the reason for linking and distinguish “current explanation” from an exact retained edition. Default to links/previews rather than copied bodies. Existing excerpt reuse and source-use controls remain authoritative; this is presentation/composition, not a general unrestricted transclusion system.

An owner-created collection could combine a few Articles, commands, investigations and their own Notes around a problem. Store typed references plus a personal introduction/order. It should be usable in the Site and as a selected GPT context root, with bounded traversal and explicit omissions. Do not create another universal content family until existing Areas/links or a small saved view have been tested against the need.

### Code artifacts and local editors

Where authoring supplies real filenames, offer a deliberate download of selected original code files or a small example pack, retaining version/environment/source information. Do not manufacture filenames from arbitrary snippets or make every code block a downloadable application. Files must match the shown code and carry relevant permissions; a download is not an execution record. Copy and ordinary local editors remain the dependable baseline.

Exact GitHub links can open the original artifact. A learner-selected diff or code excerpt can be connected to a Note without mirroring the whole repository. Direct Site connector access remains conditional; see server possibilities below and the core review's parked-history discussion.

### Existing books, PDFs and web resources

A useful future reading workspace could let the learner view an already permitted document beside their Notes, preserve an exact page/fragment citation where supported and return to it. First assess the current private media/document viewer. Do not assume a PDF page coordinate is equivalent to a canonical text passage, or that OCR supplies reliable exact quotations. Browser PDF rendering is a feasibility option; a new OCR/document-processing service is unnecessary by default.

For ordinary URLs, link cards and an owner-written reason may suffice. Importing third-party text requires the existing admission/rights path; public availability does not supply permission. Do not promise to iframe arbitrary sites, bypass their embedding rules or copy licensed books into exports. Let GPT consult available connected/research tools when asked and bring back original explanation plus appropriate references.

### Content between ChatGPT and Minamo

Support a small number of predictable round trips: GPT authors original Markdown; Minamo compiles/indexes it; the learner reads and writes; a chosen exact context returns to GPT. A readable export or copying a selected own Note can serve other tools. Public sharing, permanent embedded private Minamo readers and a new browser extension are not necessary for the primary workflow.

## 9. Server-side possibilities that make the frontend feel better

These are possible improvements inside the current Sites/Worker/D1/R2 system. They do not require a new hosted service or paid AI. Each should follow measurement and retain the shared domain authority.

| Candidate | User-visible benefit | Architectural boundary / trade-off |
| --- | --- | --- |
| Bounded workspace read projection | Stage plus a few reference summaries, current saved continuity and relevant Notes arrive coherently | Compose existing eligible reads; explicit limits and deferred details; avoid a giant all-purpose response |
| Compact title/relation hydration | Cards show useful destination names/reasons without requiring all records in browser memory | Bulk exact refs with revisions, current eligibility and missing stubs; no arbitrary graph expansion |
| Better catalogue sort/filter projections | Large Library remains navigable | Stable pagination, honest counts/coverage, derived indexes that rebuild; no history or restricted text leakage |
| Deterministic presentation metadata | Less repeated stage framing and fewer GPT formatting chores | Derive from canonical/source-mapped material; do not create competing educational truth or silent canonical edits |
| Read-only link/catalogue diagnostics | Owner/GPT can maintain Library coherence | On demand, bounded, mechanically specific findings; no autonomous semantic merges |
| Owner preferences | Consistent reading defaults where desired | Separate from learning facts, permissions and device-local drafts; guarded explicit updates |
| Lightweight read validators | Faster foreground revalidation of known versions | Version/rights/generation-aware response semantics; cached text still needs current access checks |
| Selected content packaging | Study packs/code exports without repeated full-corpus transfers | Explicit scope, original bytes, source rights and omission manifest; never raw recovery disguised as export |

Avoid a cache or materialized view becoming a second source of truth. Every outward private projection must be owner-scoped, generation-aware and currently eligible. A changed source permission can invalidate a previously safe snippet even if its content hash is unchanged. Prefetch only bounded eligible reads and never invoke execution, publication, source admission or checkpoint writes during rendering/navigation.

### Sites-managed connectors: a real possibility, not verified access

Current Sites guidance describes request-scoped connector invocation using the visitor's connection and consent. This could be preferable to building custom token custody for an eventual selected GitHub reader or permitted document source. However, the current Minamo manifest declares MCP, D1 and R2; it does not declare an external app integration. The required plugin-eligibility discovery tool was not exposed in this review session, so **GitHub or any other app's eligibility for this Site is unverified**.

A future feasibility check should use supported eligibility discovery, allowed canonical connector/actions and a narrow server-owned target. Preserve result envelopes, provider errors, sign-in returns and private/no-store responses. A connector in ChatGPT is not automatic Site access. Do not add a generic tool proxy, expose credentials to the browser, expand grants or claim a free unlimited integration before it is verified. Manual links and GPT-mediated reads remain good fallbacks.

Sites currently documents a 128 MB Worker isolate and HTTP-based external connections, with no raw TCP. These limits favour small deterministic projections and browser/local execution. They are another reason not to host a general computer, repository runner or inference model inside Minamo.

## 10. Perceived speed is part of correctness

Modern software feels continuous when navigation preserves useful context, loading is understandable and typing stays responsive. The existing Library already debounces search, aborts outdated requests, pages on the server and retains browse state. Notes owns editor state and persistence. Improve these mechanisms proportionately rather than discarding them for a new state stack.

Candidate work:

- Use stable skeletons or a local pending indicator that preserves layout; distinguish initial loading, refreshing retained results, genuinely empty results and errors. Do not display a false empty state while a request is pending.
- Restore the result position/filter, stage and reference context on Back. Test actual browser Back/Forward and opening links in a new tab, not only in-app click handlers. URL identity and presentation state should agree.
- Keep input/editor updates urgent. React transitions can help non-urgent rendering, but do not order network requests, solve races or make a controlled input non-blocking automatically. Keep explicit request identity/abort and stale-response checks. [UX-R2]
- Lazy-load heavy editors/runtimes/media when needed. Don't fetch Pyodide just because a Library page mentions Python. Existing manual runtime/player activation should remain.
- Consider list windowing only after large-list measurement; virtualising canonical reading can break selection, find-in-page, anchors and accessibility. Prefer bounded list pages and whole exact passages over clever rendering that loses the learner's place.
- If adding View Transitions, use feature detection and an ordinary-update fallback. Skip animations where native browser transitions already apply and respect reduced motion. They must not delay notes, selection or navigation. [UX-R3]

Measure task-specific latency and responsiveness on a realistic slow connection/device. Instrument coarse timings locally or through existing diagnostics, without sending Note text/searches to a new analytics provider. A server timing improvement that yields a less useful context is not a win.

## 11. Accessibility and small-screen quality are design criteria

The desired experience includes a physical Android phone, Windows and Kali. Narrow desktop screenshots cannot establish touch selection, TalkBack, the virtual keyboard, Android Back or screen-reader reading order. This review observed desktop rendering and source; mobile proposals remain unverified.

Use consistent large touch targets, visible focus, semantic landmarks and descriptive controls. A panel should not obscure the focused editor or leave keyboard focus behind it. Coordinate sticky navigation, Notes and the visual viewport; check portrait/landscape and zoom. W3C's focus guidance specifically addresses persistent disclosures and reflow. [UX-R1]

Let the learner choose comfortable reading size/width. Retest exact selection across code, tables, wrapped lines and rich Notes after changes. Source identity must not depend on visual line wrapping. Keep diagram alternatives and original code accessible; animation or syntax colour should not be the only source of meaning.

**Concrete source seam:** theme CSS zeros duration tokens under reduced motion, but reading navigation explicitly requests smooth scrolling. Audit all motion paths rather than assuming a token rule covers script-driven behaviour. This is a small improvement with broad consistency value, not a claim of a completed accessibility conformance audit.

## 12. A coherent first product slice, then optional expansion

I would give this frontend/product work equal weight with the core review's MCP improvements. The two sides should be tested as one experience.

| Order | Proposed slice | What would justify shipping it |
| --- | --- | --- |
| First | Shared hierarchy and interaction states; clearer Journey stage presentation; useful collection summaries | Learner reaches the practical action sooner, sees less repetition and always understands current context |
| First | Reference beside task, coordinated with existing Notes | Can inspect a mechanism, write a thought and return without losing place or draft |
| First | Library hub structure and understandable browse/reference choices | Independent learner finds a substantial useful explanation through more than one entry route |
| Early | Small reading/workspace settings and accurate keyboard/motion behaviour | Real comfort benefits without setup chores or weakened guarantees |
| Early | Investigation Guide/My work presentation using existing saved evidence | Learner distinguishes the guide, their observations and interpretations, and sees a useful next experiment |
| Conditional | Collections, selected artifact packs, richer document workspace | Repeated real tasks are awkward with existing links/Notes/export |
| Conditional | Direct connector readers, graph visualisation, broad offline support | Measured demand and a verified free/private capability path justify added complexity |

This is a sequence for exploring value, not a request to build every row. Avoid a sweeping visual redesign that regresses exact marks, rich code, diagrams, Notes or meaningful continuity. A short prototype of the shared shell/reference layout can be tested against the present UI before product implementation, but another prolonged assessment loop is unnecessary once the intended slice is commissioned.

Acceptance should follow realistic interactions:

1. **Discover and understand:** enter a subject with no project selected, find a function, preview its definition, read the full worked explanation, follow a related troubleshooting distinction and return to the same browse position.
2. **Build with a reference:** open a Journey stage, identify the first action, inspect its explanation alongside it, write a Note and change stage without losing the draft. Reopen the exact source of a mark.
3. **Investigate honestly:** choose a question, inspect alternative explanations, attach a deliberately supplied observation and save an explicitly requested checkpoint. A fresh GPT retrieves the same reasoning; the Site shows its origin and remaining uncertainty.
4. **Use a phone comfortably:** adjust reading size, open Notes with the keyboard, switch to a reference, return, handle a failed save and confirm acknowledgement. Test the actual device, Android Back and screen-reader focus.
5. **Grow and revise:** create a reusable Article through ordinary GPT interaction, put it in two meaningful contexts, index its commands, revise one part and verify all readers/previews remain version-correct. No duplicate project article is needed.

Compare lost-place incidents, ambiguous actions, repeated text, time to a useful explanation, accidental writes and correctness of the learner's account. Ask whether the product feels calmer and more capable, not merely whether it looks newer. Maintain the explicit free-service and privacy constraints from the core review.

## Evidence for this extension

V2 `main` was rechecked and remained `fac857a685e49699a737accf0e63484b8f6c2dcf`; the PR27 extension starts from draft head `8c91d6d31fd109685dc02254bed328932f5a20d7`. Current source and V21 were inspected again; older V1 decisions are covered in the [core evidence register](EVIDENCE.md). No new runtime benchmark, learner-data test, physical device session or independent second reviewer is claimed.

| Observation / seam | Evidence |
| --- | --- |
| O1, O3: collection counts, global navigation/search hint and current controls | Live authenticated collection/header inspection; [workspace source](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/app/workspace.tsx) |
| O2: current visual hierarchy and repeated reading/navigation surfaces | Live desktop Article and Journey overview screenshots viewed during review; [Reader](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/app/reader.tsx), [reader CSS](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/app/reader-notes.css) |
| O4: Library choices, exact filters, scoped browse and state restoration | Live Library inspection plus [Library browser](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/app/library-browser.tsx) |
| O5, O6: device/session stage position; extracted framing plus canonical reading | Live Journey overview/stage inspection; [Journey route](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/app/journey-route.tsx), [Home](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/app/learning-home.tsx) |
| O7: Investigation question/reading/links structure | Live Investigation collection and one substantive Investigation; [Investigation workspace](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/app/investigation-workspace.tsx) |
| Existing Notes and saved learning to preserve | [Notes panel](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/app/notes-panel.tsx), [Developments/resume UI](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/app/learning-developments.tsx) |
| Current palette/motion and script scrolling | [Theme](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/app/theme.css), [reading navigation](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/app/reading-navigation.tsx) |
| Current external-integration declaration | [Hosting manifest](https://github.com/frekland/minamo-v2/blob/fac857a685e49699a737accf0e63484b8f6c2dcf/.openai/hosting.json); no external plugin/connector declaration |

Primary external references, retrieved 23 October 2026:

- **UX-R1:** [W3C: Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html). Relevant panel/reflow guidance; no conformance claim for Minamo.
- **UX-R2:** [React: useTransition](https://react.dev/reference/react/useTransition). Non-blocking render/pending state and limitations around input control and asynchronous ordering. No framework migration or API adoption is prescribed.
- **UX-R3:** [Chrome platform: same-document View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions/same-document). Progressive enhancement, fallback, reduced motion and avoiding conflicting transitions. Support must be rechecked for the actual target browsers at implementation.
- **UX-R4:** The connected **Sites skill**, `references/app-integrations.md`, was read in this session. It documents eligibility discovery, manifest declarations, request-scoped visitor connectors and consent/result/error constraints. The main Sites skill documents Worker/network limits. These are platform guidance, not proof of GitHub eligibility or hosted reads. Skill resources are tool-provided and have no repository/public-web permalink; implementation must read then-current guidance rather than relying on this dated summary.

Private screenshots and learner identifiers were not added to Git. Navigation and Help inspection performed no authoring, execution, preference changes, Flags, checkpoints or external-player loading. All proposed UX/server features remain unimplemented and require normal integration/acceptance if later commissioned.
